import { supabase } from './supabase';

export interface ExchangeRates {
    base_currency: string;
    rates: Record<string, number>;
    updated_at: string;
}

/**
 * Fetches the latest exchange rates from Supabase.
 */
export async function fetchExchangeRates(): Promise<ExchangeRates | null> {
    try {
        const { data, error } = await supabase
            .from('exchange_rates')
            .select('*')
            .single();

        if (error) {
            console.error('Error fetching exchange rates:', error);
            return null;
        }

        return data as ExchangeRates;
    } catch (error) {
        console.error('Unexpected error fetching exchange rates:', error);
        return null;
    }
}

/**
 * Converts an amount from one currency to another using provided rates.
 * Rates are assumed to be relative to a base currency (like EUR).
 */
export function convertCurrency(
    amount: number,
    from: string,
    to: string,
    rates: Record<string, number>
): number {
    if (from === to) return amount;

    const fromRate = rates[from.toUpperCase()];
    const toRate = rates[to.toUpperCase()];

    if (!fromRate || !toRate) {
        console.warn(`Missing exchange rate for ${!fromRate ? from : to}. Using 1:1 fallback.`);
        return amount;
    }

    // Convert to base currency first, then to target currency
    // amount / fromRate = baseAmount
    // baseAmount * toRate = targetAmount
    return (amount / fromRate) * toRate;
}
