import { useState, useCallback } from 'react';
import { Bet, BetType, RouletteState, RED_NUMBERS, BLACK_NUMBERS, ROULETTE_NUMBERS } from '../types/roulette';

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
            setState(prev => ({
                ...prev,
                activeBets: [...prev.activeBets, bet],
            }));
        }
    }, [state.isSpinning, withdraw]);

    const undoBet = useCallback(() => {
        if (state.isSpinning || state.activeBets.length === 0) return;

        const lastBet = state.activeBets[state.activeBets.length - 1];
        deposit(lastBet.amount);
        setState(prev => ({
            ...prev,
            activeBets: prev.activeBets.slice(0, -1),
        }));
    }, [state.activeBets, state.isSpinning, deposit]);

    const repeatLastBets = useCallback(() => {
        if (state.isSpinning || state.activeBets.length > 0 || state.lastBets.length === 0) return;

        const totalAmount = state.lastBets.reduce((sum, b) => sum + b.amount, 0);
        if (withdraw(totalAmount)) {
            setState(prev => ({
                ...prev,
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
        setState(prev => ({
            ...prev,
            activeBets: [],
        }));
    }, [state.activeBets, state.isSpinning, deposit]);

    const calculatePayout = (result: number, bets: Bet[]): number => {
        let payout = 0;
        const isRed = RED_NUMBERS.includes(result);
        const isBlack = BLACK_NUMBERS.includes(result);
        const isEven = result !== 0 && result % 2 === 0;
        const isOdd = result !== 0 && result % 2 !== 0;

        bets.forEach(bet => {
            switch (bet.type) {
                case 'straight':
                    if (bet.value === result) payout += bet.amount * 36;
                    break;
                case 'red':
                    if (isRed) payout += bet.amount * 2;
                    break;
                case 'black':
                    if (isBlack) payout += bet.amount * 2;
                    break;
                case 'even':
                    if (isEven) payout += bet.amount * 2;
                    break;
                case 'odd':
                    if (isOdd) payout += bet.amount * 2;
                    break;
                case '1-18':
                    if (result >= 1 && result <= 18) payout += bet.amount * 2;
                    break;
                case '19-36':
                    if (result >= 19 && result <= 36) payout += bet.amount * 2;
                    break;
                case '1st12':
                    if (result >= 1 && result <= 12) payout += bet.amount * 3;
                    break;
                case '2nd12':
                    if (result >= 13 && result <= 24) payout += bet.amount * 3;
                    break;
                case '3rd12':
                    if (result >= 25 && result <= 36) payout += bet.amount * 3;
                    break;
                case 'col1':
                    if (result !== 0 && result % 3 === 1) payout += bet.amount * 3;
                    break;
                case 'col2':
                    if (result !== 0 && result % 3 === 2) payout += bet.amount * 3;
                    break;
                case 'col3':
                    if (result !== 0 && result % 3 === 0) payout += bet.amount * 3;
                    break;
            }
        });

        return payout;
    };

    const spin = useCallback(() => {
        if (state.isSpinning || state.activeBets.length === 0) return;

        setState(prev => ({ ...prev, isSpinning: true }));

        // Simulate spin delay
        const result = Math.floor(Math.random() * 37); // 0-36

        return result;
    }, [state.isSpinning, state.activeBets]);

    const resolveSpin = useCallback((result: number) => {
        const winAmount = calculatePayout(result, state.activeBets);

        setState(prev => ({
            ...prev,
            isSpinning: false,
            lastResult: result,
            lastBets: prev.activeBets,
            activeBets: [],
            winningHistory: [result, ...prev.winningHistory].slice(0, 50), // Keep more for stats
        }));

        deposit(winAmount);
        return winAmount;
    }, [state.activeBets]);

    const getStats = useCallback(() => {
        const counts: Record<number, number> = {};
        state.winningHistory.forEach(num => {
            counts[num] = (counts[num] || 0) + 1;
        });

        const sorted = Object.entries(counts)
            .sort(([, a], [, b]) => b - a)
            .map(([num]) => parseInt(num));

        const hot = sorted.slice(0, 5);
        const cold = ROULETTE_NUMBERS
            .filter(n => !sorted.includes(n))
            .concat(Object.keys(counts).map(Number).filter(n => !hot.includes(n)).sort((a, b) => counts[a] - counts[b]))
            .slice(0, 5);

        return { hot, cold };
    }, [state.winningHistory]);

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
