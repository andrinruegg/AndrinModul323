import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, RotateCcw, Play, Plus, Square, Coins } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useBalance } from '../../context/BalanceContext';
import { Card, CardView } from '../atoms/Card';
import { createDeck, calculateHandValue } from '../../lib/blackjackUtils';

type GameStatus = 'betting' | 'playing' | 'dealer-turn' | 'result';

const CHIP_OPTIONS = [
    { value: 50,  color: '#10b981', rim: '#059669', label: '50' },
    { value: 100, color: '#f59e0b', rim: '#d97706', label: '100' },
    { value: 250, color: '#f43f5e', rim: '#be123c', label: '250' },
    { value: 500, color: '#8b5cf6', rim: '#6d28d9', label: '500' },
];

const BlackjackGame: React.FC = () => {
    const navigate = useNavigate();
    const { balance, withdraw, deposit } = useBalance();
    const [deck, setDeck] = useState<Card[]>([]);
    const [playerHand, setPlayerHand] = useState<Card[]>([]);
    const [dealerHand, setDealerHand] = useState<Card[]>([]);
    const [status, setStatus] = useState<GameStatus>('betting');
    const [currentBet, setCurrentBet] = useState(0);
    const [tempBet, setTempBet] = useState(100);
    const [message, setMessage] = useState('');
    const [isWin, setIsWin] = useState<boolean | null>(null);

    const deal = () => {
        if (balance < tempBet) { setMessage('Insufficient balance!'); setIsWin(false); return; }
        const newDeck = createDeck();
        const p1 = newDeck.pop()!;
        const d1 = newDeck.pop()!;
        const p2 = newDeck.pop()!;
        const d2 = { ...newDeck.pop()!, isHidden: true };
        setDeck(newDeck); setPlayerHand([p1, p2]); setDealerHand([d1, d2]);
        setCurrentBet(tempBet); withdraw(tempBet); setStatus('playing'); setMessage(''); setIsWin(null);
        if (calculateHandValue([p1, p2]) === 21) revealDealer(true);
    };

    const hit = () => {
        const newDeck = [...deck];
        const card = newDeck.pop()!;
        const newHand = [...playerHand, card];
        setDeck(newDeck); setPlayerHand(newHand);
        if (calculateHandValue(newHand) > 21) { setStatus('result'); setMessage('Bust! Dealer Wins'); setIsWin(false); }
    };

    const revealDealer = (playerHasBlackjack = false) => {
        setStatus('dealer-turn');
        const revealed = dealerHand.map(c => ({ ...c, isHidden: false }));
        setDealerHand(revealed);
        let curHand = revealed; let curDeck = [...deck];
        const playDealer = () => {
            if (calculateHandValue(curHand) < 17) {
                const next = curDeck.pop()!;
                curHand = [...curHand, next];
                setDealerHand(curHand); setDeck(curDeck);
                setTimeout(playDealer, 800);
            } else { finalizeResult(curHand, playerHasBlackjack); }
        };
        setTimeout(playDealer, 800);
    };

    const finalizeResult = (finalDealerHand: Card[], playerHasBlackjack: boolean) => {
        const pVal = calculateHandValue(playerHand);
        const dVal = calculateHandValue(finalDealerHand);
        setStatus('result');
        if (playerHasBlackjack) {
            if (dVal === 21) { deposit(currentBet); setMessage('Push · Both Blackjack'); setIsWin(null); }
            else { deposit(currentBet * 2.5); setMessage('Blackjack! ✦ 3:2 Payout'); setIsWin(true); confetti({ particleCount: 180, spread: 70, origin: { y: 0.6 }, colors: ['#ffd700', '#ffffff', '#ffab0a'] }); }
            return;
        }
        if (dVal > 21) { deposit(currentBet * 2); setMessage('Dealer Bust · You Win!'); setIsWin(true); confetti({ particleCount: 120, spread: 60 }); }
        else if (pVal > dVal) { deposit(currentBet * 2); setMessage('You Win!'); setIsWin(true); confetti({ particleCount: 100, spread: 60 }); }
        else if (pVal < dVal) { setMessage('Dealer Wins'); setIsWin(false); }
        else { deposit(currentBet); setMessage('Push · Bet Returned'); setIsWin(null); }
    };

    const reset = () => { setPlayerHand([]); setDealerHand([]); setStatus('betting'); setMessage(''); setIsWin(null); };

    return (
        <div
            className="min-h-screen text-white overflow-hidden relative"
            style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 30%, #0d2318 0%, #051209 50%, #08090e 100%)' }}
        >
            {/* Felt texture overlay */}
            <div
                className="fixed inset-0 pointer-events-none opacity-[0.04] z-0"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='4' height='4'%3E%3Crect width='4' height='4' fill='none'/%3E%3Ccircle cx='1' cy='1' r='0.8' fill='%23ffffff'/%3E%3C/svg%3E")` }}
            />
            <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.06) 0%, transparent 70%)' }} />

            {/* Top accent */}
            <div className="fixed top-0 left-0 w-full h-[2px] z-50" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,171,10,0.5), transparent)' }} />

            {/* ===== HEADER ===== */}
            <header
                className="sticky top-0 z-40 border-b border-white/[0.05]"
                style={{ background: 'rgba(5,18,9,0.85)', backdropFilter: 'blur(20px)' }}
            >
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/')}
                        className="p-2.5 rounded-xl transition-all group"
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.5)' }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)'; }}
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div className="flex flex-col items-center">
                        <h1 className="font-display font-bold text-2xl text-white leading-tight">Royal Blackjack</h1>
                        <p className="text-[9px] font-semibold uppercase tracking-[0.35em] text-gold-500/50 leading-none">Vegas Rules · Dealer Hits Soft 17</p>
                    </div>

                    <div className="balance-chip">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,171,10,0.12)' }}>
                            <Coins size={13} className="text-gold-500" />
                        </div>
                        <div>
                            <div className="casino-label" style={{ fontSize: '8px' }}>Balance</div>
                            <div className="text-white font-bold text-base leading-none">${balance.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== TABLE ===== */}
            <main className="max-w-4xl mx-auto flex flex-col items-center px-6 py-8 relative z-10">
                {/* Oval felt table */}
                <div
                    className="w-full relative px-6 md:px-16 py-10 mb-8"
                    style={{
                        background: 'radial-gradient(ellipse 95% 80%, #0d3320 10%, #06180e 60%, #051209 100%)',
                        borderRadius: '50% / 30%',
                        border: '2px solid rgba(255,171,10,0.15)',
                        boxShadow: '0 0 0 4px rgba(255,171,10,0.05), 0 40px 100px rgba(0,0,0,0.7), inset 0 0 80px rgba(0,0,0,0.5)',
                        minHeight: '460px',
                    }}
                >
                    {/* Table logo */}
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] font-display font-bold text-5xl text-white pointer-events-none whitespace-nowrap select-none"
                    >
                        ♠ Royal Casino ♠
                    </div>

                    {/* Dealer section */}
                    <div className="flex flex-col items-center gap-4 mb-8">
                        <div className="casino-label" style={{ fontSize: '9px' }}>Dealer</div>
                        <div className="relative flex gap-3 min-h-[160px] md:min-h-[180px] items-center justify-center">
                            {dealerHand.map((card, i) => <CardView key={i} card={card} index={i} />)}
                            {status !== 'betting' && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-lg flex items-center gap-2"
                                    style={{ background: 'rgba(8,9,14,0.95)', border: '1px solid rgba(255,171,10,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                >
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-gold-500/60">Dealer</span>
                                    <span className="text-lg font-bold text-white">{calculateHandValue(dealerHand)}</span>
                                </motion.div>
                            )}
                        </div>
                    </div>

                    {/* Message */}
                    <div className="flex items-center justify-center h-14">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={message}
                                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                                className="font-display font-bold text-2xl md:text-3xl text-center"
                                style={{
                                    color: isWin === true ? '#ffab0a' : isWin === false ? '#f43f5e' : 'rgba(255,255,255,0.7)',
                                    textShadow: isWin === true ? '0 0 40px rgba(255,171,10,0.6)' : 'none',
                                }}
                            >
                                {message}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Player section */}
                    <div className="flex flex-col items-center gap-4 mt-4">
                        <div className="relative flex gap-3 min-h-[160px] md:min-h-[180px] items-center justify-center">
                            {playerHand.map((card, i) => <CardView key={i} card={card} index={i} />)}
                            {playerHand.length > 0 && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="absolute -top-3 left-1/2 -translate-x-1/2 z-30 px-4 py-1.5 rounded-lg flex items-center gap-2"
                                    style={{ background: 'linear-gradient(135deg, #ffcc3d, #e68a00)', boxShadow: '0 4px 20px rgba(255,171,10,0.4)' }}
                                >
                                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-900/60">You</span>
                                    <span className="text-lg font-bold text-zinc-900">{calculateHandValue(playerHand)}</span>
                                </motion.div>
                            )}
                        </div>
                        <div className="casino-label" style={{ fontSize: '9px' }}>You</div>
                    </div>
                </div>

                {/* Controls */}
                <div
                    className="w-full rounded-2xl p-6 flex flex-wrap items-center justify-center gap-6"
                    style={{ background: 'rgba(8,9,14,0.9)', border: '1px solid rgba(255,171,10,0.12)', backdropFilter: 'blur(20px)', boxShadow: '0 8px 40px rgba(0,0,0,0.5)' }}
                >
                    {status === 'betting' ? (
                        <div className="flex flex-wrap items-center justify-center gap-8 w-full">
                            {/* Bet chips */}
                            <div className="flex flex-col gap-3 items-center">
                                <span className="casino-label" style={{ fontSize: '9px' }}>Select Wager</span>
                                <div className="flex gap-3">
                                    {CHIP_OPTIONS.map(chip => (
                                        <button
                                            key={chip.value}
                                            onClick={() => setTempBet(chip.value)}
                                            disabled={balance < chip.value}
                                            className="relative w-12 h-12 rounded-full flex items-center justify-center font-bold text-[11px] text-white transition-all duration-200 disabled:opacity-25"
                                            style={{
                                                background: `linear-gradient(145deg, ${chip.color}, ${chip.rim})`,
                                                border: `3px solid ${chip.rim}`,
                                                boxShadow: tempBet === chip.value
                                                    ? `0 0 0 3px rgba(255,255,255,0.3), 0 0 30px ${chip.color}80`
                                                    : '0 4px 12px rgba(0,0,0,0.4)',
                                                transform: tempBet === chip.value ? 'scale(1.15)' : 'scale(1)',
                                            }}
                                        >
                                            <div className="absolute inset-[3px] rounded-full border border-white/[0.12]" />
                                            {chip.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col items-center gap-1">
                                <span className="casino-label" style={{ fontSize: '8px' }}>Wager</span>
                                <span className="text-3xl font-bold text-white">${tempBet}</span>
                            </div>

                            <button
                                onClick={deal}
                                className="casino-btn-primary px-10 py-4 rounded-xl text-sm flex items-center gap-3"
                            >
                                <Play size={16} className="fill-current" />
                                Deal Cards
                            </button>
                        </div>
                    ) : status === 'playing' ? (
                        <div className="flex items-center gap-4">
                            <button
                                onClick={hit}
                                className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                                style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#10b981'; (e.currentTarget as HTMLElement).style.color = '#052e16'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(16,185,129,0.1)'; (e.currentTarget as HTMLElement).style.color = '#10b981'; }}
                            >
                                <Plus size={16} />
                                Hit
                            </button>
                            <button
                                onClick={() => revealDealer()}
                                className="px-8 py-4 rounded-xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 transition-all"
                                style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.12)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)'; }}
                            >
                                <Square size={16} />
                                Stand
                            </button>
                        </div>
                    ) : (
                        <button
                            onClick={reset}
                            className="casino-btn-primary px-12 py-4 rounded-xl text-sm flex items-center gap-3"
                        >
                            <RotateCcw size={16} />
                            Play Again
                        </button>
                    )}
                </div>
            </main>
        </div>
    );
};

export default BlackjackGame;
