import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import styles from './ToastContainer.module.css';

const ICONS = {
    success: FaCheckCircle,
    error: FaExclamationCircle,
    info: FaInfoCircle,
};

const ToastContainer = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className={styles.container} aria-live="polite">
            {toasts.map(({ id, message, type }) => {
                const Icon = ICONS[type] || ICONS.info;
                return (
                    <div
                        key={id}
                        className={`${styles.toast} ${styles[type] || styles.info}`}
                        role={type === 'error' ? 'alert' : 'status'}
                    >
                        <Icon className={styles.icon} />
                        <span className={styles.message}>{message}</span>
                        <button
                            type="button"
                            className={styles.closeBtn}
                            onClick={() => onDismiss(id)}
                            aria-label="Cerrar"
                        >
                            <FaTimes />
                        </button>
                    </div>
                );
            })}
        </div>
    );
};

export default ToastContainer;
