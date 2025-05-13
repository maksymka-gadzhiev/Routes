import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './friend.module.css';

const FriendsPage = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [friends, setFriends] = useState([]);
    const [invites, setInvites] = useState([]);
    const [friendLogin, setFriendLogin] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    // Проверка валидности токена
    const validateToken = async () => {
        try {
            const response = await fetch('http://localhost:8080/api/auth/validate', {
                headers: { 
                    'Authorization': `Bearer ${user?.token}`,
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                localStorage.removeItem('user');
                navigate('/login');
                return false;
            }
            return true;
        } catch (error) {
            console.error('Token validation failed:', error);
            return false;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            if (!user?.token) {
                navigate('/login');
                return;
            }

            try {
                setIsLoading(true);
                const isValid = await validateToken();
                if (!isValid) return;

                const headers = {
                    'Authorization': `Bearer ${user.token}`,
                    'Content-Type': 'application/json'
                };

                // Параллельная загрузка данных с обработкой 403 ошибки
                const [friendsRes, invitesRes] = await Promise.all([
                    fetch(`http://localhost:8080/api/friends`, { headers })
                        .then(res => {
                            if (res.status === 403) {
                                throw new Error('Доступ запрещен');
                            }
                            return res.json();
                        }),
                    fetch(`http://localhost:8080/api/friends/invites`, { headers })
                        .then(res => {
                            if (res.status === 403) {
                                throw new Error('Доступ запрещен');
                            }
                            return res.json();
                        })
                ]);

                setFriends(friendsRes);
                setInvites(invitesRes);
                setError('');

            } catch (error) {
                console.error("Ошибка загрузки:", error);
                if (error.message.includes('403')) {
                    localStorage.removeItem('user');
                    navigate('/login');
                }
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
            if (!friendLogin.trim()) {
                throw new Error('Введите корректный email пользователя');
            }

            const response = await fetch(`http://localhost:8080/api/friends/invite`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({ 
                    senderId: user.userId,
                    receiverLogin: friendLogin.trim().toLowerCase()
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Ошибка отправки приглашения");
            }
            
            setFriendLogin('');
            setError('');
            alert("Приглашение успешно отправлено!");

        } catch (err) {
            setError(err.message || 'Произошла ошибка при отправке приглашения');
        }
    };

    const handleInviteAction = async (inviteId, action) => {
        try {
            const response = await fetch(
                `http://localhost:8080/api/friends/${action}/${inviteId}`, 
                { 
                    method: 'POST', 
                    headers: { 
                        'Authorization': `Bearer ${user.token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );
            
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `Ошибка ${action === 'accept' ? 'принятия' : 'отклонения'} приглашения`);
            }

            setInvites(prev => prev.filter(i => i.inviteId !== inviteId));
            
            if (action === 'accept') {
                const updatedFriends = await fetch(`http://localhost:8080/api/friends`, {
                    headers: { 'Authorization': `Bearer ${user.token}` }
                }).then(res => res.json());
                setFriends(updatedFriends);
            }

        } catch (error) {
            console.error("Ошибка:", error);
            setError(error.message);
            if (error.message.includes('403')) {
                localStorage.removeItem('user');
                navigate('/login');
            }
        }
    };

    const handleNavigateProfile = (friendId) => {
        navigate(`/profile/${friendId}`);
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
                            type="email"
                            value={friendLogin}
                            onChange={(e) => setFriendLogin(e.target.value)}
                            placeholder="Введите email пользователя"
                            className={styles.searchInput}
                            aria-label="Email пользователя для отправки приглашения"
                            required
                        />
                        <button 
                            type="submit" 
                            className={styles.sendButton}
                            disabled={!friendLogin.trim()}
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
                                        От: {invite.senderEmail}
                                    </h3>
                                    <time className={styles.inviteDate}>
                                        {new Date(invite.createAt).toLocaleDateString('ru-RU', {
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

            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>
                    Ваши друзья ({friends.length})
                </h2>
                <div className={styles.friendsGrid}>
                    {friends.length === 0 ? (
                        <p className={styles.emptyMessage}>Список друзей пуст</p>
                    ) : (
                        friends.map(friendship => {
                            const friendId = friendship.firstUserId === user.userId 
                                ? friendship.secondUserId 
                                : friendship.firstUserId;
                            
                            return (
                                <article 
                                    key={friendship.friendshipId} 
                                    className={styles.friendCard}
                                    onClick={() => handleNavigateProfile(friendId)}
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Профиль пользователя ${friendship.friendEmail}`}
                                >
                                    <div className={styles.friendAvatar}>
                                        <div className={styles.avatarPlaceholder}>
                                            {friendship.friendEmail.slice(0, 2).toUpperCase()}
                                        </div>
                                    </div>
                                    <div className={styles.friendDetails}>
                                        <h3 className={styles.friendEmail}>
                                            {friendship.friendEmail}
                                        </h3>
                                        <time className={styles.friendsSince}>
                                            Друзья с: {new Date(friendship.createAt).toLocaleDateString('ru-RU', {
                                                day: 'numeric',
                                                month: 'long',
                                                year: 'numeric'
                                            })}
                                        </time>
                                    </div>
                                </article>
                            );
                        })
                    )}
                </div>
            </section>
        </div>
    );
};

export default FriendsPage;