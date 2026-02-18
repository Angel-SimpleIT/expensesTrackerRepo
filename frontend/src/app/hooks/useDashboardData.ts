import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { format } from 'date-fns';
import type { DashboardFilters } from './useDashboardFilters';

export interface DashboardTransaction {
    id: string;
    user_id: string;
    raw_text: string | null;
    amount_original: number;
    currency_original: string;
    amount_base: number | null;
    amount_usd: number | null;
    category_id: string | null;
    category_name: string;
    category_icon: string;
    merchant_name: string | null;
    is_ai_confirmed: boolean;
    created_at: string;
}

export interface ChartDataPoint {
    date: string;        // 'yyyy-MM-dd'
    dateLabel: string;   // 'dd/MM' for display
    total: number;
    dominantCategory: string;
}

// ─── Category Summary ───
const CATEGORY_COLORS: Record<string, string> = {
    'Alimentación': '#EF4444',
    Transporte: '#3B82F6',
    Compras: '#8B5CF6',
    Hogar: '#06B6D4',
    'Café': '#F59E0B',
    Entretenimiento: '#F43F5E',
    Salud: '#10B981',
    'Teléfono': '#10B981',
    Viajes: '#6366F1',
};

export interface CategorySummary {
    name: string;
    icon: string;
    amount: number;
    percentage: number;
    color: string;
    transactionCount: number;
}

export function useDashboardData(filters: DashboardFilters) {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
    const [totalSpend, setTotalSpend] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (showLoading = true) => {
        if (!user) {
            setTransactions([]);
            setChartData([]);
            setCategorySummary([]);
            setTotalSpend(0);
            setLoading(false);
            return;
        }

        if (showLoading) setLoading(true);
        setError(null);

        try {
            // Build query with filters
            let query = supabase
                .from('transactions')
                .select(`
          *,
          categories (
            name,
            icon
          )
        `)
                .eq('user_id', user.id)
                .gte('created_at', filters.dateFrom.toISOString())
                .lte('created_at', filters.dateTo.toISOString())
                .order('created_at', { ascending: false });

            // Category filter
            if (filters.categoryIds.length > 0) {
                query = query.in('category_id', filters.categoryIds);
            }

            // Amount filter
            if (filters.amountMin > 0) {
                query = query.gte('amount_original', filters.amountMin);
            }

            if (filters.amountMax < 100000) {
                query = query.lte('amount_original', filters.amountMax);
            }

            const { data, error: queryError } = await query;

            if (queryError) {
                console.error('Error fetching dashboard data:', queryError);
                setError(queryError.message);
                setLoading(false);
                return;
            }

            // Format transactions
            const formatted: DashboardTransaction[] = (data || []).map((t: any) => ({
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

            setTransactions(formatted);

            // Calculate total
            const total = formatted.reduce((sum, t) => sum + t.amount_original, 0);
            setTotalSpend(total);

            // ─── Build chart data: aggregate by day ───
            const dailyMap = new Map<string, { total: number; categories: Map<string, number> }>();

            // Initialize all days in range
            const current = new Date(filters.dateFrom);
            const end = new Date(filters.dateTo);
            while (current <= end) {
                const key = format(current, 'yyyy-MM-dd');
                dailyMap.set(key, { total: 0, categories: new Map() });
                current.setDate(current.getDate() + 1);
            }

            // Aggregate transactions by day
            formatted.forEach((t) => {
                const dayKey = format(new Date(t.created_at), 'yyyy-MM-dd');
                const dayData = dailyMap.get(dayKey);
                if (dayData) {
                    dayData.total += t.amount_original;
                    const catTotal = dayData.categories.get(t.category_name) || 0;
                    dayData.categories.set(t.category_name, catTotal + t.amount_original);
                }
            });

            // Convert to array
            const chart: ChartDataPoint[] = Array.from(dailyMap.entries())
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, data]) => {
                    // Find dominant category
                    let dominant = 'Sin gastos';
                    let maxAmount = 0;
                    data.categories.forEach((amount, name) => {
                        if (amount > maxAmount) {
                            maxAmount = amount;
                            dominant = name;
                        }
                    });

                    return {
                        date,
                        dateLabel: format(new Date(date), 'dd/MM'),
                        total: Math.round(data.total * 100) / 100,
                        dominantCategory: dominant,
                    };
                });

            setChartData(chart);

            // ─── Build category summary ───
            const catMap = new Map<string, { icon: string; amount: number; count: number }>();
            formatted.forEach((t) => {
                const existing = catMap.get(t.category_name);
                if (existing) {
                    existing.amount += t.amount_original;
                    existing.count += 1;
                } else {
                    catMap.set(t.category_name, {
                        icon: t.category_icon,
                        amount: t.amount_original,
                        count: 1,
                    });
                }
            });

            const summary: CategorySummary[] = Array.from(catMap.entries())
                .map(([name, data]) => ({
                    name,
                    icon: data.icon,
                    amount: Math.round(data.amount * 100) / 100,
                    percentage: total > 0 ? Math.round((data.amount / total) * 100) : 0,
                    color: CATEGORY_COLORS[name] || '#6B7280',
                    transactionCount: data.count,
                }))
                .sort((a, b) => b.amount - a.amount);

            setCategorySummary(summary);
        } catch (err: any) {
            console.error('Unexpected error:', err);
            setError(err.message || 'Error inesperado');
        } finally {
            setLoading(false);
        }
    }, [user, filters.dateFrom, filters.dateTo, filters.categoryIds, filters.amountMin, filters.amountMax]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        transactions,
        chartData,
        categorySummary,
        totalSpend,
        loading,
        error,
        refresh: () => fetchData(false),
    };
}
