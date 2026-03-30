import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

const GlobalThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="fixed top-4 right-16 md:top-6 md:right-24 z-[100] w-9 h-9 flex items-center justify-center rounded-lg transition-all"
            style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: theme === 'dark' ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.6)',
            }}
        >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
    );
};

export default GlobalThemeToggle;
