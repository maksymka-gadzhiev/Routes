import React from 'react';
import styles from '../profile/profile.module.css';

const RoutePictogram = ({ coordinates }) => {
    const normalizeCoordinates = (coords) => {
        if (!coords || coords.length < 2) return null;

        const points = coords.map(coord => ({
            x: parseFloat(coord.xLon),
            y: parseFloat(coord.yLat)
        }));

        // Границы маршрута
        const xValues = points.map(p => p.x);
        const yValues = points.map(p => p.y);
        const minX = Math.min(...xValues);
        const maxX = Math.max(...xValues);
        const minY = Math.min(...yValues);
        const maxY = Math.max(...yValues);

        // Настройки отступов
        const PADDING = 35; // Увеличено с 25px
        const DRAW_AREA = 250 - PADDING * 2;

        // Расчёт масштаба
        const width = Math.max(maxX - minX, 0.0001);
        const height = Math.max(maxY - minY, 0.0001);
        const scale = Math.min(DRAW_AREA / width, DRAW_AREA / height) * 0.9; // Добавлен коэффициент 0.9

        // Центрирование с увеличенными отступами
        const offsetX = PADDING + (DRAW_AREA - width * scale) / 2;
        const offsetY = PADDING + (DRAW_AREA - height * scale) / 2;

        return points.map(p => ({
            x: offsetX + (p.x - minX) * scale,
            y: offsetY + (p.y - minY) * scale
        }));
    };

    const normalized = normalizeCoordinates(coordinates);
    
    if (!normalized) {
        return (
            <div className={styles.noCoordinates}>
                🗺️ Нет данных
            </div>
        );
    }

    const pathData = normalized.map((p, i) => 
        `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
    ).join(' ');

    return (
        <svg 
            viewBox="0 0 250 250" 
            className={styles.routePictogram}
            preserveAspectRatio="xMidYMid meet"
        >
            {/* Белый фон с увеличенными отступами */}
            <rect 
                x="35" 
                y="35" 
                width="180" 
                height="180" 
                rx="12" 
                ry="12" 
                fill="white" 
                stroke="#e0e0e0" 
                strokeWidth="1"
            />
            
            {/* Маршрут с гарантированными отступами */}
            <path
                d={pathData}
                fill="none"
                stroke="#84AC7C"
                strokeWidth="3"
                strokeLinejoin="round"
            />
            
            {/* Точки маршрута */}
            <circle 
                cx={normalized[0].x} 
                cy={normalized[0].y} 
                r="4" 
                fill="#84AC7C" 
            />
            <circle 
                cx={normalized[normalized.length-1].x} 
                cy={normalized[normalized.length-1].y} 
                r="4" 
                fill="#84AC7C" 
            />
        </svg>
    );
};

export default RoutePictogram;