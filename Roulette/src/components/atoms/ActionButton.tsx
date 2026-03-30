import React from 'react';

interface ActionButtonProps {
    onClick: () => void;
    disabled: boolean;
    title: string;
    icon: React.ReactNode;
}

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, title, icon }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-4 rounded-xl bg-zinc-900/80 border border-white/5 hover:bg-zinc-800 hover:text-white transition-all text-zinc-500 disabled:opacity-10 disabled:grayscale transform hover:scale-105 active:scale-95"
        title={title}
    >
        {icon}
    </button>
);
