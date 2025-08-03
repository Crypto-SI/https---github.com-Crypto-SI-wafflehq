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
