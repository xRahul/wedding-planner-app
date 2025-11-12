const { useState, useEffect, useRef } = React;

// ==================== NOTIFICATION COMPONENT ====================

const Notification = ({ message, type = 'success', onClose }) => {
    const timerRef = useRef(null);

    useEffect(() => {
        timerRef.current = setTimeout(() => {
            onClose();
        }, 3000);
        
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
        };
    }, []);

    return (
        <div className={`notification-banner notification-${type}`} role="status">
            {type === 'success' ? '✅' : 'ℹ️'} {message}
        </div>
    );
};

// ==================== NOTIFICATION HOOK ====================

const useNotification = () => {
    const [notification, setNotification] = useState(null);
    const timeoutRef = useRef(null);

    const showNotification = (message, type = 'success') => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
        setNotification({ message, type });
    };

    const closeNotification = () => {
        setNotification(null);
    };

    return { notification, showNotification, closeNotification };
};
