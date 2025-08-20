
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadIcon } from './icons';

interface ImageUploaderProps {
    onImageUpload: (file: File) => void;
    previewUrl: string | null;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageUpload, previewUrl }) => {
    const [error, setError] = useState<string|null>(null);
    
    const onDrop = useCallback((acceptedFiles: File[], fileRejections: any[]) => {
        setError(null);
        if (fileRejections.length > 0) {
            setError('Archivo no válido. Solo se aceptan imágenes.');
            return;
        }
        if (acceptedFiles.length > 0) {
            onImageUpload(acceptedFiles[0]);
        }
    }, [onImageUpload]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
        multiple: false
    });

    return (
        <div className="w-full">
            {previewUrl ? (
                <div className="w-full h-64 rounded-lg overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-600 flex justify-center items-center shadow-inner">
                    <img src={previewUrl} alt="Vista previa de la vaca" className="object-cover h-full w-full" />
                </div>
            ) : (
                <div
                    {...getRootProps()}
                    className={`w-full h-64 p-4 border-2 border-dashed rounded-lg flex flex-col justify-center items-center text-center cursor-pointer transition-colors duration-300 ${isDragActive ? 'bg-green-100 dark:bg-green-900/50 border-green-500' : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:border-green-400 dark:hover:border-green-500'}`}
                >
                    <input {...getInputProps()} />
                    <UploadIcon />
                    <p className="mt-2 font-semibold text-green-700 dark:text-green-300">
                        {isDragActive ? 'Suelta la imagen aquí' : 'Haz clic o arrastra una foto'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">PNG, JPG, WEBP</p>
                </div>
            )}
             {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>
    );
};
