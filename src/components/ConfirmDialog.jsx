import { useEffect, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

const ConfirmDialog = ({ message, confirmLabel = 'Eliminar', cancelLabel = 'Cancelar', onConfirm, onCancel }) => {
    const cancelRef = useRef(null);

    useEffect(() => {
        cancelRef.current?.focus();

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') onCancel();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onCancel]);

    return (
        <div className={styles.overlay} onClick={onCancel}>
            <div
                className={styles.dialog}
                role="alertdialog"
                aria-modal="true"
                aria-describedby="confirm-dialog-message"
                onClick={(e) => e.stopPropagation()}
            >
                <p id="confirm-dialog-message" className={styles.message}>{message}</p>
                <div className={styles.actions}>
                    <button type="button" ref={cancelRef} className={styles.cancelBtn} onClick={onCancel}>
                        {cancelLabel}
                    </button>
                    <button type="button" className={styles.confirmBtn} onClick={onConfirm}>
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
