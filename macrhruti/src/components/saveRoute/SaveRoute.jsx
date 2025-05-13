import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styles from './saveRoute.module.css';

const SaveRoute = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const routePoints = state?.routePoints || [];
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    visibility: 'private',
    difficulty: 'easy'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (routePoints.length < 2) {
      navigate('/map', { replace: true });
    }
  }, [routePoints, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      throw new Error('Введите название маршрута');
    }
    if (formData.title.length > 100) {
      throw new Error('Название не должно превышать 100 символов');
    }
    if (formData.description.length > 500) {
      throw new Error('Описание не должно превышать 500 символов');
    }
  };

  const checkTokenValidity = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
  
    try {
      validateForm();
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Проверка наличия пользователя и токена
      if (!user?.token || !user?.userId) {
        localStorage.removeItem('user');
        throw new Error('Требуется авторизация. Пожалуйста, войдите снова.');
      }

      // Проверка срока действия токена
      if (!checkTokenValidity(user.token)) {
        localStorage.removeItem('user');
        throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
      }

      const response = await fetch('http://localhost:8080/api/routes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          ...formData,
          status: 'draft',
          userId: user.userId,
          coordinates: routePoints.map((point, index) => ({
            x: point.coords[0],
            y: point.coords[1],
            elevation: point.elevation?.toString() || '0',
            orderNumber: index + 1
          }))
        })
      });

      // Обработка ответа сервера
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || 
          (response.status === 403 ? 'Доступ запрещен. Проверьте авторизацию.' : 
          `Ошибка сервера: ${response.status}`);
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('user');
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (!result?.routeId) {
        throw new Error('Не удалось сохранить маршрут');
      }

      navigate('/profile', { state: { routeCreated: true } });
    } catch (err) {
      setError(err.message);
      console.error('Ошибка сохранения маршрута:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <h2>Сохранение маршрута</h2>
        
        {error && (
          <div className={styles.error}>
            <p>{error}</p>
            <button 
              type="button" 
              onClick={() => setError('')}
              className={styles.closeError}
              aria-label="Закрыть ошибку"
            >
              ×
            </button>
          </div>
        )}

        <div className={styles.formGroup}>
          <label htmlFor="title">Название маршрута*:</label>
          <input
            id="title"
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Введите название (макс. 100 символов)"
            required
            maxLength={100}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Описание маршрута (макс. 500 символов)"
            maxLength={500}
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="visibility">Видимость:</label>
          <select 
            id="visibility"
            name="visibility"
            value={formData.visibility} 
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="private">Личный</option>
            <option value="friends">Для друзей</option>
            <option value="public">Публичный</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="difficulty">Сложность:</label>
          <select 
            id="difficulty"
            name="difficulty"
            value={formData.difficulty} 
            onChange={handleChange}
            disabled={isLoading}
          >
            <option value="easy">Легкая</option>
            <option value="medium">Средняя</option>
            <option value="hard">Сложная</option>
          </select>
        </div>

        <div className={styles.pointsPreview}>
          <h3>Точки маршрута ({routePoints.length}):</h3>
          <ul>
            {routePoints.map((point, index) => (
              <li key={`point-${index}`}>
                Точка {index + 1}: {point.coords[0].toFixed(6)}, {point.coords[1].toFixed(6)}
                {point.elevation && ` (${point.elevation}m)`}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.buttonGroup}>
          <button 
            type="button" 
            onClick={() => navigate(-1)}
            className={styles.cancelButton}
            disabled={isLoading}
          >
            Отмена
          </button>
          <button 
            type="submit" 
            className={styles.saveButton}
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? 'Сохранение...' : 'Сохранить маршрут'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SaveRoute;