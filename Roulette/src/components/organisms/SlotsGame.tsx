import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Play, Coins, Award, Gem, Heart, Spade, Club, Trophy } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useBalance } from '../../context/BalanceContext';
import confetti from 'canvas-confetti';

// --- Types ---
interface Symbol {
    id: string;
    icon: React.ReactNode;
    color: string;
    value: number;
    label: string;
}

const SYMBOLS: Symbol[] = [
    { id: 'gem', icon: <Gem size={48} />, color: 'text-cyan-400', value: 100, label: 'Diamond' },
    { id: 'crown', icon: <Award size={48} />, color: 'text-amber-400', value: 50, label: 'Crown' },
    { id: 'heart', icon: <Heart size={48} />, color: 'text-rose-500', value: 25, label: 'Hearts' },
    { id: 'spade', icon: <Spade size={48} />, color: 'text-zinc-400', value: 15, label: 'Spades' },
    { id: 'clubs', icon: <Club size={48} />, color: 'text-emerald-400', value: 10, label: 'Clubs' },
    { id: 'seven', icon: <div className="text-5xl font-black italic">7</div>, color: 'text-rose-600', value: 200, label: 'Jackpot' },
];

const REEL_COUNT = 3;
const SPIN_DURATION_BASE = 2000;
const REEL_DELAY = 500;

