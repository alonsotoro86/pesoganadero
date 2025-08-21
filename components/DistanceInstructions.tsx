import React from 'react';

interface DistanceInstructionsProps {
    isVisible: boolean;
    onClose: () => void;
}

export const DistanceInstructions: React.FC<DistanceInstructionsProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full shadow-2xl">
                {/* Header */}
                <div className="bg-green-600 text-white p-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">📏 Medición Inteligente</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="space-y-4">
                        {/* Instrucción simple */}
                        <div className="text-center">
                            <div className="text-4xl mb-3">🤖</div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                IA Detecta y Mide Automáticamente
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                La aplicación detecta automáticamente el animal y mide la distancia en tiempo real.
                            </p>
                        </div>

                        {/* Indicadores de color */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="w-8 h-6 bg-green-500 rounded-sm flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">📏</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-green-700 dark:text-green-400">Verde (3-5m):</span>
                                    <span className="text-sm text-green-600 dark:text-green-400 ml-2">¡Perfecto! Toma la foto</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="w-8 h-6 bg-yellow-500 rounded-sm flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">⚠️</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-yellow-700 dark:text-yellow-400">Amarillo:</span>
                                    <span className="text-sm text-yellow-600 dark:text-yellow-400 ml-2">Ajusta la distancia</span>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="w-8 h-6 bg-red-500 rounded-sm flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">❌</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-red-700 dark:text-red-400">Rojo:</span>
                                    <span className="text-sm text-red-600 dark:text-red-400 ml-2">Muy cerca o muy lejos</span>
                                </div>
                            </div>
                        </div>

                        {/* Funcionalidades */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-700 dark:text-blue-400 mb-2">✨ Funcionalidades:</h4>
                            <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                                <li>• <strong>Detección automática</strong> del animal</li>
                                <li>• <strong>Medición en tiempo real</strong> de la distancia</li>
                                <li>• <strong>Indicadores visuales</strong> con colores</li>
                                <li>• <strong>Instrucciones dinámicas</strong> para ajustar</li>
                            </ul>
                        </div>

                        {/* Consejo rápido */}
                        <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg">
                            <p className="text-sm text-purple-700 dark:text-purple-400">
                                💡 <strong>Tip:</strong> La línea cambia de color automáticamente. Espera a que sea verde para obtener el mejor resultado.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
                    <button
                        onClick={onClose}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Entendido
                    </button>
                </div>
            </div>
        </div>
    );
};
