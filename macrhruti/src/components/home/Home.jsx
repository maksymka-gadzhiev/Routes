import React, { useState } from 'react'
import styles from './home.module.css'
import { Link, useNavigate } from 'react-router-dom'
import logotip from '../../assets/Логотип.png'
import carCategory from '../../assets/car.png'
import veloCategory from '../../assets/velo.png'
import humanCategory from '../../assets/human.png'
import Slider from '../slider/Slider'
import C1 from '../../assets/company1.jpg'
import C2 from '../../assets/company2.png'
import C3 from '../../assets/company3.jpg'
import C4 from '../../assets/company4.png'
import C5 from '../../assets/company5.jpg'
import C6 from '../../assets/company6.jpg'

const Home = () => {
    const [isExpanded, setIsExpanded] = useState(false);
    const navigate = useNavigate();
  
    const handleFindRouteClick = () => {
      setIsExpanded(true); // Расширяем блок и скрываем кнопки
    }

    const handleBackRouteClick = () => {
        setIsExpanded(false);
    }

  return (
    <div className={styles.mainHome}>
        
        <div className={styles.navbar}>
            <div className={styles.logTip}>
                <img src={logotip}/>
                <p className={styles.logName}>Marshruti</p>
            </div>

            <div className={styles.navButtons}>
                <button className={styles.navButton} onClick={() => window.location.href = '#sectionSlider'}>Маршруты</button>
                <button className={styles.navButton} onClick={() => window.location.href = '#sectionCompany'}>Компании</button>
                <Link to={`/map`}><button className={styles.navButton}>Карты</button></Link>
            </div>
            <Link to={`/login`}><button className={styles.logButton}>Войти</button></Link>
        </div>

        <div className={styles.container}>
            <div className={`${styles.buttonContainer} ${isExpanded ? styles.expanded : ''}`}>
                {!isExpanded && (
                <>
                    <button className={styles.routeButtonFind} onClick={handleFindRouteClick}>
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
                          placeholder="Введите пункт назначения"
                          className={styles.searchInput} 
                        />
                        <button className={styles.routeButtonBack} onClick={handleBackRouteClick}>Назад</button>
                    </div>
                )}
            </div>
        </div>

        <div className={styles.category}>
            <p className={styles.categoryText}>Категории</p>
            <div className={styles.typesCategory}>
                <img src={carCategory}/>
                <img src={veloCategory}/>
                <img src={humanCategory}/>
            </div>
        </div>
        
        <div id="sectionSlider"></div>
        <Slider/>

        <div className={styles.bestCompany}>
            <h1 className={styles.textCompany} id="sectionCompany">Лучшие компании</h1>
            <div className={styles.logosCompany}>
                <img src={C1} className={styles.logoCompany}/>
                <img src={C2} className={styles.logoCompany}/>
                <img src={C3} className={styles.logoCompany}/>
                <img src={C4} className={styles.logoCompany}/>
                <img src={C5} className={styles.logoCompany}/>
                <img src={C6} className={styles.logoCompany}/>
            </div>
        </div>
        
    </div>
  )
}

export default Home