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

            {/* Línea de distancia óptima (3-5 metros) */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className="w-16 h-0.5 bg-green-400"></div>
                    <div className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">
                        📏 3-5m
                    </div>
                    <div className="w-16 h-0.5 bg-green-400"></div>
                </div>
            </div>

            {/* Texto de guía central */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
                    <p className="font-semibold">🐄 Posiciona aquí</p>
                    <p className="text-xs opacity-90">Toca la línea verde</p>
                </div>
            </div>
        </div>
    );
};
