import React from 'react';

interface DistanceInstructionsProps {
    isVisible: boolean;
    onClose: () => void;
}

export const DistanceInstructions: React.FC<DistanceInstructionsProps> = ({ isVisible, onClose }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-green-600 text-white p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">📏 Guía de Distancia</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-green-100 mt-2">
                        Aprende a usar las líneas de distancia para obtener mejores resultados
                    </p>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="space-y-6">
                        {/* Cómo usar las líneas */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                🎯 Cómo Usar las Líneas de Distancia
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                                        1
                                    </div>
                                    <div>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            <strong>Posiciona el animal</strong> en el centro del marco circular
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                                        2
                                    </div>
                                    <div>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            <strong>Observa las líneas horizontales</strong> en la parte superior de la pantalla
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-sm font-bold mt-0.5">
                                        3
                                    </div>
                                    <div>
                                        <p className="text-gray-700 dark:text-gray-300">
                                            <strong>Ajusta tu distancia</strong> hasta que el animal toque la línea verde (3-5m)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Zonas de distancia */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                🎨 Zonas de Distancia
                            </h3>
                            <div className="space-y-4">
                                <div className="border-l-4 border-green-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                                        <h4 className="font-semibold text-green-700 dark:text-green-400">Zona Verde (Óptima)</h4>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        <strong>3-5 metros:</strong> Distancia ideal para análisis preciso. El animal debe tocar esta línea.
                                    </p>
                                </div>

                                <div className="border-l-4 border-yellow-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                                        <h4 className="font-semibold text-yellow-700 dark:text-yellow-400">Zona Amarilla (Aceptable)</h4>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        <strong>2-6 metros:</strong> Distancia aceptable, pero puede afectar la precisión.
                                    </p>
                                </div>

                                <div className="border-l-4 border-red-500 pl-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                                        <h4 className="font-semibold text-red-700 dark:text-red-400">Zona Roja (Evitar)</h4>
                                    </div>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                                        <strong>Menos de 2m o más de 6m:</strong> Distancia no recomendada. Resultados imprecisos.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Consejos prácticos */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                💡 Consejos Prácticos
                            </h3>
                            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Usa objetos de referencia (postes, árboles) para medir la distancia</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Camina hacia atrás o adelante hasta que el animal toque la línea verde</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Mantén la cámara estable y paralela al suelo</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-500 mt-1">•</span>
                                        <span>Espera a que el animal esté quieto antes de capturar</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Ejemplo visual */}
                        <div>
                            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                                📱 Ejemplo Visual
                            </h3>
                            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-lg text-center">
                                <div className="text-6xl mb-2">📏</div>
                                <p className="text-gray-600 dark:text-gray-400 text-sm">
                                    En la cámara verás líneas horizontales de colores.
                                    <br />
                                    <strong>Objetivo:</strong> El animal debe tocar la línea verde central.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            💡 Las líneas te ayudarán a obtener análisis más precisos
                        </p>
                        <button
                            onClick={onClose}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            Entendido
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
