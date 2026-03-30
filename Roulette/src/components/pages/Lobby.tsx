import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useBalance } from '../../context/BalanceContext';
import { Coins, ChevronRight } from 'lucide-react';

const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const { balance } = useBalance();

    const games = [
        {
            id: 'roulette',
            title: 'Royal Roulette',
            subtitle: 'European · 0% Extra Edge',
            description: 'The iconic spinning wheel. Place your bets on numbers, colors, or groups — and let fortune decide.',
            path: '/roulette',
            image: '/images/roulette.png',
            tags: ['Live', 'Hot'],
            minBet: 10,
            accentColor: 'from-[#b8450a] to-[#ff6b35]',
            glowColor: 'rgba(255,107,53,0.25)',
            borderColor: 'rgba(255,107,53,0.2)',
        },
        {
            id: 'blackjack',
            title: 'Royal Blackjack',
            subtitle: 'Classic 21 · Vegas Rules',
            description: 'Beat the dealer to 21 without going bust. Pure strategy, real tension.',
            path: '/blackjack',
            image: '/images/blackjack.png',
            tags: ['Classic', 'Strategy'],
            minBet: 50,
            accentColor: 'from-[#0a5c2e] to-[#1db954]',
            glowColor: 'rgba(29,185,84,0.2)',
            borderColor: 'rgba(29,185,84,0.18)',
        },
        {
            id: 'slots',
            title: 'Royal Slots',
            subtitle: 'Triple Reel · Up to 500×',
            description: 'Spin the reels and chase bonus lines. Jackpots, wilds, and fortune await.',
            path: '/slots',
            image: '/images/slots.png',
            tags: ['Jackpot', 'Fast'],
            minBet: 50,
            accentColor: 'from-[#4a0080] to-[#9b59b6]',
            glowColor: 'rgba(155,89,182,0.2)',
            borderColor: 'rgba(155,89,182,0.18)',
        }
    ];

    return (
        <div className="min-h-screen text-white overflow-x-hidden relative">
            {/* Background pattern */}
            <div
                className="fixed inset-0 pointer-events-none z-0"
                style={{
                    backgroundImage: `
                        radial-gradient(ellipse 90% 60% at 50% -5%, rgba(255,171,10,0.07) 0%, transparent 55%),
                        radial-gradient(ellipse 50% 40% at 0% 100%, rgba(29,185,84,0.04) 0%, transparent 50%),
                        radial-gradient(ellipse 50% 40% at 100% 100%, rgba(155,89,182,0.04) 0%, transparent 50%)
                    `,
                }}
            />
            {/* Subtle grid lines */}
            <div
                className="fixed inset-0 pointer-events-none z-0 opacity-[0.025]"
                style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
                    backgroundSize: '64px 64px',
                }}
            />

            {/* ===== HEADER / NAV ===== */}
            <header className="relative z-20 w-full border-b border-white/[0.06]" style={{ background: 'rgba(8,9,14,0.85)', backdropFilter: 'blur(20px)' }}>
                <div className="max-w-7xl mx-auto px-6 md:px-10 h-16 md:h-20 flex items-center justify-between">
                    {/* Logo */}
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center text-lg font-display font-bold"
                            style={{ background: 'linear-gradient(135deg, #ffcc3d, #e68a00)', color: '#1a0f00' }}
                        >
                            ♠
                        </div>
                        <div>
                            <span className="font-display font-bold text-xl text-white tracking-tight">Royal Casino</span>
                            <div className="text-[9px] font-semibold uppercase tracking-[0.3em] text-gold-500/50 leading-none mt-0.5">Est. 2026</div>
                        </div>
                    </div>

                    {/* Nav items */}
                    <nav className="hidden md:flex items-center gap-8 text-[11px] font-semibold uppercase tracking-widest text-white/40">
                        <span className="text-white/80 border-b border-gold-500/60 pb-0.5">Lobby</span>
                    </nav>

                    {/* Balance */}
                    <div className="balance-chip">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: 'rgba(255,171,10,0.15)' }}>
                            <Coins size={14} className="text-gold-500" />
                        </div>
                        <div>
                            <div className="casino-label" style={{ fontSize: '8px' }}>Credits</div>
                            <div className="text-white font-bold text-base leading-none">${balance.toLocaleString()}</div>
                        </div>
                    </div>
                </div>
            </header>

            {/* ===== HERO ===== */}
            <section className="relative z-10 pt-16 pb-10 text-center px-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                    <div className="casino-badge inline-block mb-6">🔴 Live Games Available Now</div>
                    <h1 className="font-display font-bold text-5xl md:text-7xl text-white leading-[1.05] mb-4">
                        Where Fortune<br />
                        <span style={{ backgroundImage: 'linear-gradient(135deg, #ffcc3d, #ffab0a, #e68a00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Meets Excellence
                        </span>
                    </h1>
                    <p className="text-white/40 text-lg max-w-xl mx-auto font-light leading-relaxed">
                        Premium casino games crafted for the discerning player. Choose your game.
                    </p>
                </motion.div>
            </section>

            {/* ===== GAME CARDS ===== */}
            <section className="relative z-10 max-w-7xl mx-auto px-6 md:px-10 pb-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 32 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                            whileHover={{ y: -6 }}
                            onClick={() => navigate(game.path)}
                            className="group relative cursor-pointer rounded-2xl overflow-hidden"
                            style={{
                                background: 'linear-gradient(160deg, #0f1320 0%, #08090e 100%)',
                                border: `1px solid ${game.borderColor}`,
                                boxShadow: `0 4px 32px rgba(0,0,0,0.5), 0 0 0 0 ${game.glowColor}`,
                                transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 60px rgba(0,0,0,0.6), 0 0 60px ${game.glowColor}`;
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLElement).style.boxShadow = `0 4px 32px rgba(0,0,0,0.5)`;
                            }}
                        >
                            {/* Image */}
                            <div className="relative h-52 overflow-hidden">
                                <img
                                    src={game.image}
                                    alt={game.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    style={{ filter: 'brightness(0.8) saturate(1.1)' }}
                                />
                                {/* Bottom fade */}
                                <div className="absolute inset-0 bg-gradient-to-t from-[#08090e] via-[rgba(8,9,14,0.3)] to-transparent" />

                                {/* Tags */}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    {game.tags.map(tag => (
                                        <span key={tag} className="casino-badge">{tag}</span>
                                    ))}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-4">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <h3 className="font-display font-bold text-2xl text-white leading-tight">{game.title}</h3>
                                        <p className="text-[11px] font-semibold uppercase tracking-widest mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{game.subtitle}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <div className="casino-label" style={{ fontSize: '8px' }}>Min Bet</div>
                                        <div className="text-gold-500 font-bold text-lg leading-tight">${game.minBet}</div>
                                    </div>
                                </div>

                                <p className="text-white/40 text-sm leading-relaxed mb-6">{game.description}</p>

                                {/* CTA */}
                                <div
                                    className="casino-btn-primary flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm"
                                >
                                    <span>Play Now</span>
                                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>

                            {/* Subtle inner top highlight */}
                            <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.025) 0%, transparent 40%)' }} />
                        </motion.div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default Lobby;
