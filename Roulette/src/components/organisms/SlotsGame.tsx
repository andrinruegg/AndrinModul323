import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Coins } from 'lucide-react';
import { useBalance } from '../../context/BalanceContext';
import confetti from 'canvas-confetti';

// ---- Symbols ----
interface SlotSymbol {
    id: string;
    display: string;
    value: number;
    label: string;
    color: string;
    glow: string;
}

const SYMBOLS: SlotSymbol[] = [
    { id: 'seven',   display: '7',  value: 200, label: 'Jackpot',  color: '#f43f5e', glow: 'rgba(244,63,94,0.6)' },
    { id: 'diamond', display: '💎', value: 100, label: 'Diamond',  color: '#06b6d4', glow: 'rgba(6,182,212,0.5)' },
    { id: 'crown',   display: '👑', value: 50,  label: 'Crown',    color: '#f59e0b', glow: 'rgba(245,158,11,0.5)' },
    { id: 'cherry',  display: '🍒', value: 25,  label: 'Cherry',   color: '#ef4444', glow: 'rgba(239,68,68,0.4)' },
    { id: 'bar',     display: 'BAR', value: 15, label: 'Bar',      color: '#a78bfa', glow: 'rgba(167,139,250,0.4)' },
    { id: 'lemon',   display: '🍋', value: 10,  label: 'Lemon',    color: '#fbbf24', glow: 'rgba(251,191,36,0.4)' },
];

const REEL_COUNT = 3;

