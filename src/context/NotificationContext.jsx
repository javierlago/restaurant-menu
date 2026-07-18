import { createContext, useContext, useCallback, useState } from 'react';
import ToastContainer from '../components/ToastContainer';
import ConfirmDialog from '../components/ConfirmDialog';

const NotificationContext = createContext();

export const useNotification = () => useContext(NotificationContext);

const TOAST_DURATION = 4000;

export const NotificationProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const [confirmState, setConfirmState] = useState(null);

    const dismissToast = useCallback((id) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const showToast = useCallback((message, type = 'info') => {
        const id = crypto.randomUUID();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => dismissToast(id), TOAST_DURATION);
    }, [dismissToast]);

    const confirmDialog = useCallback((message, options = {}) => {
        return new Promise((resolve) => {
            setConfirmState({ message, options, resolve });
        });
    }, []);

    const resolveConfirm = (result) => {
        confirmState?.resolve(result);
        setConfirmState(null);
    };

    return (
        <NotificationContext.Provider value={{ showToast, confirmDialog }}>
            {children}
            <ToastContainer toasts={toasts} onDismiss={dismissToast} />
            {confirmState && (
                <ConfirmDialog
                    message={confirmState.message}
                    confirmLabel={confirmState.options.confirmLabel}
                    cancelLabel={confirmState.options.cancelLabel}
                    onConfirm={() => resolveConfirm(true)}
                    onCancel={() => resolveConfirm(false)}
                />
            )}
        </NotificationContext.Provider>
    );
};
