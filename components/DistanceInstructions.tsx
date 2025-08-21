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
                        <h2 className="text-xl font-bold">📏 Guía Rápida</h2>
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
                            <div className="text-4xl mb-3">📏</div>
                            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2">
                                ¿Cómo usar la línea verde?
                            </h3>
                            <p className="text-gray-600 dark:text-gray-400 text-sm">
                                Posiciona el animal para que <strong>toque la línea verde</strong> en la parte superior de la pantalla.
                            </p>
                        </div>

                        {/* Distancia */}
                        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                <span className="font-semibold text-green-700 dark:text-green-400">Distancia Óptima: 3-5 metros</span>
                            </div>
                            <p className="text-sm text-green-600 dark:text-green-400">
                                Esta distancia asegura el análisis más preciso del peso del animal.
                            </p>
                        </div>

                        {/* Consejo rápido */}
                        <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                            <p className="text-sm text-blue-700 dark:text-blue-400">
                                💡 <strong>Tip:</strong> Camina hacia atrás o adelante hasta que el animal toque la línea verde.
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
