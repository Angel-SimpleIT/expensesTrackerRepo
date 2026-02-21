import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
    format,
    differenceInDays,
    differenceInMonths,
    startOfWeek,
    startOfMonth,
    startOfYear,
    eachDayOfInterval,
    eachWeekOfInterval,
    eachMonthOfInterval,
    eachYearOfInterval
} from 'date-fns';
import { es } from 'date-fns/locale';
import type { DashboardFilters } from './useDashboardFilters';

export interface DashboardTransaction {
    id: string;
    amount_base: number;
    category_name: string;
    category_icon: string;
    created_at: string;
}

export interface ChartDataPoint {
    date: string;        // Identifier for the period
    dateLabel: string;   // Display label
    total: number;
    [category: string]: any; // Allow category names as keys for stacked area chart
}

// ─── Category Summary ───
const CATEGORY_COLORS: Record<string, string> = {
    'Alimentación': '#4F46E5',
    'Vivienda': '#F43F5E',
    'Hogar': '#F43F5E',
    'Transporte': '#F59E0B',
    'Salud': '#10B981',
    'Entretenimiento': '#8B5CF6',
    'Compras': '#06B6D4',
    'Otros': '#94A3B8',
    'Sueldo': '#10B981', // Emerald for income/positive
};

export interface CategorySummary {
    name: string;
    icon: string;
    amount: number;
    percentage: number;
    color: string;
    transactionCount: number;
}

type Granularity = 'day' | 'week' | 'month' | 'year';

function getGranularity(start: Date, end: Date): Granularity {
    const days = differenceInDays(end, start);
    const months = differenceInMonths(end, start);

    if (days <= 60) return 'day';
    if (months <= 6) return 'week';
    if (months <= 24) return 'month';
    return 'year';
}

export function useDashboardData(filters: DashboardFilters) {
    const { user } = useAuth();
    const userId = user?.id ?? null;
    const [transactions, setTransactions] = useState<DashboardTransaction[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [categorySummary, setCategorySummary] = useState<CategorySummary[]>([]);
    const [totalSpend, setTotalSpend] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (showLoading = true) => {
        if (!userId) {
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
            // Using the optimized RPC for Daily Category Stats
            const { data: rpcData, error: rpcError } = await supabase.rpc('get_daily_category_stats', {
                p_user_id: userId,
                p_date_from: filters.dateFrom.toISOString(),
                p_date_to: filters.dateTo.toISOString()
            });

            if (rpcError) {
                console.error('Error fetching optimized stats:', rpcError);
                // Fallback to existing query if RPC fails (e.g. not migrated yet)
            }

            // Keep the raw transactions fetch for the transaction list if needed, 
            // but optimize it by only selecting what's needed for the list.
            let query = supabase
                .from('transactions')
                .select(`
                    id,
                    created_at,
                    amount_base,
                    category_id,
                    categories (
                        name,
                        icon
                    )
                `)
                .eq('user_id', userId)
                .gte('created_at', filters.dateFrom.toISOString())
                .lte('created_at', filters.dateTo.toISOString())
                .order('created_at', { ascending: false });

            // Category filter
            if (filters.categoryIds.length > 0) {
                query = query.in('category_id', filters.categoryIds);
            }

            // Amount filter
            if (filters.amountMin > 0) {
                query = query.gte('amount_base', filters.amountMin);
            }

            if (filters.amountMax < 100000) {
                query = query.lte('amount_base', filters.amountMax);
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
                amount_base: parseFloat(t.amount_base),
                category_name: t.categories?.name || 'Sin categoría',
                category_icon: t.categories?.icon || 'circle',
                created_at: t.created_at,
            }));

            setTransactions(formatted);

            // Calculate total
            const total = formatted.reduce((sum, t) => sum + t.amount_base, 0);
            setTotalSpend(total);

            // ─── Build chart data: aggregate based on granularity ───
            const granularity = getGranularity(filters.dateFrom, filters.dateTo);
            const dataMap = new Map<string, { total: number; categories: Map<string, number>; label: string; sortDate: Date }>();

            let intervals: Date[];
            const intervalOptions = { locale: es };

            // Generate all intervals
            switch (granularity) {
                case 'day':
                    intervals = eachDayOfInterval({ start: filters.dateFrom, end: filters.dateTo });
                    break;
                case 'week':
                    intervals = eachWeekOfInterval({ start: filters.dateFrom, end: filters.dateTo }, { weekStartsOn: 1 }); // Monday start
                    break;
                case 'month':
                    intervals = eachMonthOfInterval({ start: filters.dateFrom, end: filters.dateTo });
                    break;
                case 'year':
                    intervals = eachYearOfInterval({ start: filters.dateFrom, end: filters.dateTo });
                    break;
            }

            // Initialize buckets
            intervals.forEach(date => {
                let key: string;
                let label: string;

                // Format key and label based on granularity
                if (granularity === 'day') {
                    key = format(date, 'yyyy-MM-dd');
                    label = format(date, 'dd/MM', { locale: es });
                } else if (granularity === 'week') {
                    key = format(date, 'yyyy-ww');
                    label = `Sem ${format(date, 'dd/MM', { locale: es })}`;
                } else if (granularity === 'month') {
                    key = format(date, 'yyyy-MM');
                    label = format(date, 'MMM yyyy', { locale: es });
                } else {
                    key = format(date, 'yyyy');
                    label = format(date, 'yyyy');
                }

                dataMap.set(key, { total: 0, categories: new Map(), label, sortDate: date });
            });

            // Aggregate transactions
            const catNamesSet = new Set<string>();
            formatted.forEach((t) => {
                const tDate = new Date(t.created_at);
                let key: string = '';

                if (granularity === 'day') {
                    key = format(tDate, 'yyyy-MM-dd');
                } else if (granularity === 'week') {
                    key = format(startOfWeek(tDate, { weekStartsOn: 1 }), 'yyyy-ww');
                } else if (granularity === 'month') {
                    key = format(startOfMonth(tDate), 'yyyy-MM');
                } else {
                    key = format(startOfYear(tDate), 'yyyy');
                }

                if (dataMap.has(key)) {
                    const bucket = dataMap.get(key)!;
                    bucket.total += t.amount_base;
                    const catTotal = bucket.categories.get(t.category_name) || 0;
                    bucket.categories.set(t.category_name, catTotal + t.amount_base);
                    catNamesSet.add(t.category_name);
                }
            });

            // Convert to array
            const chart: ChartDataPoint[] = Array.from(dataMap.values())
                .sort((a, b) => a.sortDate.getTime() - b.sortDate.getTime())
                .map((data) => {
                    const point: ChartDataPoint = {
                        date: format(data.sortDate, 'yyyy-MM-dd'),
                        dateLabel: data.label,
                        total: Math.round(data.total * 100) / 100,
                    };

                    // Ensure ALL categories that exist in the period are present in EVERY point
                    // This prevents gaps in the BarChart
                    catNamesSet.forEach(catName => {
                        const amount = data.categories.get(catName) || 0;
                        point[catName] = Math.round(amount * 100) / 100;
                    });

                    return point;
                });

            setChartData(chart);

            // ─── Build category summary ───
            const catMap = new Map<string, { icon: string; amount: number; count: number }>();
            formatted.forEach((t) => {
                const existing = catMap.get(t.category_name);
                if (existing) {
                    existing.amount += t.amount_base;
                    existing.count += 1;
                } else {
                    catMap.set(t.category_name, {
                        icon: t.category_icon,
                        amount: t.amount_base,
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
    }, [userId, filters.dateFrom, filters.dateTo, filters.categoryIds, filters.amountMin, filters.amountMax]);

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
