import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const GlobalThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className={`fixed top-4 right-4 md:top-8 md:right-8 z-[100] p-4 rounded-2xl transition-all border shadow-2xl backdrop-blur-xl group hover:scale-110 active:scale-95 ${theme === 'dark'
                ? 'bg-zinc-900/80 hover:bg-zinc-800 border-white/10 text-yellow-400'
                : 'bg-white/80 hover:bg-zinc-50 border-zinc-200 text-zinc-900 shadow-sm'}`}
        >
            {theme === 'dark' ? <Sun size={24} className="animate-spin-slow" /> : <Moon size={24} />}
        </button>
    );
};

export default GlobalThemeToggle;
