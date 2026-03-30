import React from 'react';
import { motion } from 'framer-motion';
import { Trophy } from 'lucide-react';

export type Suit = '♠' | '♣' | '♥' | '♦';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
    suit: Suit;
    rank: Rank;
    value: number;
    isHidden?: boolean;
}

interface CardViewProps {
    card: Card;
    index: number;
}

export const CardView: React.FC<CardViewProps> = ({ card, index }) => {
    const isRed = card.suit === '♥' || card.suit === '♦';

    return (
        <motion.div
            initial={{ y: -100, x: 100, opacity: 0, rotate: 20 }}
            animate={{ y: 0, x: 0, opacity: 1, rotate: 0 }}
            transition={{ delay: index * 0.15, type: 'spring', stiffness: 100 }}
            className={`relative w-24 h-36 md:w-32 md:h-48 rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col justify-between p-3 md:p-4 border backdrop-blur-sm transition-all duration-500 ${card.isHidden
                ? 'bg-zinc-800 border-gold-500/50'
                : 'bg-white/95 border-white/40'
                }`}
        >
            {/* Holographic Edge */}
            {!card.isHidden && <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-white/10 rounded-xl pointer-events-none" />}
            {card.isHidden ? (
                <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-lg">
                    <div className="w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold-600/20 via-zinc-900 to-zinc-950 flex items-center justify-center">
                        <Trophy className="text-gold-500 opacity-20" size={48} />
                    </div>
                </div>
            ) : (
                <>
                    <div className={`flex flex-col items-start ${isRed ? 'text-rose-600' : 'text-zinc-900'}`}>
                        <span className="text-xl md:text-2xl font-black leading-none">{card.rank}</span>
                        <span className="text-lg md:text-xl">{card.suit}</span>
                    </div>
                    <div className={`flex justify-center items-center ${isRed ? 'text-rose-600' : 'text-zinc-900'}`}>
                        <span className="text-4xl md:text-5xl opacity-20">{card.suit}</span>
                    </div>
                    <div className={`flex flex-col items-end rotate-180 ${isRed ? 'text-rose-600' : 'text-zinc-900'}`}>
                        <span className="text-xl md:text-2xl font-black leading-none">{card.rank}</span>
                        <span className="text-lg md:text-xl">{card.suit}</span>
                    </div>
                </>
            )}
        </motion.div>
    );
};
