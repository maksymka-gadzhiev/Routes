import React, { useState, useEffect } from 'react';
import styles from './home.module.css';
import { Link, useNavigate } from 'react-router-dom';
import logotip from '../../assets/Логотип.png';
import carCategory from '../../assets/car.png';
import veloCategory from '../../assets/velo.png';
import humanCategory from '../../assets/human.png';
import Slider from '../slider/Slider';
import C1 from '../../assets/company1.jpg';
import C2 from '../../assets/company2.png';
import C3 from '../../assets/company3.jpg';
import C4 from '../../assets/company4.png';
import C5 from '../../assets/company5.jpg';
import C6 from '../../assets/company6.jpg';

const Home = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    // Проверяем авторизацию при загрузке компонента
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                console.error("Ошибка чтения данных пользователя", e);
                localStorage.removeItem('user');
            }
        }
    }, []);

    const handleFindRouteClick = () => {
        setIsExpanded(true);
    }

    const handleBackRouteClick = () => {
        setIsExpanded(false);
        setSearchQuery('');
    }

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        navigate('/');
        window.location.reload();
    };

    // Поиск маршрутов
    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        
        try {
            // Получаем токен из объекта user
            const token = user?.token;
            
            if (!token) {
                alert('Для поиска маршрутов необходимо войти в систему');
                navigate('/login');
                return;
            }

            const response = await fetch(
                `http://localhost:8080/api/routes/search?query=${encodeURIComponent(searchQuery)}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            
            if (!response.ok) {
                if (response.status === 403) {
                    alert('Сессия истекла. Пожалуйста, войдите снова');
                    handleLogout();
                    return;
                }
                throw new Error('Ошибка поиска маршрутов');
            }
            
            const data = await response.json();
     const validatedData = data
            .filter(route => route) // Фильтруем undefined
            .map(route => ({
                ...route,
                // Нормализуем рейтинг
                avgRating: route.avgRating || 0
            }));
        
        navigate('/routes', { 
            state: { 
                searchResults: validatedData,
                searchQuery 
            } 
        });
        } catch (error) {
            console.error("Ошибка поиска маршрутов", error);
            alert('Произошла ошибка при поиске маршрутов: ' + error.message);
        }
    };

    // Обработка нажатия Enter в поле поиска
    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Генерация инициалов пользователя
    const getUserInitials = () => {
        if (!user) return "";
        
        if (user.username) {
            return user.username.charAt(0).toUpperCase();
        }
        
        return user.email.charAt(0).toUpperCase();
    };

    // Генерация цвета аватара
    const getAvatarColor = () => {
        if (!user) return "#4CAF50";
        
        const colors = [
            "#4CAF50", "#2196F3", "#FF9800", 
            "#9C27B0", "#E91E63", "#00BCD4",
            "#FF5722", "#795548", "#607D8B"
        ];
        
        const hash = user.email.split("").reduce(
            (acc, char) => char.charCodeAt(0) + acc, 
            0
        );
        
        return colors[hash % colors.length];
    };

    return (
        <div className={styles.mainHome}>
            <div className={styles.navbar}>
                <div className={styles.logTip}>
                    <img src={logotip} alt="Логотип"/>
                    <p className={styles.logName}>Marshruti</p>
                </div>

                <div className={styles.navButtons}>
                    <button 
                        className={styles.navButton} 
                        onClick={() => window.location.href = '#sectionSlider'}
                    >
                        Маршруты
                    </button>
                    <button 
                        className={styles.navButton} 
                        onClick={() => window.location.href = '#sectionCompany'}
                    >
                        Компании
                    </button>
                    <Link to={`/map`}>
                        <button className={styles.navButton}>Карты</button>
                    </Link>
                </div>
                
                {user ? (
                    <div className={styles.userContainer}>
                        <div 
                            className={styles.userAvatar}
                            onClick={() => navigate(`/profile/${user.userId}`)}
                            title="Перейти в профиль"
                            style={{ backgroundColor: getAvatarColor() }}
                        >
                            {getUserInitials()}
                        </div>
                        <button 
                            className={styles.logoutButton}
                            onClick={handleLogout}
                            title="Выйти из системы"
                        >
                            Выйти
                        </button>
                    </div>
                ) : (
                    <Link to={`/login`}>
                        <button className={styles.logButton}>Войти</button>
                    </Link>
                )}
            </div>

            <div className={styles.container}>
                <div className={`${styles.buttonContainer} ${isExpanded ? styles.expanded : ''}`}>
                    {!isExpanded && (
                    <>
                        <button 
                            className={styles.routeButtonFind} 
                            onClick={handleFindRouteClick}
                        >
                            Найти маршрут
                        </button>
                        <Link to={`/map`}>
                            <button className={styles.routeButtonCreate}>
                                Создать маршрут
                            </button>
                        </Link>
                    </>
                    )}
                    {isExpanded && (
                        <div className={styles.buttonSearch}>
                            <input
                                type="text"
                                placeholder="Введите название маршрута"
                                className={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyPress={handleKeyPress}
                            />
                            <button 
                                className={styles.routeButtonSearch} 
                                onClick={handleSearch}
                            >
                                Найти
                            </button>
                            <button 
                                className={styles.routeButtonBack} 
                                onClick={handleBackRouteClick}
                            >
                                Назад
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <div className={styles.category}>
                <p className={styles.categoryText}>Категории</p>
                <div className={styles.typesCategory}>
                    <img src={carCategory} alt="Автомобильные маршруты"/>
                    <img src={veloCategory} alt="Велосипедные маршруты"/>
                    <img src={humanCategory} alt="Пешие маршруты"/>
                </div>
            </div>
            
            <div id="sectionSlider"></div>
            <Slider/>

            <div className={styles.bestCompany}>
                <h1 className={styles.textCompany} id="sectionCompany">Лучшие компании</h1>
                <div className={styles.logosCompany}>
                    <img src={C1} className={styles.logoCompany} alt="Компания 1"/>
                    <img src={C2} className={styles.logoCompany} alt="Компания 2"/>
                    <img src={C3} className={styles.logoCompany} alt="Компания 3"/>
                    <img src={C4} className={styles.logoCompany} alt="Компания 4"/>
                    <img src={C5} className={styles.logoCompany} alt="Компания 5"/>
                    <img src={C6} className={styles.logoCompany} alt="Компания 6"/>
                </div>
            </div>
        </div>
    );
};

export default Home;