import React, { useState } from 'react'
import styles from './slider.module.css'
import mar18 from '../../assets/18.png'
import mar49 from '../../assets/49.jpg'
import mar56 from '../../assets/56.jpg'
import mar77 from '../../assets/77.jpg'

const Slider = () => {
  // Данные для слайдов
  const slides = [
    {
        image: mar18,
        text: 'Маршрутка номер 18',
    },
    {
        image: mar49,
        text: 'Это 2 слайд',
    },
    {
        image: mar56,
        text: 'Это 3 слайд',
    },
    {
        image: mar77,
        text: 'Это 4 слайд',
    }
  ];

  const [currentSlide, setCurrentSlide] = useState(0); // Текущий слайд

  // Переход к следующему слайду
  const nextSlide = () => {
    setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  // Переход к предыдущему слайду
  const prevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  // Переход к конкретному слайду
  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <div className={styles.slider}>
        <h1>Популярные Маршруты</h1>
        <div className={styles.sliderBody}>
          <div className={styles.slidesWithNavigation}>
            <img src={slides[currentSlide].image } className={styles.slide}/>
            <div className={styles.buttomNavigation}>
              <button className={styles.buttomArrow} onClick={prevSlide}>&#10094;</button>
              <div className={styles.indicators}>
                {slides.map((slide, index) => (
                  <button key={index} className={`${styles.indicator} ${index === currentSlide ? styles.active : ''}`}
                  onClick={() => goToSlide(index)}/>
                ))}
              </div>
              <button className={styles.buttomArrow} onClick={nextSlide}>&#10095;</button>
            </div>
          </div>
          <div className={styles.slidesText}>
            <p>{slides[currentSlide].text}</p>
          </div>
        </div>
    </div>
    
  );
};

export default Slider;