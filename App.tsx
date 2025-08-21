
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ResultDisplay } from './components/ResultDisplay';
import { Spinner } from './components/Spinner';
import { analyzeCowImage } from './services/geminiService';
import type { CowAnalysisResult, HistoryEntry } from './types';
import { ResetIcon, RocketIcon, SaveIcon, BackIcon } from './components/icons';
import { HistoryList } from './components/HistoryList';
import { HistoryDetail } from './components/HistoryDetail';

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

    const handleImageUpload = (file: File) => {
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
            setError("Ocurrió un error al analizar la imagen. Por favor, inténtalo de nuevo.");
        } finally {
            setIsLoading(false);
        }
    }, [imageFile]);

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
        setHistory(prevHistory => prevHistory.filter(item => item.id !== id));
    };

    const handleViewHistoryItem = (id: string) => {
        setSelectedHistoryItemId(id);
        setView('historyDetail');
    };

    const selectedHistoryItem = history.find(item => item.id === selectedHistoryItemId);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200 flex flex-col items-center p-4">
            <div className="w-full max-w-md mx-auto">
                <Header historyCount={history.length} onViewHistory={() => setView('history')} />
                <main className="mt-8 space-y-6">
                    {view === 'home' && (
                        <>
                            <ImageUploader onImageUpload={handleImageUpload} previewUrl={imagePreviewUrl} />
                            {imageFile && !isLoading && (
                                <button
                                    onClick={handleAnalyzeClick}
                                    disabled={isLoading}
                                    className="btn-primary w-full flex items-center justify-center gap-2"
                                >
                                    <RocketIcon />
                                    Calcular Peso
                                </button>
                            )}
                        </>
                    )}

                    {isLoading && <Spinner />}

                    {error && !isLoading && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
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
                        <HistoryDetail item={selectedHistoryItem} onBack={() => setView('history')} />
                    )}
                </main>
            </div>
        </div>
    );
};

export default App;
