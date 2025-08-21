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

    // Función para detectar objetos usando TensorFlow.js o una aproximación simple
    const detectObjects = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        // Configurar canvas para el análisis
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Dibujar el frame actual en el canvas
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Obtener datos de imagen para análisis
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Detección simple basada en diferencias de color (aproximación)
        const objects: DetectedObject[] = [];
        const threshold = 50; // Umbral para detectar cambios significativos

        // Analizar la imagen en busca de objetos grandes (posibles animales)
        for (let y = 0; y < canvas.height; y += 10) {
            for (let x = 0; x < canvas.width; x += 10) {
                const index = (y * canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                // Detectar áreas con colores que podrían ser animales (marrón, negro, etc.)
                if (r > 100 && g > 80 && b < 120) { // Detección simple de colores marrones
                    objects.push({
                        x,
                        y,
                        width: 50,
                        height: 50,
                        confidence: 0.7
                    });
                }
            }
        }

        // Agrupar objetos cercanos
        const groupedObjects = groupNearbyObjects(objects);
        setDetectedObjects(groupedObjects);

        // Calcular distancia basada en el tamaño del objeto detectado
        if (groupedObjects.length > 0) {
            const largestObject = groupedObjects.reduce((largest, current) => 
                (current.width * current.height) > (largest.width * largest.height) ? current : largest
            );

            // Calcular distancia aproximada basada en el tamaño del objeto
            const distance = calculateDistance(largestObject, canvas.width, canvas.height);
            setDistance(distance);
        } else {
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
                
                if (distance < 100) {
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
                            '📏 Esperando...'
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
                        {obj.confidence > 0.5 ? '🐄' : '?'}
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
        </div>
    );
};
