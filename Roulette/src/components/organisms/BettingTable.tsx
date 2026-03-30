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
    const getBetAmount = (type: BetType, value: number | string) =>
        activeBets.filter(b => b.type === type && b.value === value).reduce((sum, b) => sum + b.amount, 0);

    const NumberCell = ({ num }: { num: number }) => {
        const isRed = RED_NUMBERS.includes(num);
        const amount = getBetAmount('straight', num);
        return (
            <motion.button
                whileHover={{ scale: 1.08, zIndex: 10 }}
                whileTap={{ scale: 0.93 }}
                onClick={() => onPlaceBet('straight', num)}
                className={cn(
                    'relative h-14 w-full flex items-center justify-center font-bold text-lg overflow-hidden transition-all duration-150',
                    num === 0
                        ? 'text-white h-full rounded-l-xl'
                        : isRed
                            ? 'text-white'
                            : 'text-white/90'
                )}
                style={{
                    background: num === 0
                        ? 'linear-gradient(160deg, #1a6b3a, #0d3d22)'
                        : isRed
                            ? 'linear-gradient(160deg, #9b1c2e, #5c0f1b)'
                            : 'linear-gradient(160deg, #1c1c28, #0d0d14)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
                }}
            >
                {/* Gloss */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/[0.06] to-transparent pointer-events-none" />
                <span className="relative z-10 drop-shadow-sm">{num}</span>
                {amount > 0 && <Chip amount={amount} />}
            </motion.button>
        );
    };

    const gridNumbers: number[][] = [];
    for (let col = 0; col < 12; col++) {
        gridNumbers.push([3 * col + 3, 3 * col + 2, 3 * col + 1]);
    }

    return (
        <div className="w-full mx-auto select-none perspective-table">
            <div
                className="rounded-2xl overflow-hidden rotate-table"
                style={{
                    background: 'linear-gradient(160deg, #0d1a14 0%, #060e09 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: '0 30px 80px rgba(0,0,0,0.7)',
                }}
            >
                {/* Header label */}
                <div className="flex items-center justify-center py-2 border-b border-white/[0.05]">
                    <span className="casino-label" style={{ fontSize: '9px', letterSpacing: '0.4em' }}>Betting Table · European Roulette</span>
                </div>

                <div className="flex">
                    {/* Zero */}
                    <div className="w-16 md:w-20">
                        <NumberCell num={0} />
                    </div>

                    {/* Grid */}
                    <div className="flex-1 grid grid-cols-12 gap-[1px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        {gridNumbers.map((col, i) => (
                            <div key={i} className="flex flex-col gap-[1px]">
                                {col.map(num => <NumberCell key={num} num={num} />)}
                            </div>
                        ))}
                    </div>

                    {/* Column bets */}
                    <div className="w-12 md:w-16 grid grid-rows-3 gap-[1px]" style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <ColumnBet label="2:1" onClick={() => onPlaceBet('col3', 'col3')} amount={getBetAmount('col3', 'col3')} />
                        <ColumnBet label="2:1" onClick={() => onPlaceBet('col2', 'col2')} amount={getBetAmount('col2', 'col2')} />
                        <ColumnBet label="2:1" onClick={() => onPlaceBet('col1', 'col1')} amount={getBetAmount('col1', 'col1')} />
                    </div>
                </div>
            </div>

            {/* Outside bets */}
            <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                    { label: '1st 12', type: '1st12' as BetType, value: '1-12' },
                    { label: '2nd 12', type: '2nd12' as BetType, value: '13-24' },
                    { label: '3rd 12', type: '3rd12' as BetType, value: '25-36' },
                ].map(b => (
                    <OutsideBet key={b.label} label={b.label} onClick={() => onPlaceBet(b.type, b.value)} amount={getBetAmount(b.type, b.value)} />
                ))}
            </div>
            <div className="mt-2 grid grid-cols-6 gap-2">
                <OutsideBet label="1-18" onClick={() => onPlaceBet('1-18', 'low')} amount={getBetAmount('1-18', 'low')} />
                <OutsideBet label="Even" onClick={() => onPlaceBet('even', 'even')} amount={getBetAmount('even', 'even')} />
                <OutsideBet
                    label={<div className="w-6 h-6 rounded-full border-2 border-rose-500/40" style={{ background: 'linear-gradient(135deg, #f43f5e, #9b1c2e)' }} />}
                    onClick={() => onPlaceBet('red', 'red')}
                    amount={getBetAmount('red', 'red')}
                />
                <OutsideBet
                    label={<div className="w-6 h-6 rounded-full border-2 border-white/10" style={{ background: 'linear-gradient(135deg, #3f3f4e, #0d0d14)' }} />}
                    onClick={() => onPlaceBet('black', 'black')}
                    amount={getBetAmount('black', 'black')}
                />
                <OutsideBet label="Odd" onClick={() => onPlaceBet('odd', 'odd')} amount={getBetAmount('odd', 'odd')} />
                <OutsideBet label="19-36" onClick={() => onPlaceBet('19-36', 'high')} amount={getBetAmount('19-36', 'high')} />
            </div>
        </div>
    );
};

const OutsideBet = ({ label, onClick, amount }: { label: React.ReactNode; onClick: () => void; amount: number }) => (
    <motion.button
        whileHover={{ scale: 1.03, y: -1 }}
        whileTap={{ scale: 0.97 }}
        onClick={onClick}
        className="relative h-14 flex items-center justify-center font-semibold text-xs md:text-sm rounded-xl overflow-hidden group transition-all duration-200"
        style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: 'rgba(255,255,255,0.5)',
        }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
            (e.currentTarget as HTMLElement).style.color = 'white';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,171,10,0.2)';
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.5)';
            (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
        }}
    >
        <span className="z-10 uppercase tracking-widest text-[10px] font-bold">{label}</span>
        {amount > 0 && <Chip amount={amount} />}
    </motion.button>
);

const ColumnBet = ({ label, onClick, amount }: { label: string; onClick: () => void; amount: number }) => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onClick}
        className="relative flex items-center justify-center font-bold text-[9px] overflow-hidden"
        style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.06)',
            color: 'rgba(255,255,255,0.35)',
        }}
        onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.color = '#ffab0a';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,171,10,0.08)';
        }}
        onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.35)';
            (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.04)';
        }}
    >
        <div className="transform -rotate-90 whitespace-nowrap font-bold tracking-widest uppercase">{label}</div>
        {amount > 0 && <Chip amount={amount} />}
    </motion.button>
);
