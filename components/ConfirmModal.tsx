import React from 'react';

interface ConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    type = 'danger'
}) => {
    if (!isOpen) return null;

    const getTypeStyles = () => {
        switch (type) {
            case 'danger':
                return {
                    icon: '⚠️',
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
                    iconBg: 'bg-red-100 dark:bg-red-900/20',
                    iconColor: 'text-red-600 dark:text-red-400'
                };
            case 'warning':
                return {
                    icon: '⚠️',
                    confirmButton: 'bg-yellow-600 hover:bg-yellow-700 text-white',
                    iconBg: 'bg-yellow-100 dark:bg-yellow-900/20',
                    iconColor: 'text-yellow-600 dark:text-yellow-400'
                };
            case 'info':
                return {
                    icon: 'ℹ️',
                    confirmButton: 'bg-blue-600 hover:bg-blue-700 text-white',
                    iconBg: 'bg-blue-100 dark:bg-blue-900/20',
                    iconColor: 'text-blue-600 dark:text-blue-400'
                };
            default:
                return {
                    icon: '⚠️',
                    confirmButton: 'bg-red-600 hover:bg-red-700 text-white',
                    iconBg: 'bg-red-100 dark:bg-red-900/20',
                    iconColor: 'text-red-600 dark:text-red-400'
                };
        }
    };

    const styles = getTypeStyles();

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        } else if (e.key === 'Enter') {
            handleConfirm();
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onKeyDown={handleKeyDown}
        >
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 scale-100">
                {/* Header */}
                <div className="flex items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${styles.iconBg}`}>
                        <span>{styles.icon}</span>
                    </div>
                    <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                        {message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 p-6 pt-0">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors duration-200"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors duration-200 ${styles.confirmButton}`}
                        autoFocus
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};




