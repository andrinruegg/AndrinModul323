import React, { useState, useEffect } from 'react';
import { RouletteWheel } from '../molecules/RouletteWheel';
import { BettingTable } from './BettingTable';
import { GameControls } from './GameControls';
import { useRoulette } from '../../hooks/useRoulette';
import { useAudio } from '../../hooks/useAudio';
import { BetType, RED_NUMBERS } from '../../types/roulette';
import confetti from 'canvas-confetti';
import { Trophy, History, Wallet, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useBalance } from '../../context/BalanceContext';
import { cn } from '../../lib/utils';

const RouletteGame: React.FC = () => {
    const navigate = useNavigate();
    const { balance, withdraw, deposit } = useBalance();
    const { state, placeBet, undoBet, clearBets, repeatLastBets, refillBalance, spin, resolveSpin, getStats } = useRoulette(balance, withdraw, deposit);
    const { play, stop } = useAudio();
    const [selectedChip, setSelectedChip] = useState(100);
    const [winningNumber, setWinningNumber] = useState<number | null>(null);
    const [winMessage, setWinMessage] = useState<{ amount: number } | null>(null);
    const [muted, setMuted] = useState(false);
    const { theme } = useTheme();
    const stats = getStats();

    const handlePlaceBet = (type: BetType, value: number | string) => {
        if (!muted) play('chip', 0.4);
        placeBet({ type, value, amount: selectedChip });
    };

    const handleSpin = () => {
        const result = spin();
        if (result !== undefined) {
            if (!muted) play('spin', 0.6);
            setWinningNumber(result);
            setWinMessage(null);
        }
    };

    const onAnimationComplete = () => {
        if (winningNumber !== null) {
            if (!muted) {
                stop('spin');
                play('ball', 0.8);
            }

            const winAmount = resolveSpin(winningNumber);
            if (winAmount > 0) {
                if (!muted) setTimeout(() => play('win', 0.7), 200);
                setWinMessage({ amount: winAmount });
                confetti({
                    particleCount: 200,
                    spread: 80,
                    origin: { y: 0.6 },
                    colors: ['#ffab0a', '#ffffff', '#e68a00', '#ffd700']
                });
            } else {
                if (!muted) setTimeout(() => play('lose', 0.3), 200);
            }
        }
    };

    useEffect(() => {
        if (winMessage) {
            const timer = setTimeout(() => setWinMessage(null), 5000);
            return () => clearTimeout(timer);
        }
    }, [winMessage]);

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans overflow-x-hidden p-4 md:p-8 selection:bg-gold-500/30 ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none opacity-50">
                <div className={`absolute top-[-20%] left-[-10%] w-[50%] h-[50%] blur-[100px] rounded-full ${theme === 'dark' ? 'bg-emerald-900/10' : 'bg-emerald-200/30'}`} />
                <div className={`absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] blur-[100px] rounded-full ${theme === 'dark' ? 'bg-gold-900/10' : 'bg-gold-200/30'}`} />
            </div>

            {/* Header */}
            <header className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between mb-8 md:mb-16 relative z-10 gap-8 md:gap-0">
                <div className="flex items-center gap-6 group">
                    <motion.button
                        whileHover={{ x: -5 }}
                        onClick={() => navigate('/')}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-colors group/back"
                    >
                        <ArrowLeft className="text-zinc-400 group-hover/back:text-white transition-colors" size={24} />
                    </motion.button>

                    <div className="flex items-center gap-4">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            className="w-12 h-12 bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 rounded-xl flex items-center justify-center shadow-[0_10px_30px_rgba(255,171,10,0.3)] border border-white/10 relative overflow-hidden"
                        >
                            <Trophy className="text-zinc-950 relative z-10" size={24} />
                        </motion.div>
                        <div>
                            <h1 className={`text-2xl font-black tracking-tighter uppercase italic bg-gradient-r ${theme === 'dark' ? 'from-white via-gold-400 to-white' : 'from-zinc-900 via-gold-600 to-zinc-900'} bg-clip-text text-transparent`}>Royal Roulette</h1>
                            <p className={`text-[8px] font-bold tracking-[0.4em] uppercase opacity-50 ${theme === 'dark' ? 'text-gold-500' : 'text-gold-700'}`}>Royal Casino</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4 items-center flex-wrap justify-center">
                    <div className={`flex p-1.5 rounded-2xl border ${theme === 'dark' ? 'bg-white/5 border-white/5' : 'bg-zinc-200/50 border-zinc-200'}`}>
                        <button
                            onClick={() => setMuted(!muted)}
                            className={`p-2.5 rounded-xl transition-colors ${theme === 'dark' ? 'hover:bg-white/10 text-zinc-400 hover:text-white' : 'hover:bg-zinc-300 text-zinc-600 hover:text-zinc-900'}`}
                            title={muted ? "Unmute SFX" : "Mute SFX"}
                        >
                            {muted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                        </button>
                    </div>

                    <div className="h-10 w-[1px] bg-white/10 mx-2 hidden md:block" />

                    <div className="hidden sm:block text-right">
                        <div className="text-[9px] text-zinc-500 font-black uppercase tracking-[0.3em] mb-2 opacity-40">Previous Results</div>
                        <div className="flex gap-2 justify-end">
                            {state.winningHistory.length === 0 && <span className="text-zinc-700 text-xs italic tracking-wide">Place bets to start...</span>}
                            {state.winningHistory.slice(0, 6).map((num, i) => (
                                <motion.div
                                    initial={{ scale: 0, x: 20 }}
                                    animate={{ scale: 1, x: 0 }}
                                    key={i}
                                    className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black shadow-lg border border-white/10 ${num === 0 ? 'bg-emerald-600 shadow-emerald-500/20' : RED_NUMBERS.includes(num) ? 'bg-rose-700 shadow-rose-500/20' : 'bg-zinc-800 shadow-black/40'}`}
                                >
                                    {num}
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-12 lg:gap-20 items-start relative z-10">
                <div className="relative flex flex-col items-center justify-center pt-8 md:pt-16 xl:sticky xl:top-24">
                    <AnimatePresence>
                        {winMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 100, scale: 0.5 }}
                                animate={{ opacity: 1, y: -40, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.3 } }}
                                className="absolute top-0 flex items-center justify-center z-50 pointer-events-none"
                            >
                                <div className="bg-gradient-to-b from-white via-gold-400 to-gold-700 text-zinc-950 px-12 py-8 rounded-[2rem] shadow-[0_0_120px_rgba(255,171,10,0.7)] flex flex-col items-center border-[6px] border-white/30 transform-gpu">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] opacity-60 mb-2">Jackpot Win!</span>
                                    <span className="text-7xl font-black tracking-tighter drop-shadow-sm">${winMessage.amount.toLocaleString()}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <RouletteWheel
                        isSpinning={state.isSpinning}
                        winningNumber={winningNumber}
                        onAnimationComplete={onAnimationComplete}
                    />


                    <motion.div
                        animate={state.isSpinning ? { opacity: [0.3, 1, 0.3], scale: [0.98, 1, 0.98] } : { opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className={`mt-16 md:mt-24 px-10 py-5 rounded-2xl flex items-center gap-6 border shadow-2xl relative overflow-hidden group transition-colors ${theme === 'dark' ? 'bg-white/5 border-gold-500/20 text-gold-500/80 shadow-gold-500/10' : 'bg-white border-gold-500/30 text-gold-600 shadow-zinc-200'}`}
                    >
                        <div className="absolute inset-0 bg-gold-500/5 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        <History size={24} className="text-gold-500" />
                        <span className="text-xs font-black uppercase tracking-[0.3em]">
                            {state.isSpinning ? "Wheel is in motion..." : "Place your bets and win big"}
                        </span>
                    </motion.div>
                </div>

                <div className="flex flex-col gap-8 pb-16">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gold-500/5 blur-[120px] rounded-full translate-y-24" />
                        <BettingTable
                            onPlaceBet={handlePlaceBet}
                            activeBets={state.activeBets}
                        />
                    </div>

                    <GameControls
                        onSpin={handleSpin}
                        onClear={clearBets}
                        onUndo={() => {
                            if (!muted) play('chip', 0.2);
                            undoBet();
                        }}
                        onRepeat={() => {
                            if (!muted) play('chip', 0.2);
                            repeatLastBets();
                        }}
                        onRefill={() => {
                            if (!muted) play('win', 0.5);
                            refillBalance();
                        }}
                        canSpin={state.activeBets.length > 0 && !state.isSpinning}
                        canUndo={state.activeBets.length > 0 && !state.isSpinning}
                        canRepeat={state.activeBets.length === 0 && state.lastBets.length > 0 && !state.isSpinning}
                        canRefill={balance < 100}
                        selectedChip={selectedChip}
                        setSelectedChip={(chip) => {
                            if (!muted) play('chip', 0.2);
                            setSelectedChip(chip);
                        }}
                        balance={balance}
                    />

                    <div className="mt-4 grid grid-cols-2 gap-8 px-4">
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-rose-500/5 rounded-3xl border border-rose-500/10 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase text-rose-500 tracking-[0.2em] opacity-60">Hot Numbers</span>
                                <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse" />
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {stats.hot.length === 0 && <div className="text-[10px] text-zinc-700 italic font-medium">Awaiting spin data...</div>}
                                {stats.hot.map(n => (
                                    <div key={n} className={cn(
                                        "w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-black shadow-lg transition-transform hover:scale-110",
                                        n === 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                            RED_NUMBERS.includes(n) ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                                "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                                    )}>
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-6 bg-cyan-500/5 rounded-3xl border border-cyan-500/10 backdrop-blur-sm">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black uppercase text-cyan-500 tracking-[0.2em] opacity-60">Cold Numbers</span>
                                <div className="w-2 h-2 rounded-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]" />
                            </div>
                            <div className="flex gap-3 flex-wrap">
                                {stats.cold.length === 0 && <div className="text-[10px] text-zinc-700 italic font-medium">Awaiting spin data...</div>}
                                {stats.cold.map(n => (
                                    <div key={n} className={cn(
                                        "w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-black shadow-lg transition-transform hover:scale-110",
                                        n === 0 ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" :
                                            RED_NUMBERS.includes(n) ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                                "bg-zinc-500/10 border-zinc-500/20 text-zinc-400"
                                    )}>
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    <div className="mt-8 flex items-center gap-4 justify-center text-white/10 text-[10px] font-bold uppercase tracking-[0.5em]">
                        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent to-white/10" />
                        <div className="flex items-center gap-3">
                            <Wallet size={14} className="opacity-30" />
                            Purely for Entertainment
                        </div>
                        <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent to-white/10" />
                    </div>
                </div>
            </main>

            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-500/20 to-transparent z-50" />
            <div className="fixed bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent z-50" />
        </div>
    );
};

export default RouletteGame;
