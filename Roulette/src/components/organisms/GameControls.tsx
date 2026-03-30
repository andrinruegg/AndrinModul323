import React from 'react';
import { Coins, RotateCw, Trash2, Undo2, Repeat, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface GameControlsProps {
    onSpin: () => void;
    onClear: () => void;
    onUndo: () => void;
    onRepeat: () => void;
    onRefill: () => void;
    canSpin: boolean;
    canUndo: boolean;
    canRepeat: boolean;
    canRefill: boolean;
    selectedChip: number;
    setSelectedChip: (amount: number) => void;
    balance: number;
}

const CHIPS = [
    { value: 10,   color: '#3b82f6', rim: '#1d4ed8',  label: '10' },
    { value: 50,   color: '#10b981', rim: '#059669',  label: '50' },
    { value: 100,  color: '#f59e0b', rim: '#d97706',  label: '100' },
    { value: 500,  color: '#f43f5e', rim: '#be123c',  label: '500' },
    { value: 1000, color: '#8b5cf6', rim: '#6d28d9',  label: '1K' },
];

export const GameControls: React.FC<GameControlsProps> = ({
    onSpin, onClear, onUndo, onRepeat, onRefill,
    canSpin, canUndo, canRepeat, canRefill,
    selectedChip, setSelectedChip, balance,
}) => {
    return (
        <div
            className="w-full rounded-2xl p-5 md:p-7 flex flex-col gap-6"
            style={{
                background: 'linear-gradient(160deg, rgba(15,19,32,0.95) 0%, rgba(8,9,14,0.98) 100%)',
                border: '1px solid rgba(255,171,10,0.12)',
                boxShadow: '0 4px 32px rgba(0,0,0,0.5)',
            }}
        >
            {/* Chip Selector */}
            <div>
                <div className="casino-label mb-4" style={{ fontSize: '9px' }}>Select Chip Value</div>
                <div className="flex gap-3 flex-wrap">
                    {CHIPS.map(chip => {
                        const isSelected = selectedChip === chip.value;
                        const isDisabled = balance < chip.value;
                        return (
                            <button
                                key={chip.value}
                                onClick={() => !isDisabled && setSelectedChip(chip.value)}
                                disabled={isDisabled}
                                title={isDisabled ? 'Insufficient balance' : `Select $${chip.value} chip`}
                                className={cn('relative w-14 h-14 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-200', isDisabled && 'opacity-25 cursor-not-allowed')}
                                style={{
                                    background: `linear-gradient(145deg, ${chip.color}, ${chip.rim})`,
                                    boxShadow: isSelected
                                        ? `0 0 0 3px rgba(255,255,255,0.2), 0 0 30px ${chip.color}80, 0 6px 20px rgba(0,0,0,0.5)`
                                        : `0 4px 16px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.15)`,
                                    transform: isSelected ? 'scale(1.15)' : 'scale(1)',
                                    border: `3px solid ${chip.rim}`,
                                }}
                            >
                                {/* Chip inner ring */}
                                <div className="absolute inset-[4px] rounded-full border border-white/[0.12]" />
                                <span className="relative z-10 text-white font-bold text-[11px] drop-shadow">{chip.label}</span>
                                {isSelected && (
                                    <motion.div
                                        layoutId="chip-selector"
                                        className="absolute inset-[-4px] rounded-full border-2 border-white/40"
                                    />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Divider */}
            <div className="casino-divider" />

            {/* Action Row */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                {/* Secondary actions */}
                <div className="flex items-center gap-2">
                    {[
                        { action: onUndo, disabled: !canUndo, icon: <Undo2 size={16} />, title: 'Undo' },
                        { action: onRepeat, disabled: !canRepeat, icon: <Repeat size={16} />, title: 'Repeat Bets' },
                        { action: onClear, disabled: !canSpin, icon: <Trash2 size={16} />, title: 'Clear All' },
                    ].map(({ action, disabled, icon, title }) => (
                        <button
                            key={title}
                            onClick={action}
                            disabled={disabled}
                            title={title}
                            className="w-10 h-10 flex items-center justify-center rounded-xl transition-all disabled:opacity-25 disabled:cursor-not-allowed"
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: 'rgba(255,255,255,0.5)',
                            }}
                            onMouseEnter={e => {
                                if (!disabled) {
                                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.1)';
                                    (e.currentTarget as HTMLElement).style.color = 'white';
                                }
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)';
                                (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
                            }}
                        >
                            {icon}
                        </button>
                    ))}
                </div>

                {/* SPIN button */}
                <button
                    onClick={onSpin}
                    disabled={!canSpin}
                    className={cn(
                        'relative overflow-hidden px-14 py-4 rounded-xl font-bold text-base uppercase tracking-[0.15em] transition-all duration-300 flex items-center gap-3',
                        canSpin
                            ? 'casino-btn-primary text-zinc-900'
                            : 'cursor-not-allowed opacity-30 text-white/30'
                    )}
                    style={!canSpin ? { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' } : {}}
                >
                    {canSpin && (
                        <div
                            className="absolute inset-0 -translate-x-full"
                            style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)', animation: 'shimmer 2s infinite' }}
                        />
                    )}
                    <RotateCw size={20} className={cn('transition-transform duration-700', canSpin && 'group-hover:rotate-180')} />
                    Spin
                </button>
            </div>

            {/* Balance + Refill */}
            <div className="casino-divider" />
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,171,10,0.08)', border: '1px solid rgba(255,171,10,0.15)' }}>
                        <Coins size={18} className="text-gold-500" />
                    </div>
                    <div>
                        <div className="casino-label" style={{ fontSize: '8px' }}>Available Balance</div>
                        <div className="text-2xl font-bold text-white tracking-tight">${balance.toLocaleString()}</div>
                    </div>
                </div>

                {canRefill && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={onRefill}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all"
                        style={{
                            background: 'rgba(16,185,129,0.08)',
                            border: '1px solid rgba(16,185,129,0.2)',
                            color: '#10b981',
                        }}
                        onMouseEnter={e => {
                            (e.currentTarget as HTMLElement).style.background = '#10b981';
                            (e.currentTarget as HTMLElement).style.color = '#052e16';
                        }}
                        onMouseLeave={e => {
                            (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.08)';
                            (e.currentTarget as HTMLElement).style.color = '#10b981';
                        }}
                    >
                        <PlusCircle size={14} />
                        Reload Credits
                    </motion.button>
                )}

                <div className="hidden sm:flex flex-col items-end opacity-20 text-[10px] font-semibold uppercase tracking-widest">
                    <span>House Edge</span>
                    <span className="text-gold-500">2.7%</span>
                </div>
            </div>
        </div>
    );
};
