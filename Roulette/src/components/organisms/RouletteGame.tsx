import React, { useState, useEffect } from 'react';
import { RouletteWheel } from '../molecules/RouletteWheel';
import { BettingTable } from './BettingTable';
import { GameControls } from './GameControls';
import { useRoulette } from '../../hooks/useRoulette';
import { useAudio } from '../../hooks/useAudio';
import { BetType, RED_NUMBERS } from '../../types/roulette';
import confetti from 'canvas-confetti';
import { History, Volume2, VolumeX, ArrowLeft, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
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
            if (!muted) { stop('spin'); play('ball', 0.8); }
            const winAmount = resolveSpin(winningNumber);
            if (winAmount > 0) {
                if (!muted) setTimeout(() => play('win', 0.7), 200);
                setWinMessage({ amount: winAmount });
                confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 }, colors: ['#ffab0a', '#ffffff', '#e68a00', '#ffd700'] });
            } else {
                if (!muted) setTimeout(() => play('lose', 0.3), 200);
            }
        }
    };

    useEffect(() => {
        if (winMessage) {
            const t = setTimeout(() => setWinMessage(null), 5000);
            return () => clearTimeout(t);
        }
    }, [winMessage]);

    return (
        <div className="min-h-screen text-white overflow-x-hidden">
            {/* Background */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{
                backgroundImage: `radial-gradient(ellipse 70% 50% at 30% 20%, rgba(29,185,84,0.04) 0%, transparent 55%), radial-gradient(ellipse 60% 40% at 80% 80%, rgba(255,171,10,0.04) 0%, transparent 50%)`,
            }} />

            {/* Top accent line */}
            <div className="fixed top-0 left-0 w-full h-[2px] z-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,171,10,0.6), transparent)' }} />

            {/* ===== HEADER ===== */}
            <header
                className="sticky top-0 z-40 w-full border-b border-white/[0.05]"
                style={{ background: 'rgba(8,9,14,0.9)', backdropFilter: 'blur(20px)' }}
            >
                <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-6">
                    {/* Left: back + title */}
                    <div className="flex items-center gap-4">
                        <motion.button
                            whileHover={{ x: -3 }}
                            onClick={() => navigate('/')}
                            className="casino-btn-ghost p-2.5 rounded-xl text-white/50"
                        >
                            <ArrowLeft size={18} />
                        </motion.button>
                        <div className="hidden sm:block w-px h-6 bg-white/[0.08]" />
                        <div>
                            <h1 className="font-display font-bold text-2xl text-white leading-tight">Royal Roulette</h1>
                            <p className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-500/50 leading-none">European · Single Zero</p>
                        </div>
                    </div>

                    {/* Right: mute + history + balance */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setMuted(!muted)}
                            className="p-2 rounded-lg transition-colors"
                            style={{ color: muted ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                        >
                            {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                        </button>

                        {/* History pills */}
                        <div className="hidden sm:flex items-center gap-1.5">
                            {state.winningHistory.length === 0
                                ? <span className="text-[10px] text-white/20 italic">No results yet</span>
                                : state.winningHistory.slice(0, 7).map((num, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className={cn(
                                            'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold border',
                                            num === 0 ? 'bg-emerald-600/20 border-emerald-500/30 text-emerald-400'
                                                : RED_NUMBERS.includes(num) ? 'bg-rose-700/20 border-rose-500/30 text-rose-400'
                                                    : 'bg-white/[0.04] border-white/10 text-white/50'
                                        )}
                                    >
                                        {num}
                                    </motion.div>
                                ))}
                        </div>

                        <div className="hidden sm:block w-px h-6 bg-white/[0.08]" />

                        <div className="balance-chip">
                            <div className="text-right">
                                <div className="casino-label" style={{ fontSize: '8px' }}>Balance</div>
                                <div className="text-white font-bold text-base leading-none">${balance.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== MAIN ===== */}
            <main className="max-w-[1400px] mx-auto grid grid-cols-1 xl:grid-cols-2 gap-8 lg:gap-16 items-start px-4 md:px-8 py-10 relative z-10">
                {/* LEFT: Wheel */}
                <div className="relative flex flex-col items-center justify-center xl:sticky xl:top-24">
                    <AnimatePresence>
                        {winMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: 60, scale: 0.7 }}
                                animate={{ opacity: 1, y: -20, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.25 } }}
                                className="absolute top-0 z-50 flex flex-col items-center pointer-events-none"
                            >
                                <div
                                    className="px-14 py-8 rounded-2xl flex flex-col items-center"
                                    style={{
                                        background: 'linear-gradient(135deg, #ffcc3d 0%, #ffab0a 50%, #e68a00 100%)',
                                        boxShadow: '0 0 80px rgba(255,171,10,0.8), 0 20px 60px rgba(0,0,0,0.6)',
                                        border: '1px solid rgba(255,255,255,0.3)',
                                    }}
                                >
                                    <span className="text-[9px] font-bold uppercase tracking-[0.4em] text-zinc-900/60 mb-1">Winner!</span>
                                    <span className="text-6xl font-display font-bold text-zinc-900 leading-none">${winMessage.amount.toLocaleString()}</span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <RouletteWheel
                        isSpinning={state.isSpinning}
                        winningNumber={winningNumber}
                        onAnimationComplete={onAnimationComplete}
                    />

                    {/* Status bar */}
                    <motion.div
                        animate={state.isSpinning ? { opacity: [0.5, 1, 0.5] } : { opacity: 1 }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="mt-10 px-8 py-3 rounded-xl flex items-center gap-3 text-sm font-semibold"
                        style={{
                            background: 'rgba(255,171,10,0.05)',
                            border: '1px solid rgba(255,171,10,0.12)',
                            color: state.isSpinning ? '#ffab0a' : 'rgba(255,255,255,0.3)',
                        }}
                    >
                        <History size={14} className={state.isSpinning ? 'text-gold-500 animate-spin' : 'opacity-40'} />
                        <span>{state.isSpinning ? 'The wheel is spinning...' : 'Place your bets to start'}</span>
                    </motion.div>

                    {/* Hot / Cold */}
                    <div className="mt-6 grid grid-cols-2 gap-4 w-full max-w-sm">
                        {[
                            { label: 'Hot Numbers', data: stats.hot, color: '#f43f5e', bg: 'rgba(244,63,94,0.05)', icon: <TrendingUp size={12} /> },
                            { label: 'Cold Numbers', data: stats.cold, color: '#06b6d4', bg: 'rgba(6,182,212,0.05)', icon: <TrendingDown size={12} /> },
                        ].map(({ label, data, color, bg, icon }) => (
                            <div key={label} className="p-4 rounded-xl" style={{ background: bg, border: `1px solid ${color}20` }}>
                                <div className="flex items-center gap-1.5 mb-3">
                                    <span style={{ color }}>{icon}</span>
                                    <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: `${color}99` }}>{label}</span>
                                </div>
                                <div className="flex gap-2 flex-wrap">
                                    {data.length === 0
                                        ? <span className="text-[10px] text-white/20 italic">Awaiting data</span>
                                        : data.map(n => (
                                            <div key={n} className={cn(
                                                'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold border',
                                                n === 0 ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                                    : RED_NUMBERS.includes(n) ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                                                        : 'bg-white/[0.04] border-white/10 text-white/50'
                                            )}>{n}</div>
                                        ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT: Betting area */}
                <div className="flex flex-col gap-6 pb-16">
                    <BettingTable onPlaceBet={handlePlaceBet} activeBets={state.activeBets} />
                    <GameControls
                        onSpin={handleSpin}
                        onClear={clearBets}
                        onUndo={() => { if (!muted) play('chip', 0.2); undoBet(); }}
                        onRepeat={() => { if (!muted) play('chip', 0.2); repeatLastBets(); }}
                        onRefill={() => { if (!muted) play('win', 0.5); refillBalance(); }}
                        canSpin={state.activeBets.length > 0 && !state.isSpinning}
                        canUndo={state.activeBets.length > 0 && !state.isSpinning}
                        canRepeat={state.activeBets.length === 0 && state.lastBets.length > 0 && !state.isSpinning}
                        canRefill={balance < 100}
                        selectedChip={selectedChip}
                        setSelectedChip={(chip) => { if (!muted) play('chip', 0.2); setSelectedChip(chip); }}
                        balance={balance}
                    />
                </div>
            </main>
        </div>
    );
};

export default RouletteGame;
