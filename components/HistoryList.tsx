import React, { useState } from 'react';
import type { HistoryEntry } from '../types';
import { WeightIcon, BreedIcon, TrashIcon, ViewIcon } from './icons';
import { ConfirmModal } from './ConfirmModal';

interface HistoryListProps {
    history: HistoryEntry[];
    onViewItem: (id: string) => void;
    onDeleteItem: (id: string) => void;
}

const HistoryItem: React.FC<{ item: HistoryEntry; onView: () => void; onDelete: () => void; }> = ({ item, onView, onDelete }) => {
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const handleDeleteClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent triggering onView on the parent li
        setShowDeleteModal(true);
    };

    const handleConfirmDelete = () => {
        onDelete();
        setShowDeleteModal(false);
    };

    return (
        <li
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg hover:ring-2 hover:ring-green-500 transition-all duration-300 cursor-pointer"
            onClick={onView}
            role="button"
            tabIndex={0}
            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') onView(); }}
            aria-label={`Ver detalles de ${item.name}`}
        >
            <div className="flex items-center p-4">
                <img className="h-20 w-20 object-cover rounded-lg mr-4 flex-shrink-0" src={item.imageUrl} alt={`Foto de ${item.name}`} />
                <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-800 dark:text-white truncate">{item.name}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.date}</p>
                    <div className="flex items-center mt-2 space-x-4">
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <WeightIcon className="h-4 w-4 mr-1" /> {item.peso_kg} kg
                        </div>
                        <div className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                            <BreedIcon className="h-4 w-4 mr-1" /> {item.raza}
                        </div>
                    </div>
                </div>
                <div className="ml-2">
                    <button onClick={handleDeleteClick} aria-label={`Eliminar a ${item.name}`} className="p-2 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800 transition-colors">
                        <TrashIcon />
                    </button>
                </div>
            </div>

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
        </li>
    );
};


export const HistoryList: React.FC<HistoryListProps> = ({ history, onViewItem, onDeleteItem }) => {
    if (history.length === 0) {
        return (
            <div className="text-center p-8 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300">Historial Vacío</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Aún no has analizado ninguna foto. ¡Empieza ahora!</p>
            </div>
        );
    }

    return (
        <div className="w-full animate-fade-in">
            <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-6">Historial de Análisis</h2>
            <ul className="space-y-4">
                {history.map(item => (
                    <HistoryItem
                        key={item.id}
                        item={item}
                        onView={() => onViewItem(item.id)}
                        onDelete={() => onDeleteItem(item.id)}
                    />
                ))}
            </ul>
        </div>
    );
};