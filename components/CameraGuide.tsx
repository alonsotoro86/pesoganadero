import React from 'react';

interface CameraGuideProps {
    isVisible: boolean;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 pointer-events-none camera-guide">
            {/* Recuadros de distancia - Estilo cámara de reversa */}

            {/* Zona muy cerca (menos de 2m) - Rojo */}
            <div className="absolute top-1/8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-8 bg-red-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">❌</span>
                    </div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold border border-white">
                        &lt;2m
                    </div>
                    <div className="w-12 h-8 bg-red-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">❌</span>
                    </div>
                </div>
            </div>

            {/* Zona aceptable (2-6 metros) - Amarillo */}
            <div className="absolute top-1/6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-10 bg-yellow-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">⚠️</span>
                    </div>
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs font-bold border border-white">
                        2-6m
                    </div>
                    <div className="w-16 h-10 bg-yellow-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-xs font-bold">⚠️</span>
                    </div>
                </div>
            </div>

            {/* Zona óptima (3-5 metros) - Verde */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-20 h-12 bg-green-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📏</span>
                    </div>
                    <div className="bg-green-500 text-white px-3 py-2 rounded text-sm font-bold border border-white">
                        3-5m
                    </div>
                    <div className="w-20 h-12 bg-green-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-sm font-bold">📏</span>
                    </div>
                </div>
            </div>

            {/* Zona muy lejos (más de 6m) - Rojo */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-24 h-14 bg-red-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-sm font-bold">❌</span>
                    </div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold border border-white">
                        &gt;6m
                    </div>
                    <div className="w-24 h-14 bg-red-500 border-2 border-white rounded-sm flex items-center justify-center">
                        <span className="text-white text-sm font-bold">❌</span>
                    </div>
                </div>
            </div>
        </div>
    );
};
