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
                        <h2 className="text-xl font-bold">📏 Guía de Distancia</h2>
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
                            <div className="text-4xl mb-3">🚗</div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                Recuadros de Distancia
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Como en una cámara de reversa, ajusta hasta que el animal toque los recuadros verdes.
                            </p>
                        </div>

                        {/* Zonas de distancia */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="w-8 h-6 bg-green-500 border border-white rounded-sm flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">📏</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-green-700 dark:text-green-400">Verde (3-5m):</span>
                                    <span className="text-sm text-green-600 dark:text-green-400 ml-2">Óptimo</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="w-8 h-6 bg-yellow-500 border border-white rounded-sm flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">⚠️</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-yellow-700 dark:text-yellow-400">Amarillo (2-6m):</span>
                                    <span className="text-sm text-yellow-600 dark:text-yellow-400 ml-2">Aceptable</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                                <div className="w-8 h-6 bg-red-500 border border-white rounded-sm flex items-center justify-center">
                                    <span className="text-white text-xs font-bold">❌</span>
                                </div>
                                <div>
                                    <span className="font-semibold text-red-700 dark:text-red-400">Rojo (&lt;2m o &gt;6m):</span>
                                    <span className="text-sm text-red-600 dark:text-red-400 ml-2">Evitar</span>
                                </div>
                            </div>
                        </div>

                        {/* Consejo rápido */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                💡 <strong>Tip:</strong> Como en una cámara de reversa, los recuadros más grandes indican mayor distancia.
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
