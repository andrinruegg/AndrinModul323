import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface BalanceContextType {
    balance: number;
    withdraw: (amount: number) => boolean;
    deposit: (amount: number) => void;
}

const BalanceContext = createContext<BalanceContextType | undefined>(undefined);

const INITIAL_BALANCE = 5000;

export const BalanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [balance, setBalance] = useState<number>(() => {
        const saved = localStorage.getItem('casino_balance');
        return saved !== null ? parseInt(saved, 10) : INITIAL_BALANCE;
    });

    useEffect(() => {
        localStorage.setItem('casino_balance', balance.toString());
    }, [balance]);

    const withdraw = useCallback((amount: number): boolean => {
        if (balance >= amount) {
            setBalance(prev => prev - amount);
            return true;
        }
        return false;
    }, [balance]);

    const deposit = useCallback((amount: number) => {
        setBalance(prev => prev + amount);
    }, []);

    return (
        <BalanceContext.Provider value={{ balance, withdraw, deposit }}>
            {children}
        </BalanceContext.Provider>
    );
};

export const useBalance = () => {
    const context = useContext(BalanceContext);
    if (!context) throw new Error('useBalance must be used within a BalanceProvider');
    return context;
};
