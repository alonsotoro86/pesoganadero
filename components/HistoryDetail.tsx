
import React from 'react';
import type { HistoryEntry } from '../types';
import { ResultDisplay } from './ResultDisplay';
import { BackIcon } from './icons';

interface HistoryDetailProps {
    item: HistoryEntry;
    onBack: () => void;
}

export const HistoryDetail: React.FC<HistoryDetailProps> = ({ item, onBack }) => {
    const resultForDisplay = {
        peso_kg: item.peso_kg,
        raza: item.raza,
        comentarios: item.comentarios,
    };

    return (
        <div className="w-full animate-fade-in">
            <button
                onClick={onBack}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300 mb-4"
            >
                <BackIcon />
                Volver al Historial
            </button>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
                Detalle de: <span className="text-green-600 dark:text-green-400">{item.name}</span>
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Analizado el {item.date}</p>
            <ResultDisplay result={resultForDisplay} imageUrl={item.imageUrl} />
        </div>
    );
};
