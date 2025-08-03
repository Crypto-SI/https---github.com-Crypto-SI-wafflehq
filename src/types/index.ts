
export type User = {
    id: string;
    name: string;
    email: string;
    status: 'Active' | 'Pending' | 'Banned';
    credits: number;
    creditHistory: CreditRecord[];
};

export type CreditRecord = {
    date: string;
    description: string;
    amount: number;
};

export type Gem = {
    id: string;
    name: string;
    coingeckoId: string;
    currentValue: number;
    valueWhenAdded: number;
    valueWhenSold: number | null;
};
