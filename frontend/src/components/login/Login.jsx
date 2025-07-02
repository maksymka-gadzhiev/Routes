import React, { useState, useEffect } from 'react';
import styles from './login.module.css';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Проверка авторизации при монтировании
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const { userId } = JSON.parse(userData);
      navigate(`/profile/${userId}`, { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.email.trim() || !formData.password.trim()) {
      throw new Error('Все поля должны быть заполнены');
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      throw new Error('Введите корректный email');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Валидация формы
      validateForm();

      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email.toLowerCase().trim(),
          password: formData.password
        }),
      });

      // Обработка HTTP ошибок
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ошибка авторизации');
      }

      const responseData = await response.json();

      // Проверка обязательных полей
      if (!responseData.token || !responseData.userId) {
        throw new Error('Неполные данные от сервера');
      }

      // Сохраняем данные пользователя
      const userData = {
        token: responseData.token,
        userId: responseData.userId,
        email: responseData.email,
        username: responseData.username,
        routesCount: responseData.routesCount,
        totalDistance: responseData.totalDistance
      };
      
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Перенаправляем на защищенную страницу
      navigate(`/profile/${responseData.userId}`, { replace: true });

    } catch (err) {
      console.error('Ошибка входа:', err);
      setError(err.message || 'Произошла ошибка при авторизации');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.box} onSubmit={handleSubmit} noValidate>
        <h1>Вход</h1>
        
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
          <input
            id="email"
            name="email"
            className={styles.but}
            type="email"
            placeholder="Ваш email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
            disabled={isLoading}
          />
        </div>

        <div className={styles.formGroup}>
          <input
            id="password"
            name="password"
            className={styles.but}
            type="password"
            placeholder="Ваш пароль"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
            minLength={6}
            disabled={isLoading}
          />
        </div>

        <button 
          className={styles.button} 
          type="submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Вход...' : 'Войти'}
        </button>

        <div className={styles.registration}>
          <Link to="/registration" className={styles.registration}>
            Регистрация
          </Link>
        </div>
      </form>
    </div>
  );
};

export default Login;