
import React from 'react';
import { CowIcon, HistoryIcon } from './icons';

interface HeaderProps {
    historyCount: number;
    onViewHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({ historyCount, onViewHistory }) => {
    return (
        <header className="text-center relative">
            <div className="flex justify-center items-center gap-4">
                <CowIcon />
                <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
                    Peso Ganadero AI
                </h1>
            </div>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-2">
                Calcula el peso de tu ganado con una foto
            </p>
            {historyCount > 0 && (
                <button 
                    onClick={onViewHistory} 
                    className="absolute top-0 right-0 flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
                    aria-label={`Ver historial (${historyCount} registros)`}
                >
                    <HistoryIcon />
                    <span className="hidden sm:inline">Historial</span>
                </button>
            )}
        </header>
    );
};
