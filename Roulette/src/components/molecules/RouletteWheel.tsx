import React, { useEffect, useRef, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { ROULETTE_NUMBERS, RED_NUMBERS } from '../../types/roulette';

interface RouletteWheelProps {
    isSpinning: boolean;
    winningNumber: number | null;
    onAnimationComplete: () => void;
}

export const RouletteWheel: React.FC<RouletteWheelProps> = ({
    isSpinning,
    winningNumber,
    onAnimationComplete,
}) => {
    const controls = useAnimation();
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        if (isSpinning && winningNumber !== null) {
            const numberIndex = ROULETTE_NUMBERS.indexOf(winningNumber);
            const sectorAngle = 360 / ROULETTE_NUMBERS.length;

            // Calculate target angle based on CURRENT rotation to avoid backwards snapping
            // Base rotation is the normalized current rotation
            const baseRotation = Math.floor(rotation / 360) * 360;
            const targetSectorAngle = numberIndex * sectorAngle;

            // We want to spin forward at least 8 full rotations PLUS the target angle
            const finalAngle = baseRotation - (360 * 8 + targetSectorAngle);

            controls.start({
                rotate: finalAngle,
                transition: {
                    duration: 6,
                    ease: [0.12, 0, 0.39, 0], // Smooth deceleration
                },
            }).then(() => {
                onAnimationComplete();
                setRotation(finalAngle);
            });
        }
    }, [isSpinning, winningNumber, controls, onAnimationComplete]);

    return (
        <div className="relative w-[320px] h-[320px] sm:w-[400px] sm:h-[400px] lg:w-[480px] lg:h-[480px] mx-auto perspective-table">
            {/* Outer Case / Mahogany Frame */}
            <div className="absolute inset-[-30px] rounded-full bg-gradient-to-br from-[#5d2d14] via-[#2d1608] to-[#120602] border-[12px] border-[#3d1e0d] shadow-[0_40px_100px_rgba(0,0,0,0.9),inset_0_2px_20px_rgba(255,255,255,0.15)] z-0" />

            {/* Brass Internal Rim */}
            <div className="absolute inset-[-10px] rounded-full border-[10px] border-gold-600 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)] z-10 opacity-90"
                style={{
                    borderImage: 'conic-gradient(from 0deg, #bf6a00, #ffcc3d, #472100, #ffcc3d, #bf6a00) 1',
                    borderRadius: '50%'
                }} />

            {/* The Spinning Wheel */}
            <motion.div
                animate={controls}
                initial={{ rotate: rotation }}
                style={{ willChange: 'transform' }}
                className="relative w-full h-full rounded-full bg-zinc-950 shadow-[inset_0_0_80px_rgba(0,0,0,1)] overflow-hidden border-[18px] border-zinc-900/90"
            >
                {ROULETTE_NUMBERS.map((number, index) => {
                    const angle = index * (360 / ROULETTE_NUMBERS.length);
                    const isRed = RED_NUMBERS.includes(number);
                    const isZero = number === 0;

                    return (
                        <div
                            key={number}
                            className="absolute top-0 left-1/2 w-12 h-1/2 origin-bottom -translate-x-1/2"
                            style={{ transform: `translateX(-50%) rotate(${angle}deg)` }}
                        >
                            <div
                                className={`w-full h-20 flex flex-col items-center justify-start pt-3 font-black text-xl
                  ${isZero ? 'bg-gradient-to-b from-emerald-600 to-emerald-900' :
                                        isRed ? 'bg-gradient-to-b from-rose-700 to-rose-950' :
                                            'bg-gradient-to-b from-zinc-900 to-black'}
                  border-x border-white/5
                `}
                                style={{
                                    clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)',
                                }}
                            >
                                <span className="transform rotate-180 drop-shadow-[0_2px_3px_rgba(0,0,0,0.8)] text-white/95">{number}</span>
                                {/* Brass separators */}
                                <div className="w-full h-[2px] bg-gradient-to-r from-transparent via-gold-500/20 to-transparent mt-2" />
                            </div>
                        </div>
                    );
                })}

                {/* Center Hub - Professional Style */}
                <div className="absolute inset-[22%] rounded-full bg-gradient-to-br from-zinc-800 via-zinc-900 to-black shadow-[0_20px_50px_rgba(0,0,0,0.8)] border-[10px] border-zinc-800/50 flex items-center justify-center overflow-hidden">
                    {/* Reflective Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />

                    {/* Spindles */}
                    <div className="absolute inset-0 w-full h-full animate-spin-slow opacity-30">
                        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
                            <div
                                key={deg}
                                className="absolute w-[2px] h-1/2 bg-gradient-to-t from-gold-500/50 to-transparent left-1/2 -translate-x-1/2 origin-bottom"
                                style={{ transform: `rotate(${deg}deg)` }}
                            />
                        ))}
                    </div>

                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-300 via-gold-600 to-gold-900 shadow-[0_0_40px_rgba(255,171,10,0.6)] border-2 border-white/30 z-20 flex items-center justify-center">
                        <div className="w-4 h-4 rounded-full bg-white/20 blur-[1px]" />
                    </div>
                </div>
            </motion.div>

            {/* Ambient Lighting Override */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-30" />

            {/* Pointer/Ball Indicator */}
            <div className="absolute top-[-40px] left-1/2 -translate-x-1/2 z-40 flex flex-col items-center">
                <div className="w-3 h-16 bg-gradient-to-b from-gold-300 via-gold-600 to-gold-900 shadow-2xl rounded-full border border-white/10" />
                <motion.div
                    animate={isSpinning ? {
                        y: [0, -8, 2, -4, 0],
                        scale: [1, 1.2, 0.9, 1.1, 1]
                    } : {}}
                    transition={{ repeat: Infinity, duration: 0.8, ease: "easeInOut" }}
                    className="w-8 h-8 bg-white rounded-full absolute -top-6 shadow-[0_0_30px_rgba(255,255,255,1)] border-2 border-zinc-100 flex items-center justify-center"
                >
                    <div className="w-2 h-2 rounded-full bg-zinc-200/50 -translate-x-1 -translate-y-1" />
                </motion.div>
            </div>
        </div>
    );
};
