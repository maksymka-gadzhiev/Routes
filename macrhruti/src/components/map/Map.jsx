import React, { useState, useEffect, useRef } from 'react';
import styles from './map.module.css';
import Sortable from 'sortablejs';
import metka from '../../assets/Логотип.png';
import { useNavigate } from 'react-router-dom';

const Map = () => {
  const [placemarks, setPlacemarks] = useState([]);
  const [selectedRoutingMode, setSelectedRoutingMode] = useState('auto');
  const mapRef = useRef(null);
  const multiRouteRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const navigate = useNavigate();

  // Динамическая загрузка Yandex Maps API
  useEffect(() => {
    if (!window.ymaps) {
      const script = document.createElement('script');
      script.src =
        'https://api-maps.yandex.ru/2.1/?apikey=19a904b9-df3c-4e45-81be-2102d1b2d676&lang=ru_RU&onload=initYandexMap';
      script.async = true;

      window.initYandexMap = () => {
        ymaps.ready(() => {
          mapInstanceRef.current = new ymaps.Map(mapRef.current, {
            center: [59.94, 30.32],
            zoom: 12,
            controls: ['zoomControl'],
            behaviors: ['drag'],
          });

          mapInstanceRef.current.events.add('click', (e) => {
            const coords = e.get('coords');
            addPlacemark(coords);
          });
        });
      };

      document.head.appendChild(script);

      return () => {
        document.head.removeChild(script);
        delete window.initYandexMap;
      };
    } else {
      ymaps.ready(() => {
        mapInstanceRef.current = new ymaps.Map(mapRef.current, {
          center: [59.94, 30.32],
          zoom: 12,
          controls: ['zoomControl'],
          behaviors: ['drag'],
        });

        mapInstanceRef.current.events.add('click', (e) => {
          const coords = e.get('coords');
          addPlacemark(coords);
        });
      });
    }
  }, []);

  // Обновление маршрута при изменении меток или типа маршрута
  useEffect(() => {
    if (placemarks.length > 1 && mapInstanceRef.current) {
      ymaps.ready(() => {
        if (multiRouteRef.current) {
          mapInstanceRef.current.geoObjects.remove(multiRouteRef.current);
        }

        const routePoints = placemarks.map((mark) => mark.coords);

        multiRouteRef.current = new ymaps.multiRouter.MultiRoute(
          {
            referencePoints: routePoints,
            params: {
              routingMode: selectedRoutingMode,
            },
          },
          {
            boundsAutoApply: true,
            wayPointVisible: false,
          }
        );

        mapInstanceRef.current.geoObjects.add(multiRouteRef.current);
      });
    } else {
      if (multiRouteRef.current) {
        mapInstanceRef.current.geoObjects.remove(multiRouteRef.current);
        multiRouteRef.current = null;
      }
    }
  }, [placemarks, selectedRoutingMode]);

  // Добавление метки на карту
  const addPlacemark = (coords) => {
    const placeMark = new ymaps.Placemark(
      coords,
      {
        hintContent: `Метка ${placemarks.length + 1}`,
        balloonContent: `Координаты: ${coords}`,
      },
      {
        iconLayout: 'default#image',
        iconImageHref: metka,
        iconImageSize: [46, 57],
        iconImageOffset: [-23, -57],
        draggable: true,
      }
    );

    mapInstanceRef.current.geoObjects.add(placeMark);

    setPlacemarks((prevPlacemarks) => [
      ...prevPlacemarks,
      { id: Date.now(), coords, placeMark },
    ]);

    placeMark.events.add('dragend', () => {
      setPlacemarks((prevPlacemarks) =>
        prevPlacemarks.map((mark) => {
          if (mark.placeMark === placeMark) {
            return { ...mark, coords: placeMark.geometry.getCoordinates() };
          }
          return mark;
        })
      );
    });
  };

  // Удаление метки
  const removePlacemark = (id) => {
    const updatedPlacemarks = placemarks.filter((mark) => mark.id !== id);
    setPlacemarks(updatedPlacemarks);

    const markToRemove = placemarks.find((mark) => mark.id === id);
    if (markToRemove) {
      mapInstanceRef.current.geoObjects.remove(markToRemove.placeMark);
    }
  };

  const handleExportGPX = async () => {
    if (placemarks.length < 2) {
        alert('Для экспорта нужно минимум 2 точки');
        return;
    }
  
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.token) {
            throw new Error('Требуется авторизация');
        }

        const response = await fetch('http://localhost:8080/api/routes/export/gpx', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({
                title: `Маршрут ${new Date().toLocaleString()}`,
                points: placemarks.map((point, index) => ({
                    lat: point.coords[0],
                    lon: point.coords[1],
                    name: `Точка ${index + 1}`
                }))
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(errorText || 'Ошибка экспорта');
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `маршрут_${new Date().toISOString()}.gpx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (err) {
        console.error('Ошибка экспорта:', err);
        alert(`Ошибка экспорта: ${err.message}`);
    }
};

  const handleImportGPX = async () => {
      try {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.gpx';
          
          input.onchange = async (e) => {
              const file = e.target.files[0];
              if (!file) return;
      
              const reader = new FileReader();
              reader.onload = async (event) => {
                  try {
                      const user = JSON.parse(localStorage.getItem('user'));
                      if (!user?.token) throw new Error('Требуется авторизация');
      
                      const formData = new FormData();
                      formData.append('file', file);
                      
                      const response = await fetch('http://localhost:8080/api/routes/import/gpx', {
                          method: 'POST',
                          headers: {
                              'Authorization': `Bearer ${user.token}`
                          },
                          body: formData
                      });
      
                      if (!response.ok) {
                          const errorText = await response.text();
                          throw new Error(errorText || 'Ошибка импорта');
                      }
      
                      const result = await response.json();
      
                      // Очищаем текущие метки
                      placemarks.forEach(mark => {
                          mapInstanceRef.current.geoObjects.remove(mark.placeMark);
                      });
                      setPlacemarks([]);
      
                      // Добавляем новые метки
                      result.points.forEach(point => {
                          addPlacemark([point.lat, point.lon]);
                      });
      
                      alert('Маршрут успешно импортирован!');
                  } catch (err) {
                      console.error('Ошибка импорта:', err);
                      alert(`Ошибка импорта: ${err.message}`);
                  }
              };
              reader.readAsArrayBuffer(file);
          };
          
          input.click();
      } catch (err) {
          console.error('Ошибка:', err);
          alert(`Ошибка: ${err.message}`);
      }
  };

  const handleSave = () => {
    if (placemarks.length < 2) {
      alert('Для сохранения маршрута нужно минимум 2 точки');
      return;
    }
    
    navigate('/saveRoute', { 
      state: { 
        routePoints: placemarks.map(mark => ({
          id: mark.id,
          coords: mark.coords
        }))
      }
    });
  };


  return (
    <div className={styles.mapContainer}>
      {/* Левая панель с метками и типами маршрутов */}
      <div className={styles.leftPanel}>
        <div className={styles.markersList}>
          <h1 className={styles.panelTitle}>Метки</h1>
          <ul
            id="markersContainer"
            ref={(el) =>
              el &&
              Sortable.create(el, {
                animation: 150,
                ghostClass: styles.ghost,
                chosenClass: styles.chosen,
                dragClass: styles.drag,
                onEnd: (evt) => {
                  setPlacemarks((prevPlacemarks) => {
                    const newOrder = [...prevPlacemarks];
                    const movedItem = newOrder.splice(evt.oldIndex, 1)[0];
                    newOrder.splice(evt.newIndex, 0, movedItem);
                    return newOrder;
                  });
                },
              })
            }
          >
            {placemarks.map((mark, index) => (
              <li key={mark.id} className={styles.markerItem}>
                Метка {index + 1}: {mark.coords[0].toFixed(2)}, {mark.coords[1].toFixed(2)}
                <button
                  className={styles.removeButton}
                  onClick={() => removePlacemark(mark.id)}
                >
                  —
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className={styles.routeButtons}>
          <h1 className={styles.panelTitle}>Тип маршрута</h1>
          <div className={styles.routeTypes}>
            {['pedestrian', 'masstransit', 'scooter', 'auto', 'bicycle'].map((mode) => (
              <button
                key={mode}
                className={`${styles.choiceButton} ${
                  selectedRoutingMode === mode ? styles.active : ''
                }`}
                onClick={() => setSelectedRoutingMode(mode)}
              >
                {mode === 'pedestrian' && 'Пеший'}
                {mode === 'masstransit' && 'Автобус'}
                {mode === 'scooter' && 'Самокат'}
                {mode === 'auto' && 'Машина'}
                {mode === 'bicycle' && 'Веломаршрут'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Правая часть с картой и кнопками */}
      <div className={styles.rightPanel}>
        <div id="map" ref={mapRef} className={styles.map}></div>
        
        <div className={styles.controlsPanel}>
          <button className={styles.controlButton} onClick={handleExportGPX}>
            Экспорт
          </button>
          <button className={styles.controlButton} onClick={handleImportGPX}>
            Импорт
          </button>
          <button className={styles.saveButton} onClick={handleSave} disabled={placemarks.length < 2}>
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
};

export default Map;