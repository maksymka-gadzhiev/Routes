import React, { useState } from 'react';
import styles from './registration.module.css';
import { useNavigate } from 'react-router-dom';

const Registration = () => {
  const [formData, setFormData] = useState({
    username: '', // Добавлено новое поле
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Валидация
    if (!formData.username.trim()) {
      setError('Введите имя пользователя');
      return;
    }
    
    if (!formData.email.includes('@')) {
      setError('Введите корректный email');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch('http://localhost:8080/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username, // Добавлено в запрос
          email: formData.email,
          password: formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => response.text());
        throw new Error(typeof errorData === 'object' 
          ? errorData.message || 'Ошибка регистрации' 
          : errorData);
      }

      navigate('/login');
    } catch (err) {
      setError(err.message || 'Произошла ошибка при регистрации');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <form className={styles.box} onSubmit={handleSubmit}>
        <h2>Регистрация</h2>
        {error && <p className={styles.error}>{error}</p>}
        
        {/* Добавлено поле для имени пользователя */}
        <input
          className={styles.but}
          type="text"
          name="username"
          placeholder="Имя пользователя"
          value={formData.username}
          onChange={handleChange}
          required
        />
        
        <input
          className={styles.but}
          type="email"
          name="email"
          placeholder="Ваш email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        
        <input
          className={styles.but}
          type="password"
          name="password"
          placeholder="Придумайте пароль (минимум 6 символов)"
          value={formData.password}
          onChange={handleChange}
          required
          minLength="6"
        />
        
        <input
          className={styles.but}
          type="password"
          name="confirmPassword"
          placeholder="Повторите пароль"
          value={formData.confirmPassword}
          onChange={handleChange}
          required
        />
        
        <button 
          className={styles.button} 
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Регистрация...' : 'Зарегистрироваться'}
        </button>
      </form>
    </div>
  );
};

export default Registration;