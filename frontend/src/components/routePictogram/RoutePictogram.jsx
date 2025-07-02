import React from 'react';
import styles from './routePictogram.module.css';

const RoutePictogram = ({ coordinates = [] }) => {
  // Используем правильные имена свойств (в нижнем регистре)
  const validCoordinates = coordinates.filter(coord => 
    coord.xlon !== null && coord.ylat !== null &&
    typeof coord.xlon === 'number' && typeof coord.ylat === 'number'
  );

  if (validCoordinates.length < 2) {
    return (
      <div className={styles.emptyPictogram}>
        <svg width="100%" height="100%" viewBox="0 0 100 50">
          <rect width="100%" height="100%" fill="#f5f5f5" />
          <text 
            x="50" 
            y="25" 
            textAnchor="middle" 
            dominantBaseline="middle"
            fill="#999"
            fontSize="8"
          >
            {validCoordinates.length === 1 ? "1 точка" : "Нет данных"}
          </text>
        </svg>
      </div>
    );
  }

  // Извлекаем значения с правильными именами свойств
  const xValues = validCoordinates.map(c => c.xlon);
  const yValues = validCoordinates.map(c => c.ylat);
  
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const minY = Math.min(...yValues);
  const maxY = Math.max(...yValues);
  
  const width = maxX - minX;
  const height = maxY - minY;
  
  const scaleX = width !== 0 ? 90 / width : 1;
  const scaleY = height !== 0 ? 40 / height : 1;
  const scale = Math.min(scaleX, scaleY);
  
  const offsetX = (100 - width * scale) / 2;
  const offsetY = (50 - height * scale) / 2;

  // Преобразуем координаты
  const points = validCoordinates.map(coord => {
    const x = offsetX + (coord.xlon - minX) * scale;
    const y = 50 - (offsetY + (coord.ylat - minY) * scale);
    return `${x},${y}`;
  }).join(' ');

  const startPoint = points.split(' ')[0].split(',');
  const endPoint = points.split(' ')[points.split(' ').length - 1].split(',');

  return (
    <svg 
      width="100%" 
      height="100%" 
      viewBox="0 0 100 50" 
      preserveAspectRatio="xMidYMid meet"
      className={styles.pictogram}
    >
      <rect width="100%" height="100%" fill="#f0f8ff" stroke="#ddd" strokeWidth="0.5" />
      
      <polyline 
        points={points} 
        fill="none" 
        stroke="#4CAF50" 
        strokeWidth="1.5" 
        strokeLinejoin="round" 
        strokeLinecap="round"
      />
      
      <circle 
        cx={startPoint[0]} 
        cy={startPoint[1]} 
        r="2.5" 
        fill="#FF5722" 
        stroke="#fff" 
        strokeWidth="0.8"
      />
      
      <circle 
        cx={endPoint[0]} 
        cy={endPoint[1]} 
        r="2.5" 
        fill="#2196F3" 
        stroke="#fff" 
        strokeWidth="0.8"
      />
      
      {/* Отладочная информация */}
      <text x="5" y="10" fontSize="5" fill="#666">
        Points: {validCoordinates.length}
      </text>
    </svg>
  );
};

export default RoutePictogram;