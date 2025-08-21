import React from 'react';

interface CameraGuideProps {
    isVisible: boolean;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 pointer-events-none camera-guide">
            {/* Marco de guía principal */}
            <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-80 guide-frame"></div>
            
            {/* Indicadores de esquina */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>
            
            {/* Líneas de distancia - Zona óptima (3-5 metros) */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-0.5 bg-green-400"></div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        📏 3-5m
                    </div>
                    <div className="w-16 h-0.5 bg-green-400"></div>
                </div>
            </div>

            {/* Líneas de distancia - Zona aceptable (2-6 metros) */}
            <div className="absolute top-1/6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-0.5 bg-yellow-400"></div>
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                        ⚠️ 2-6m
                    </div>
                    <div className="w-12 h-0.5 bg-yellow-400"></div>
                </div>
            </div>

            {/* Líneas de distancia - Zona muy cerca (menos de 2m) */}
            <div className="absolute top-1/8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-400"></div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        ❌ &lt;2m
                    </div>
                    <div className="w-8 h-0.5 bg-red-400"></div>
                </div>
            </div>

            {/* Líneas de distancia - Zona muy lejos (más de 6m) */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-20 h-0.5 bg-red-400"></div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        ❌ &gt;6m
                    </div>
                    <div className="w-20 h-0.5 bg-red-400"></div>
                </div>
            </div>

            {/* Líneas verticales de referencia */}
            <div className="absolute top-1/4 left-1/4 w-0.5 h-32 bg-green-400 opacity-60"></div>
            <div className="absolute top-1/4 right-1/4 w-0.5 h-32 bg-green-400 opacity-60"></div>
            
            {/* Líneas horizontales de referencia */}
            <div className="absolute top-1/4 left-1/4 w-32 h-0.5 bg-green-400 opacity-60"></div>
            <div className="absolute top-1/4 right-1/4 w-32 h-0.5 bg-green-400 opacity-60"></div>
            <div className="absolute bottom-1/4 left-1/4 w-32 h-0.5 bg-green-400 opacity-60"></div>
            <div className="absolute bottom-1/4 right-1/4 w-32 h-0.5 bg-green-400 opacity-60"></div>

            {/* Texto de guía central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
                    <p className="font-semibold">🐄 Posiciona el animal aquí</p>
                    <p className="text-xs opacity-90">Vista lateral, distancia óptima 3-5m</p>
                </div>
            </div>
            
            {/* Indicador de ángulo */}
            <div className="absolute bottom-1/4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                📐 90° Lateral
            </div>

            {/* Instrucciones de distancia */}
            <div className="absolute bottom-4 left-4 bg-black bg-opacity-70 text-white px-3 py-2 rounded text-xs max-w-48">
                <p className="font-semibold mb-1">📏 Guía de Distancia:</p>
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                        <span>Verde: 3-5m (Óptimo)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <span>Amarillo: 2-6m (Aceptable)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <span>Rojo: &lt;2m o &gt;6m (Evitar)</span>
                    </div>
                </div>
            </div>

            {/* Indicador de enfoque */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 border-2 border-white border-dashed rounded-full opacity-60"></div>
            </div>
        </div>
    );
};
