
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { PhotoIcon, ArrowUpTrayIcon } from './icons';
import { PhotoGuide } from './PhotoGuide';
import { useState } from 'react';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl }) => {
    const [showGuide, setShowGuide] = useState(false);

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
                ) : (
                    <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
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
                )}

                {/* Consejos rápidos */}
                {!previewUrl && (
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
