
import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, ArrowUpTrayIcon, CameraIcon } from './icons';
import { PhotoGuide } from './PhotoGuide';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl }) => {
    const [showGuide, setShowGuide] = useState(false);
    const [showCamera, setShowCamera] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
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

    const startCamera = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: 'environment', // Usar cámara trasera si está disponible
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });
            
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                streamRef.current = stream;
                setIsCameraActive(true);
                setShowCamera(true);
            }
        } catch (error) {
            console.error('Error al acceder a la cámara:', error);
            alert('No se pudo acceder a la cámara. Verifica los permisos.');
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        setIsCameraActive(false);
        setShowCamera(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');

            if (context) {
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
                        onImageUpload(file);
                        stopCamera();
                    }
                }, 'image/jpeg', 0.9);
            }
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
                                onClick={() => onImageUpload(new File([], ''))}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
                                title="Cambiar imagen"
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
                        <div className="relative">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                muted
                                className="w-full h-64 object-cover rounded-lg border-2 border-gray-200 dark:border-gray-600"
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
                                    {isCameraActive ? 'Cámara activa' : 'Iniciando cámara...'}
                                </div>
                            </div>
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={capturePhoto}
                                disabled={!isCameraActive}
                                className="btn-primary flex items-center gap-2"
                            >
                                📸 Capturar Foto
                            </button>
                            <button
                                onClick={stopCamera}
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                            >
                                ❌ Cancelar
                            </button>
                        </div>
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
                                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                                    isDragActive
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
        </>
    );
};
