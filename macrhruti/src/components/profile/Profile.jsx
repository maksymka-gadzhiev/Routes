import React, { useState, useEffect } from "react";
import styles from "../profile/profile.module.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import RoutePictogram from "../routePictogram/RoutePictogram";

const Profile = () => {
    const {userId} = useParams();
    const [currentUserId, setCurrentUserId] = useState(null);
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isOnline] = useState(true);
    const [visibility, setVisibility] = useState("private");
    const [friends, setFriends] = useState([]);
    const [routes, setRoutes] = useState([]);

    const validateToken = async (token) => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/validate', {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            try {
                const profileResponse = await fetch(
                    `http://localhost:8080/api/users/${userId}/profile`, 
                    {
                        headers: { 
                            'Authorization': `Bearer ${userData.token}` 
                        }
                    }
                );

                if (!profileResponse.ok) {
                    throw new Error("Ошибка загрузки профиля");
                }

                const profileData = await profileResponse.json();
                setProfileUser(profileData);
                const userData = JSON.parse(localStorage.getItem('user'));
                
                if(userData?.userId) {
                    setCurrentUserId(userData.userId);
                }
                
                if (!userData?.token) {
                    navigate('/login');
                    return;
                }

                // Проверка валидности токена
                const isValid = await validateToken(userData.token);
                if (!isValid) {
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }

                setUser({
                    email: userData.email,
                    userId: userData.userId,
                    token: userData.token
                });

                // Загрузка данных
                const [friendsRes, routesRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/users/${userId}/friends`, {
                        headers: { Authorization: `Bearer ${userData.token}` }
                    }),
                    fetch(`http://localhost:8080/api/routes/user/${userId}`, {
                        headers: { Authorization: `Bearer ${userData.token}` }
                    })
                ]);

                if (friendsRes.ok) setFriends(await friendsRes.json());
                
                if (routesRes.ok) {
                    const routesData = await routesRes.json();
                    setRoutes(routesData.sort((a, b) => 
                        new Date(b.createdAt) - new Date(a.createdAt)
                    ));
                }

            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
                localStorage.removeItem('user');
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
        window.location.reload(); // Принудительный сброс состояния
    };

    const handleRouteClick = (routeId) => {
        navigate(`/routes/${routeId}`);
    };

    const getRussianVisibility = (vis) => ({
        private: "Личный",
        friends: "Для друзей",
        public: "Публичный"
    }[vis]);

    if (isLoading) return <div className={styles.loading}>Загрузка профиля...</div>;
    if (!user) return null;

    return (
        <div className={styles.mainProfile}>
            <div className={styles.navbar}>
                <div className={styles.navButtons}>
                    <Link to="/"><button className={styles.navButton}>Главная</button></Link>
                    <button className={styles.navButton}>Профиль</button>
                    <Link to="/routes"><button className={styles.navButton}>Маршруты</button></Link>
                    <button className={styles.navButton} onClick={handleLogout}>Выйти</button>
                </div>
            </div>

            <div className={styles.personalData}>
                <div className={styles.avatarStatic}>
                    <div className={styles.avatar}>
                        <div className={styles.avatarPhoto}>
                            {user.email.charAt(0).toUpperCase()}
                        </div>
                        <h2 className={styles.userName}>{user.email.split('@')[0]}</h2>
                        <p className={styles.userId}>ID: {user.userId}</p>
                        <div 
                            className={styles.status} 
                            style={{ color: isOnline ? "green" : "gray" }}
                        >
                            {isOnline ? "в сети" : "не в сети"}
                        </div>
                    </div>

                    <div className={styles.static}>
                        <h1 className={styles.staticName}>Статистика</h1>
                        <div className={styles.staticText}>
                            <p className={styles.staticInfo}>
                                Маршрутов: {routes.length}
                            </p>
                            <p className={styles.staticInfo}>
                                Пройдено км: {routes.reduce((sum, r) => sum + (r.distance || 0), 0).toFixed(1)}
                            </p>
                            <p className={styles.staticInfo}>
                                Активные: {routes.filter(r => r.status === 'draft').length}
                            </p>
                            <p className={styles.staticInfo}>
                                Завершено: {routes.filter(r => r.status === 'completed').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className={styles.friends}>
                    <div className={styles.friendsHeader}>
                        <h2 className={styles.nameFriends}>Друзья ({friends.length})</h2>
                        <Link to="/friends" className={styles.manageLink}>
                            <button className={styles.nameFriends}>Управление друзьями</button>
                        </Link>
                    </div>
                    
                    <div className={styles.friendsList}>
                        {friends.length === 0 ? (
                            <p className={styles.noFriends}>Пока нет друзей</p>
                        ) : (
                            friends.map((friend) => (
                                <div key={friend.userId} className={styles.friendItem}>
                                    <div className={styles.friendAvatar}>
                                        <div className={styles.friendAvatarPlaceholder}>
                                            {friend.email.charAt(0).toUpperCase()}
                                        </div>
                                    </div>
                                    <span className={styles.friendName}>
                                        {friend.name || friend.email.split('@')[0]}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className={styles.routes}>
                    <h2 className={styles.routesTitle}>Мои маршруты</h2>
                    <div className={styles.routesControls}>
                        <div className={styles.customDropdown}>
                            <div className={styles.dropdownHeader}>
                                {getRussianVisibility(visibility)}
                            </div>
                            <ul className={styles.dropdownList}>
                                <li onClick={() => setVisibility("private")}>Личный</li>
                                <li onClick={() => setVisibility("friends")}>Для друзей</li>
                                <li onClick={() => setVisibility("public")}>Публичный</li>
                            </ul>
                        </div>
                    </div>
                    
                    <div className={styles.routesGrid}>
                        {routes
                            .filter(r => r.visibility === visibility)
                            .map(route => (
                                <div 
                                    key={route.routeId} 
                                    className={styles.routeIcon}
                                    onClick={() => handleRouteClick(route.routeId)}
                                >
                                    <div className={styles.iconContainer}>
                                        <div className={styles.routeVisual}>
                                            <RoutePictogram coordinates={route.coordinates} />
                                        </div>
                                        <div className={styles.routeInfo}>
                                            <span className={styles.routeTitle}>{route.title}</span>
                                            <div className={styles.routeMeta}>
                                                <span className={styles.routeStat}>
                                                    {route.distance?.toFixed(1) || '0.0'} км
                                                </span>
                                                <span className={`${styles.statusBadge} ${
                                                    route.status === 'completed' 
                                                        ? styles.completed 
                                                        : styles.inProgress
                                                }`}>
                                                    {route.status === 'completed' ? '✓' : '↻'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;