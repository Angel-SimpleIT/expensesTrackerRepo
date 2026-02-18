import { useState, useCallback, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router';
import { subDays, startOfDay, endOfDay, format, parseISO } from 'date-fns';

export type DateRangePreset = 'today' | '7d' | '30d' | 'custom';

export interface DashboardFilters {
    dateRange: DateRangePreset;
    dateFrom: Date;
    dateTo: Date;
    categoryIds: string[];
    amountMin: number;
    amountMax: number;
}

const DEFAULT_AMOUNT_MAX = 100000;

function getPresetDates(preset: DateRangePreset): { from: Date; to: Date } {
    const now = new Date();
    switch (preset) {
        case 'today':
            return { from: startOfDay(now), to: endOfDay(now) };
        case '7d':
            return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
        case '30d':
            return { from: startOfDay(subDays(now, 29)), to: endOfDay(now) };
        case 'custom':
            return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
        default:
            return { from: startOfDay(subDays(now, 6)), to: endOfDay(now) };
    }
}

export function useDashboardFilters() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Parse initial state from URL
    const initialFilters = useMemo<DashboardFilters>(() => {
        const range = (searchParams.get('range') as DateRangePreset) || '7d';
        const customFrom = searchParams.get('from');
        const customTo = searchParams.get('to');
        const cats = searchParams.get('categories');
        const minAmt = searchParams.get('amountMin');
        const maxAmt = searchParams.get('amountMax');

        const presetDates = getPresetDates(range);

        return {
            dateRange: range,
            dateFrom: customFrom ? parseISO(customFrom) : presetDates.from,
            dateTo: customTo ? parseISO(customTo) : presetDates.to,
            categoryIds: cats ? cats.split(',').filter(Boolean) : [],
            amountMin: minAmt ? parseFloat(minAmt) : 0,
            amountMax: maxAmt ? parseFloat(maxAmt) : DEFAULT_AMOUNT_MAX,
        };
    }, []); // only run once on mount

    const [filters, setFiltersState] = useState<DashboardFilters>(initialFilters);

    // Sync filters → URL (debounced via useEffect)
    useEffect(() => {
        const params = new URLSearchParams();
        params.set('range', filters.dateRange);

        if (filters.dateRange === 'custom') {
            params.set('from', format(filters.dateFrom, 'yyyy-MM-dd'));
            params.set('to', format(filters.dateTo, 'yyyy-MM-dd'));
        }

        if (filters.categoryIds.length > 0) {
            params.set('categories', filters.categoryIds.join(','));
        }

        if (filters.amountMin > 0) {
            params.set('amountMin', String(filters.amountMin));
        }

        if (filters.amountMax < DEFAULT_AMOUNT_MAX) {
            params.set('amountMax', String(filters.amountMax));
        }

        setSearchParams(params, { replace: true });
    }, [filters, setSearchParams]);

    const setDateRange = useCallback((preset: DateRangePreset) => {
        const dates = getPresetDates(preset);
        setFiltersState((prev) => ({
            ...prev,
            dateRange: preset,
            dateFrom: dates.from,
            dateTo: dates.to,
        }));
    }, []);

    const setCustomDates = useCallback((from: Date, to: Date) => {
        setFiltersState((prev) => ({
            ...prev,
            dateRange: 'custom' as DateRangePreset,
            dateFrom: startOfDay(from),
            dateTo: endOfDay(to),
        }));
    }, []);

    const setCategoryIds = useCallback((ids: string[]) => {
        setFiltersState((prev) => ({ ...prev, categoryIds: ids }));
    }, []);

    const toggleCategory = useCallback((id: string) => {
        setFiltersState((prev) => {
            const exists = prev.categoryIds.includes(id);
            return {
                ...prev,
                categoryIds: exists
                    ? prev.categoryIds.filter((c) => c !== id)
                    : [...prev.categoryIds, id],
            };
        });
    }, []);

    const setAmountRange = useCallback((min: number, max: number) => {
        setFiltersState((prev) => ({ ...prev, amountMin: min, amountMax: max }));
    }, []);

    const clearFilters = useCallback(() => {
        const dates = getPresetDates('7d');
        setFiltersState({
            dateRange: '7d',
            dateFrom: dates.from,
            dateTo: dates.to,
            categoryIds: [],
            amountMin: 0,
            amountMax: DEFAULT_AMOUNT_MAX,
        });
    }, []);

    return {
        filters,
        setDateRange,
        setCustomDates,
        setCategoryIds,
        toggleCategory,
        setAmountRange,
        clearFilters,
        DEFAULT_AMOUNT_MAX,
    };
}
