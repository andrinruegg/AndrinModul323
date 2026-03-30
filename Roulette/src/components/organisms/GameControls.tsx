import React from 'react';
import { Coins, RotateCw, Trash2, Undo2, Repeat, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ActionButton } from '../atoms/ActionButton';
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

const CHIPS = [10, 50, 100, 500, 1000];

export const GameControls: React.FC<GameControlsProps> = ({
    onSpin,
    onClear,
    onUndo,
    onRepeat,
    onRefill,
    canSpin,
    canUndo,
    canRepeat,
    canRefill,
    selectedChip,
    setSelectedChip,
    balance,
}) => {
    return (
        <div className="w-full glass-gold rounded-3xl p-4 md:p-8 mt-4 md:mt-8 flex flex-col gap-8 shadow-2xl border border-gold-500/20 relative overflow-hidden">
            {/* Background Decorative Element */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-500/5 blur-3xl -translate-y-16 translate-x-16 rounded-full" />

            <div className="flex flex-col xl:flex-row items-center justify-between gap-8 relative z-10">
                {/* Chip Selector */}
                <div className="flex flex-col items-center md:items-start gap-4 w-full xl:w-auto">
                    <div className="text-gold-500/40 font-black text-[10px] uppercase tracking-[0.3em] ml-1">Select Your Chip</div>
                    <div className="flex gap-4 flex-wrap justify-center">
                        {CHIPS.map((amount) => (
                            <button
                                key={amount}
                                onClick={() => setSelectedChip(amount)}
                                disabled={balance < amount}
                                className={cn(
                                    "relative w-14 h-14 rounded-full flex items-center justify-center font-black text-xs transition-all duration-300 transform hover:scale-110 active:scale-90 disabled:opacity-20 disabled:grayscale disabled:scale-100",
                                    selectedChip === amount
                                        ? "bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-zinc-950 scale-110 shadow-[0_0_30px_rgba(255,171,10,0.5)] ring-4 ring-gold-500/20"
                                        : "bg-zinc-900 text-gold-500/60 border-2 border-gold-500/10 hover:border-gold-500/30 hover:text-gold-500"
                                )}
                            >
                                <span className="drop-shadow-sm">{amount}</span>
                                <div className="absolute inset-1 rounded-full border-2 border-dashed border-current opacity-10" />
                                <div className="absolute inset-[15%] rounded-full border border-current opacity-5" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Action Group */}
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full xl:w-auto">
                    {/* Secondary Actions */}
                    <div className="flex gap-3 p-2 bg-black/20 rounded-2xl border border-white/5">
                        <ActionButton
                            onClick={onUndo}
                            disabled={!canUndo}
                            title="Undo Last Bet"
                            icon={<Undo2 size={20} />}
                        />
                        <ActionButton
                            onClick={onRepeat}
                            disabled={!canRepeat}
                            title="Repeat Last Bets"
                            icon={<Repeat size={20} />}
                        />
                        <ActionButton
                            onClick={onClear}
                            disabled={!canSpin}
                            title="Clear All Bets"
                            icon={<Trash2 size={20} />}
                        />
                    </div>

                    {/* Primary Action: SPIN */}
                    <button
                        onClick={onSpin}
                        disabled={!canSpin}
                        className={cn(
                            "group relative flex-1 sm:flex-initial px-12 py-5 rounded-2xl font-black text-xl tracking-[0.2em] uppercase transition-all duration-500 overflow-hidden flex items-center justify-center gap-4",
                            canSpin
                                ? "bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 text-zinc-950 shadow-[0_10px_40px_rgba(255,171,10,0.4)] hover:shadow-[0_15px_60px_rgba(255,171,10,0.6)] hover:-translate-y-1 active:translate-y-1"
                                : "bg-zinc-800 text-zinc-600 cursor-not-allowed opacity-50"
                        )}
                    >
                        {/* Button Shine Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none" />

                        <RotateCw size={28} className={cn("transition-transform duration-700", canSpin && "group-hover:rotate-180")} />
                        <span>Spin</span>
                    </button>
                </div>
            </div>

            {/* Bottom Section: Balance & Info */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-gold-500/10">
                <div className="flex items-center gap-6">
                    <div className="relative">
                        <div className="text-gold-500/40 font-black text-[9px] uppercase tracking-[0.3em] mb-1">Available Funds</div>
                        <div className="text-4xl font-black text-white flex items-center gap-3 tracking-tighter">
                            <div className="w-10 h-10 rounded-xl bg-gold-500/10 flex items-center justify-center border border-gold-500/20">
                                <Coins className="text-gold-500" size={24} />
                            </div>
                            <span className="bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                                ${balance.toLocaleString()}
                            </span>
                        </div>
                    </div>

                    {canRefill && (
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={onRefill}
                            className="flex items-center gap-2 bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-zinc-950 px-5 py-3 rounded-xl transition-all border border-emerald-600/20 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-900/10"
                        >
                            <PlusCircle size={16} />
                            Refill Wallet
                        </motion.button>
                    )}
                </div>

                <div className="hidden sm:flex flex-col items-end opacity-30 group">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] mb-1 group-hover:text-gold-500 transition-colors">House Edge: 2.7%</div>
                    <div className="w-24 h-1 bg-zinc-800 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gold-500/50" />
                    </div>
                </div>
            </div>
        </div>
    );
};


