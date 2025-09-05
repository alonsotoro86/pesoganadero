
import React, { useState } from 'react';
import type { HistoryEntry } from '../types';
import { ResultDisplay } from './ResultDisplay';
import { BackIcon, TrashIcon } from './icons';
import { ConfirmModal } from './ConfirmModal';

interface HistoryDetailProps {
    item: HistoryEntry;
    onBack: () => void;
    onDelete: () => void;
}

export const HistoryDetail: React.FC<HistoryDetailProps> = ({ item, onBack, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const resultForDisplay = {
        peso_kg: item.peso_kg,
        raza: item.raza,
        comentarios: item.comentarios,
    };

    const handleConfirmDelete = () => {
        onDelete();
        setShowDeleteModal(false);
    };

    return (
        <div className="w-full animate-fade-in">
            <div className="flex gap-2 mb-4">
                <button
                    onClick={onBack}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors duration-300"
                >
                    <BackIcon />
                    Volver al Historial
                </button>
                <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center gap-2 bg-red-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                    title="Eliminar del historial"
                >
                    <TrashIcon />
                </button>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
                Detalle de: <span className="text-green-600 dark:text-green-400">{item.name}</span>
            </h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-4">Analizado el {item.date}</p>
            <ResultDisplay result={resultForDisplay} imageUrl={item.imageUrl} />

            {/* Modal de confirmación */}
            <ConfirmModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleConfirmDelete}
                title="Eliminar del historial"
                message={`¿Estás seguro de que quieres eliminar a "${item.name}" del historial? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                cancelText="Cancelar"
                type="danger"
            />
        </div>
    );
};
