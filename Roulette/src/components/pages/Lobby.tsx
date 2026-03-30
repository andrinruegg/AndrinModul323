import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useBalance } from '../../context/BalanceContext';
import { Trophy, Play, Coins } from 'lucide-react';

const Lobby: React.FC = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const { balance } = useBalance();

    const games = [
        {
            id: 'roulette',
            title: 'Royal Roulette',
            description: 'Experience the elegance of high-stakes play with our premium European Roulette.',
            path: '/roulette',
            image: '/images/roulette.png',
            tags: ['Elite', 'Live'],
            color: 'from-gold-400 via-gold-500 to-gold-700'
        },
        {
            id: 'blackjack',
            title: 'Royal Blackjack',
            description: 'The ultimate card showdown. Strategy meets luxury in our exclusive VIP tables.',
            path: '/blackjack',
            disabled: false,
            image: '/images/blackjack.png',
            tags: ['Classic', 'Skills'],
            color: 'from-emerald-400 via-emerald-500 to-emerald-700'
        },
        {
            id: 'slots',
            title: 'Royal Slots',
            description: 'Classic fortune reels reimagined for the modern connoisseur.',
            path: '/slots',
            disabled: false,
            image: '/images/slots.png',
            tags: ['New', 'Elite'],
            color: 'from-rose-400 via-rose-500 to-rose-700'
        }
    ];

    return (
        <div className={`min-h-screen transition-colors duration-500 font-sans overflow-x-hidden p-4 md:p-8 selection:bg-gold-500/30 ${theme === 'dark' ? 'bg-zinc-950 text-white' : 'bg-zinc-50 text-zinc-900'}`}>
            {/* Background Ambience */}
            <div className="fixed inset-0 pointer-events-none opacity-50">
                <div className={`absolute top-[-10%] left-[-5%] w-[40%] h-[40%] blur-[80px] rounded-full ${theme === 'dark' ? 'bg-gold-900/10' : 'bg-gold-200/40'}`} />
                <div className={`absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] blur-[80px] rounded-full ${theme === 'dark' ? 'bg-emerald-900/5' : 'bg-emerald-200/20'}`} />
            </div>

            <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center justify-center min-h-[80vh]">
                {/* Header */}
                <header className="w-full flex items-center justify-between mb-16 md:mb-24 px-4 md:px-0">
                    <div className="flex items-center gap-6 group">
                        <motion.div
                            whileHover={{ rotate: 15, scale: 1.1 }}
                            className="w-16 h-16 bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 rounded-2xl flex items-center justify-center shadow-[0_15px_40px_rgba(255,171,10,0.4)] border border-white/20 relative overflow-hidden"
                        >
                            <Trophy className="text-zinc-950 relative z-10" size={36} />
                            <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </motion.div>
                        <div>
                            <h1 className={`text-4xl md:text-6xl font-black tracking-tighter uppercase italic leading-none bg-clip-text text-transparent bg-gradient-to-r ${theme === 'dark' ? 'from-white via-gold-400 to-white' : 'from-zinc-900 via-gold-600 to-zinc-900'}`}>Royal Casino</h1>
                            <p className="text-[10px] text-gold-500 font-bold tracking-[0.4em] uppercase mt-2 opacity-50 text-center">Excellence in Gaming • 2026</p>
                        </div>
                    </div>

                    {/* Global Balance Display */}
                    <div className={`border px-6 py-3 rounded-2xl flex items-center gap-4 shadow-2xl ${theme === 'dark' ? 'bg-zinc-900 border-white/20' : 'bg-white border-zinc-200'}`}>
                        <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white">
                            <Coins size={16} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] text-zinc-500 font-black uppercase leading-none">Credits</span>
                            <span className={`text-xl font-black ${theme === 'dark' ? 'text-white' : 'text-zinc-950'}`}>${balance.toLocaleString()}</span>
                        </div>
                    </div>
                </header>

                {/* Game Grid - Centered and focused */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
                    {games.map((game, index) => (
                        <motion.div
                            key={game.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * index }}
                            whileHover={game.disabled ? {} : { y: -10 }}
                            className={`group relative overflow-hidden rounded-[2.5rem] border h-[450px] flex flex-col transition-all duration-500 ${theme === 'dark'
                                ? 'bg-white/5 border-white/10'
                                : 'bg-white border-zinc-200 shadow-xl'
                                } ${game.disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'cursor-pointer'}`}
                            onClick={() => !game.disabled && navigate(game.path)}
                        >
                            {/* Card Image */}
                            <div className="relative h-60 overflow-hidden">
                                <img
                                    src={game.image}
                                    alt={game.title}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent`} />

                                <div className="absolute top-6 left-6 flex gap-2">
                                    {game.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 bg-zinc-950/80 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-gold-500 border border-gold-500/20">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Card Content */}
                            <div className="relative z-10 p-8 flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className={`text-2xl font-black uppercase italic bg-gradient-to-r ${game.color} bg-clip-text text-transparent group-hover:tracking-wider transition-all duration-500`}>
                                        {game.title}
                                    </h3>
                                    <p className="mt-4 text-sm text-zinc-400 font-medium leading-relaxed line-clamp-2">
                                        {game.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-end mt-6">
                                    <div className={`p-4 rounded-2xl bg-white/5 group-hover:bg-gold-500 transition-all duration-300 ${game.disabled ? 'hidden' : ''}`}>
                                        <Play size={20} className="fill-white group-hover:fill-zinc-950 group-hover:text-zinc-950 text-white" />
                                    </div>
                                </div>
                            </div>

                            {/* Hover Border Glow */}
                            <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold-500/50 rounded-[2.5rem] transition-colors pointer-events-none" />
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Lobby;
