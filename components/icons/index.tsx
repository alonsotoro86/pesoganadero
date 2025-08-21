import React from 'react';

// A helper type for SVG components
type IconProps = {
    className?: string;
};

export const CowIcon: React.FC<IconProps> = ({ className = "h-12 w-12" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        {/* Cabeza de la vaca */}
        <ellipse cx="12" cy="8" rx="4" ry="3" />
        {/* Orejas */}
        <path d="M8 6c-1 0-2 1-2 2s1 2 2 2" />
        <path d="M16 6c1 0 2 1 2 2s-1 2-2 2" />
        {/* Ojos */}
        <circle cx="10" cy="7" r="0.5" fill="currentColor" />
        <circle cx="14" cy="7" r="0.5" fill="currentColor" />
        {/* Nariz */}
        <ellipse cx="12" cy="9" rx="1" ry="0.5" />
        {/* Cuerpo */}
        <ellipse cx="12" cy="16" rx="6" ry="4" />
        {/* Patas */}
        <line x1="8" y1="20" x2="8" y2="24" />
        <line x1="10" y1="20" x2="10" y2="24" />
        <line x1="14" y1="20" x2="14" y2="24" />
        <line x1="16" y1="20" x2="16" y2="24" />
        {/* Cola */}
        <path d="M18 14c2 0 3 1 3 2s-1 2-3 2" />
        {/* Manchas */}
        <ellipse cx="9" cy="14" rx="1" ry="0.8" fill="currentColor" opacity="0.3" />
        <ellipse cx="15" cy="12" rx="1.2" ry="1" fill="currentColor" opacity="0.3" />
    </svg>
);


export const UploadIcon: React.FC<IconProps> = ({ className = "h-10 w-10 text-gray-400" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

export const RocketIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.3.05-3.11.63-1.4 1.3-3.63 1.4-6.45.07-1.7.6-3.45 1.45-4.43 1.24-1.4 3.25-2.4 5.45-2.4 3.5 0 5.15 2.1 5.15 4.9 0 2.2-1.15 4.35-2.65 6.35-1.6 2.1-3.4 3.8-4.5 4.5-.7.45-2.25.4-3.1.05-1.4-.6-3.6-1.3-6.4-1.4-.7-.04-1.7-.1-2.45-.1z" />
    </svg>
);

export const ResetIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4" />
        <path d="M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4" />
    </svg>
);

export const WeightIcon: React.FC<IconProps> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 12c0 4.4-3.6 8-8 8s-8-3.6-8-8 3.6-8 8-8" />
        <path d="M12 2v4" />
        <path d="m16.2 7.8 2.3-1.3" />
        <path d="M19 12h4" />
        <path d="m16.2 16.2 2.3 1.3" />
        <path d="M12 20v2" />
        <path d="m7.8 16.2-2.3 1.3" />
        <path d="M5 12H1" />
        <path d="m7.8 7.8-2.3-1.3" />
    </svg>
);

export const BreedIcon: React.FC<IconProps> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="8.5" cy="7" r="4" />
        <polyline points="17 11 19 13 23 9" />
    </svg>
);

export const CommentIcon: React.FC<IconProps> = ({ className = "h-8 w-8" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
);

export const HistoryIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 4v6h6" />
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
);

export const TrashIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
        <line x1="10" y1="11" x2="10" y2="17" />
        <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
);

export const SaveIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
        <polyline points="17 21 17 13 7 13 7 21" />
        <polyline points="7 3 7 8 15 8" />
    </svg>
);

export const BackIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

export const ViewIcon: React.FC<IconProps> = ({ className = "h-5 w-5" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);