
import React from 'react';
import type { CowAnalysisResult } from '../types';
import { WeightIcon, BreedIcon, CommentIcon } from './icons';

interface ResultDisplayProps {
    result: CowAnalysisResult;
    imageUrl: string;
}

const ResultCard: React.FC<{ icon: React.ReactNode; label: string; value: string; unit?: string }> = ({ icon, label, value, unit }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center">
        <div className="mr-4 text-green-600 dark:text-green-400">{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
                {value} <span className="text-base font-normal">{unit}</span>
            </p>
        </div>
    </div>
);

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, imageUrl }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in">
            <img src={imageUrl} alt="Vaca analizada" className="w-full h-56 object-cover" />
            <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Resultados del Análisis</h2>
                <div className="space-y-3">
                    <ResultCard
                        icon={<WeightIcon />}
                        label="Peso Estimado"
                        value={result.peso_kg.toString()}
                        unit="kg"
                    />
                    <ResultCard
                        icon={<BreedIcon />}
                        label="Raza Probable"
                        value={result.raza}
                    />
                </div>
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-start">
                        <div className="mr-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0"><CommentIcon /></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Comentarios de la IA</p>
                            <p className="text-gray-700 dark:text-gray-300 italic">"{result.comentarios}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
