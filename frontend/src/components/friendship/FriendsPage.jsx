import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './friend.module.css';

const FriendsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [invites, setInvites] = useState([]);
    const [friends, setFriends] = useState([]); // Добавлено состояние для друзей
    const [friendUsername, setFriendUsername] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            if (!user?.token) {
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);
                
                const headers = {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                };

                // Загрузка входящих приглашений
                const invitesRes = await fetch(
                    `http://localhost:8080/api/friend/invite/${user.userId}`, 
                    { headers }
                );
                
                if (invitesRes.status === 401 || invitesRes.status === 403) {
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }
                
                if (!invitesRes.ok) {
                    throw new Error('Ошибка загрузки приглашений');
                }
                
                const invitesData = await invitesRes.json();
                setInvites(invitesData);
                
                // Загрузка списка друзей (новый эндпоинт)
                const friendsRes = await fetch(
                    `http://localhost:8080/api/friend/friends/${user.userId}`, 
                    { headers }
                );
                
                if (friendsRes.ok) {
                    const friendsData = await friendsRes.json();
                    setFriends(friendsData);
                }
                
                setError('');

            } catch (error) {
                console.error("Ошибка загрузки:", error);
                setError(error.message);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [user, navigate]);

    const handleSendInvite = async (e) => {
        e.preventDefault();
        try {
            if (!friendUsername.trim()) {
                throw new Error('Введите username пользователя');
            }

            const response = await fetch(`http://localhost:8080/api/friend/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ 
                    username: friendUsername.trim()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Ошибка отправки приглашения");
            }
            
            setFriendUsername('');
            setError('');
            alert("Приглашение успешно отправлено!");

        } catch (err) {
            setError(err.message || 'Произошла ошибка при отправке приглашения');
        }
    };

    const handleInviteAction = async (inviteId, action) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/friend/${inviteId}/${action}`, 
                { 
                    method: 'PATCH', 
                    headers: { 
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `Ошибка ${action === 'accept' ? 'принятия' : 'отклонения'} приглашения`);
            }

            setInvites(prev => prev.filter(i => i.inviteId !== inviteId));
            alert(`Приглашение успешно ${action === 'accept' ? 'принято' : 'отклонено'}`);

        } catch (error) {
            console.error("Ошибка:", error);
            setError(error.message);
            if (error.message.includes('403') || error.message.includes('401')) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    };

    const handleNavigateProfile = (userId) => {
        navigate(`/profile/${userId}`);
    };

    if (isLoading) {
        return (
            <div className={styles.loadingContainer}>
                <div className={styles.spinner}></div>
                <p>Загрузка данных...</p>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <button 
                    onClick={() => navigate('/')}
                    className={styles.backButton}
                    aria-label="Вернуться на главную"
                >
                    ← На главную
                </button>
                <h1 className={styles.title}>Управление друзьями</h1>
            </header>

            {error && (
                <div className={styles.errorBanner}>
                    <span>{error}</span>
                    <button 
                        onClick={() => setError('')}
                        className={styles.closeError}
                        aria-label="Закрыть уведомление"
                    >
                        ×
                    </button>
                </div>
            )}

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Добавить друга</h2>
                <form onSubmit={handleSendInvite} className={styles.inviteForm}>
                    <div className={styles.inputGroup}>
                        <input
                            type="text"
                            value={friendUsername}
                            onChange={(e) => setFriendUsername(e.target.value)}
                            placeholder="Введите username пользователя"
                            className={styles.searchInput}
                            aria-label="Username пользователя для отправки приглашения"
                            required
                        />
                        <button 
                            type="submit" 
                            className={styles.sendButton}
                            disabled={!friendUsername.trim()}
                            aria-label="Отправить приглашение"
                        >
                            Отправить
                        </button>
                    </div>
                </form>
            </section>

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Входящие запросы ({invites.length})
                </h2>
                <div className={styles.invitesContainer}>
                    {invites.length === 0 ? (
                        <p className={styles.emptyMessage}>Нет новых запросов</p>
                    ) : (
                        invites.map(invite => (
                            <article key={invite.inviteId} className={styles.inviteCard}>
                                <div className={styles.inviteInfo}>
                                    <h3 className={styles.inviteFrom}>
                                        От: {invite.userFromUsername}
                                    </h3>
                                    <time className={styles.inviteDate}>
                                        {new Date(invite.createdAt).toLocaleDateString('ru-RU', {
                                            day: 'numeric',
                                            month: 'long',
                                            year: 'numeric'
                                        })}
                                    </time>
                                </div>
                                <div className={styles.inviteActions}>
                                    <button 
                                        className={`${styles.actionButton} ${styles.acceptButton}`}
                                        onClick={() => handleInviteAction(invite.inviteId, 'accept')}
                                        aria-label="Принять запрос"
                                    >
                                        ✓
                                    </button>
                                    <button
                                        className={`${styles.actionButton} ${styles.declineButton}`}
                                        onClick={() => handleInviteAction(invite.inviteId, 'decline')}
                                        aria-label="Отклонить запрос"
                                    >
                                        ✕
                                    </button>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>

            {/* Секция друзей */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Ваши друзья ({friends.length})
                </h2>
                <div className={styles.friendsGrid}>
                    {friends.length === 0 ? (
                        <p className={styles.emptyMessage}>Список друзей пуст</p>
                    ) : (
                        friends.map(friend => (
                            <article 
                                key={friend.userId} 
                                className={styles.friendCard}
                                onClick={() => handleNavigateProfile(friend.userId)}
                                role="button"
                                tabIndex={0}
                                aria-label={`Профиль пользователя ${friend.username}`}
                            >
                                <div className={styles.friendAvatar}>
                                    <div className={styles.avatarPlaceholder}>
                                        {friend.username.slice(0, 2).toUpperCase()}
                                    </div>
                                </div>
                                <div className={styles.friendDetails}>
                                    <h3 className={styles.friendName}>
                                        {friend.username}
                                    </h3>
                                    <p className={styles.friendEmail}>
                                        {friend.email}
                                    </p>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default FriendsPage;