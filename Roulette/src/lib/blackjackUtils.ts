import { Card, Rank, Suit } from '../components/atoms/Card';

export const createDeck = (): Card[] => {
    const suits: Suit[] = ['♠', '♣', '♥', '♦'];
    const ranks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck: Card[] = [];

    for (const suit of suits) {
        for (const rank of ranks) {
            let value = parseInt(rank);
            if (rank === 'A') value = 11;
            else if (['J', 'Q', 'K'].includes(rank)) value = 10;
            deck.push({ suit, rank, value });
        }
    }
    return deck.sort(() => Math.random() - 0.5);
};

export const calculateHandValue = (hand: Card[]): number => {
    let value = hand.reduce((acc, card) => acc + (card.isHidden ? 0 : card.value), 0);
    let aces = hand.filter(c => c.rank === 'A' && !c.isHidden).length;

    while (value > 21 && aces > 0) {
        value -= 10;
        aces--;
    }
    return value;
};
