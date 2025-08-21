import React from 'react';
import { useConnectionStatus } from '../services/connectionService';

export const ConnectionStatus: React.FC = () => {
    const { isOnline, isStable } = useConnectionStatus();

    if (isOnline && isStable) {
        return null; // No mostrar nada si la conexión está bien
    }

    return (
        <div className="fixed top-4 right-4 z-50">
            {!isOnline ? (
                <div className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-pulse">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-sm font-medium">Sin conexión</span>
                </div>
            ) : !isStable ? (
                <div className="bg-yellow-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Conexión lenta</span>
                </div>
            ) : null}
        </div>
    );
};
