import React from 'react';
import { BetType, RED_NUMBERS } from '../../types/roulette';
import { motion } from 'framer-motion';
import { Chip } from '../atoms/Chip';
import { cn } from '../../lib/utils';

interface BettingTableProps {
    onPlaceBet: (type: BetType, value: number | string) => void;
    activeBets: { type: BetType; value: number | string; amount: number }[];
}

export const BettingTable: React.FC<BettingTableProps> = ({ onPlaceBet, activeBets }) => {
    const getBetAmount = (type: BetType, value: number | string) => {
        return activeBets
            .filter((b) => b.type === type && b.value === value)
            .reduce((sum, b) => sum + b.amount, 0);
    };

    const NumberCell = ({ num }: { num: number }) => {
        const isRed = RED_NUMBERS.includes(num);
        const amount = getBetAmount('straight', num);

        return (
            <motion.button
                whileHover={{ scale: 1.05, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onPlaceBet('straight', num)}
                className={cn(
                    "relative h-14 w-full flex items-center justify-center font-black text-xl border border-white/5 transition-all duration-300 overflow-hidden",
                    num === 0 ? "bg-gradient-to-br from-emerald-400 via-emerald-600 to-emerald-800 h-full rounded-l-2xl shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]" :
                        isRed ? "bg-gradient-to-br from-rose-500 via-rose-700 to-rose-900 shadow-[inset_0_2px_10px_rgba(255,255,255,0.1)]" :
                            "bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-[inset_0_2px_10px_rgba(255,255,255,0.05)]"
                )}
            >
                {/* Cell Shine */}
                <div className="absolute top-0 left-0 w-full h-[1px] bg-white/10" />
                <span className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)] relative z-10">{num}</span>
                {amount > 0 && <Chip amount={amount} />}
            </motion.button>
        );
    };

    const gridNumbers = [];
    for (let col = 0; col < 12; col++) {
        gridNumbers.push([3 * col + 3, 3 * col + 2, 3 * col + 1]);
    }

    return (
        <div className="w-full max-w-5xl mx-auto p-4 md:p-8 select-none perspective-table">
            <div className="flex bg-zinc-900/60 backdrop-blur-lg rounded-3xl overflow-hidden border border-white/10 shadow-[0_40px_80px_rgba(0,0,0,0.6)] rotate-table">
                {/* Zero Section */}
                <div className="w-20">
                    <NumberCell num={0} />
                </div>

                {/* Main Numbers Grid */}
                <div className="flex-1 grid grid-cols-12 gap-[1px] bg-white/5">
                    {gridNumbers.map((col, i) => (
                        <div key={i} className="flex flex-col gap-[1px]">
                            {col.map((num) => (
                                <NumberCell key={num} num={num} />
                            ))}
                        </div>
                    ))}
                </div>

                {/* Column Bets */}
                <div className="w-20 grid grid-rows-3 gap-[1px] bg-white/5">
                    <ColumnBet label="2 to 1" onClick={() => onPlaceBet('col3', 'col3')} amount={getBetAmount('col3', 'col3')} />
                    <ColumnBet label="2 to 1" onClick={() => onPlaceBet('col2', 'col2')} amount={getBetAmount('col2', 'col2')} />
                    <ColumnBet label="2 to 1" onClick={() => onPlaceBet('col1', 'col1')} amount={getBetAmount('col1', 'col1')} />
                </div>
            </div>

            {/* Outside Bets */}
            <div className="mt-8 grid grid-cols-3 gap-4 md:gap-6">
                <OutsideBet label="1st 12" onClick={() => onPlaceBet('1st12', '1-12')} amount={getBetAmount('1st12', '1-12')} />
                <OutsideBet label="2nd 12" onClick={() => onPlaceBet('2nd12', '13-24')} amount={getBetAmount('2nd12', '13-24')} />
                <OutsideBet label="3rd 12" onClick={() => onPlaceBet('3rd12', '25-36')} amount={getBetAmount('3rd12', '25-36')} />
            </div>

            <div className="mt-4 md:mt-6 grid grid-cols-6 gap-4 md:gap-6">
                <OutsideBet label="1-18" onClick={() => onPlaceBet('1-18', 'low')} amount={getBetAmount('1-18', 'low')} />
                <OutsideBet label="EVEN" onClick={() => onPlaceBet('even', 'even')} amount={getBetAmount('even', 'even')} />
                <OutsideBet
                    label={<div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-rose-500 to-rose-800 rounded-full shadow-[0_4px_15px_rgba(225,29,72,0.4)] border-2 border-white/20" />}
                    onClick={() => onPlaceBet('red', 'red')}
                    amount={getBetAmount('red', 'red')}
                />
                <OutsideBet
                    label={<div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-zinc-700 to-zinc-950 rounded-full shadow-[0_4px_15px_rgba(0,0,0,0.5)] border-2 border-white/20" />}
                    onClick={() => onPlaceBet('black', 'black')}
                    amount={getBetAmount('black', 'black')}
                />
                <OutsideBet label="ODD" onClick={() => onPlaceBet('odd', 'odd')} amount={getBetAmount('odd', 'odd')} />
                <OutsideBet label="19-36" onClick={() => onPlaceBet('19-36', 'high')} amount={getBetAmount('19-36', 'high')} />
            </div>
        </div>
    );
};

const OutsideBet = ({ label, onClick, amount }: { label: React.ReactNode; onClick: () => void; amount: number }) => (
    <motion.button
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className="relative h-20 bg-zinc-900/40 border border-white/5 flex items-center justify-center font-black text-xs md:text-sm hover:bg-zinc-800/60 transition-all duration-300 rounded-2xl shadow-2xl overflow-hidden group"
    >
        <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <span className="z-10 tracking-[0.2em] uppercase opacity-60 group-hover:opacity-100 transition-opacity">{label}</span>
        {amount > 0 && <Chip amount={amount} />}
    </motion.button>
);

const ColumnBet = ({ label, onClick, amount }: { label: string; onClick: () => void; amount: number }) => (
    <motion.button
        whileHover={{ scale: 1.1, x: 5, zIndex: 10 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="relative h-14 bg-zinc-900/80 border border-white/5 flex items-center justify-center font-black text-[10px] hover:bg-zinc-800 hover:text-gold-500 transition-all rounded-r-xl"
    >
        <div className="transform -rotate-90 whitespace-nowrap opacity-40 uppercase tracking-tighter group-hover:opacity-100">{label}</div>
        {amount > 0 && <Chip amount={amount} />}
    </motion.button>
);


