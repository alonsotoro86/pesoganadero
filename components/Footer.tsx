import React from 'react';

export const Footer: React.FC = () => {
    return (
        <footer className="mt-auto py-4 px-4 text-center text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 text-sm">
                <span>Desarrollado por</span>
                <img
                    src="/images/logo-monarca.png"
                    alt="Monarca SQA Logo"
                    className="h-4 w-auto opacity-80 hover:opacity-100 transition-opacity duration-200"
                />
                <a
                    href="https://monarca-sqa.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors duration-200"
                >
                    Monarca SQA
                </a>
                <span>•</span>
                <span>2025</span>
            </div>
        </footer>
    );
};
