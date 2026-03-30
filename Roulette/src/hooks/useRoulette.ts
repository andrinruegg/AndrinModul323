import { useState, useCallback } from 'react';
import { Bet, RouletteState } from '../types/roulette';
import { update } from '../lib/fpUtils';
import { calculateTotalPayout, deriveStats } from '../lib/rouletteUtils';

export const useRoulette = (
    balance: number,
    withdraw: (amount: number) => boolean,
    deposit: (amount: number) => void
) => {
    const [state, setState] = useState<Omit<RouletteState, 'balance'>>({
        activeBets: [],
        lastBets: [],
        lastResult: null,
        isSpinning: false,
        winningHistory: [],
    });

    const placeBet = useCallback((bet: Bet) => {
        if (state.isSpinning) return;
        if (withdraw(bet.amount)) {
            setState(prev => update(prev, {
                activeBets: [...prev.activeBets, bet],
            }));
        }
    }, [state.isSpinning, withdraw]);

    const undoBet = useCallback(() => {
        if (state.isSpinning || state.activeBets.length === 0) return;

        const lastBet = state.activeBets[state.activeBets.length - 1];
        deposit(lastBet.amount);
        setState(prev => update(prev, {
            activeBets: prev.activeBets.slice(0, -1),
        }));
    }, [state.activeBets, state.isSpinning, deposit]);

    const repeatLastBets = useCallback(() => {
        if (state.isSpinning || state.activeBets.length > 0 || state.lastBets.length === 0) return;

        const totalAmount = state.lastBets.reduce((sum, b) => sum + b.amount, 0);
        if (withdraw(totalAmount)) {
            setState(prev => update(prev, {
                activeBets: state.lastBets,
            }));
        }
    }, [state.isSpinning, state.activeBets, state.lastBets, withdraw]);

    const refillBalance = useCallback(() => {
        if (balance < 100) {
            deposit(5000);
        }
    }, [balance, deposit]);

    const clearBets = useCallback(() => {
        if (state.isSpinning) return;
        const totalBetAmount = state.activeBets.reduce((sum, bet) => sum + bet.amount, 0);
        deposit(totalBetAmount);
        setState(prev => update(prev, {
            activeBets: [],
        }));
    }, [state.activeBets, state.isSpinning, deposit]);

    const spin = useCallback(() => {
        if (state.isSpinning || state.activeBets.length === 0) return;

        setState(prev => update(prev, { isSpinning: true }));

        // Simulate spin boundaries - side effects isolated from state manipulation
        return Math.floor(Math.random() * 37); // 0-36
    }, [state.isSpinning, state.activeBets]);

    const resolveSpin = useCallback((result: number) => {
        // Leverages pure functional calculations from our new rouletteUtils, entirely decoupled
        const winAmount = calculateTotalPayout(result, state.activeBets);

        setState(prev => update(prev, {
            isSpinning: false,
            lastResult: result,
            lastBets: prev.activeBets,
            activeBets: [],
            // Immutably prepend history using destructuring array syntax
            winningHistory: [result, ...prev.winningHistory].slice(0, 50),
        }));

        deposit(winAmount);
        return winAmount;
    }, [state.activeBets, deposit]);

    // Leverage pure domain data-pipeline to derive stats without side-effects or state coupling
    const getStats = useCallback(() => deriveStats(state.winningHistory), [state.winningHistory]);

    return {
        state,
        placeBet,
        undoBet,
        clearBets,
        repeatLastBets,
        refillBalance,
        spin,
        resolveSpin,
        getStats
    };
};
