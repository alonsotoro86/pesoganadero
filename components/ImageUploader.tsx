import React, { useCallback, useState, useRef, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, ArrowUpTrayIcon, CameraIcon } from './icons';
import { PhotoGuide } from './PhotoGuide';
import { CameraGuide } from './CameraGuide';
import { DistanceInstructions } from './DistanceInstructions';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    previewUrl: string | null;
    openCamera?: boolean;
    onCameraOpened?: () => void;
    onRequestCamera?: () => void;
}

// Función para detectar si estamos en un dispositivo móvil
const isMobileDevice = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
        (navigator.maxTouchPoints && navigator.maxTouchPoints > 2);
};

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl, openCamera = false, onCameraOpened, onRequestCamera }) => {
    const [showGuide, setShowGuide] = useState(false);
    const [showDistanceInstructions, setShowDistanceInstructions] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const [cameraError, setCameraError] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            onImageUpload(acceptedFiles[0]);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png', '.webp']
        },
        multiple: false,
        maxSize: 10 * 1024 * 1024 // 10MB
    });

    // Limpiar la cámara cuando el componente se desmonte
    useEffect(() => {
        return () => {
            if (streamRef.current) {
                console.log('Limpiando cámara al desmontar componente');
                stopCamera();
            }
        };
    }, []);

    // Limpiar la cámara cuando showCamera cambie a false
    useEffect(() => {
        if (!showCamera && streamRef.current) {
            console.log('Deteniendo cámara porque showCamera es false');
            stopCamera();
        }
    }, [showCamera]);

    // Abrir la cámara automáticamente cuando openCamera sea true
    useEffect(() => {
        if (openCamera && !showCamera && !streamRef.current) {
            console.log('Abriendo cámara automáticamente');
            // Agregar un pequeño delay para asegurar que el componente esté listo
            const timer = setTimeout(() => {
                startCamera();
                onCameraOpened?.(); // Notificar que la cámara se está abriendo
            }, 200); // Aumentar delay para mayor estabilidad

            return () => clearTimeout(timer);
        }
    }, [openCamera, showCamera, onCameraOpened]);

    const startCamera = async () => {
        // Evitar múltiples llamadas simultáneas
        if (streamRef.current) {
            console.log('Cámara ya está activa, deteniendo primero...');
            stopCamera();
            await new Promise(resolve => setTimeout(resolve, 200)); // Pausa más larga
        }

        try {
            console.log('Iniciando cámara...');
            setShowCamera(true);
            setIsCameraActive(false);
            setCameraError(null); // Limpiar errores anteriores

            // Verificar si getUserMedia está disponible
            if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                throw new Error('getUserMedia no está disponible en este navegador');
            }

            // Configuración de cámara optimizada según el dispositivo
            const isMobile = isMobileDevice();
            console.log('Dispositivo móvil detectado:', isMobile);

            // Configuración especial para permitir cámara en HTTP en algunos navegadores
            const videoConstraints = isMobile ? {
                facingMode: 'environment', // Usar cámara trasera en móviles
                width: { ideal: 1280, min: 640 },
                height: { ideal: 720, min: 480 }
            } : {
                width: { ideal: 1920, min: 640 },
                height: { ideal: 1080, min: 480 },
                aspectRatio: { ideal: 16 / 9 }
            };

            // Intentar con configuración simple primero
            let stream;
            try {
                stream = await navigator.mediaDevices.getUserMedia({
                    video: videoConstraints,
                    audio: false
                });
            } catch (error) {
                console.log('Error con configuración avanzada, intentando configuración simple...');
                // Fallback a configuración simple
                stream = await navigator.mediaDevices.getUserMedia({
                    video: true,
                    audio: false
                });
            }

            console.log('Stream obtenido:', stream);

            // Esperar a que el elemento de video esté disponible en el DOM
            let attempts = 0;
            const maxAttempts = 10;
            while (!videoRef.current && attempts < maxAttempts) {
                console.log(`Esperando elemento de video... intento ${attempts + 1}/${maxAttempts}`);
                await new Promise(resolve => setTimeout(resolve, 200));
                attempts++;
            }

            // Verificar que el elemento de video esté disponible
            if (!videoRef.current) {
                throw new Error('Elemento de video no disponible después de múltiples intentos');
            }

            console.log('✅ Elemento de video encontrado:', videoRef.current);

            videoRef.current.srcObject = stream;
            streamRef.current = stream;

            // Configurar event listeners simples
            videoRef.current.onloadedmetadata = () => {
                console.log('Video metadata cargado');
                console.log('Dimensiones del video:', videoRef.current?.videoWidth, 'x', videoRef.current?.videoHeight);

                // Intentar reproducir el video
                videoRef.current?.play().then(() => {
                    console.log('Video iniciado correctamente');
                    setIsCameraActive(true);
                }).catch((error) => {
                    console.error('Error al reproducir video:', error);
                    // Intentar activar de todas formas si el video está visible
                    setTimeout(() => {
                        if (videoRef.current && videoRef.current.videoWidth > 0) {
                            console.log('Activando cámara por dimensiones del video');
                            setIsCameraActive(true);
                        }
                    }, 1000);
                });
            };

            // Event listener adicional para cuando el video puede reproducirse
            videoRef.current.oncanplay = () => {
                console.log('Video puede reproducirse');
                setIsCameraActive(true);
            };

            // Event listener para cuando el video empieza a reproducirse
            videoRef.current.onplaying = () => {
                console.log('Video empezó a reproducirse');
                setIsCameraActive(true);
            };

            // Timeout de seguridad simplificado
            setTimeout(() => {
                console.log('Verificando estado de la cámara después de 5 segundos...');
                if (videoRef.current && videoRef.current.videoWidth > 0) {
                    console.log('Activando cámara por timeout - video tiene dimensiones');
                    setIsCameraActive(true);
                } else {
                    console.log('Cámara no se activó - verificando stream...');
                    if (streamRef.current && streamRef.current.getVideoTracks().length > 0) {
                        console.log('Stream tiene tracks de video, activando cámara');
                        setIsCameraActive(true);
                    } else {
                        console.log('No se pudo activar la cámara');
                        setCameraError('La cámara no se pudo activar correctamente. Intenta nuevamente.');
                        stopCamera();
                    }
                }
            }, 5000);

        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            setShowCamera(false);

            if (error instanceof Error) {
                if (error.name === 'NotAllowedError') {
                    setCameraError('Permiso denegado para acceder a la cámara. Verifica los permisos del navegador y recarga la página.');
                } else if (error.name === 'NotFoundError') {
                    setCameraError('No se encontró ninguna cámara disponible. Verifica que tu dispositivo tenga una cámara.');
                } else if (error.name === 'NotReadableError') {
                    setCameraError('La cámara está siendo usada por otra aplicación. Cierra otras aplicaciones que usen la cámara.');
                } else if (error.name === 'OverconstrainedError') {
                    setCameraError('La configuración de la cámara no es compatible. Intenta con una resolución más baja.');
                } else {
                    setCameraError(`Error al acceder a la cámara: ${error.message}`);
                }
            } else {
                setCameraError('Error desconocido al acceder a la cámara.');
            }
        }
    };

    const stopCamera = () => {
        console.log('Deteniendo cámara...');

        if (streamRef.current) {
            try {
                streamRef.current.getTracks().forEach(track => {
                    console.log('Deteniendo track:', track.kind);
                    track.stop();
                });
                streamRef.current = null;
            } catch (error) {
                console.error('Error al detener stream:', error);
            }
        }

        if (videoRef.current) {
            try {
                videoRef.current.srcObject = null;
                videoRef.current.onloadedmetadata = null;
                videoRef.current.oncanplay = null;
                videoRef.current.onplaying = null;
            } catch (error) {
                console.error('Error al limpiar video:', error);
            }
        }

        setIsCameraActive(false);
        setShowCamera(false);
        setCameraError(null); // Limpiar errores al detener la cámara
        console.log('Cámara detenida');
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current) {
            console.error('Video o canvas no disponible');
            return;
        }

        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        if (!context) {
            console.error('No se pudo obtener el contexto del canvas');
            return;
        }

        // Verificar que el video esté listo
        if (video.videoWidth === 0 || video.videoHeight === 0) {
            console.error('Video no está listo');
            setCameraError('Espera un momento para que la cámara se active completamente');
            return;
        }

        try {
            // Configurar el canvas con las dimensiones del video
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            // Dibujar el frame actual del video en el canvas
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            // Convertir el canvas a un archivo
            canvas.toBlob((blob) => {
                if (blob) {
                    const file = new File([blob], `foto-${Date.now()}.jpg`, {
                        type: 'image/jpeg'
                    });
                    console.log('Foto capturada exitosamente:', file.name);
                    onImageUpload(file);
                    stopCamera();
                } else {
                    console.error('Error al crear el blob de la imagen');
                    setCameraError('Error al capturar la foto. Intenta nuevamente.');
                }
            }, 'image/jpeg', 0.9);
        } catch (error) {
            console.error('Error al capturar la foto:', error);
            setCameraError('Error al capturar la foto. Intenta nuevamente.');
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onImageUpload(file);
        }
    };

    return (
        <>
            <div className="card">
                <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
                        Subir Foto del Animal
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                        Selecciona una imagen clara del ganado para análisis
                    </p>
                    <button
                        onClick={() => setShowGuide(true)}
                        className="mt-2 text-green-600 hover:text-green-700 text-sm font-medium underline"
                    >
                        📸 Ver guía para mejores fotos
                    </button>
                </div>

                {previewUrl ? (
                    <div className="space-y-4">
                        <div className="relative">
                            <img
                                src={previewUrl}
                                alt="Preview"
                                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                            />
                            <button
                                onClick={() => {
                                    // Limpiar la imagen actual y abrir la cámara
                                    console.log('🔄 Botón X: Limpiando imagen y abriendo cámara');
                                    // Crear un archivo vacío para limpiar el estado
                                    const emptyFile = new File([''], 'empty.txt', { type: 'text/plain' });
                                    onImageUpload(emptyFile);
                                    // Solicitar apertura de cámara
                                    onRequestCamera?.();
                                }}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors cursor-pointer"
                                title="Repetir foto con cámara"
                            >
                                ×
                            </button>
                        </div>
                        <p className="text-sm text-green-600 dark:text-green-400 text-center">
                            ✅ Imagen seleccionada. Lista para análisis.
                        </p>
                    </div>
                ) : showCamera ? (
                    <div className="space-y-4">
                        <div className="relative camera-container">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                            />
                            <CameraGuide isVisible={isCameraActive} videoRef={videoRef} />
                            {/* Solo mostrar overlay cuando la cámara no está activa */}
                            {!isCameraActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
                                    <div className="bg-black bg-opacity-70 text-white px-4 py-2 rounded-lg text-center">
                                        <div className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full mb-2"></div>
                                        <div>Iniciando cámara...</div>
                                        <div className="text-xs opacity-75 mt-1">Espera un momento</div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={capturePhoto}
                                disabled={!isCameraActive}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${isCameraActive
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                    }`}
                            >
                                {isCameraActive ? '📸 Capturar Foto' : '⏳ Cargando...'}
                            </button>
                            <button
                                onClick={stopCamera}
                                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
                            >
                                ❌ Cancelar
                            </button>

                        </div>

                        {/* Mensaje de error de la cámara */}
                        {cameraError && (
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                                <div className="flex items-center gap-2">
                                    <span className="text-red-500">⚠️</span>
                                    <span className="text-sm">{cameraError}</span>
                                </div>
                                <div className="mt-2 flex gap-2">
                                    <button
                                        onClick={() => setCameraError(null)}
                                        className="text-xs bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                                    >
                                        Cerrar
                                    </button>
                                    <button
                                        onClick={startCamera}
                                        className="text-xs bg-green-600 text-white px-2 py-1 rounded hover:bg-green-700"
                                    >
                                        Intentar de Nuevo
                                    </button>
                                </div>
                            </div>
                        )}

                        {isCameraActive && (
                            <div className="text-center space-y-2">
                                <div className="text-sm text-gray-600 dark:text-gray-400">
                                    💡 Posiciona el animal en el marco y haz clic en "Capturar Foto"
                                </div>
                                <button
                                    onClick={() => setShowDistanceInstructions(true)}
                                    className="text-green-600 hover:text-green-700 text-xs underline"
                                >
                                    🐄 ¿Cómo funciona la detección?
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Opciones de entrada */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Cámara */}
                            <button
                                onClick={startCamera}
                                className="border-2 border-dashed border-green-300 dark:border-green-600 rounded-lg p-6 text-center cursor-pointer hover:border-green-400 dark:hover:border-green-500 transition-colors bg-green-50 dark:bg-green-900/20"
                            >
                                <CameraIcon className="mx-auto h-12 w-12 text-green-600 mb-4" />
                                <p className="text-green-700 dark:text-green-300 font-medium mb-2">
                                    📸 Usar Cámara
                                </p>
                                <p className="text-sm text-green-600 dark:text-green-400">
                                    Tomar foto directamente
                                </p>
                            </button>

                            {/* Subir archivo */}
                            <div
                                {...getRootProps()}
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${isDragActive
                                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                                    : 'border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'
                                    }`}
                            >
                                <input {...getInputProps()} />
                                <PhotoIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                                {isDragActive ? (
                                    <p className="text-green-600 dark:text-green-400 font-medium">
                                        Suelta la imagen aquí...
                                    </p>
                                ) : (
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-2">
                                            Arrastra y suelta una imagen aquí, o
                                        </p>
                                        <button className="btn-primary inline-flex items-center gap-2">
                                            <ArrowUpTrayIcon />
                                            Seleccionar Archivo
                                        </button>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            JPG, PNG, WEBP hasta 10MB
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Input file oculto para compatibilidad */}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                            id="file-input"
                        />
                    </div>
                )}

                {/* Consejos rápidos */}
                {!previewUrl && !showCamera && (
                    <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <h4 className="font-semibold text-blue-800 dark:text-blue-200 text-sm mb-2">
                            💡 Consejos para mejores resultados:
                        </h4>
                        <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                            <li>• Distancia: 3-5 metros del animal</li>
                            <li>• Ángulo: Vista lateral (90°)</li>
                            <li>• Iluminación: Luz natural uniforme</li>
                            <li>• Posición: Animal de pie y quieto</li>
                        </ul>
                    </div>
                )}
            </div>

            {showGuide && (
                <PhotoGuide onClose={() => setShowGuide(false)} />
            )}
            {showDistanceInstructions && (
                <DistanceInstructions
                    isVisible={showDistanceInstructions}
                    onClose={() => setShowDistanceInstructions(false)}
                />
            )}
        </>
    );
};