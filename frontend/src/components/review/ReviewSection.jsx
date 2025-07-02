import React, { useState, useEffect } from 'react';
import styles from './ReviewSection.module.css';

const ReviewSection = ({ routeId }) => {
    const [reviews, setReviews] = useState([]);
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState(5);
    const [error, setError] = useState('');
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setCurrentUser(user);
        }
    }, []);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                // Получаем токен из объекта пользователя
                const storedUser = localStorage.getItem('user');
                const token = storedUser ? JSON.parse(storedUser).token : '';
                
                const headers = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
                
                const response = await fetch(
                    `http://localhost:8080/api/routes/${routeId}/reviews`,
                    { headers }
                );
                
                if (response.ok) {
                    const data = await response.json();
                    setReviews(data);
                } else if (response.status === 403) {
                    setError('Доступ запрещен. Проверьте права доступа');
                } else {
                    setError('Ошибка загрузки отзывов');
                }
            } catch (err) {
                console.error("Ошибка загрузки отзывов:", err);
                setError('Ошибка загрузки отзывов');
            }
        };
        
        fetchReviews();
    }, [routeId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!comment.trim()) return setError('Введите текст комментария');
        
        // Проверяем наличие пользователя и его ID
        if (!currentUser || !currentUser.userId) {
            return setError('Требуется авторизация');
        }

        try {
            const token = currentUser.token;
            if (!token) return setError('Требуется авторизация');

            const response = await fetch(
                `http://localhost:8080/api/routes/${routeId}/reviews/${currentUser.userId}`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ comment, rating })
                }
            );

            if (response.ok) {
                const newReview = await response.json();
                setReviews([...reviews, newReview]);
                setComment('');
                setRating(5);
                setError('');
            } else if (response.status === 403) {
                setError('У вас нет прав для добавления отзыва');
            } else {
                setError('Ошибка при отправке комментария');
            }
        } catch (err) {
            console.error("Ошибка при отправке комментария:", err);
            setError('Ошибка при отправке комментария');
        }
    };

    const handleDelete = async (reviewId) => {
        try {
            const storedUser = localStorage.getItem('user');
            const token = storedUser ? JSON.parse(storedUser).token : '';
            
            if (!token) {
                setError('Требуется авторизация');
                return;
            }
            
            const response = await fetch(
                `http://localhost:8080/api/routes/${routeId}/reviews/${reviewId}`, 
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (response.ok) {
                setReviews(reviews.filter(r => r.reviewId !== reviewId));
                setError('');
            } else if (response.status === 403) {
                setError('У вас нет прав для удаления этого отзыва');
            } else {
                setError('Ошибка удаления комментария');
            }
        } catch (err) {
            console.error("Ошибка удаления комментария:", err);
            setError('Ошибка удаления комментария');
        }
    };

    return (
        <div className={styles.reviewSection}>
            <h3 className={styles.title}>Отзывы о маршруте</h3>
            
            {currentUser && (
                <form onSubmit={handleSubmit} className={styles.reviewForm}>
                    <div className={styles.formGroup}>
                        <label htmlFor="comment">Ваш комментарий:</label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className={styles.textarea}
                            rows="4"
                            required
                        />
                    </div>
                    
                    <div className={styles.formGroup}>
                        <label htmlFor="rating">Оценка:</label>
                        <select
                            id="rating"
                            value={rating}
                            onChange={(e) => setRating(parseFloat(e.target.value))}
                            className={styles.select}
                        >
                            {[1, 2, 3, 4, 5].map(num => (
                                <option key={num} value={num}>{num}</option>
                            ))}
                        </select>
                    </div>
                    
                    {error && <p className={styles.error}>{error}</p>}
                    <button type="submit" className={styles.submitButton}>Добавить отзыв</button>
                </form>
            )}
            
            {!currentUser && (
                <div className={styles.authWarning}>
                    <p>Чтобы оставить отзыв, пожалуйста, <a href="/login">войдите</a> в систему.</p>
                </div>
            )}
            
            <div className={styles.reviewsList}>
                {reviews.length === 0 ? (
                    <p className={styles.noReviews}>Пока нет отзывов</p>
                ) : (
                    reviews.map(review => (
                        <div key={review.reviewId} className={styles.reviewCard}>
                            <div className={styles.reviewHeader}>
                                <span className={styles.username}>{review.username}</span>
                                <span className={styles.rating}>
                                    {[...Array(5)].map((_, i) => (
                                        <span 
                                            key={i} 
                                            className={`${styles.star} ${i < review.rating ? styles.filled : ''}`}
                                        >
                                            {i < review.rating ? '★' : '☆'}
                                        </span>
                                    ))}
                                </span>
                                <span className={styles.date}>
                                    {new Date(review.reviewDate).toLocaleDateString('ru-RU')}
                                </span>
                                {currentUser && currentUser.userId === review.userId && (
                                    <button 
                                        onClick={() => handleDelete(review.reviewId)}
                                        className={styles.deleteButton}
                                        aria-label="Удалить отзыв"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>
                            <p className={styles.comment}>{review.comment}</p>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ReviewSection;