const SlotsGame: React.FC = () => {
    const navigate = useNavigate();
    const { balance, withdraw, deposit } = useBalance();

    const [reels, setReels] = useState<SlotSymbol[][]>(
        Array(REEL_COUNT).fill(null).map(() => [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]])
    );
    const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [bet, setBet] = useState(100);
    const [message, setMessage] = useState('Good luck!');
    const [winAmount, setWinAmount] = useState(0);
    const [winningLine, setWinningLine] = useState<number | null>(null);

    const spin = async () => {
        if (balance < bet) { setMessage('Insufficient balance!'); return; }
        setIsSpinning(true);
        setSpinningReels([true, true, true]);
        withdraw(bet);
        setMessage('Spinning…');
        setWinAmount(0);
        setWinningLine(null);

        const newResults: SlotSymbol[][] = Array(REEL_COUNT).fill(null).map(() =>
            Array(3).fill(null).map(() => SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)])
        );

        for (let i = 0; i < REEL_COUNT; i++) {
            await new Promise(res => setTimeout(res, 2000 + i * 500));
            setSpinningReels(prev => { const n = [...prev]; n[i] = false; return n; });
            setReels(prev => { const n = [...prev]; n[i] = newResults[i]; return n; });
        }

        setIsSpinning(false);
        checkWin(newResults);
    };

    const checkWin = (results: SlotSymbol[][]) => {
        let totalWin = 0;
        let wonLine: number | null = null;
        for (let row = 0; row < 3; row++) {
            const line = [results[0][row], results[1][row], results[2][row]];
            if (line.every(s => s.id === line[0].id)) {
                totalWin += line[0].value * (bet / 10);
                wonLine = row;
            }
        }
        if (totalWin > 0) {
            deposit(totalWin); setWinAmount(totalWin); setWinningLine(wonLine);
            setMessage(`Winner! +$${totalWin.toLocaleString()}`);
            confetti({ particleCount: 220, spread: 100, origin: { y: 0.5 }, colors: ['#ffab0a', '#ffffff', '#f43f5e', '#06b6d4'] });
        } else {
            const midRow = [results[0][1], results[1][1], results[2][1]];
            const counts: Record<string, number> = {};
            midRow.forEach(s => counts[s.id] = (counts[s.id] || 0) + 1);
            if (Object.values(counts).some(c => c === 2)) {
                const payout = Math.floor(bet * 0.5);
                deposit(payout); setWinAmount(payout);
                setMessage(`Near miss! +$${payout}`);
            } else {
                setMessage('Better luck next time');
            }
        }
    };

    const BET_OPTIONS = [50, 100, 200, 500];

    return (
        <div
            className="min-h-screen text-white overflow-hidden relative"
            style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 0%, #1a0a2e 0%, #0d0616 40%, #08090e 100%)' }}
        >
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(139,92,246,0.06) 0%, transparent 60%)' }} />
            {/* Top accent */}
            <div className="fixed top-0 left-0 w-full h-[2px] z-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.7), rgba(255,171,10,0.5), rgba(139,92,246,0.7), transparent)' }} />

            {/* ===== HEADER ===== */}
            <header
                className="sticky top-0 z-40 border-b border-white/[0.05]"
                style={{ background: 'rgba(8,6,22,0.88)', backdropFilter: 'blur(20px)' }}
            >
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-xl transition-all"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex flex-col items-center">
                        <h1 className="font-display font-bold text-2xl text-white leading-tight">Royal Slots</h1>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.35em] leading-none" style={{ color: 'rgba(139,92,246,0.7)' }}>Triple Reel · Noble Fortunes</p>
                    </div>

                    <div className="balance-chip">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,171,10,0.12)' }}>
                            <Coins size={13} className="text-gold-500" />
                        </div>
                        <div>
                            <div className="casino-label" style={{ fontSize: '8px' }}>Credits</div>
                            <div className="text-white font-bold text-base leading-none">${balance.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== MAIN ===== */}
            <main className="max-w-3xl mx-auto flex flex-col items-center px-6 py-10 relative z-10 gap-8">

                {/* Machine Cabinet */}
                <div
                    className="w-full rounded-3xl overflow-hidden"
                    style={{
                        background: 'linear-gradient(180deg, #1e1530 0%, #120d20 60%, #0a0812 100%)',
                        border: '2px solid rgba(139,92,246,0.25)',
                        boxShadow: '0 0 80px rgba(139,92,246,0.15), 0 40px 100px rgba(0,0,0,0.8)',
                    }}
                >
                    {/* Cabinet top bar (LED strip) */}
                    <div
                        className="w-full h-1.5"
                        style={{ background: 'linear-gradient(90deg, #6d28d9, #8b5cf6, #a78bfa, #f59e0b, #a78bfa, #8b5cf6, #6d28d9)', animation: isSpinning ? 'shimmer 1s linear infinite' : 'none' }}
                    />

                    {/* Cabinet header */}
                    <div className="px-8 pt-6 pb-4 text-center border-b border-white/[0.05]">
                        <div className="font-display font-bold text-lg tracking-widest" style={{ color: 'rgba(167,139,250,0.8)' }}>
                            ♠ ROYAL SLOTS ♠
                        </div>
                    </div>

                    {/* Reel area */}
                    <div
                        className="relative mx-6 my-5 rounded-2xl overflow-hidden p-4 md:p-6"
                        style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.05)', boxShadow: 'inset 0 8px 40px rgba(0,0,0,0.6)' }}
                    >
                        {/* Paylines */}
                        {[25, 50, 75].map((top, i) => (
                            <div
                                key={i}
                                className="absolute left-0 right-0 h-px z-20 transition-opacity duration-500"
                                style={{ top: `${top}%`, background: i === 1 ? 'rgba(255,171,10,0.25)' : 'rgba(255,255,255,0.04)' }}
                            />
                        ))}

                        {/* Winning line highlight */}
                        <AnimatePresence>
                            {winningLine !== null && (
                                <motion.div
                                    initial={{ scaleX: 0, opacity: 0 }}
                                    animate={{ scaleX: 1, opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute left-0 right-0 h-1 rounded-full z-30"
                                    style={{
                                        top: `${(winningLine * 33.33) + 16.66}%`,
                                        background: 'linear-gradient(90deg, transparent, #8b5cf6, #f59e0b, #8b5cf6, transparent)',
                                        boxShadow: '0 0 20px rgba(139,92,246,0.8)',
                                    }}
                                />
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 md:gap-4 relative z-10">
                            {reels.map((reel, ri) => (
                                <div
                                    key={ri}
                                    className="flex-1 rounded-xl overflow-hidden relative"
                                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.06)', height: '300px' }}
                                >
                                    {/* Inner top/bottom shadows for reel depth */}
                                    <div className="absolute inset-0 pointer-events-none z-20"
                                        style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 25%, transparent 75%, rgba(0,0,0,0.7) 100%)' }} />

                                    <motion.div
                                        animate={spinningReels[ri]
                                            ? { y: [-800, 0], opacity: [0.7, 1] }
                                            : { y: 0, opacity: 1 }}
                                        transition={spinningReels[ri]
                                            ? { repeat: Infinity, duration: 0.12, ease: 'linear' }
                                            : { type: 'spring', stiffness: 250, damping: 22 }}
                                        style={{ willChange: 'transform' }}
                                        className="flex flex-col items-center"
                                    >
                                        {(spinningReels[ri]
                                            ? [...SYMBOLS, ...SYMBOLS, ...SYMBOLS]
                                            : reel
                                        ).map((sym, idx) => (
                                            <div
                                                key={idx}
                                                className="h-[100px] flex flex-col items-center justify-center shrink-0 w-full"
                                            >
                                                {sym.id === 'seven' ? (
                                                    <div
                                                        className="text-5xl font-display font-bold italic leading-none"
                                                        style={{ color: sym.color, textShadow: `0 0 20px ${sym.glow}` }}
                                                    >
                                                        7
                                                    </div>
                                                ) : sym.id === 'bar' ? (
                                                    <div
                                                        className="text-xl font-display font-bold tracking-widest px-3 py-1 rounded-lg"
                                                        style={{ color: sym.color, background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.2)' }}
                                                    >
                                                        BAR
                                                    </div>
                                                ) : (
                                                    <div className="text-4xl leading-none" style={{ filter: `drop-shadow(0 0 8px ${sym.glow})` }}>
                                                        {sym.display}
                                                    </div>
                                                )}
                                                {!spinningReels[ri] && (
                                                    <div className="text-[8px] font-bold uppercase tracking-widest mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
                                                        {sym.label}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status message */}
                    <div className="h-16 flex flex-col items-center justify-center px-8 pb-2">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={message}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -6 }}
                                className="font-display font-bold text-2xl md:text-3xl text-center"
                                style={{
                                    color: winAmount > 0 ? '#ffab0a' : 'rgba(255,255,255,0.4)',
                                    textShadow: winAmount > 0 ? '0 0 40px rgba(255,171,10,0.6)' : 'none',
                                }}
                            >
                                {message}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Bottom LED strip */}
                    <div className="w-full h-1" style={{ background: 'linear-gradient(90deg, #6d28d9, #8b5cf6, #a78bfa, #f59e0b, #a78bfa, #8b5cf6, #6d28d9)', opacity: 0.6 }} />
                </div>

                {/* Controls panel */}
                <div
                    className="w-full rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6 items-center"
                    style={{ background: 'rgba(8,9,14,0.9)', border: '1px solid rgba(139,92,246,0.15)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
                >
                    {/* Bet selector */}
                    <div className="flex flex-col gap-3">
                        <span className="casino-label" style={{ fontSize: '9px' }}>Bet Amount</span>
                        <div className="grid grid-cols-2 gap-2">
                            {BET_OPTIONS.map(val => (
                                <button
                                    key={val}
                                    onClick={() => setBet(val)}
                                    disabled={isSpinning}
                                    className="py-2.5 rounded-xl text-sm font-bold transition-all duration-200 disabled:opacity-40"
                                    style={{
                                        background: bet === val ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.04)',
                                        border: `1px solid ${bet === val ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                                        color: bet === val ? '#a78bfa' : 'rgba(255,255,255,0.4)',
                                        boxShadow: bet === val ? '0 0 15px rgba(139,92,246,0.2)' : 'none',
                                    }}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Spin button */}
                    <div className="flex justify-center">
                        <button
                            onClick={spin}
                            disabled={isSpinning}
                            className="relative w-36 h-36 rounded-full flex flex-col items-center justify-center font-bold text-base uppercase tracking-widest transition-all duration-300 overflow-hidden"
                            style={{
                                background: isSpinning
                                    ? 'rgba(255,255,255,0.05)'
                                    : 'linear-gradient(145deg, #8b5cf6, #6d28d9)',
                                border: isSpinning ? '3px solid rgba(255,255,255,0.08)' : '3px solid rgba(167,139,250,0.5)',
                                boxShadow: isSpinning ? 'none' : '0 0 50px rgba(139,92,246,0.4), 0 12px 40px rgba(0,0,0,0.6)',
                                color: isSpinning ? 'rgba(255,255,255,0.2)' : 'white',
                                transform: isSpinning ? 'scale(0.93)' : 'scale(1)',
                                cursor: isSpinning ? 'not-allowed' : 'pointer',
                            }}
                            onMouseEnter={e => {
                                if (!isSpinning) {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1.05)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 80px rgba(139,92,246,0.6), 0 16px 60px rgba(0,0,0,0.6)';
                                }
                            }}
                            onMouseLeave={e => {
                                if (!isSpinning) {
                                    (e.currentTarget as HTMLElement).style.transform = 'scale(1)';
                                    (e.currentTarget as HTMLElement).style.boxShadow = '0 0 50px rgba(139,92,246,0.4), 0 12px 40px rgba(0,0,0,0.6)';
                                }
                            }}
                        >
                            {/* Gloss */}
                            <div className="absolute inset-0 rounded-full" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.18) 0%, transparent 55%)' }} />
                            {isSpinning ? (
                                <RotateCcw size={28} className="animate-spin mb-1 relative z-10" />
                            ) : (
                                <span className="text-3xl mb-1 relative z-10">▶</span>
                            )}
                            <span className="relative z-10 text-sm">{isSpinning ? '...' : 'SPIN'}</span>
                        </button>
                    </div>

                    {/* Pay table */}
                    <div className="flex flex-col gap-2">
                        <span className="casino-label" style={{ fontSize: '9px' }}>Pay Table</span>
                        {SYMBOLS.slice(0, 4).map(sym => (
                            <div key={sym.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-base" style={{ filter: `drop-shadow(0 0 4px ${sym.glow})` }}>
                                        {sym.id === 'seven' ? <span style={{ color: sym.color, fontWeight: 900 }}>7</span>
                                            : sym.id === 'bar' ? <span style={{ color: sym.color, fontSize: '10px', fontWeight: 700 }}>BAR</span>
                                                : sym.display}
                                    </span>
                                    <span className="text-[10px] font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{sym.label}</span>
                                </div>
                                <span className="text-[11px] font-bold" style={{ color: sym.color }}>{sym.value}× bet/10</span>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SlotsGame;
