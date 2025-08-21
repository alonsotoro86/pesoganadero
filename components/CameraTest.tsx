import React, { useState, useRef, useEffect } from 'react';

export const CameraTest: React.FC = () => {
    const [isActive, setIsActive] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startCamera = async () => {
        try {
            setError(null);
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            });

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                
                videoRef.current.onloadedmetadata = () => {
                    videoRef.current?.play().then(() => {
                        setIsActive(true);
                        console.log('✅ Cámara iniciada correctamente');
                    }).catch((err) => {
                        console.error('❌ Error al reproducir video:', err);
                        setError('Error al reproducir video');
                    });
                };
            }
        } catch (err) {
            console.error('❌ Error al acceder a la cámara:', err);
            setError(err instanceof Error ? err.message : 'Error desconocido');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsActive(false);
        setError(null);
    };

    useEffect(() => {
        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    return (
        <div className="p-4 bg-white rounded-lg shadow">
            <h3 className="text-lg font-bold mb-4">🧪 Prueba de Cámara</h3>
            
            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    ❌ Error: {error}
                </div>
            )}

            <div className="mb-4">
                <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-48 bg-gray-200 rounded border"
                />
            </div>

            <div className="flex gap-2">
                {!isActive ? (
                    <button
                        onClick={startCamera}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        🎥 Iniciar Cámara
                    </button>
                ) : (
                    <button
                        onClick={stopCamera}
                        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                        ⏹️ Detener Cámara
                    </button>
                )}
            </div>

            <div className="mt-2 text-sm text-gray-600">
                Estado: {isActive ? '✅ Activa' : '⏸️ Inactiva'}
            </div>
        </div>
    );
};
