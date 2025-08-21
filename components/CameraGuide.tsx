import React from 'react';

interface CameraGuideProps {
    isVisible: boolean;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="absolute inset-0 pointer-events-none camera-guide">
            {/* Marco de guía */}
            <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg opacity-80 guide-frame"></div>
            
            {/* Indicadores de esquina */}
            <div className="absolute top-4 left-4 w-8 h-8 border-l-4 border-t-4 border-green-400 rounded-tl-lg"></div>
            <div className="absolute top-4 right-4 w-8 h-8 border-r-4 border-t-4 border-green-400 rounded-tr-lg"></div>
            <div className="absolute bottom-4 left-4 w-8 h-8 border-l-4 border-b-4 border-green-400 rounded-bl-lg"></div>
            <div className="absolute bottom-4 right-4 w-8 h-8 border-r-4 border-b-4 border-green-400 rounded-br-lg"></div>
            
            {/* Texto de guía */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-sm">
                    <p className="font-semibold">🐄 Posiciona el animal aquí</p>
                    <p className="text-xs opacity-90">Vista lateral, 3-5 metros de distancia</p>
                </div>
            </div>
            
            {/* Indicadores de distancia */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                📏 3-5m
            </div>
            
            {/* Indicador de ángulo */}
            <div className="absolute bottom-1/4 right-4 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                📐 90°
            </div>
        </div>
    );
};
