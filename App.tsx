
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { analyzeCowImage, getErrorMessage, GeminiServiceError } from './services/geminiService';
import { useConnectionStatus } from './services/connectionService';
import type { CowAnalysisResult, HistoryEntry } from './types';
import { ResetIcon, RocketIcon, SaveIcon, BackIcon, PhotoIcon, CameraIcon } from './components/icons';
import { HistoryList } from './components/HistoryList';
import { HistoryDetail } from './components/HistoryDetail';
import { Footer } from './components/Footer';
import { ConnectionStatus } from './components/ConnectionStatus';

const App: React.FC = () => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
    const [analysisResult, setAnalysisResult] = useState<CowAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [animalName, setAnimalName] = useState<string>('');

    // History and View Management State
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [view, setView] = useState<'home' | 'result' | 'history' | 'historyDetail'>('home');
    const [selectedHistoryItemId, setSelectedHistoryItemId] = useState<string | null>(null);
    const [openCamera, setOpenCamera] = useState<boolean>(false);

    // Connection status
    const connectionStatus = useConnectionStatus();

    // Load history from localStorage on initial render
    useEffect(() => {
        try {
            const savedHistory = localStorage.getItem('pesoGanadoHistory');
            if (savedHistory) {
                setHistory(JSON.parse(savedHistory));
            }
        } catch (e) {
            console.error("Failed to load history from localStorage", e);
        }
    }, []);

    // Save history to localStorage whenever it changes
    useEffect(() => {
        try {
            localStorage.setItem('pesoGanadoHistory', JSON.stringify(history));
        } catch (e) {
            console.error("Failed to save history to localStorage", e);
        }
    }, [history]);

    // Service Worker registration
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('✅ Service Worker registrado:', registration);

                    // Verificar actualizaciones
                    registration.addEventListener('updatefound', () => {
                        console.log('🔄 Nueva versión del Service Worker disponible');
                        const newWorker = registration.installing;
                        if (newWorker) {
                            newWorker.addEventListener('statechange', () => {
                                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                                    console.log('📦 Service Worker instalado, forzando actualización...');
                                    // Forzar actualización automáticamente
                                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                                    window.location.reload();
                                }
                            });
                        }
                    });

                    // Escuchar mensajes del Service Worker
                    navigator.serviceWorker.addEventListener('message', event => {
                        if (event.data && event.data.type === 'SKIP_WAITING') {
                            console.log('🔄 Recibida señal de actualización, recargando página...');
                            window.location.reload();
                        }
                    });
                })
                .catch(error => {
                    console.error('❌ Error registrando Service Worker:', error);
                });
        }
    }, []);

    const handleImageUpload = (file: File) => {
        console.log('📁 handleImageUpload:', file.name, file.size, file.type);

        // Si es un archivo vacío (para limpiar), resetear todo
        if (file.size === 0 || file.name === 'empty.txt') {
            console.log('🗑️ Limpiando imagen...');
            setImageFile(null);
            setImagePreviewUrl(null);
            setAnalysisResult(null);
            setError(null);
            setIsLoading(false);
            return;
        }

        // Procesar imagen normal
        setImageFile(file);
        setAnalysisResult(null);
        setError(null);
        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleReset = useCallback(() => {
        setImageFile(null);
        setImagePreviewUrl(null);
        setAnalysisResult(null);
        setError(null);
        setIsLoading(false);
        setAnimalName('');
        setView('home');
        setSelectedHistoryItemId(null);
        setOpenCamera(false);
    }, []);

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const result = (reader.result as string).split(',')[1];
                resolve(result);
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleAnalyzeClick = useCallback(async () => {
        if (!imageFile) {
            setError("Por favor, selecciona una imagen primero.");
            return;
        }

        if (!connectionStatus.isOnline) {
            setError("📶 Sin conexión a internet. El análisis de IA requiere conexión.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysisResult(null);

        try {
            const base64Image = await fileToBase64(imageFile);
            const result = await analyzeCowImage(base64Image, imageFile.type);
            setAnalysisResult(result);
            setView('result');
        } catch (err) {
            console.error(err);

            if (err instanceof GeminiServiceError) {
                setError(getErrorMessage(err));
            } else {
                setError("Ocurrió un error inesperado. Por favor, inténtalo de nuevo.");
            }
        } finally {
            setIsLoading(false);
        }
    }, [imageFile, connectionStatus.isOnline]);

    const handleSaveToHistory = () => {
        if (!analysisResult || !animalName.trim() || !imagePreviewUrl) return;

        const newEntry: HistoryEntry = {
            id: Date.now().toString(),
            name: animalName.trim(),
            imageUrl: imagePreviewUrl,
            date: new Date().toLocaleDateString('es-ES'),
            ...analysisResult
        };

        setHistory(prevHistory => [newEntry, ...prevHistory]);
        handleReset();
    };

    const handleDeleteFromHistory = (id: string) => {
        console.log('🗑️ Eliminando elemento del historial:', id);

        // Si estamos viendo el detalle del elemento que se está eliminando,
        // redirigir a la vista del historial
        if (selectedHistoryItemId === id) {
            console.log('🔄 Redirigiendo desde historyDetail a history');
            setSelectedHistoryItemId(null);
            setView('history');
        }

        // Eliminar el elemento del historial y verificar si queda vacío
        setHistory(prevHistory => {
            const newHistory = prevHistory.filter(item => item.id !== id);

            // Si el historial queda vacío después de eliminar, volver al inicio
            if (newHistory.length === 0) {
                console.log('📭 Historial vacío, redirigiendo al inicio');
                setView('home');
            }

            return newHistory;
        });
    };

    const handleViewHistoryItem = (id: string) => {
        setSelectedHistoryItemId(id);
        setView('historyDetail');
    };

    const selectedHistoryItem = history.find(item => item.id === selectedHistoryItemId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col">
            <ConnectionStatus />
            <div className="flex-1 flex flex-col items-center p-4">
                <div className="w-full max-w-md mx-auto">
                    <Header historyCount={history.length} onViewHistory={() => setView('history')} />
                    <main className="mt-8 space-y-6">
                        {view === 'home' && (
                            <>
                                <ImageUploader
                                    onImageUpload={handleImageUpload}
                                    previewUrl={imagePreviewUrl}
                                    openCamera={openCamera}
                                    onCameraOpened={() => setOpenCamera(false)}
                                    onRequestCamera={() => setOpenCamera(true)}
                                />
                                {imageFile && !isLoading && !error && (
                                    <button
                                        onClick={handleAnalyzeClick}
                                        disabled={isLoading || !connectionStatus.isOnline}
                                        className="btn-primary w-full flex items-center justify-center gap-2"
                                    >
                                        <RocketIcon />
                                        {!connectionStatus.isOnline ? 'Sin Conexión' : 'Calcular Peso'}
                                    </button>
                                )}
                                {!connectionStatus.isOnline && (
                                    <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg">
                                        <p className="text-sm">
                                            <strong>Modo Offline:</strong> Puedes ver el historial y preparar fotos.
                                            El análisis de IA requiere conexión a internet.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}

                        {isLoading && <Spinner />}

                        {error && !isLoading && (
                            <div className="space-y-4">
                                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                                    <strong className="font-bold">Error: </strong>
                                    <span className="block sm:inline">{error}</span>
                                </div>

                                {/* Botones de acción para errores */}
                                <div className="flex gap-3">
                                    <button
                                        onClick={handleReset}
                                        className="btn-gray flex-1 flex items-center justify-center gap-2"
                                    >
                                        <ResetIcon />
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setError(null);
                                            setAnalysisResult(null);
                                            setIsLoading(false); // Asegurar que no esté cargando
                                            setImageFile(null);
                                            setImagePreviewUrl(null);
                                            setOpenCamera(true); // Abrir la cámara directamente
                                        }}
                                        className="btn-primary flex-1 flex items-center justify-center gap-2"
                                    >
                                        <CameraIcon />
                                        Repetir Foto
                                    </button>
                                </div>

                                {/* Este botón ya no es necesario porque "Tomar Nueva Foto" limpia la imagen */}
                            </div>
                        )}

                        {view === 'result' && analysisResult && (
                            <div className="animate-fade-in space-y-4">
                                <ResultDisplay result={analysisResult} imageUrl={imagePreviewUrl!} />
                                <div className="card space-y-3">
                                    <h3 className="font-bold text-lg text-center mb-2">Guardar en el Historial</h3>
                                    <input
                                        type="text"
                                        value={animalName}
                                        onChange={(e) => setAnimalName(e.target.value)}
                                        placeholder="Nombre o N° del animal (ej: 015, Manchitas)"
                                        className="input-field"
                                        aria-label="Nombre o número del animal"
                                    />
                                    <button
                                        onClick={handleSaveToHistory}
                                        disabled={!animalName.trim()}
                                        className="btn-secondary w-full flex items-center justify-center gap-2"
                                    >
                                        <SaveIcon />
                                        Guardar
                                    </button>
                                </div>
                                <button
                                    onClick={handleReset}
                                    className="btn-gray w-full flex items-center justify-center gap-2"
                                >
                                    <ResetIcon />
                                    Analizar otra foto (No Guardar)
                                </button>
                            </div>
                        )}

                        {view === 'history' && (
                            <>
                                <HistoryList
                                    history={history}
                                    onViewItem={handleViewHistoryItem}
                                    onDeleteItem={handleDeleteFromHistory}
                                />
                                <button
                                    onClick={handleReset}
                                    className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
                                >
                                    <BackIcon />
                                    Volver al Inicio
                                </button>
                            </>
                        )}

                        {view === 'historyDetail' && selectedHistoryItem && (
                            <HistoryDetail
                                item={selectedHistoryItem}
                                onBack={() => setView('history')}
                                onDelete={() => handleDeleteFromHistory(selectedHistoryItem.id)}
                            />
                        )}
                    </main>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default App;
