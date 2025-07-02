import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import styles from './RouteList.module.css';
import RoutePictogram from '../routePictogram/RoutePictogram' // Импортируйте компонент пиктограммы

const RouteList = () => {
    const [routes, setRoutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const location = useLocation();
    const navigate = useNavigate();
    
    const searchResults = location.state?.searchResults;
    const searchQuery = location.state?.searchQuery || '';

    useEffect(() => {
        if (searchResults) {
            setRoutes(searchResults);
            setLoading(false);
        } else {
            fetchPopularRoutes();
        }
    }, [location]);

    const fetchPopularRoutes = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/routes/popular');
            if (!response.ok) throw new Error('Ошибка загрузки маршрутов');
            
            const data = await response.json();
            setRoutes(data);
            setLoading(false);
        } catch (error) {
            console.error("Ошибка загрузки маршрутов", error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className={styles.loading}>Загрузка маршрутов...</div>;
    }

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>
                {searchQuery ? `Результаты поиска: "${searchQuery}"` : 'Популярные маршруты'}
            </h1>
            
            {routes.length === 0 ? (
                <div className={styles.noResults}>
                    <p>По вашему запросу ничего не найдено</p>
                    <button onClick={() => navigate('/')}>Вернуться на главную</button>
                </div>
            ) : (
                <div className={styles.routeGrid}>
                    {routes.map(route => (
                        <div key={route.routeId} className={styles.routeCard}>
                            {/* Добавлен контейнер для пиктограммы */}
                            <div className={styles.pictogramContainer}>
                                <RoutePictogram coordinates={route.coordinates || []} />
                            </div>
                            
                            <div className={styles.routeInfo}>
                                <h3>{route.title}</h3>
                                <p className={styles.description}>
                                    {route.description || 'Без описания'}
                                </p>
                                <div className={styles.routeMeta}>
                                    <span>Дистанция: {route.distance} км</span>
                                    <span>Сложность: {route.difficulty}</span>
                                </div>
                                <Link to={`/routes/${route.userId}/${route.routeId}`}>
                                    <button className={styles.detailsButton}>
                                        Подробнее
                                    </button>
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default RouteList;