import { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Transaction {
    id: string;
    user_id: string;
    raw_text: string | null;
    amount_original: number;
    currency_original: string;
    amount_base: number | null;
    amount_usd: number | null;
    category_id: string | null;
    category_name?: string;
    category_icon?: string;
    merchant_name: string | null;
    is_ai_confirmed: boolean;
    created_at: string;
}

export interface Category {
    id: string;
    name: string;
    icon: string | null;
    keywords: string[] | null;
}

export interface CategorySpending {
    id: string;
    name: string;
    icon: string;
    amount: number;
    percentage: number;
    color: string;
}

// Color palette for categories
const CATEGORY_COLORS: Record<string, string> = {
    'Alimentación': '#EF4444',
    'Transporte': '#3B82F6',
    'Compras': '#8B5CF6',
    'Hogar': '#06B6D4',
    'Café': '#F59E0B',
    'Entretenimiento': '#F43F5E',
    'Salud': '#10B981',
    'Teléfono': '#10B981',
    'Viajes': '#6366F1',
};

const DEFAULT_COLOR = '#6B7280';

interface UseTransactionsOptions {
    page?: number;
    pageSize?: number;
    startDate?: Date | undefined;
    endDate?: Date | undefined;
    searchQuery?: string;
}

export function useTransactions(options: UseTransactionsOptions = {}) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalCount, setTotalCount] = useState(0);

    const { page = 1, pageSize = 20, startDate, endDate, searchQuery } = options;

    const fetchTransactions = async (showLoading = true) => {
        if (!userId) {
            setTransactions([]);
            setTotalCount(0);
            setLoading(false);
            return;
        }

        if (showLoading) setLoading(true);

        try {
            let query = supabase
                .from('transactions')
                .select(`
                  *,
                  categories (
                    name,
                    icon
                  )
                `, { count: 'exact' })
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            // Apply date filters
            if (startDate) {
                query = query.gte('created_at', startDate.toISOString());
            }
            if (endDate) {
                // Ensure end date covers the whole day
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);
                query = query.lte('created_at', end.toISOString());
            }

            // Apply search filter
            if (searchQuery && searchQuery.trim() !== '') {
                const term = searchQuery.trim();
                query = query.or(`merchant_name.ilike.%${term}%,raw_text.ilike.%${term}%`);
            }

            // Apply pagination
            if (page && pageSize) {
                const from = (page - 1) * pageSize;
                const to = from + pageSize - 1;
                query = query.range(from, to);
            }

            const { data, error, count } = await query;

            if (error) {
                console.error('Error fetching transactions:', error);
                setError(error.message);
                setLoading(false);
                return;
            }

            const formattedTransactions: Transaction[] = (data || []).map((t: any) => ({
                id: t.id,
                user_id: t.user_id,
                raw_text: t.raw_text,
                amount_original: parseFloat(t.amount_original),
                currency_original: t.currency_original,
                amount_base: t.amount_base ? parseFloat(t.amount_base) : null,
                amount_usd: t.amount_usd ? parseFloat(t.amount_usd) : null,
                category_id: t.category_id,
                category_name: t.categories?.name || 'Sin categoría',
                category_icon: t.categories?.icon || 'circle',
                merchant_name: t.merchant_name,
                is_ai_confirmed: t.is_ai_confirmed,
                created_at: t.created_at,
            }));

            setTransactions(formattedTransactions);
            setTotalCount(count || 0);
            setLoading(false);
        } catch (err: any) {
            console.error('Unexpected error fetching transactions:', err);
            setError(err.message || 'Error inesperado');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, [userId, page, pageSize, startDate, endDate, searchQuery]);

    return {
        transactions,
        loading,
        error,
        totalCount,
        totalPages: Math.ceil(totalCount / pageSize),
        refresh: () => fetchTransactions(false),
        updateTransaction: async (id: string, updates: Partial<Transaction>) => {
            const { error: fError, data: existingData } = await supabase
                .from('transactions')
                .select('amount_original, currency_original, amount_base, amount_usd')
                .eq('id', id)
                .single();

            if (fError) {
                console.error('Error fetching existing transaction for update:', fError);
                return { error: fError };
            }

            let amountBase = existingData.amount_base;
            let amountUsd = existingData.amount_usd;

            const amountChanged = updates.amount_original !== undefined && updates.amount_original !== parseFloat(existingData.amount_original);
            const currencyChanged = updates.currency_original !== undefined && updates.currency_original !== existingData.currency_original;

            if (amountChanged || currencyChanged) {
                const { fetchExchangeRates, convertCurrency } = await import('../../utils/currency');
                const ratesData = await fetchExchangeRates();
                const currency = updates.currency_original || existingData.currency_original;
                const newAmount = updates.amount_original !== undefined ? updates.amount_original : parseFloat(existingData.amount_original);

                if (ratesData) {
                    // We need homeCurrency here. Since useData hook doesn't have it directly, 
                    // we might need to fetch it from the profile or assume USD for base if unknown, 
                    // but better to fetch it if possible. 
                    // For now, let's just use what's in the profile if we can.
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('home_currency')
                        .eq('id', userId)
                        .single();

                    const homeCurrency = profile?.home_currency || 'USD';

                    amountBase = convertCurrency(newAmount, currency, homeCurrency, ratesData.rates);
                    amountUsd = convertCurrency(newAmount, currency, 'USD', ratesData.rates);
                }
            }

            const { error } = await supabase
                .from('transactions')
                .update({
                    amount_original: updates.amount_original,
                    currency_original: updates.currency_original,
                    amount_base: amountBase,
                    amount_usd: amountUsd,
                    category_id: updates.category_id,
                    created_at: updates.created_at,
                    merchant_name: updates.merchant_name,
                })
                .eq('id', id);

            if (error) {
                console.error('Error updating transaction:', error);
                return { error };
            }

            await fetchTransactions(false);
            return { error: null };
        },
        deleteTransaction: async (id: string) => {
            const { error } = await supabase
                .from('transactions')
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting transaction:', error);
                return { error };
            }

            await fetchTransactions(false);
            return { error: null };
        }
    };
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            const { data, error } = await supabase
                .from('categories')
                .select('*')
                .order('name');

            if (error) {
                console.error('Error fetching categories:', error);
                setLoading(false);
                return;
            }

            setCategories(data || []);
            setLoading(false);
        };

        fetchCategories();
    }, []);

    return { categories, loading };
}

