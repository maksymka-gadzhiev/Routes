import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './RouteDetail.module.css';
import ReviewSection from '../review/ReviewSection';

const RouteDetail = () => {
  const { userId, routeId } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null); // Добавлено состояние для текущего пользователя
  
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  
  // Получение текущего пользователя
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);
  
  const getCategoryName = (category) => {
    if (!category) return 'Не указано';
    
    const mode = category.toLowerCase();
    switch(mode) {
      case 'pedestrian': return 'Пеший';
      case 'masstransit': return 'Автобус';
      case 'scooter': return 'Самокат';
      case 'auto': return 'Машина';
      case 'bicycle': return 'Веломаршрут';
      default: return category;
    }
  };

  // Загрузка данных маршрута
  useEffect(() => {
    const fetchRoute = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.token) {
          throw new Error('Требуется авторизация');
        }

        const response = await fetch(
          `http://localhost:8080/api/routes/route/${userId}/${routeId}`,
          {
            headers: {
              'Authorization': `Bearer ${user.token}`
            }
          }
        );

        if (!response.ok) {
          throw new Error('Маршрут не найден');
        }

        const data = await response.json();
        setRoute(data);
      } catch (err) {
        setError(err.message);
        console.error('Ошибка загрузки маршрута:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoute();
  }, [userId, routeId]);

  // Инициализация Яндекс.Карты
  useEffect(() => {
      console.log('Token from localStorage:', localStorage.getItem('token'));
    if (!route || !route.coordinates || route.coordinates.length === 0) return;

    // Проверяем, загружена ли уже API Яндекс.Карт
    if (window.ymaps) {
      initMap();
      return;
    }

    // Создаем тег script для загрузки API
    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=19a904b9-df3c-4e45-81be-2102d1b2d676&lang=ru_RU`;
    script.async = true;
    
    // Обработчик успешной загрузки API
    script.onload = () => {
      window.ymaps.ready(initMap);
    };

    // Обработчик ошибки загрузки API
    script.onerror = () => {
      setError('Не удалось загрузить Яндекс.Карты');
      console.error('Ошибка загрузки Яндекс.Карт');
    };

    document.head.appendChild(script);

    return () => {
      // Удаляем скрипт при размонтировании
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
      
      // Уничтожаем карту
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [route]);

  // Инициализация карты и отрисовка маршрута
  const initMap = () => {
    if (!mapRef.current || !route || !route.coordinates || route.coordinates.length === 0) return;
    
    try {
      // Уничтожаем предыдущий экземпляр карты
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      
      // Получаем координаты маршрута в правильном порядке: [долгота, широта]
      const coordinates = route.coordinates
        .sort((a, b) => a.orderNumber - b.orderNumber)
        .filter(coord => coord.xlon && coord.ylat) // Фильтрация невалидных точек
        .map(coord => [coord.xlon, coord.ylat]);  
      
      // Создаем новую карту
      mapInstanceRef.current = new window.ymaps.Map(mapRef.current, {
        center: coordinates[0],
        zoom: 12,
        controls: ['zoomControl', 'fullscreenControl'],
      });
      
      // Создаем линию маршрута
      const routeLine = new window.ymaps.Polyline(coordinates, {}, {
        strokeColor: "#9C27B0", // Новый цвет маршрута
        strokeWidth: 5,
        strokeOpacity: 0.7
      });
      
      mapInstanceRef.current.geoObjects.add(routeLine);
      
      // Добавляем точки маршрута
      coordinates.forEach((coord, index) => {
        const placemark = new window.ymaps.Placemark(coord, {
          hintContent: `Точка ${index + 1}`,
          balloonContent: `
            <div class="${styles.balloon}">
              <b>Точка ${index + 1}</b>
              <p>Широта: ${coord[1].toFixed(6)}</p>
              <p>Долгота: ${coord[0].toFixed(6)}</p>
              ${route.coordinates[index].elevation ? 
                `<p>Высота: ${route.coordinates[index].elevation} м</p>` : ''}
            </div>
          `
        }, {
          preset: index === 0 
            ? 'islands#redDotIcon' 
            : index === coordinates.length - 1 
              ? 'islands#greenDotIcon' 
              : 'islands#blueDotIcon'
        });
        
        mapInstanceRef.current.geoObjects.add(placemark);
      });
      
      // Устанавливаем границы маршрута
      mapInstanceRef.current.setBounds(mapInstanceRef.current.geoObjects.getBounds(), {
        checkZoomRange: true
      });
      
    } catch (err) {
      console.error('Ошибка инициализации карты:', err);
      setError('Ошибка создания карты: ' + err.message);
    }
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return <div className={styles.loading}>Загрузка маршрута...</div>;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h2>Ошибка</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Вернуться назад
        </button>
      </div>
    );
  }

  if (!route) {
    return <div className={styles.notFound}>Маршрут не найден</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{route.title}</h1>
      
      <div className={styles.mapContainer}>
        <div ref={mapRef} className={styles.map} />
      </div>
      
      <div className={styles.routeInfo}>
        <div className={styles.infoSection}>
          <h2>Информация о маршруте</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Описание:</span>
              <p>{route.description || 'Нет описания'}</p>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Статус:</span>
              <span className={styles.statusBadge}>{route.status}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Видимость:</span>
              <span className={styles.visibilityBadge}>{route.visibility}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Сложность:</span>
              <span className={styles.difficultyBadge}>{route.difficulty}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Расстояние:</span>
              <span>{route.distance?.toFixed(2)} км</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Категория:</span>
              <span>{getCategoryName(route.category)}</span>
            </div>
            
            <div className={styles.infoItem}>
              <span className={styles.infoLabel}>Создан:</span>
              <span>{formatDate(route.createdAt)}</span>
            </div>
            
            {route.updatedAt && (
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Обновлен:</span>
                <span>{formatDate(route.updatedAt)}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={styles.pointsSection}>
          <h2>Точки маршрута ({route.coordinates.length})</h2>
          <div className={styles.pointsList}>
            {route.coordinates
              .sort((a, b) => a.orderNumber - b.orderNumber)
              .map((point, index) => (
                <div key={point.coordinateId} className={styles.pointItem}>
                  <div className={styles.pointHeader}>
                    <span className={styles.pointNumber}>Точка {point.orderNumber}</span>
                    {index === 0 && <span className={styles.pointMarkerStart}>Старт</span>}
                    {index === route.coordinates.length - 1 && <span className={styles.pointMarkerEnd}>Финиш</span>}
                  </div>
                  
                  {/* Защищённый блок координат */}
                  {point.ylat && point.xlon && (
                    <div className={styles.pointCoords}>
                      <span>Широта: {point.ylat.toFixed(6)}</span>
                      <span>Долгота: {point.xlon.toFixed(6)}</span>
                    </div>
                  )}
                  
                  {point.elevation && (
                    <div className={styles.pointElevation}>
                      Высота: {point.elevation} м
                    </div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button onClick={() => navigate(-1)} className={styles.backButton}>
          Назад
        </button>
      </div>
      
      {/* Секция с отзывами */}
      <div className={styles.reviewsSection}>
        <ReviewSection 
          routeId={routeId} 
          currentUser={currentUser} 
        />
      </div>
    </div>
  );
};

export default RouteDetail;