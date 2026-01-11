import { useRef, useEffect } from 'react';
import styles from './FocalPointSelector.module.css';

const FocalPointSelector = ({ imageUrl, value, onChange }) => {
    const containerRef = useRef(null);

    // Parse value (e.g., "50% 50%")
    const [xPerc, yPerc] = (value || '50% 50%').split(' ').map(v => parseFloat(v));

    const handleInteract = (e) => {
        if (!containerRef.current) return;

        const rect = containerRef.current.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;

        let x = ((clientX - rect.left) / rect.width) * 100;
        let y = ((clientY - rect.top) / rect.height) * 100;

        // Clamp 0-100
        x = Math.max(0, Math.min(100, x));
        y = Math.max(0, Math.min(100, y));

        onChange(`${x.toFixed(0)}% ${y.toFixed(0)}%`);
    };

    return (
        <div className={styles.wrapper}>
            <div
                ref={containerRef}
                className={styles.container}
                onClick={handleInteract}
                onTouchMove={(e) => {
                    e.preventDefault();
                    handleInteract(e);
                }}
            >
                {imageUrl ? (
                    <img src={imageUrl} alt="Focal adjustment" className={styles.image} />
                ) : (
                    <div className={styles.placeholder}>Sube una imagen primero</div>
                )}

                {imageUrl && (
                    <div
                        className={styles.marker}
                        style={{ left: `${xPerc}%`, top: `${yPerc}%` }}
                    />
                )}
            </div>
            <p className={styles.help}>Toca o arrastra para fijar el punto de interés</p>
        </div>
    );
};

export default FocalPointSelector;
