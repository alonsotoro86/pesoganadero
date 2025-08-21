import React, { useEffect, useRef, useState } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as cocoSsd from '@tensorflow-models/coco-ssd';

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
    class: string;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible, videoRef }) => {
    const [distance, setDistance] = useState<number | null>(null);
    const [detectedObjects, setDetectedObjects] = useState<DetectedObject[]>([]);
    const [model, setModel] = useState<cocoSsd.ObjectDetection | null>(null);
    const [isModelLoading, setIsModelLoading] = useState(false);
    const [useFallback, setUseFallback] = useState(false);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    // Inicializar TensorFlow.js y cargar el modelo
    useEffect(() => {
        const loadModel = async () => {
            try {
                setIsModelLoading(true);
                console.log('Inicializando TensorFlow.js...');

                // Inicializar TensorFlow.js con backend webgl
                await tf.ready();
                console.log('TensorFlow.js inicializado');

                // Intentar cargar el modelo
                console.log('Cargando modelo de detección...');
                const loadedModel = await cocoSsd.load();
                setModel(loadedModel);
                setUseFallback(false);
                console.log('Modelo cargado exitosamente');

            } catch (error) {
                console.error('Error cargando el modelo:', error);
                console.log('Usando detección simple como fallback...');
                setUseFallback(true);
                setModel(null);
            } finally {
                setIsModelLoading(false);
            }
        };

        if (isVisible) {
            loadModel();
        }
    }, [isVisible]);

    // Función para detectar objetos usando TensorFlow.js
    const detectObjects = async () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        try {
            // Configurar canvas para el análisis
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            if (model && !useFallback) {
                // Usar TensorFlow.js si está disponible
                const predictions = await model.detect(video);

                // Filtrar objetos relevantes (personas, animales, etc.)
                const relevantObjects = predictions.filter(pred =>
                    ['person', 'dog', 'cat', 'horse', 'cow', 'sheep', 'bear', 'zebra', 'giraffe'].includes(pred.class)
                );

                // Convertir a nuestro formato
                const objects: DetectedObject[] = relevantObjects.map(pred => ({
                    x: pred.bbox[0],
                    y: pred.bbox[1],
                    width: pred.bbox[2],
                    height: pred.bbox[3],
                    confidence: pred.score,
                    class: pred.class
                }));

                setDetectedObjects(objects);

                // Calcular distancia basada en el objeto más grande y confiable
                if (objects.length > 0) {
                    const bestObject = objects.reduce((best, current) =>
                        (current.confidence * current.width * current.height) > (best.confidence * best.width * best.height) ? current : best
                    );

                    const distance = calculateDistance(bestObject, canvas.width, canvas.height);
                    setDistance(distance);
                } else {
                    setDistance(null);
                }
            } else {
                // Usar detección simple como fallback
                fallbackDetection();
            }

        } catch (error) {
            console.error('Error en detección:', error);
            // Fallback a detección simple si falla TensorFlow
            fallbackDetection();
        }

        // Continuar la detección
        animationRef.current = requestAnimationFrame(detectObjects);
    };

    // Detección simple como fallback
    const fallbackDetection = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        if (!ctx) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        const objects: DetectedObject[] = [];
        const step = 20; // Analizar cada 20 píxeles

        for (let y = 0; y < canvas.height; y += step) {
            for (let x = 0; x < canvas.width; x += step) {
                const index = (y * canvas.width + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];

                // Detectar colores que podrían ser animales (marrón, negro, etc.)
                if ((r > 80 && g > 60 && b < 100) || // Marrón
                    (r < 50 && g < 50 && b < 50)) {  // Negro
                    objects.push({
                        x,
                        y,
                        width: 100,
                        height: 100,
                        confidence: 0.5,
                        class: 'animal'
                    });
                }
            }
        }

        // Agrupar objetos cercanos
        const groupedObjects = groupNearbyObjects(objects);
        setDetectedObjects(groupedObjects);

        if (groupedObjects.length > 0) {
            const largestObject = groupedObjects.reduce((largest, current) =>
                (current.width * current.height) > (largest.width * largest.height) ? current : largest
            );
            const distance = calculateDistance(largestObject, canvas.width, canvas.height);
            setDistance(distance);
        } else {
            setDistance(null);
        }
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

                if (distance < 150) {
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
                confidence: Math.max(...group.map(g => g.confidence)),
                class: group[0].class
            };
        });
    };

    // Calcular distancia aproximada basada en el tamaño del objeto
    const calculateDistance = (object: DetectedObject, canvasWidth: number, canvasHeight: number): number => {
        // Tamaño de referencia para un animal a 3 metros
        const referenceSize = Math.min(canvasWidth, canvasHeight) * 0.25;
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
        if (isVisible && videoRef.current && !isModelLoading) {
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
    }, [isVisible, isModelLoading, useFallback]);

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
                        ) : isModelLoading ? (
                            '🤖 Cargando IA...'
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
                        {obj.confidence > 0.7 ? '🐄' : obj.confidence > 0.5 ? '?' : '!'}
                    </div>
                </div>
            ))}

            {/* Instrucción dinámica */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    {isModelLoading ? (
                        '🤖 Inicializando IA...'
                    ) : distance ? (
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

            {/* Indicador de modo de detección */}
            {useFallback && (
                <div className="absolute top-4 right-4 bg-yellow-500 text-white px-2 py-1 rounded text-xs">
                    🔧 Modo Simple
                </div>
            )}
        </div>
    );
};
