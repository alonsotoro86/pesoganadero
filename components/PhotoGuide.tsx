import React, { useState } from 'react';

interface PhotoGuideProps {
    onClose: () => void;
}

export const PhotoGuide: React.FC<PhotoGuideProps> = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState<'distance' | 'angle' | 'lighting' | 'position'>('distance');

    const tabs = [
        { id: 'distance', label: '📏 Distancia', icon: '📏' },
        { id: 'angle', label: '📐 Ángulo', icon: '📐' },
        { id: 'lighting', label: '☀️ Iluminación', icon: '☀️' },
        { id: 'position', label: '🐄 Posición', icon: '🐄' }
    ];

    const distanceGuide = {
        title: "Distancia Óptima: 3-5 metros",
        description: "La distancia ideal para capturar el animal completo y obtener análisis precisos.",
        details: [
            "📏 **3-5 metros:** Distancia ideal para animales adultos",
            "📏 **2-3 metros:** Para terneros y animales pequeños",
            "📏 **5-7 metros:** Para animales muy grandes o grupos",
            "⚠️ **Evitar:** Distancias menores a 1.5m o mayores a 10m"
        ],
        tips: [
            "El animal debe ocupar 60-80% del encuadre",
            "Mantener una distancia consistente",
            "Usar objetos de referencia para medir distancia"
        ]
    };

    const angleGuide = {
        title: "Ángulo Lateral: 90° desde el costado",
        description: "La vista lateral proporciona la mejor información para el análisis de peso.",
        details: [
            "📐 **90° lateral:** Vista perfecta del perfil completo",
            "📐 **75-105°:** Rango aceptable de variación",
            "📐 **45°:** Solo para casos especiales",
            "❌ **Evitar:** Vistas frontales, traseras o muy anguladas"
        ],
        tips: [
            "El animal debe estar paralelo a la cámara",
            "Capturar desde la cabeza hasta la cola",
            "Evitar perspectivas distorsionadas"
        ]
    };

    const lightingGuide = {
        title: "Iluminación Natural: Luz difusa y uniforme",
        description: "La iluminación correcta es esencial para que la IA identifique detalles precisos.",
        details: [
            "☀️ **Luz natural:** Preferiblemente en días nublados",
            "☀️ **Sombra suave:** Evitar sombras duras",
            "☀️ **Sin reflejos:** Evitar brillos en el pelaje",
            "❌ **Evitar:** Luz directa del sol, sombras muy marcadas"
        ],
        tips: [
            "Tomar fotos en horas de luz suave (mañana/tarde)",
            "Evitar fotos con el sol de frente",
            "Usar sombras naturales para iluminación uniforme"
        ]
    };

    const positionGuide = {
        title: "Posición del Animal: Estático y natural",
        description: "El animal debe estar en una posición que permita ver su estructura completa.",
        details: [
            "🐄 **Pie firme:** Animal de pie, no acostado",
            "🐄 **Cabeza visible:** Perfil completo de la cabeza",
            "🐄 **Patas visibles:** Ver la estructura de las patas",
            "❌ **Evitar:** Animales en movimiento, acostados, parcialmente ocultos"
        ],
        tips: [
            "Esperar a que el animal esté quieto",
            "Capturar el perfil completo",
            "Asegurar que no haya obstáculos"
        ]
    };

    const getCurrentGuide = () => {
        switch (activeTab) {
            case 'distance': return distanceGuide;
            case 'angle': return angleGuide;
            case 'lighting': return lightingGuide;
            case 'position': return positionGuide;
            default: return distanceGuide;
        }
    };

    const currentGuide = getCurrentGuide();

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
                {/* Header */}
                <div className="bg-green-600 text-white p-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold">📸 Guía para Fotos Óptimas</h2>
                        <button
                            onClick={onClose}
                            className="text-white hover:text-gray-200 text-2xl font-bold"
                        >
                            ×
                        </button>
                    </div>
                    <p className="text-green-100 mt-2">
                        Sigue estas recomendaciones para obtener análisis más precisos
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 dark:border-gray-700">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${activeTab === tab.id
                                    ? 'text-green-600 border-b-2 border-green-600 bg-green-50 dark:bg-green-900/20'
                                    : 'text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
                                }`}
                        >
                            <span className="block text-lg mb-1">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                    <div className="mb-6">
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                            {currentGuide.title}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            {currentGuide.description}
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                📋 Especificaciones:
                            </h4>
                            <ul className="space-y-2">
                                {currentGuide.details.map((detail, index) => (
                                    <li key={index} className="text-gray-600 dark:text-gray-300 text-sm">
                                        {detail}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                💡 Consejos Prácticos:
                            </h4>
                            <ul className="space-y-2">
                                {currentGuide.tips.map((tip, index) => (
                                    <li key={index} className="text-gray-600 dark:text-gray-300 text-sm flex items-start">
                                        <span className="text-green-500 mr-2">•</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Visual Guide */}
                    {activeTab === 'distance' && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                🎯 Distancia Recomendada:
                            </h4>
                            <div className="text-center">
                                <div className="inline-block bg-green-100 dark:bg-green-900/30 p-4 rounded-lg">
                                    <div className="text-3xl mb-2">📏</div>
                                    <div className="text-lg font-bold text-green-700 dark:text-green-300">
                                        3-5 metros
                                    </div>
                                    <div className="text-sm text-green-600 dark:text-green-400">
                                        Distancia ideal
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'angle' && (
                        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <h4 className="font-semibold text-gray-800 dark:text-white mb-3">
                                📐 Ángulo Óptimo:
                            </h4>
                            <div className="text-center">
                                <div className="inline-block bg-blue-100 dark:bg-blue-900/30 p-4 rounded-lg">
                                    <div className="text-3xl mb-2">📐</div>
                                    <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
                                        90° Lateral
                                    </div>
                                    <div className="text-sm text-blue-600 dark:text-blue-400">
                                        Vista de perfil completo
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 border-t border-gray-200 dark:border-gray-600">
                    <div className="flex justify-between items-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            💡 Sigue estas recomendaciones para mejores resultados
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




