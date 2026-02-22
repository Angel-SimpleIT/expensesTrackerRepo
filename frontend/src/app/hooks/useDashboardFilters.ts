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
            // startOfDay(now) usa la medianoche local del navegador
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

    // Compute filters directly from URL on every render
    const filters = useMemo<DashboardFilters>(() => {
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
    }, [searchParams]);

    const updateFilters = useCallback((newParams: Partial<Record<string, string | null>>) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            Object.entries(newParams).forEach(([key, value]) => {
                if (value === null) {
                    next.delete(key);
                } else if (value !== undefined) {
                    next.set(key, value);
                }
            });
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    const setDateRange = useCallback((preset: DateRangePreset) => {
        const params: Record<string, string | null> = {
            range: preset,
            from: null,
            to: null,
        };
        updateFilters(params);
    }, [updateFilters]);

    const setCustomDates = useCallback((from: Date, to: Date) => {
        updateFilters({
            range: 'custom',
            from: format(from, 'yyyy-MM-dd'),
            to: format(to, 'yyyy-MM-dd'),
        });
    }, [updateFilters]);

    const setCategoryIds = useCallback((ids: string[]) => {
        updateFilters({
            categories: ids.length > 0 ? ids.join(',') : null,
        });
    }, [updateFilters]);

    const toggleCategory = useCallback((id: string) => {
        const currentIds = filters.categoryIds;
        const exists = currentIds.includes(id);
        const nextIds = exists
            ? currentIds.filter((c) => c !== id)
            : [...currentIds, id];

        updateFilters({
            categories: nextIds.length > 0 ? nextIds.join(',') : null,
        });
    }, [filters.categoryIds, updateFilters]);

    const setAmountRange = useCallback((min: number, max: number) => {
        updateFilters({
            amountMin: min > 0 ? String(min) : null,
            amountMax: max < DEFAULT_AMOUNT_MAX ? String(max) : null,
        });
    }, [updateFilters]);

    const clearFilters = useCallback(() => {
        setSearchParams(new URLSearchParams(), { replace: true });
    }, [setSearchParams]);

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
