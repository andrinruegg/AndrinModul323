import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Play, Plus, Square, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useTheme } from '../../context/ThemeContext';
import { useBalance } from '../../context/BalanceContext';
import { Card, CardView } from '../atoms/Card';
import { createDeck, calculateHandValue } from '../../lib/blackjackUtils';

type GameStatus = 'betting' | 'playing' | 'dealer-turn' | 'result';

const BlackjackGame: React.FC = () => {
    const navigate = useNavigate();
    const { balance, withdraw, deposit } = useBalance();
    const [deck, setDeck] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [status, setStatus] = useState<GameStatus>('betting');
    const [currentBet, setCurrentBet] = useState(0);
    const [tempBet, setTempBet] = useState(100);
    const [message, setMessage] = useState('Place your bet');
    const { theme } = useTheme();

    // Start Game / Deal
    const deal = () => {
        if (balance < tempBet) {
            setMessage("Insufficient balance!");
            return;
        }

        const newDeck = createDeck();
        const p1 = newDeck.pop()!;
        const d1 = newDeck.pop()!;
        const p2 = newDeck.pop()!;
        const d2 = { ...newDeck.pop()!, isHidden: true };

        setDeck(newDeck);
        setPlayerHand([p1, p2]);
        setDealerHand([d1, d2]);
        setCurrentBet(tempBet);
        withdraw(tempBet);
        setStatus('playing');
        setMessage('');

        // Check for natural Blackjack
        const pValue = calculateHandValue([p1, p2]);
        if (pValue === 21) {
            revealDealer(true);
        }
    };

    const hit = () => {
        const newDeck = [...deck];
        const card = newDeck.pop()!;
        const newHand = [...playerHand, card];
        setDeck(newDeck);
        setPlayerHand(newHand);

        const val = calculateHandValue(newHand);
        if (val > 21) {
            setStatus('result');
            setMessage('Bust! Dealer Wins');
        }
    };

    const revealDealer = (playerHasBlackjack = false) => {
        setStatus('dealer-turn');
        const revealedDealerHand: Card[] = dealerHand.map(c => ({ ...c, isHidden: false }));
        setDealerHand(revealedDealerHand);

        let currentDealerHand = revealedDealerHand;
        let currentDeck = [...deck];

        const playDealer = () => {
            const dealerVal = calculateHandValue(currentDealerHand);
            if (dealerVal < 17) {
                const nextCard = currentDeck.pop()!;
                currentDealerHand = [...currentDealerHand, nextCard];
                setDealerHand(currentDealerHand);
                setDeck(currentDeck);
                setTimeout(playDealer, 800);
            } else {
                finalizeResult(currentDealerHand, playerHasBlackjack);
            }
        };

        setTimeout(playDealer, 800);
    };

    const finalizeResult = (finalDealerHand: Card[], playerHasBlackjack: boolean) => {
        const pVal = calculateHandValue(playerHand);
        const dVal = calculateHandValue(finalDealerHand);
        setStatus('result');

        if (playerHasBlackjack) {
            if (dVal === 21) {
                deposit(currentBet);
                setMessage('Push (Both Blackjack)');
            } else {
                deposit(currentBet * 2.5);
                setMessage('BLACKJACK! You Win');
                confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#ffd700', '#ffffff'] });
            }
            return;
        }

        if (dVal > 21) {
            deposit(currentBet * 2);
            setMessage('Dealer Bust! You Win');
            confetti({ particleCount: 100, spread: 60 });
        } else if (pVal > dVal) {
            deposit(currentBet * 2);
            setMessage('You Win!');
            confetti({ particleCount: 100, spread: 60 });
        } else if (pVal < dVal) {
            setMessage('Dealer Wins');
        } else {
            deposit(currentBet);
            setMessage('Push');
        }
    };

    const reset = () => {
        setPlayerHand([]);
        setDealerHand([]);
        setStatus('betting');
        setMessage('Place your bet');
    };

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans overflow-hidden p-4 md:p-8 relative ${theme === 'dark' ? 'bg-emerald-950 text-white' : 'bg-emerald-900/10 text-emerald-950'}`}>
            {/* Background Texture */}
            <div className={`absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/felt.png')] ${theme === 'light' ? 'invert' : ''}`} />

            <header className="max-w-7xl mx-auto flex items-center justify-between relative z-10 mb-8">
                <button
                    onClick={() => navigate('/')}
                    className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/10"
                >
                    <ArrowLeft className="group-hover:-translate-x-1 transition-transform" />
                </button>

                <div className="flex flex-col items-center">
                    <h1 className={`text-3xl font-black uppercase italic tracking-tighter bg-gradient-to-r ${theme === 'dark' ? 'from-gold-300 via-gold-500 to-gold-700' : 'from-gold-600 via-gold-800 to-gold-900'} bg-clip-text text-transparent`}>
                        Royal Blackjack
                    </h1>
                    <p className={`text-[10px] font-bold uppercase tracking-[0.4em] opacity-50 ${theme === 'dark' ? 'text-gold-500' : 'text-gold-600'}`}>Elite VIP Lounge</p>
                </div>

                <div className={`border px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-white/20' : 'bg-white border-zinc-200'}`}>
                    <div className="w-8 h-8 rounded-full bg-gold-500 flex items-center justify-center text-zinc-950">
                        <Coins size={16} />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] text-zinc-500 font-black uppercase leading-none">Balance</span>
                        <span className={`text-xl font-black ${theme === 'dark' ? 'text-gold-500' : 'text-zinc-900'}`}>{balance.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            <main className="max-w-5xl mx-auto relative z-10 flex flex-col items-center justify-center h-[calc(100vh-200px)]">
                <div className="flex flex-col items-center gap-6 mb-16 relative">
                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'bg-zinc-900/80 border-white/10 text-zinc-400' : 'bg-white/80 border-zinc-200 text-zinc-500'}`}>Dealer</div>

                    {/* Table Glow */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gold-500/5 blur-[100px] pointer-events-none" />

                    <div className="flex gap-4 min-h-[180px] md:min-h-[200px] relative z-10">
                        {dealerHand.map((card, idx) => (
                            <CardView key={idx} card={card} index={idx} />
                        ))}

                        {/* Dealer Counter HUD */}
                        {status !== 'betting' && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="absolute -bottom-4 left-1/2 -translate-x-1/2 z-30 px-6 py-2 bg-zinc-950 border-2 border-gold-500/50 rounded-2xl shadow-[0_0_30px_rgba(255,171,10,0.3)] flex flex-col items-center min-w-[60px]"
                            >
                                <span className="text-[8px] font-black uppercase tracking-widest text-gold-500/60 leading-tight">Dealer</span>
                                <span className="text-xl font-black text-white leading-none">{calculateHandValue(dealerHand)}</span>
                            </motion.div>
                        )}
                    </div>

                </div>

                {/* Info Area */}
                <div className="h-16 flex items-center justify-center mb-8">
                    <AnimatePresence mode="wait">
                        <motion.h2
                            key={message}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="text-3xl font-black uppercase italic text-center"
                        >
                            {message}
                        </motion.h2>
                    </AnimatePresence>
                </div>

                {/* Player Area */}
                <div className="flex flex-col items-center gap-6 relative">
                    <div className="flex gap-4 min-h-[180px] md:min-h-[200px] relative">
                        {playerHand.map((card, idx) => (
                            <CardView key={idx} card={card} index={idx} />
                        ))}

                        {/* Player Counter HUD - FIXED: Now highly visible */}
                        {playerHand.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute -top-6 left-1/2 -translate-x-1/2 z-30 px-8 py-3 bg-gold-500 rounded-3xl shadow-[0_10px_40px_rgba(255,171,10,0.5)] border-4 border-white/30 flex flex-col items-center min-w-[80px]"
                            >
                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-950 leading-tight">Your Hand</span>
                                <span className="text-3xl font-black text-zinc-950 leading-none">{calculateHandValue(playerHand)}</span>
                            </motion.div>
                        )}
                    </div>
                    <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-[0.3em] transition-colors ${theme === 'dark' ? 'bg-zinc-900/80 border-white/10 text-zinc-400' : 'bg-white/80 border-zinc-200 text-zinc-500'}`}>You</div>
                </div>
            </main>

            {/* Controls */}
            <div className="fixed bottom-12 left-0 right-0 z-50 flex justify-center px-4">
                <div className={`backdrop-blur-2xl border p-6 rounded-[2.5rem] shadow-2xl flex flex-wrap items-center justify-center gap-8 min-w-[320px] transition-colors duration-500 ${theme === 'dark' ? 'bg-zinc-950/80 border-white/10' : 'bg-white/80 border-zinc-200'}`}>
                    {status === 'betting' ? (
                        <div className="flex items-center gap-8">
                            <div className="flex flex-col items-center gap-2">
                                <span className={`text-[10px] font-bold uppercase tracking-widest ${theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'}`}>Wager</span>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setTempBet(Math.max(10, tempBet - 50))}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900'}`}
                                    >
                                        -
                                    </button>
                                    <span className={`text-2xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-900'}`}>${tempBet}</span>
                                    <button
                                        onClick={() => setTempBet(tempBet + 50)}
                                        className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors ${theme === 'dark' ? 'bg-white/5 hover:bg-white/10 border-white/10 text-white' : 'bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-900'}`}
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                            <button
                                onClick={deal}
                                className="px-10 py-5 bg-gold-500 hover:bg-gold-600 text-zinc-950 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all shadow-[0_10px_30px_rgba(255,171,10,0.3)]"
                            >
                                <Play size={20} className="fill-zinc-950" />
                                Deal Cards
                            </button>
                        </div>
                    ) : status === 'playing' ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={hit}
                                className="group px-8 py-5 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 border border-white/10 transition-all"
                            >
                                <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                                Hit
                            </button>
                            <button
                                onClick={() => revealDealer()}
                                className="group px-8 py-5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 border border-white/10 transition-all"
                            >
                                <Square size={20} />
                                Stand
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={reset}
                            className="px-10 py-5 bg-gold-500 hover:bg-gold-600 text-zinc-950 rounded-2xl font-black uppercase tracking-widest flex items-center gap-3 transition-all"
                        >
                            <RotateCcw size={20} />
                            Play Again
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BlackjackGame;
