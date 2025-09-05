
import React from 'react';
import type { CowAnalysisResult } from '../types';
import { WeightIcon, BreedIcon, CommentIcon } from './icons';

interface ResultDisplayProps {
    result: CowAnalysisResult;
    imageUrl: string;
}

const ResultCard: React.FC<{ icon: React.ReactNode; label: string; value: string; unit?: string; color?: string }> = ({ icon, label, value, unit, color = "text-green-600 dark:text-green-400" }) => (
    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg flex items-center">
        <div className={`mr-4 ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className="text-lg font-bold text-gray-800 dark:text-white">
                {value} <span className="text-base font-normal">{unit}</span>
            </p>
        </div>
    </div>
);

const ConfidenceBar: React.FC<{ confidence: number }> = ({ confidence }) => {
    const getColor = (conf: number) => {
        if (conf >= 80) return 'bg-green-500';
        if (conf >= 60) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    return (
        <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
            <div 
                className={`h-2 rounded-full transition-all duration-300 ${getColor(confidence)}`}
                style={{ width: `${confidence}%` }}
            />
        </div>
    );
};

const ConditionIndicator: React.FC<{ condition: number }> = ({ condition }) => {
    const getConditionText = (cond: number) => {
        if (cond <= 1) return 'Muy Magro';
        if (cond <= 2) return 'Magro';
        if (cond <= 3) return 'Normal';
        if (cond <= 4) return 'Gordo';
        return 'Muy Gordo';
    };

    const getConditionColor = (cond: number) => {
        if (cond <= 2) return 'text-red-600 dark:text-red-400';
        if (cond <= 3) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Condición Corporal</p>
            <div className="flex items-center justify-between">
                <span className={`font-bold ${getConditionColor(condition)}`}>
                    {getConditionText(condition)} ({condition}/5)
                </span>
                <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map(level => (
                        <div 
                            key={level}
                            className={`w-3 h-3 rounded-full ${level <= condition ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, imageUrl }) => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-fade-in">
            <img src={imageUrl} alt="Vaca analizada" className="w-full h-56 object-cover" />
            <div className="p-6 space-y-4">
                <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white">Resultados del Análisis</h2>
                
                {/* Información principal */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

                {/* Información adicional */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <ResultCard
                        icon={<div className="w-6 h-6">🐄</div>}
                        label="Edad Estimada"
                        value={result.edad_estimada}
                        color="text-blue-600 dark:text-blue-400"
                    />
                    <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Confianza del Análisis</p>
                        <div className="flex items-center space-x-2">
                            <span className="text-lg font-bold text-gray-800 dark:text-white">
                                {result.confianza}%
                            </span>
                            <ConfidenceBar confidence={result.confianza} />
                        </div>
                    </div>
                </div>

                {/* Condición corporal */}
                <ConditionIndicator condition={result.condicion_corporal} />

                {/* Comentarios detallados */}
                <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg">
                    <div className="flex items-start">
                        <div className="mr-4 text-green-600 dark:text-green-400 mt-1 flex-shrink-0"><CommentIcon /></div>
                        <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Análisis Detallado</p>
                            <p className="text-gray-700 dark:text-gray-300 italic">"{result.comentarios}"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