const SlotsGame: React.FC = () => {
    const navigate = useNavigate();
    const { balance, withdraw, deposit } = useBalance();
    const [reels, setReels] = useState<Symbol[][]>(
        Array(REEL_COUNT).fill(null).map(() => [SYMBOLS[0], SYMBOLS[1], SYMBOLS[2]])
    );
    const [spinningReels, setSpinningReels] = useState<boolean[]>([false, false, false]);
    const [isSpinning, setIsSpinning] = useState(false);
    const [bet, setBet] = useState(100);
    const [message, setMessage] = useState('Spin to win!');
    const [winAmount, setWinAmount] = useState(0);
    const [winningLine, setWinningLine] = useState<number | null>(null); // null, 0 (top), 1 (mid), 2 (bot)
    const { theme } = useTheme();

    const spin = async () => {
        if (balance < bet) {
            setMessage('Insufficient balance!');
            return;
        }

        setIsSpinning(true);
        setSpinningReels([true, true, true]);
        withdraw(bet);
        setMessage('Spinning Reels...');
        setWinAmount(0);
        setWinningLine(null);

        // Generate final results
        const newResults: Symbol[][] = [];
        for (let i = 0; i < REEL_COUNT; i++) {
            const reelResult: Symbol[] = [];
            for (let j = 0; j < 3; j++) {
                reelResult.push(SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]);
            }
            newResults.push(reelResult);
        }

        // Staggered stop logic
        for (let i = 0; i < REEL_COUNT; i++) {
            await new Promise(resolve => setTimeout(resolve, SPIN_DURATION_BASE + (i * REEL_DELAY)));
            setSpinningReels(prev => {
                const next = [...prev];
                next[i] = false;
                return next;
            });
            // Update only the reel that stopped
            setReels(prev => {
                const next = [...prev];
                next[i] = newResults[i];
                return next;
            });
        }

        setIsSpinning(false);
        checkWin(newResults);
    };

    const checkWin = (results: Symbol[][]) => {
        // Check rows: 0 (top), 1 (mid), 2 (bot)
        let totalWin = 0;
        let linesWon: number[] = [];

        for (let row = 0; row < 3; row++) {
            const line = [results[0][row], results[1][row], results[2][row]];
            const allEqual = line.every(s => s.id === line[0].id);

            if (allEqual) {
                const payout = line[0].value * (bet / 10);
                totalWin += payout;
                linesWon.push(row);
            }
        }

        if (totalWin > 0) {
            deposit(totalWin);
            setWinAmount(totalWin);
            setWinningLine(linesWon[0]); // For now just highlight one, or we could support multiple
            setMessage(`ROYAL WIN! $${totalWin}`);
            confetti({
                particleCount: 200,
                spread: 100,
                origin: { y: 0.6 },
                colors: ['#8b5cf6', '#3b82f6', '#06b6d4', '#f59e0b']
            });
        } else {
            // Check for any 2 matches in middle row for small consolation
            const midRow = [results[0][1], results[1][1], results[2][1]];
            const counts: Record<string, number> = {};
            midRow.forEach(s => counts[s.id] = (counts[s.id] || 0) + 1);
            const hasTwo = Object.values(counts).some(c => c === 2);

            if (hasTwo) {
                const payout = bet * 0.5;
                deposit(payout);
                setWinAmount(payout);
                setMessage(`Small Win! $${payout}`);
            } else {
                setMessage('Better Luck Next Time');
            }
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans overflow-hidden p-4 md:p-8 relative ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] blur-[80px] opacity-20 rounded-full ${theme === 'dark' ? 'bg-purple-900/20' : 'bg-purple-200/60'}`} />
                <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] blur-[60px] opacity-10 rounded-full ${theme === 'dark' ? 'bg-blue-900/20' : 'bg-blue-200/50'}`} />
            </div>

            <header className="max-w-7xl mx-auto flex items-center justify-between relative z-50 mb-8 md:mb-12 px-4 md:px-0">
                <button
                    onClick={() => navigate('/')}
                    className={`p-3 rounded-2xl transition-all group border ${theme === 'dark'
                        ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white'
                        : 'bg-zinc-200/50 hover:bg-zinc-200 border-zinc-200 text-zinc-900 shadow-sm'}`}
                >
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col items-center">
                    <h1 className={`text-4xl font-black uppercase italic tracking-tighter bg-clip-text text-transparent bg-gradient-to-r ${theme === 'dark'
                        ? 'from-purple-400 via-white to-blue-400'
                        : 'from-purple-600 via-zinc-800 to-blue-600'}`}>
                        Royal Slots
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.4em] opacity-50 ${theme === 'dark' ? 'text-purple-400' : 'text-purple-600'}`}>Noble Fortunes Await</p>
                </div>

                <div className="flex items-center gap-4">
                    <div className={`border px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl ${theme === 'dark'
                        ? 'bg-zinc-900 border-white/20'
                        : 'bg-white border-zinc-200'}`}>
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <Coins size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-black uppercase leading-none">Credits</span>
                            <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>${balance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto relative z-10 flex flex-col items-center justify-center pt-8">
                {/* Slot Machine Cabinet */}
                <div className={`relative p-2 md:p-4 rounded-[3rem] border-x-[12px] transition-all duration-500 ${theme === 'dark'
                    ? 'bg-gradient-to-b from-zinc-800 via-zinc-900 to-black border-zinc-800 shadow-[0_0_100px_rgba(139,92,246,0.2)]'
                    : 'bg-gradient-to-b from-zinc-200 via-zinc-300 to-zinc-400 border-zinc-300 shadow-[0_0_100px_rgba(139,92,246,0.1)]'}`}>

                    {/* Machine Header / Logo Area */}
                    <div className={`absolute -top-12 left-1/2 -translate-x-1/2 border-2 px-8 py-2 rounded-full z-30 shadow-xl ${theme === 'dark'
                        ? 'bg-zinc-900 border-purple-500/50 shadow-purple-500/20'
                        : 'bg-white border-purple-400 shadow-purple-200'}`}>
                        <span className={`text-xl font-black italic tracking-widest flex items-center gap-2 ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>
                            <Trophy size={20} className="text-purple-500" />
                            ROYAL
                            <Trophy size={20} className="text-purple-500" />
                        </span>
                    </div>

                    {/* The Reel Area Container */}
                    <div className={`relative p-6 md:p-10 rounded-[2.5rem] border-4 inner-shadow-lg overflow-hidden transition-colors duration-500 ${theme === 'dark'
                        ? 'bg-zinc-950 border-zinc-800'
                        : 'bg-zinc-100 border-zinc-200'}`}>
                        {/* Glass Gloss effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none z-20" />

                        {/* Static Horizontal Paylines (Subtle) */}
                        <div className={`absolute left-0 right-0 top-1/4 h-[1px] z-10 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />
                        <div className={`absolute left-0 right-0 top-1/2 h-[1px] z-10 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'}`} />
                        <div className={`absolute left-0 right-0 top-3/4 h-[1px] z-10 ${theme === 'dark' ? 'bg-white/5' : 'bg-black/5'}`} />

                        {/* Winning Line Highlight */}
                        <AnimatePresence>
                            {winningLine !== null && (
                                <motion.div
                                    initial={{ opacity: 0, scaleX: 0 }}
                                    animate={{ opacity: 1, scaleX: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-purple-500 to-transparent z-30 shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                                    style={{ top: `${(winningLine * 33.33) + 16.66}%` }}
                                />
                            )}
                        </AnimatePresence>

                        <div className="flex gap-3 md:gap-6 relative z-10">
                            {reels.map((reel, i) => (
                                <div key={i} className={`relative w-28 md:w-40 h-[360px] md:h-[450px] rounded-2xl border overflow-hidden transition-colors ${theme === 'dark'
                                    ? 'bg-black/40 border-white/5'
                                    : 'bg-white border-zinc-200 shadow-inner'}`}>
                                    {/* Vertical shadow gradients for depth */}
                                    <div className={`absolute inset-0 pointer-events-none z-20 opacity-40 bg-gradient-to-b ${theme === 'dark' ? 'from-black via-transparent to-black' : 'from-zinc-300 via-transparent to-zinc-300'}`} />

                                    <motion.div
                                        animate={spinningReels[i] ? {
                                            y: [-1000, 0],
                                            opacity: [0.8, 1, 0.8]
                                        } : { y: 0, opacity: 1, filter: "blur(0px)" }}
                                        style={{ willChange: 'transform' }}
                                        transition={spinningReels[i] ? {
                                            repeat: Infinity,
                                            duration: 0.15,
                                            ease: "linear"
                                        } : {
                                            type: 'spring',
                                            stiffness: 200,
                                            damping: 20,
                                            mass: 0.8
                                        }}
                                        className="flex flex-col items-center py-4"
                                    >
                                        {/* During spin, we repeat symbols. When stopped, we show the 3 results. */}
                                        {(spinningReels[i] ? [...SYMBOLS, ...SYMBOLS, ...SYMBOLS] : reel).map((symbol, idx) => (
                                            <div key={idx} className="h-[120px] md:h-[150px] flex flex-col items-center justify-center shrink-0">
                                                <div className={`${symbol.color} flex flex-col items-center ${theme === 'dark' ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.15)]' : 'drop-shadow-[0_5px_10px_rgba(0,0,0,0.1)]'}`}>
                                                    {symbol.icon}
                                                    {!spinningReels[i] && (
                                                        <span className={`text-[10px] font-black uppercase tracking-[0.2em] mt-3 ${theme === 'dark' ? 'text-white/20' : 'text-zinc-500'}`}>
                                                            {symbol.label}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className={`w-12 h-12 rounded-full shadow-inner ${theme === 'dark' ? 'bg-zinc-800 border-t-2 border-white/10' : 'bg-zinc-300 border-t-2 border-white/40'}`} />
                    <div className={`w-12 h-12 rounded-full shadow-inner ${theme === 'dark' ? 'bg-zinc-800 border-t-2 border-white/10' : 'bg-zinc-300 border-t-2 border-white/40'}`} />
                </div>

                {/* Status Message Display */}
                <div className="mt-8 h-20 flex flex-col items-center justify-center">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={message}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="flex flex-col items-center"
                        >
                            <h2 className={`text-4xl md:text-5xl font-black uppercase italic tracking-tighter ${winAmount > 0
                                ? 'text-amber-500 drop-shadow-[0_0_20px_rgba(251,191,36,0.5)]'
                                : theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'}`}>
                                {message}
                            </h2>
                            {winAmount > 0 && (
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1.2 }}
                                    className="text-white font-black text-xl mt-2 px-4 py-1 bg-purple-600 rounded-lg shadow-lg"
                                >
                                    + ${winAmount.toLocaleString()}
                                </motion.div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                {/* Controls Area */}
                <div className={`mt-8 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 items-center gap-8 backdrop-blur-2xl p-8 rounded-[3rem] border shadow-2xl relative overflow-hidden transition-all duration-500 ${theme === 'dark'
                    ? 'bg-zinc-900/60 border-white/10'
                    : 'bg-white/80 border-zinc-200'}`}>
                    <div className={`absolute inset-0 pointer-events-none opacity-20 ${theme === 'dark' ? 'bg-gradient-to-br from-purple-500/10 to-transparent' : 'bg-gradient-to-br from-purple-200 to-transparent'}`} />

                    {/* Bet Selection */}
                    <div className="flex flex-col gap-4">
                        <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Select Offering</span>
                        <div className="grid grid-cols-2 gap-3">
                            {[100, 200, 500, 1000].map(val => (
                                <button
                                    key={val}
                                    onClick={() => setBet(val)}
                                    disabled={isSpinning}
                                    className={`px-4 py-3 rounded-2xl text-sm font-black transition-all border ${bet === val
                                        ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]'
                                        : theme === 'dark'
                                            ? 'bg-zinc-800/50 border-white/5 text-zinc-500 hover:text-white/80 hover:bg-zinc-800'
                                            : 'bg-zinc-100 border-zinc-200 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200'
                                        }`}
                                >
                                    ${val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Spin Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={spin}
                            disabled={isSpinning}
                            className={`group relative w-48 h-48 rounded-full transition-all ${isSpinning
                                ? 'scale-90 opacity-50'
                                : 'hover:scale-105 active:scale-95'
                                }`}
                        >
                            {/* Outer Glow */}
                            <div className={`absolute inset-0 rounded-full blur-2xl transition-opacity ${isSpinning
                                ? 'bg-zinc-600'
                                : theme === 'dark' ? 'bg-purple-600/50 opacity-100' : 'bg-purple-400/30 opacity-100'}`} />

                            {/* The Button Itself */}
                            <div className={`absolute inset-2 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-500 ${isSpinning
                                ? 'bg-zinc-900 border-zinc-700 text-zinc-600'
                                : 'bg-gradient-to-b from-purple-500 to-indigo-700 border-purple-400 text-white shadow-xl shadow-purple-900/40'}`}>

                                {isSpinning ? (
                                    <RotateCcw className="animate-spin mb-2" size={32} />
                                ) : (
                                    <Play className="fill-white mb-2" size={32} />
                                )}
                                <span className="font-black text-lg uppercase tracking-wider">{isSpinning ? '...' : 'SPIN'}</span>
                            </div>

                            {/* Tactile Highlight */}
                            <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-white/20 to-transparent pointer-events-none" />
                        </button>
                    </div>

                    {/* Stats / Info */}
                    <div className="flex flex-col items-end gap-3 text-right">
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em]">Jackpot Value</span>
                            <span className="text-2xl font-black text-rose-500 animate-pulse">$25,000</span>
                        </div>
                        <div className={`border p-4 rounded-2xl w-full transition-colors ${theme === 'dark' ? 'bg-zinc-800/50 border-white/5' : 'bg-zinc-100 border-zinc-200'}`}>
                            <span className="block text-[10px] text-zinc-500 font-bold uppercase tracking-[0.2em] mb-1">Win Multiplier</span>
                            <span className="text-lg font-black text-cyan-500">UP TO 500X</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SlotsGame;
