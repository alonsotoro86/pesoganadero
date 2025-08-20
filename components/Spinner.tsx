import React, { useState, useEffect } from 'react';

const loadingMessages = [
    "Analizando la imagen...",
    "Identificando la raza...",
    "Estimando el peso corporal...",
    "Calculando la condición...",
    "Casi listo...",
];

export const Spinner: React.FC = () => {
    const [messageIndex, setMessageIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setMessageIndex(prevIndex => (prevIndex + 1) % loadingMessages.length);
        }, 2500);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center space-y-3 p-4" role="status" aria-live="polite">
            <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-green-600 dark:text-green-400 font-medium text-center">
                {loadingMessages[messageIndex]}
            </p>
        </div>
    );
};
