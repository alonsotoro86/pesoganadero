import React, { useEffect, useRef, useState } from 'react';

interface CameraGuideProps {
    isVisible: boolean;
    videoRef: React.RefObject<HTMLVideoElement>;
}

interface DetectedAnimal {
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible, videoRef }) => {
    const [distance, setDistance] = useState<number | null>(null);
    const [detectedAnimal, setDetectedAnimal] = useState<DetectedAnimal | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();

    // Función para detectar el animal usando análisis de imagen simple
    const detectAnimal = () => {
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

            let largestArea = 0;
            let bestAnimal: DetectedAnimal | null = null;
            const step = 15; // Analizar cada 15 píxeles para mejor precisión

            // Buscar el objeto más grande (probablemente el animal)
            for (let y = canvas.height * 0.1; y < canvas.height * 0.9; y += step) {
                for (let x = canvas.width * 0.1; x < canvas.width * 0.9; x += step) {
                    const index = (y * canvas.width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    // Detectar colores que podrían ser animales (marrón, negro, gris)
                    if ((r > 60 && g > 40 && b < 80) || // Marrón
                        (r < 60 && g < 60 && b < 60) ||  // Negro/Gris
                        (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r < 120)) { // Gris uniforme

                        // Calcular el tamaño real del objeto detectado
                        const objectSize = calculateObjectSize(data, x, y, canvas.width, canvas.height);
                        
                        if (objectSize.area > largestArea && objectSize.area > 1000) { // Mínimo tamaño para ser un animal
                            largestArea = objectSize.area;
                            bestAnimal = {
                                x: objectSize.x,
                                y: objectSize.y,
                                width: objectSize.width,
                                height: objectSize.height,
                                confidence: 0.7
                            };
                        }
                    }
                }
            }

            setDetectedAnimal(bestAnimal);

            // Calcular distancia basada en el animal detectado
            if (bestAnimal) {
                const distance = calculateDistance(bestAnimal, canvas.width, canvas.height);
                setDistance(distance);
            } else {
                setDistance(null);
            }

        } catch (error) {
            console.error('Error en detección:', error);
            setDistance(null);
            setDetectedAnimal(null);
        }

        // Continuar la detección
        animationRef.current = requestAnimationFrame(detectAnimal);
    };

    // Calcular el tamaño real del objeto detectado
    const calculateObjectSize = (data: Uint8ClampedArray, startX: number, startY: number, canvasWidth: number, canvasHeight: number) => {
        let minX = startX, maxX = startX, minY = startY, maxY = startY;
        const visited = new Set();
        const queue = [{x: startX, y: startY}];
        
        while (queue.length > 0) {
            const {x, y} = queue.shift()!;
            const key = `${x},${y}`;
            
            if (visited.has(key) || x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue;
            visited.add(key);
            
            const index = (y * canvasWidth + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            
            // Verificar si es el mismo color
            if ((r > 60 && g > 40 && b < 80) || // Marrón
                (r < 60 && g < 60 && b < 60) ||  // Negro/Gris
                (Math.abs(r - g) < 20 && Math.abs(g - b) < 20 && r < 120)) { // Gris uniforme
                
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);
                
                // Agregar vecinos a la cola
                queue.push({x: x + 1, y});
                queue.push({x: x - 1, y});
                queue.push({x, y: y + 1});
                queue.push({x, y: y - 1});
            }
        }
        
        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            area: (maxX - minX) * (maxY - minY)
        };
    };

    // Calcular distancia aproximada basada en el tamaño del animal
    const calculateDistance = (animal: DetectedAnimal, canvasWidth: number, canvasHeight: number): number => {
        // Tamaño de referencia para un animal a 3 metros (ajustado para ser más realista)
        const referenceSize = Math.min(canvasWidth, canvasHeight) * 0.15; // 15% del frame
        const animalSize = Math.max(animal.width, animal.height);
        
        // Fórmula inversa: distancia = tamaño_referencia * distancia_referencia / tamaño_animal
        const estimatedDistance = (referenceSize * 3) / animalSize;
        
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
                detectAnimal();
            } else {
                video.addEventListener('loadeddata', detectAnimal);
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
                            '🔍 Buscando animal...'
                        )}
                    </div>
                    <div className={`w-16 h-0.5 ${distanceInfo?.color === 'green' ? 'bg-green-400' : distanceInfo?.color === 'yellow' ? 'bg-yellow-400' : 'bg-red-400'}`}></div>
                </div>
            </div>

            {/* Indicador del animal detectado */}
            {detectedAnimal && (
                <div
                    className="absolute border-2 border-green-400 bg-green-400 bg-opacity-20 rounded"
                    style={{
                        left: `${(detectedAnimal.x / (videoRef.current?.videoWidth || 640)) * 100}%`,
                        top: `${(detectedAnimal.y / (videoRef.current?.videoHeight || 480)) * 100}%`,
                        width: `${(detectedAnimal.width / (videoRef.current?.videoWidth || 640)) * 100}%`,
                        height: `${(detectedAnimal.height / (videoRef.current?.videoHeight || 480)) * 100}%`,
                    }}
                >
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-1 py-0.5 rounded text-xs">
                        🐄
                    </div>
                </div>
            )}

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
                        '🔍 Buscando animal...'
                    )}
                </div>
            </div>

            {/* Indicador de modo simple */}
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                🐄 Detección Simple
            </div>
        </div>
    );
};
