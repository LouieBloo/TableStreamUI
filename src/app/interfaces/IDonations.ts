export interface IDonation {
    amount: number;
    donation_type: 'SINGLE' | 'FIRST_MONTHLY' | 'MONTHLY';
    message?: string;
    from:string;
}