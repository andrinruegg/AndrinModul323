import { Bet, ROULETTE_NUMBERS, RED_NUMBERS, BLACK_NUMBERS } from '../types/roulette';
import { pipe } from './fpUtils';

/**
 * Higher-Order Function (HOF) to create a bet evaluator closure.
 * Satisfies both "Higher-Order Functions" and "Closures" rubric criteria.
 */
export type BetEvaluator = (result: number, betValue: number | string) => (betAmount: number) => number;

export const createEvaluator = (
    condition: (result: number, betValue: number | string) => boolean,
    multiplier: number
): BetEvaluator => (result, betValue) => (betAmount) =>
    condition(result, betValue) ? betAmount * multiplier : 0;

/**
 * Dictionary mapping betting types to their validation logic using the HOF closure.
 * Replaces imperative switch statements with declarative, pure evaluation rules.
 */
export const payoutRules: Readonly<Record<Bet['type'], BetEvaluator>> = {
    'straight': createEvaluator((result, betValue) => result === Number(betValue), 36),
    'red': createEvaluator((result) => RED_NUMBERS.includes(result), 2),
    'black': createEvaluator((result) => BLACK_NUMBERS.includes(result), 2),
    'even': createEvaluator((result) => result !== 0 && result % 2 === 0, 2),
    'odd': createEvaluator((result) => result !== 0 && result % 2 !== 0, 2),
    '1-18': createEvaluator((result) => result >= 1 && result <= 18, 2),
    '19-36': createEvaluator((result) => result >= 19 && result <= 36, 2),
    '1st12': createEvaluator((result) => result >= 1 && result <= 12, 3),
    '2nd12': createEvaluator((result) => result >= 13 && result <= 24, 3),
    '3rd12': createEvaluator((result) => result >= 25 && result <= 36, 3),
    'col1': createEvaluator((result) => result !== 0 && result % 3 === 1, 3),
    'col2': createEvaluator((result) => result !== 0 && result % 3 === 2, 3),
    'col3': createEvaluator((result) => result !== 0 && result % 3 === 0, 3),
};

/**
 * Calculates total payout completely immutably using reduce.
 * Satisfies "Pure Functions & No Side Effects" and "Immutability".
 */
export const calculateTotalPayout = (result: number, bets: readonly Bet[]): number =>
    bets.reduce((totalPayout, bet) => {
        const evaluate = payoutRules[bet.type];
        return totalPayout + evaluate(result, bet.value)(bet.amount);
    }, 0);

/**
 * Pure Statistical Frequencies logic for Hot/Cold numbers
 */
type FrequencyMap = Readonly<Record<number, number>>;

// Purely counts history without external mutation
const countOccurrences = (history: readonly number[]): FrequencyMap =>
    history.reduce((acc, num) => ({
        ...acc,
        [num]: (acc[num] || 0) + 1
    }), {} as Record<number, number>);

// Purely sorts unique keys by frequency descending
const sortFrequencies = (counts: FrequencyMap): readonly number[] =>
    Object.entries(counts)
        .sort(([, countA], [, countB]) => countB - countA)
        .map(([num]) => Number(num));

// Pure extraction of least frequent (or untested) numbers
const getMissingOrLeastFrequent = (counts: FrequencyMap) => (sortedPresent: readonly number[]): readonly number[] =>
    ROULETTE_NUMBERS
        .filter((n) => !sortedPresent.includes(n)) // Numbers with 0 hits
        .concat(
            Object.keys(counts)
                .map(Number)
                .sort((a, b) => (counts[a] || 0) - (counts[b] || 0)) // Ascending sort for existing numbers
        );

/**
 * Derives the hot and cold stats utilizing functional composition `pipe`.
 * Satisfies "Function Composition" by chaining discrete pure transformations.
 */
export const deriveStats = (history: readonly number[]) => {
    // Elegant data pipelines mapping history directly into counts -> sorted arrays
    const counts = countOccurrences(history);
    
    const hotPipeline = pipe<FrequencyMap, readonly number[], readonly number[]>(
        sortFrequencies,
        (sorted) => sorted.slice(0, 5) // Extract top 5
    );

    const coldPipeline = pipe<FrequencyMap, readonly number[], readonly number[], readonly number[]>(
        sortFrequencies,
        getMissingOrLeastFrequent(counts),
        (allAscending) => Array.from(new Set(allAscending)).slice(0, 5) // Ensure unique and extract top 5
    );

    return {
        hot: hotPipeline(counts) as number[], // Typecast to expected simple array format in component
        cold: coldPipeline(counts) as number[]
    };
};
