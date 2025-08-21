import React, { useEffect, useRef, useState } from 'react';

interface CameraGuideProps {
    isVisible: boolean;
    videoRef: React.RefObject<HTMLVideoElement>;
}

interface DetectedObject {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible, videoRef }) => {
    const [distance, setDistance] = useState<number | null>(null);
    const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    // Función para detectar objetos usando análisis de imagen simple
    const detectObjects = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) return;

        try {
            // Configurar canvas para el análisis
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            const objects: DetectedObject[] = [];
            const step = 30; // Analizar cada 30 píxeles para mejor rendimiento

            // Detectar objetos grandes en el centro de la imagen
            for (let y = canvas.height * 0.2; y < canvas.height * 0.8; y += step) {
                for (let x = canvas.width * 0.2; x < canvas.width * 0.8; x += step) {
                    const index = (y * canvas.width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    // Detectar colores que podrían ser animales (marrón, negro, gris)
                    if ((r > 60 && g > 40 && b < 80) || // Marrón
                        (r < 60 && g < 60 && b < 60) ||  // Negro/Gris
                        (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r < 120)) { // Gris uniforme
                        objects.push({
                            x,
                            y,
                            width: 150,
                            height: 150,
                            confidence: 0.6
                        });
                    }
                }
            }

            // Agrupar objetos cercanos
            const groupedObjects = groupNearbyObjects(objects);
            setDetectedObjects(groupedObjects);

            // Calcular distancia basada en el objeto más grande
            if (groupedObjects.length > 0) {
                const largestObject = groupedObjects.reduce((largest, current) => 
                    (current.width * current.height) > (largest.width * largest.height) ? current : largest
                );
                const distance = calculateDistance(largestObject, canvas.width, canvas.height);
                setDistance(distance);
            } else {
                setDistance(null);
            }

        } catch (error) {
            console.error('Error en detección:', error);
            setDistance(null);
        }

        // Continuar la detección
        animationRef.current = requestAnimationFrame(detectObjects);
    };

    // Agrupar objetos cercanos
    const groupNearbyObjects = (objects: DetectedObject[]): DetectedObject[] => {
        const groups: DetectedObject[][] = [];
        
        objects.forEach(obj => {
            let addedToGroup = false;
            
            for (const group of groups) {
                const groupCenter = group.reduce((acc, g) => ({
                    x: acc.x + g.x,
                    y: acc.y + g.y
                }), { x: 0, y: 0 });
                
                groupCenter.x /= group.length;
                groupCenter.y /= group.length;
                
                const distance = Math.sqrt(
                    Math.pow(obj.x - groupCenter.x, 2) + Math.pow(obj.y - groupCenter.y, 2)
                );
                
                if (distance < 200) {
                    group.push(obj);
                    addedToGroup = true;
                    break;
                }
            }
            
            if (!addedToGroup) {
                groups.push([obj]);
            }
        });
        
        return groups.map(group => {
            const center = group.reduce((acc, g) => ({
                x: acc.x + g.x,
                y: acc.y + g.y
            }), { x: 0, y: 0 });
            
            center.x /= group.length;
            center.y /= group.length;
            
            return {
                x: center.x,
                y: center.y,
                width: Math.max(...group.map(g => g.width)),
                height: Math.max(...group.map(g => g.height)),
                confidence: Math.max(...group.map(g => g.confidence))
            };
        });
    };

    // Calcular distancia aproximada basada en el tamaño del objeto
    const calculateDistance = (object: DetectedObject, canvasWidth: number, canvasHeight: number): number => {
        // Tamaño de referencia para un animal a 3 metros
        const referenceSize = Math.min(canvasWidth, canvasHeight) * 0.3;
        const objectSize = Math.max(object.width, object.height);
        
        // Fórmula inversa: distancia = tamaño_referencia * distancia_referencia / tamaño_objeto
        const estimatedDistance = (referenceSize * 3) / objectSize;
        
        return Math.max(1, Math.min(10, estimatedDistance)); // Limitar entre 1-10 metros
    };

    // Obtener color y texto basado en la distancia
    const getDistanceInfo = (distance: number) => {
        if (distance < 2) {
            return { color: 'red', text: 'Muy cerca', icon: '❌' };
        } else if (distance < 3) {
            return { color: 'yellow', text: 'Cerca', icon: '⚠️' };
        } else if (distance <= 5) {
            return { color: 'green', text: 'Óptimo', icon: '📏' };
        } else if (distance < 7) {
            return { color: 'yellow', text: 'Lejos', icon: '⚠️' };
        } else {
            return { color: 'red', text: 'Muy lejos', icon: '❌' };
        }
    };

    useEffect(() => {
        if (isVisible && videoRef.current) {
            // Iniciar detección cuando la cámara esté lista
            const video = videoRef.current;
            if (video.readyState >= 2) { // HAVE_CURRENT_DATA
                detectObjects();
            } else {
                video.addEventListener('loadeddata', detectObjects);
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isVisible]);

    if (!isVisible) return null;

    const distanceInfo = distance ? getDistanceInfo(distance) : null;

    return (
        <div className="absolute inset-0 pointer-events-none camera-guide">
            {/* Canvas oculto para análisis */}
            <canvas 
                ref={canvasRef} 
                className="hidden"
                style={{ position: 'absolute', top: '-9999px' }}
            />
            
            {/* Línea de distancia interactiva */}
            <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2">
                <div className="flex items-center gap-2">
                    <div className={`w-16 h-0.5 ${distanceInfo?.color === 'green' ? 'bg-green-400' : distanceInfo?.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                    <div className={`${distanceInfo?.color === 'green' ? 'bg-green-500' : distanceInfo?.color === 'yellow' ? 'bg-yellow-500' : 'bg-red-500'} text-white px-2 py-1 rounded text-xs font-bold`}>
                        {distance ? (
                            <>
                                {distanceInfo?.icon} {distance.toFixed(1)}m
                                <div className="text-xs opacity-75">{distanceInfo?.text}</div>
                            </>
                        ) : (
                            '🔍 Esperando objeto...'
                        )}
                    </div>
                    <div className={`w-16 h-0.5 ${distanceInfo?.color === 'green' ? 'bg-green-400' : distanceInfo?.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                </div>
            </div>

            {/* Indicador de objetos detectados */}
            {detectedObjects.map((obj, index) => (
                <div
                    key={index}
                    className="absolute border-2 border-green-400 bg-green-400 bg-opacity-20 rounded"
                    style={{
                        left: `${(obj.x / (videoRef.current?.videoWidth || 640)) * 100}%`,
                        top: `${(obj.y / (videoRef.current?.videoHeight || 480)) * 100}%`,
                        width: `${(obj.width / (videoRef.current?.videoWidth || 640)) * 100}%`,
                        height: `${(obj.height / (videoRef.current?.videoHeight || 480)) * 100}%`,
                    }}
                >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                        🐄
                    </div>
                </div>
            ))}

            {/* Instrucción dinámica */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    {distance ? (
                        distance >= 3 && distance <= 5 ? (
                            '✅ Distancia perfecta - Toma la foto'
                        ) : distance < 3 ? (
                            '⬅️ Retrocede para alejarte'
                        ) : (
                            '➡️ Acércate más'
                        )
                    ) : (
                        '🔍 Detectando objeto...'
                    )}
                </div>
            </div>

            {/* Indicador de modo simple */}
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                🔧 Modo Simple
            </div>
        </div>
    );
};