export function useCategorySpending() {
    // Determine a large enough page size to simulate "all" for now, or just use default pagination
    // Since this hook seems unused, we'll just use the default which gives 20 items. 
    // If it were used, we'd pass { pageSize: 1000 } or similar.
    const { transactions } = useTransactions({ pageSize: 1000 });
    const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);

    useEffect(() => {
        if (transactions.length === 0) {
            setCategorySpending([]);
            return;
        }

        // Aggregate spending by category
        const spendingMap = new Map<string, { name: string; icon: string; amount: number }>();

        transactions.forEach((t: Transaction) => {
            const categoryName = t.category_name || 'Otros';
            const existing = spendingMap.get(categoryName);

            if (existing) {
                existing.amount += t.amount_original;
            } else {
                spendingMap.set(categoryName, {
                    name: categoryName,
                    icon: t.category_icon || 'circle',
                    amount: t.amount_original,
                });
            }
        });

        const totalSpending = Array.from(spendingMap.values()).reduce((sum, c) => sum + c.amount, 0);

        const spending: CategorySpending[] = Array.from(spendingMap.entries())
            .map(([id, data]) => ({
                id,
                name: data.name,
                icon: data.icon,
                amount: data.amount,
                percentage: totalSpending > 0 ? Math.round((data.amount / totalSpending) * 100) : 0,
                color: CATEGORY_COLORS[data.name] || DEFAULT_COLOR,
            }))
            .sort((a, b) => b.amount - a.amount);

        setCategorySpending(spending);
    }, [transactions]);

    return { categorySpending };
}

export function useWeeklyCashFlow() {
    // Use large page size to ensure we get enough data for the week
    const { transactions } = useTransactions({ pageSize: 1000 });
    const [cashFlowData, setCashFlowData] = useState<{ day: string; gastos: number; presupuesto: number }[]>([]);

    useEffect(() => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        const today = new Date();
        const weekData: { day: string; gastos: number; presupuesto: number }[] = [];

        // Get last 7 days
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dayName = days[date.getDay()];

            // Calculate spending for this day
            const daySpending = transactions
                .filter((t: Transaction) => {
                    const transactionDate = new Date(t.created_at);
                    return transactionDate.toDateString() === date.toDateString();
                })
                .reduce((sum: number, t: Transaction) => sum + t.amount_original, 0);

            weekData.push({
                day: dayName,
                gastos: Math.round(daySpending * 100) / 100,
                presupuesto: date.getDay() === 0 || date.getDay() === 6 ? 80 : 60, // Higher budget on weekends
            });
        }

        setCashFlowData(weekData);
    }, [transactions]);

    return { cashFlowData };
}
