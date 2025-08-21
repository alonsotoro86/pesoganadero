import React from 'react';

interface CameraGuideProps {
    isVisible: boolean;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 pointer-events-none camera-guide">
            {/* Línea de distancia - Zona muy cerca (menos de 2m) */}
            <div className="absolute top-1/8 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-0.5 bg-red-400"></div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        ❌ &lt;2m
                    </div>
                    <div className="w-8 h-0.5 bg-red-400"></div>
                </div>
            </div>

            {/* Línea de distancia - Zona aceptable (2-6 metros) */}
            <div className="absolute top-1/6 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-12 h-0.5 bg-yellow-400"></div>
                    <div className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                        ⚠️ 2-6m
                    </div>
                    <div className="w-12 h-0.5 bg-yellow-400"></div>
                </div>
            </div>

            {/* Línea de distancia - Zona óptima (3-5 metros) */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-0.5 bg-green-400"></div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        📏 3-5m
                    </div>
                    <div className="w-16 h-0.5 bg-green-400"></div>
                </div>
            </div>

            {/* Línea de distancia - Zona muy lejos (más de 6m) */}
            <div className="absolute top-1/3 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-20 h-0.5 bg-red-400"></div>
                    <div className="bg-red-500 text-white px-2 py-1 rounded text-xs">
                        ❌ &gt;6m
                    </div>
                    <div className="w-20 h-0.5 bg-red-400"></div>
                </div>
            </div>
        </div>
    );
};
