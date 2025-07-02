import React, { useState, useEffect } from "react";
import styles from "../profile/profile.module.css";
import { Link, useNavigate, useParams } from "react-router-dom";
import RoutePictogram from "../routePictogram/RoutePictogram";

const Profile = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [visibility, setVisibility] = useState("public");
    const [friends, setFriends] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    
    // Добавляем состояния для работы с чужим профилем
    const [areFriends, setAreFriends] = useState(false);
    const [otherUserRoutes, setOtherUserRoutes] = useState([]);
    const [profileFriends, setProfileFriends] = useState([]); // Друзья просматриваемого профиля

    useEffect(() => {
        const loadData = async () => {
            try {
                // Получаем данные пользователя из localStorage
                const storedUser = localStorage.getItem('user');
                if (!storedUser) {
                    navigate('/login');
                    return;
                }

                const userData = JSON.parse(storedUser);
                const currentUserId = userData.userId;
                
                // Базовые данные пользователя
                setUser({
                    email: userData.email,
                    userId: currentUserId,
                    username: userData.username,
                    token: userData.token
                });

                // Проверяем, текущий ли это пользователь
                const isCurrent = parseInt(currentUserId) === parseInt(userId);
                setIsCurrentUser(isCurrent);

                // Загрузка профиля пользователя
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
                setUser(prev => ({ ...prev, ...profileData }));

                // Загрузка друзей текущего пользователя
                const friendsRes = await fetch(
                    `http://localhost:8080/api/friend/friends/${currentUserId}`, 
                    {
                        headers: { 
                            'Authorization': `Bearer ${userData.token}` 
                        }
                    }
                );
                
                if (friendsRes.ok) {
                    const friendsData = await friendsRes.json();
                    setFriends(friendsData);
                    
                    // Проверяем дружбу для не текущего пользователя
                    if (!isCurrent) {
                        const isFriend = friendsData.some(
                            friend => friend.userId === parseInt(userId)
                        );
                        setAreFriends(isFriend);
                    }
                }

                // Загрузка друзей просматриваемого профиля
                const profileFriendsRes = await fetch(
                    `http://localhost:8080/api/friend/friends/${userId}`, 
                    {
                        headers: { 
                            'Authorization': `Bearer ${userData.token}` 
                        }
                    }
                );
                
                if (profileFriendsRes.ok) {
                    const profileFriendsData = await profileFriendsRes.json();
                    setProfileFriends(profileFriendsData);
                }

                // Загрузка маршрутов
                if (isCurrent) {
                    // Для текущего пользователя загружаем все маршруты
                    const routesRes = await fetch(
                        `http://localhost:8080/api/routes/user/${userId}`, 
                        {
                            headers: { 
                                'Authorization': `Bearer ${userData.token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    if (routesRes.ok) {
                        const routesData = await routesRes.json();
                        setRoutes(routesData.sort((a, b) => 
                            new Date(b.createdAt) - new Date(a.createdAt)
                        ));
                    }
                } else {
                    // Для другого пользователя загружаем только публичные и дружеские (если есть доступ)
                    const routesRes = await fetch(
                        `http://localhost:8080/api/routes/user/${userId}`, 
                        {
                            headers: { 
                                'Authorization': `Bearer ${userData.token}`,
                                'Content-Type': 'application/json'
                            }
                        }
                    );
                    
                    if (routesRes.ok) {
                        const allRoutes = await routesRes.json();
                        
                        // Фильтруем маршруты по доступной видимости
                        const visibleRoutes = allRoutes.filter(route => 
                            route.visibility === 'public' || 
                            (areFriends && route.visibility === 'friends')
                        );
                        
                        setOtherUserRoutes(visibleRoutes.sort((a, b) => 
                            new Date(b.createdAt) - new Date(a.createdAt)
                        ));
                    }
                }

            } catch (error) {
                console.error("Ошибка загрузки данных:", error);
                setUser(null);
                navigate('/login');
            } finally {
                setIsLoading(false);
            }
        };
        
        loadData();
    }, [userId, navigate, areFriends]); // Добавляем areFriends в зависимости

    // Остальной код без изменений
    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/login');
    };

    const handleRouteClick = (routeId) => {
        navigate(`/routes/${user.userId}/${routeId}`);
    };
    
    // Функция для перехода к профилю друга
    const navigateToFriendProfile = (friendId) => {
        navigate(`/profile/${friendId}`);
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
                    <button className={styles.navButton} onClick={handleLogout}>Выйти</button>
                </div>
            </div>

            <div className={styles.personalData}>
                <div className={styles.avatarStatic}>
                    <div className={styles.avatar}>
                        <div className={styles.avatarPhoto}>
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <h2 className={styles.userName}>{user.username || user.email.split('@')[0]}</h2>
                        <p className={styles.userId}>ID: {user.userId}</p>
                        <p className={styles.userEmail}>{user.email}</p>
                    </div>

                    <div className={styles.static}>
                        <h1 className={styles.staticName}>Статистика</h1>
                        <div className={styles.staticText}>
                            <p className={styles.staticInfo}>
                                Маршрутов: {user.routesCount || 0}
                            </p>
                            <p className={styles.staticInfo}>
                                Пройдено км: {(user.totalDistance || 0).toFixed(1)}
                            </p>
                        </div>
                    </div>
                </div>

                {isCurrentUser ? (
                    <>
                        <div className={styles.friends}>
                            <div className={styles.friendsHeader}>
                                <Link to="/friends" className={styles.manageLink}>
                                    <button className={styles.nameFriends}>Управление друзьями</button>
                                </Link>
                            </div>
                            
                            <div className={styles.friendsList}>
                                {friends.length === 0 ? (
                                    <p className={styles.noFriends}>Пока нет друзей</p>
                                ) : (
                                    friends.map((friend) => (
                                        <div 
                                            key={friend.userId} 
                                            className={styles.friendItem}
                                            onClick={() => navigateToFriendProfile(friend.userId)}
                                        >
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
                                                    <RoutePictogram 
                                                        coordinates={route.coordinates || []} 
                                                    />
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
                                    
                                {/* Отображаем сообщение, если нет маршрутов */}
                                {routes.filter(r => r.visibility === visibility).length === 0 && (
                                    <div className={styles.noRoutesMessage}>
                                        Нет маршрутов с выбранной видимостью
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    // Блок для просмотра чужого профиля
                    <>
                        <div className={styles.friends}>
                            <div className={styles.friendsHeader}>
                                <h3 className={styles.nameFriends}>Друзья пользователя</h3>
                            </div>
                            <div className={styles.friendsList}>
                                {profileFriends.length === 0 ? (
                                    <p className={styles.noFriends}>У пользователя нет друзей</p>
                                ) : (
                                    profileFriends.map((friend) => (
                                        <div 
                                            key={friend.userId} 
                                            className={styles.friendItem}
                                            onClick={() => navigateToFriendProfile(friend.userId)}
                                        >
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
                            <h2 className={styles.routesTitle}>
                                {areFriends ? "Маршруты друга" : "Публичные маршруты"}
                            </h2>
                            
                            <div className={styles.routesGrid}>
                                {otherUserRoutes.length === 0 ? (
                                    <div className={styles.noRoutesMessage}>
                                        {areFriends 
                                            ? "Нет доступных маршрутов" 
                                            : "Нет публичных маршрутов"}
                                    </div>
                                ) : (
                                    otherUserRoutes.map(route => (
                                        <div 
                                            key={route.routeId} 
                                            className={styles.routeIcon}
                                            onClick={() => handleRouteClick(route.routeId)}
                                        >
                                            <div className={styles.iconContainer}>
                                                <div className={styles.routeVisual}>
                                                    <RoutePictogram 
                                                        coordinates={route.coordinates || []} 
                                                    />
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
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Profile;