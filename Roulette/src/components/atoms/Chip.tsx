import React from 'react';
import { motion } from 'framer-motion';

interface ChipProps {
    amount: number;
}

export const Chip: React.FC<ChipProps> = ({ amount }) => (
    <motion.div
        initial={{ scale: 0, y: 15, rotate: -20 }}
        animate={{ scale: 1, y: 0, rotate: 0 }}
        className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
    >
        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold-300 via-gold-500 to-gold-700 border-[3px] border-white/30 shadow-[0_10px_20px_rgba(0,0,0,0.4),0_0_15px_rgba(255,171,10,0.3)] flex items-center justify-center ring-2 ring-zinc-950/50">
            <div className="w-8 h-8 rounded-full border border-zinc-950/20 flex items-center justify-center font-black text-[10px] text-zinc-950 tracking-tighter">
                {amount >= 1000 ? `${(amount / 1000).toFixed(1)}k` : amount}
            </div>
            {/* Chip Serrations */}
            <div className="absolute inset-0 rounded-full border-4 border-dashed border-white/10" />
        </div>
    </motion.div>
);
