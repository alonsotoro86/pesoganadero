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
    centerX: number;
    centerY: number;
}

export const CameraGuide: React.FC<CameraGuideProps> = ({ isVisible, videoRef }) => {
    const [distance, setDistance] = useState<number | null>(null);
    const [detectedAnimal, setDetectedAnimal] = useState<DetectedAnimal | null>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const lastDetectionTime = useRef<number>(0);
    const isDetecting = useRef<boolean>(false);

    // Sistema de suavizado para mediciones más estables
    const distanceHistory = useRef<number[]>([]);
    const animalHistory = useRef<DetectedAnimal[]>([]);
    const stableCount = useRef<number>(0);
    const lastStableDistance = useRef<number | null>(null);

    // Función mejorada para suavizar las mediciones de distancia
    const smoothDistance = (newDistance: number): number => {
        const history = distanceHistory.current;
        const maxHistorySize = 10; // Aumentar para mayor estabilidad

        // Agregar nueva medición
        history.push(newDistance);

        // Mantener solo las últimas mediciones
        if (history.length > maxHistorySize) {
            history.shift();
        }

        // Filtrar outliers usando el método de la mediana mejorado
        const sorted = [...history].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];

        // Calcular desviación estándar
        const mean = history.reduce((sum, val) => sum + val, 0) / history.length;
        const variance = history.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / history.length;
        const stdDev = Math.sqrt(variance);

        // Filtrar valores que están muy lejos de la mediana (outliers más tolerante)
        const filteredHistory = history.filter(d => Math.abs(d - median) <= stdDev * 1.5);

        // Si no hay suficientes datos válidos, usar la mediana
        if (filteredHistory.length < 3) {
            return median;
        }

        // Calcular promedio ponderado (más peso a mediciones recientes)
        let weightedSum = 0;
        let totalWeight = 0;

        filteredHistory.forEach((d, index) => {
            const weight = Math.pow(index + 1, 1.5); // Peso exponencial para mediciones recientes
            weightedSum += d * weight;
            totalWeight += weight;
        });

        return weightedSum / totalWeight;
    };

    // Función mejorada para verificar estabilidad de la detección
    const isStableDetection = (newAnimal: DetectedAnimal | null): boolean => {
        const history = animalHistory.current;
        const maxHistorySize = 5; // Aumentar historial para mayor estabilidad

        if (!newAnimal) {
            history.length = 0; // Limpiar historial si no hay detección
            stableCount.current = 0;
            return false;
        }

        // Agregar nueva detección al historial
        history.push(newAnimal);
        if (history.length > maxHistorySize) {
            history.shift();
        }

        // Verificar si las últimas detecciones son consistentes
        if (history.length >= 3) {
            const recentAnimals = history.slice(-3);
            const avgCenterX = recentAnimals.reduce((sum, a) => sum + a.centerX, 0) / recentAnimals.length;
            const avgCenterY = recentAnimals.reduce((sum, a) => sum + a.centerY, 0) / recentAnimals.length;
            const avgSize = recentAnimals.reduce((sum, a) => sum + (a.width * a.height), 0) / recentAnimals.length;

            // Verificar si las posiciones y tamaños son consistentes (más tolerante)
            const isPositionStable = recentAnimals.every(a =>
                Math.abs(a.centerX - avgCenterX) < 40 && Math.abs(a.centerY - avgCenterY) < 40
            );

            const isSizeStable = recentAnimals.every(a =>
                Math.abs((a.width * a.height) - avgSize) < avgSize * 0.5
            );

            // Verificar confianza de detección
            const avgConfidence = recentAnimals.reduce((sum, a) => sum + a.confidence, 0) / recentAnimals.length;
            const isConfidenceStable = avgConfidence > 0.4; // Umbral de confianza

            if (isPositionStable && isSizeStable && isConfidenceStable) {
                stableCount.current = Math.min(stableCount.current + 1, 4);
            } else {
                stableCount.current = Math.max(stableCount.current - 1, 0);
            }
        }

        return stableCount.current >= 3; // Requerir al menos 3 detecciones estables
    };

    // Función mejorada para detectar el animal usando análisis de imagen más preciso
    const detectAnimal = () => {
        if (!videoRef.current || !canvasRef.current || !isVisible) {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = undefined;
            }
            return;
        }

        // Limitar la frecuencia de detección para evitar sobrecarga
        const now = Date.now();
        if (now - lastDetectionTime.current < 200) { // Aumentar a ~5 FPS para mejor precisión
            animationRef.current = requestAnimationFrame(detectAnimal);
            return;
        }
        lastDetectionTime.current = now;

        // Evitar múltiples detecciones simultáneas
        if (isDetecting.current) {
            animationRef.current = requestAnimationFrame(detectAnimal);
            return;
        }

        isDetecting.current = true;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (!ctx) {
            isDetecting.current = false;
            animationRef.current = requestAnimationFrame(detectAnimal);
            return;
        }

        try {
            // Verificar que el video esté listo
            if (video.videoWidth === 0 || video.videoHeight === 0) {
                isDetecting.current = false;
                animationRef.current = requestAnimationFrame(detectAnimal);
                return;
            }

            // Configurar canvas para el análisis
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;

            // Buscar el objeto más prominente en el centro de la imagen
            const centerX = canvas.width / 2;
            const centerY = canvas.height / 2;
            const searchRadius = Math.min(canvas.width, canvas.height) * 0.4; // Aumentar área de búsqueda

            let bestAnimal: DetectedAnimal | null = null;
            let bestScore = 0;

            // Buscar desde el centro hacia afuera con mayor densidad
            for (let radius = 10; radius <= searchRadius; radius += 10) { // Reducir paso para mayor precisión
                for (let angle = 0; angle < 360; angle += 8) { // Mayor densidad de muestreo
                    const x = centerX + radius * Math.cos(angle * Math.PI / 180);
                    const y = centerY + radius * Math.sin(angle * Math.PI / 180);

                    if (x < 0 || x >= canvas.width || y < 0 || y >= canvas.height) continue;

                    const index = (y * canvas.width + x) * 4;
                    const r = data[index];
                    const g = data[index + 1];
                    const b = data[index + 2];

                    // Detectar colores que podrían ser animales (más específicos)
                    if (isAnimalColor(r, g, b)) {
                        const objectSize = calculateObjectSize(data, x, y, canvas.width, canvas.height);

                        if (objectSize.area > 2000) { // Reducir mínimo para detectar terneros
                            // Calcular score basado en tamaño, posición central y forma
                            const distanceFromCenter = Math.sqrt(
                                Math.pow(objectSize.centerX - centerX, 2) +
                                Math.pow(objectSize.centerY - centerY, 2)
                            );

                            const sizeScore = objectSize.area / 8000; // Ajustar normalización
                            const positionScore = Math.max(0, 1 - (distanceFromCenter / searchRadius));
                            const aspectRatio = objectSize.width / objectSize.height;
                            
                            // Mejorar score de forma para detectar animales en diferentes ángulos
                            let shapeScore = 0.5; // Score base
                            if (aspectRatio > 0.4 && aspectRatio < 3.0) { // Rango más amplio
                                shapeScore = 1.0;
                            } else if (aspectRatio > 0.3 && aspectRatio < 4.0) {
                                shapeScore = 0.8;
                            }

                            // Agregar factor de continuidad (objetos más compactos)
                            const compactness = objectSize.area / (objectSize.width * objectSize.height);
                            const compactnessScore = Math.min(1, compactness * 2);

                            const totalScore = sizeScore * 0.35 + positionScore * 0.35 + shapeScore * 0.2 + compactnessScore * 0.1;

                            if (totalScore > bestScore) {
                                bestScore = totalScore;
                                bestAnimal = {
                                    x: objectSize.x,
                                    y: objectSize.y,
                                    width: objectSize.width,
                                    height: objectSize.height,
                                    confidence: totalScore,
                                    centerX: objectSize.centerX,
                                    centerY: objectSize.centerY
                                };
                            }
                        }
                    }
                }
            }

            // Verificar estabilidad de la detección
            const isStable = isStableDetection(bestAnimal);
            setDetectedAnimal(bestAnimal);

            // Calcular distancia solo si la detección es estable
            if (bestAnimal && isStable) {
                const rawDistance = calculateDistance(bestAnimal, canvas.width, canvas.height);
                const smoothedDistance = smoothDistance(rawDistance);

                // Solo actualizar si el cambio no es demasiado drástico
                if (lastStableDistance.current === null ||
                    Math.abs(smoothedDistance - lastStableDistance.current) < 1.5) {
                    setDistance(smoothedDistance);
                    lastStableDistance.current = smoothedDistance;
                }
            } else if (!bestAnimal) {
                setDistance(null);
                lastStableDistance.current = null;
                distanceHistory.current.length = 0; // Limpiar historial
            }

        } catch (error) {
            console.error('Error en detección:', error);
            setDistance(null);
            setDetectedAnimal(null);
        } finally {
            isDetecting.current = false;
        }

        // Continuar la detección solo si es visible
        if (isVisible) {
            animationRef.current = requestAnimationFrame(detectAnimal);
        }
    };

    // Función mejorada para detectar colores de animales con mayor precisión
    const isAnimalColor = (r: number, g: number, b: number): boolean => {
        // Detectar marrón (varios tonos más específicos para ganado)
        const isBrown = (
            (r > 80 && g > 50 && b < 100 && r > g + 20) || // Marrón rojizo (Angus)
            (r > 100 && g > 60 && b < 120 && r > g + 15) || // Marrón medio (Hereford)
            (r > 60 && g > 40 && b < 80 && r > g + 10) || // Marrón oscuro (Brahman)
            (r > 120 && g > 80 && b < 100 && r > g + 25) // Marrón claro (Simmental)
        );

        // Detectar negro/gris oscuro (más específico para Holstein)
        const isDark = (
            (r < 60 && g < 60 && b < 60) || // Negro puro
            (r < 80 && g < 80 && b < 80 && Math.abs(r - g) < 15 && Math.abs(g - b) < 15) // Gris muy oscuro
        );

        // Detectar gris uniforme (mejorado para razas grises)
        const isGray = (
            Math.abs(r - g) < 20 && 
            Math.abs(g - b) < 20 && 
            r < 160 && 
            r > 40 // Evitar blancos y negros puros
        );

        // Detectar tonos cálidos (beige, crema, dorado - Jersey, Guernsey)
        const isWarm = (
            (r > 150 && g > 120 && b < 110 && r > g + 20) || // Beige claro
            (r > 140 && g > 110 && b < 100 && r > g + 15) || // Beige medio
            (r > 160 && g > 130 && b < 120 && r > g + 25) // Dorado claro
        );

        // Detectar tonos rojizos (algunas razas específicas)
        const isReddish = (
            (r > 120 && g < 80 && b < 80 && r > g + 40) || // Rojo oscuro
            (r > 140 && g < 100 && b < 100 && r > g + 35) // Rojo medio
        );

        // Detectar tonos blancos (razas blancas como Holstein)
        const isWhite = (
            r > 180 && g > 180 && b > 180 && 
            Math.abs(r - g) < 15 && Math.abs(g - b) < 15
        );

        // Detectar tonos beige-grisáceos (algunas razas mixtas)
        const isBeigeGray = (
            r > 130 && g > 110 && b > 100 &&
            Math.abs(r - g) < 25 && Math.abs(g - b) < 25 &&
            r > g + 10
        );

        return isBrown || isDark || isGray || isWarm || isReddish || isWhite || isBeigeGray;
    };

    // Calcular el tamaño real del objeto detectado (mejorado para precisión)
    const calculateObjectSize = (data: Uint8ClampedArray, startX: number, startY: number, canvasWidth: number, canvasHeight: number) => {
        let minX = startX, maxX = startX, minY = startY, maxY = startY;
        const visited = new Set();
        const queue = [{ x: startX, y: startY }];
        let pixelCount = 0;
        const maxPixels = 3000; // Aumentar para mejor precisión

        while (queue.length > 0 && pixelCount < maxPixels) {
            const { x, y } = queue.shift()!;
            const key = `${x},${y}`;

            if (visited.has(key) || x < 0 || x >= canvasWidth || y < 0 || y >= canvasHeight) continue;
            visited.add(key);
            pixelCount++;

            const index = (y * canvasWidth + x) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];

            // Verificar si es el mismo color
            if (isAnimalColor(r, g, b)) {
                minX = Math.min(minX, x);
                maxX = Math.max(maxX, x);
                minY = Math.min(minY, y);
                maxY = Math.max(maxY, y);

                // Agregar vecinos a la cola (limitado para rendimiento)
                if (queue.length < 300) {
                    queue.push({ x: x + 1, y });
                    queue.push({ x: x - 1, y });
                    queue.push({ x, y: y + 1 });
                    queue.push({ x, y: y - 1 });
                }
            }
        }

        return {
            x: minX,
            y: minY,
            width: maxX - minX,
            height: maxY - minY,
            area: (maxX - minX) * (maxY - minY),
            centerX: (minX + maxX) / 2,
            centerY: (minY + maxY) / 2
        };
    };

    // Función mejorada para calcular distancia con calibración más precisa
    const calculateDistance = (animal: DetectedAnimal, canvasWidth: number, canvasHeight: number): number => {
        // Calcular el tamaño aparente del animal en píxeles
        const animalArea = animal.width * animal.height;
        const frameArea = canvasWidth * canvasHeight;
        const relativeSize = animalArea / frameArea;

        // Factores de calibración mejorados basados en el tamaño relativo
        // Calibrado para cámaras de smartphone con diferentes resoluciones
        let distance = 0;

        if (relativeSize > 0.5) {
            // Animal muy cerca (ocupa más del 50% del frame)
            distance = 0.8 + (0.5 - relativeSize) * 1.5;
        } else if (relativeSize > 0.25) {
            // Animal a distancia media-cerca (25-50% del frame)
            distance = 1.5 + (0.25 - relativeSize) * 2.5;
        } else if (relativeSize > 0.08) {
            // Animal a distancia media (8-25% del frame) - DISTANCIA ÓPTIMA
            distance = 2.5 + (0.08 - relativeSize) * 4;
        } else if (relativeSize > 0.03) {
            // Animal a distancia lejana (3-8% del frame)
            distance = 4.0 + (0.03 - relativeSize) * 6;
        } else {
            // Animal muy lejos (menos del 3% del frame)
            distance = 6.0 + (0.01 - relativeSize) * 15;
        }

        // Ajustar basado en la posición del animal en el frame
        const centerX = animal.centerX / canvasWidth;
        const centerY = animal.centerY / canvasHeight;
        const distanceFromCenter = Math.sqrt(
            Math.pow(centerX - 0.5, 2) + Math.pow(centerY - 0.5, 2)
        );

        // Si el animal está descentrado, ajustar la distancia
        if (distanceFromCenter > 0.25) {
            distance *= 1.15; // Aumentar distancia si está descentrado
        }

        // Ajustar basado en la forma del animal (aspect ratio)
        const aspectRatio = animal.width / animal.height;
        if (aspectRatio > 3.0 || aspectRatio < 0.3) {
            // Animal muy estirado o muy comprimido, probablemente no está bien posicionado
            distance *= 1.25;
        } else if (aspectRatio > 2.5 || aspectRatio < 0.4) {
            // Animal algo estirado, ajuste menor
            distance *= 1.1;
        }

        // Ajuste basado en la confianza de la detección
        if (animal.confidence < 0.5) {
            distance *= 1.2; // Si la detección no es muy confiable, aumentar distancia
        }

        // Limitar la distancia a valores razonables para análisis de peso
        return Math.max(0.5, Math.min(7.0, distance));
    };

    // Obtener color y texto basado en la distancia (ajustado para distancias reales)
    const getDistanceInfo = (distance: number) => {
        if (distance < 1.5) {
            return { color: 'red', text: 'Muy cerca', icon: '❌' };
        } else if (distance < 2.5) {
            return { color: 'yellow', text: 'Cerca', icon: '⚠️' };
        } else if (distance <= 4.0) {
            return { color: 'green', text: 'Óptimo', icon: '📏' };
        } else if (distance < 5.5) {
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
        } else {
            // Detener la detección si no es visible
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = undefined;
            }
        }

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
                animationRef.current = undefined;
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

            {/* Marco de referencia para posicionar el animal */}
            <div className="absolute inset-8 border-2 border-white border-dashed rounded-lg opacity-80">
                {/* Esquinas del marco */}
                <div className="absolute -top-1 -left-1 w-4 h-4 border-l-2 border-t-2 border-white"></div>
                <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-white"></div>
                <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-white"></div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 border-r-2 border-b-2 border-white"></div>
            </div>

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
                        {stableCount.current >= 2 ? '🐄✓' : '🐄'}
                    </div>
                </div>
            )}

            {/* Instrucción dinámica */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                <div className="bg-black bg-opacity-50 text-white px-3 py-1 rounded text-sm">
                    {distance ? (
                        distance >= 2.5 && distance <= 4.0 ? (
                            '✅ Distancia perfecta - Toma la foto'
                        ) : distance < 2.5 ? (
                            '⬅️ Retrocede para alejarte'
                        ) : (
                            '➡️ Acércate más'
                        )
                    ) : (
                        '🔍 Buscando animal...'
                    )}
                </div>
            </div>

            {/* Indicador de estabilidad */}
            <div className="absolute top-4 right-4 bg-blue-500 text-white px-2 py-1 rounded text-xs">
                🐄 {stableCount.current >= 2 ? 'Estable' : 'Calibrando'}
            </div>
        </div>
    );
};
