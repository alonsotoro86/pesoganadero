import React from 'react';

interface CameraGuideProps {
    isVisible: boolean;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 pointer-events-none camera-guide">
            {/* Líneas de distancia - Estilo simple y elegante */}

            {/* Línea de distancia óptima (3-5 metros) - Verde */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-0.5 bg-green-400"></div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        📏 3-5m
                    </div>
                    <div className="w-16 h-0.5 bg-green-400"></div>
                </div>
            </div>
        </div>
    );
};
