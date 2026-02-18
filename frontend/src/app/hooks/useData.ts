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

export function useTransactions() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchTransactions = async (showLoading = true) => {
        if (!user) {
            setTransactions([]);
            setLoading(false);
            return;
        }

        if (showLoading) setLoading(true);

        const { data, error } = await supabase
            .from('transactions')
            .select(`
          *,
          categories (
            name,
            icon
          )
        `)
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });

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
        setLoading(false);
    };

    useEffect(() => {
        fetchTransactions();
    }, [user]);

    return { transactions, loading, error, refresh: () => fetchTransactions(false) };
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
    const { transactions } = useTransactions();
    const [categorySpending, setCategorySpending] = useState<CategorySpending[]>([]);

    useEffect(() => {
        if (transactions.length === 0) {
            setCategorySpending([]);
            return;
        }

        // Aggregate spending by category
        const spendingMap = new Map<string, { name: string; icon: string; amount: number }>();

        transactions.forEach((t) => {
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
    const { transactions } = useTransactions();
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
                .filter((t) => {
                    const transactionDate = new Date(t.created_at);
                    return transactionDate.toDateString() === date.toDateString();
                })
                .reduce((sum, t) => sum + t.amount_original, 0);

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
