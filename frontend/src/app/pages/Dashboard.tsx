import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import {
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Smartphone,
  Heart,
  Plus,
  Clock,
  Plane,
  Film,
  Circle,
  Loader2,
  Check,
  CalendarDays,
  ChevronDown,
  X,
  SlidersHorizontal,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { AddTransactionDrawer } from "../components/AddTransactionDrawer";
import { useAuth } from "../contexts/AuthContext";
import { useDashboardFilters, type DateRangePreset } from "../hooks/useDashboardFilters";
import { useDashboardData, type CategorySummary } from "../hooks/useDashboardData";
import { useCategories } from "../hooks/useData";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Slider } from "../components/ui/slider";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";

// ─── Icon Resolver ───
const ICON_MAP: Record<string, any> = {
  coffee: Coffee,
  "shopping-bag": ShoppingBag,
  car: Car,
  utensils: Utensils,
  smartphone: Smartphone,
  home: Home,
  heart: Heart,
  plane: Plane,
  film: Film,
  circle: Circle,
};
const getIcon = (name: string) => ICON_MAP[name] || Circle;

// ─── Date range presets ───
const DATE_PRESETS: { value: DateRangePreset; label: string }[] = [
  { value: "today", label: "Hoy" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "custom", label: "Personalizado" },
];

// ─── Custom Tooltip for the Chart ───
function ChartTooltipContent({ active, payload, label, hoveredCategory }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;

  // Extract categories for breakdown
  const categories = Object.keys(data)
    .filter(key => key !== 'date' && key !== 'dateLabel' && key !== 'total' && typeof data[key] === 'number' && data[key] > 0)
    .map(key => ({ name: key, amount: data[key] }))
    .sort((a, b) => b.amount - a.amount);

  // If we are hovering a specific category (focus mode), only show that one.
  const isFocusMode = hoveredCategory && hoveredCategory !== 'total';
  const activeItem = isFocusMode
    ? payload.find((p: any) => p.dataKey === hoveredCategory)
    : null;

  return (
    <div
      className="bg-white border border-[#E5E7EB] rounded-lg p-3 shadow-lg"
      style={{ minWidth: 180, fontFamily: "'Inter', sans-serif" }}
    >
      <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold mb-2">
        {label}
      </p>

      {isFocusMode && activeItem ? (
        <div className="flex flex-col">
          <span className="text-xs text-[#6B7280] mb-0.5">{activeItem.name}</span>
          <span className="text-lg font-medium text-[#111827]">
            ${Number(activeItem.value).toLocaleString("es-AR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          <div className="pb-2 border-b border-[#F3F4F6]">
            <span className="text-xs text-[#6B7280] block mb-0.5">Total Gastado</span>
            <span className="text-lg font-bold text-[#111827]">
              ${data.total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="space-y-1.5 pt-1">
            {categories.map((cat, i) => (
              <div key={i} className="flex items-center justify-between gap-4">
                <span className="text-[11px] text-[#4B5563] truncate">{cat.name}</span>
                <span className="text-[11px] font-medium text-[#111827] shrink-0">
                  ${cat.amount.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Category Multi Select Dropdown ───
function CategoryDropdown({
  categories,
  selectedIds,
  onToggle,
}: {
  categories: { id: string; name: string; icon: string | null }[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const label =
    selectedIds.length === 0
      ? "Categorías"
      : selectedIds.length === 1
        ? categories.find((c) => c.id === selectedIds[0])?.name || "1 categoría"
        : `${selectedIds.length} categorías`;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all border ${selectedIds.length > 0
          ? "bg-[var(--primary-main)] text-white border-[var(--primary-main)]"
          : "bg-white text-[var(--neutral-700)] border-[var(--neutral-200)] hover:border-[var(--neutral-300)]"
          }`}
      >
        {label}
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-[var(--neutral-200)] rounded-[var(--radius-md)] shadow-[var(--shadow-float)] z-50 py-1 max-h-64 overflow-y-auto">
          {categories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            const Icon = getIcon(cat.icon || "circle");
            return (
              <button
                key={cat.id}
                onClick={() => onToggle(cat.id)}
                className="flex items-center gap-3 w-full px-3 py-2.5 hover:bg-[var(--neutral-50)] transition-colors text-left"
              >
                <div
                  className={`w-5 h-5 rounded flex items-center justify-center text-white text-xs transition-all ${isSelected ? "bg-[var(--primary-main)]" : "border border-[var(--neutral-300)]"
                    }`}
                >
                  {isSelected && <Check className="w-3 h-3" />}
                </div>
                <Icon className="w-4 h-4 text-[var(--neutral-500)]" />
                <span className="text-sm text-[var(--neutral-700)]">{cat.name}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Category Chip (compact icon) ───
function CategoryChip({ item }: { item: CategorySummary }) {
  const Icon = getIcon(item.icon);
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-[72px] max-w-[140px] py-3 px-2 rounded-[var(--radius-md)] hover:bg-[var(--neutral-50)] transition-colors cursor-default group">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
        style={{ backgroundColor: `${item.color}15` }}
      >
        <Icon className="w-5 h-5" style={{ color: item.color }} />
      </div>
      <span className="text-[11px] font-medium text-[var(--neutral-600)] text-center leading-tight truncate max-w-[80px]">
        {item.name}
      </span>
      <span className="text-[11px] font-semibold text-[var(--neutral-900)]">
        ${item.amount.toLocaleString("es-AR", { minimumFractionDigits: 0 })}
      </span>
      <span className="text-[10px] text-[var(--neutral-400)]">
        {item.percentage}%
      </span>
    </div>
  );
}

// ═══════════════════════════════════════
// ─── MAIN DASHBOARD ───
// ═══════════════════════════════════════
export function Dashboard() {
  const { profile } = useAuth();
  const { categories } = useCategories();
  const {
    filters,
    setDateRange,
    setCustomDates,
    toggleCategory,
    setAmountRange,
    clearFilters,
    DEFAULT_AMOUNT_MAX,
  } = useDashboardFilters();
  const { categorySummary, chartData, totalSpend, loading, refresh } =
    useDashboardData(filters);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [showAmountSlider, setShowAmountSlider] = useState(false);
  const [viewMode, setViewMode] = useState<'total' | 'breakdown'>('total');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);

  // Custom date picker state
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const homeCurrency = profile?.home_currency || "USD";

  const hasActiveFilters =
    filters.categoryIds.length > 0 ||
    filters.amountMin > 0 ||
    filters.amountMax < DEFAULT_AMOUNT_MAX;

  // ─── Loading state ───
  if (loading && categorySummary.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-main)] mx-auto mb-4" />
          <p className="text-[var(--neutral-500)]">Cargando tus finanzas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-8 sm:py-8">
        {/* ─── Welcome + Total ─── */}
        <div className="mb-6">
          <h2 className="text-[var(--font-h2-size)] font-bold text-[var(--neutral-900)] mb-1">
            Bienvenido, {profile?.name || "Usuario"}
          </h2>
          <p className="text-[var(--font-body-size)] text-[var(--neutral-500)]">
            Gastos del período:{" "}
            <span className="font-semibold text-[var(--neutral-900)]">
              ${totalSpend.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[var(--font-caption-size)] text-[var(--neutral-400)] ml-1">
              {homeCurrency}
            </span>
          </p>
        </div>

        {/* ─── Filter Toolbar ─── */}
        <Card className="p-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Date range pills */}
            <div className="flex items-center gap-1 bg-[var(--neutral-100)] rounded-[var(--radius-sm)] p-1">
              {DATE_PRESETS.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => {
                    if (preset.value === "custom") {
                      setShowDatePicker(true);
                    } else {
                      setShowDatePicker(false);
                      setDateRange(preset.value);
                    }
                  }}
                  className={`px-3 py-1.5 rounded-[6px] text-sm font-medium transition-all ${filters.dateRange === preset.value
                    ? "bg-[var(--primary-main)] text-white shadow-sm"
                    : "text-[var(--neutral-600)] hover:text-[var(--neutral-900)]"
                    }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom date inputs */}
            {showDatePicker && (
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[var(--neutral-400)]" />
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="text-sm border border-[var(--neutral-200)] rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--neutral-700)] bg-white"
                  />
                  <span className="text-[var(--neutral-400)] text-sm">→</span>
                  <input
                    type="date"
                    value={customTo}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="text-sm border border-[var(--neutral-200)] rounded-[var(--radius-sm)] px-2 py-1.5 text-[var(--neutral-700)] bg-white"
                  />
                </div>
                <button
                  onClick={() => {
                    if (customFrom && customTo) {
                      const fromDate = new Date(customFrom);
                      const toDate = new Date(customTo);

                      const diffInYears = (toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24 * 365);

                      if (diffInYears > 5) {
                        alert("El rango de fechas no puede superar los 5 años.");
                        return;
                      }

                      setCustomDates(fromDate, toDate);
                    }
                  }}
                  className="text-sm font-medium text-[var(--primary-main)] hover:underline"
                >
                  Aplicar
                </button>
              </div>
            )}

            {/* Divider */}
            <div className="w-px h-6 bg-[var(--neutral-200)] hidden sm:block" />

            {/* Category multi-select */}
            <CategoryDropdown
              categories={categories}
              selectedIds={filters.categoryIds}
              onToggle={toggleCategory}
            />

            {/* Amount slider toggle */}
            <button
              onClick={() => setShowAmountSlider(!showAmountSlider)}
              className={`flex items-center gap-2 px-3 py-2 rounded-[var(--radius-sm)] text-sm font-medium transition-all border ${showAmountSlider || filters.amountMin > 0 || filters.amountMax < DEFAULT_AMOUNT_MAX
                ? "bg-[var(--primary-main)] text-white border-[var(--primary-main)]"
                : "bg-white text-[var(--neutral-700)] border-[var(--neutral-200)] hover:border-[var(--neutral-300)]"
                }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Monto
            </button>

            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 px-2 py-1.5 text-sm text-[var(--error-text)] hover:bg-[var(--error-bg)] rounded-[var(--radius-sm)] transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Limpiar
              </button>
            )}
          </div>

          {/* Amount range slider */}
          {showAmountSlider && (
            <div className="mt-4 pt-4 border-t border-[var(--neutral-100)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-[var(--neutral-500)]">Rango de monto</span>
                <span className="text-sm font-medium text-[var(--neutral-700)]">
                  ${filters.amountMin} – ${filters.amountMax < DEFAULT_AMOUNT_MAX ? filters.amountMax : "∞"}
                </span>
              </div>
              <Slider
                value={[filters.amountMin, Math.min(filters.amountMax, 5000)]}
                min={0}
                max={5000}
                step={50}
                onValueChange={([min, max]: number[]) =>
                  setAmountRange(min, max >= 5000 ? DEFAULT_AMOUNT_MAX : max)
                }
                className="w-full"
              />
              <div className="flex justify-between mt-1">
                <span className="text-xs text-[var(--neutral-400)]">$0</span>
                <span className="text-xs text-[var(--neutral-400)]">$5.000+</span>
              </div>
            </div>
          )}
        </Card>

        {/* ─── Area Chart ─── */}
        <Card className="p-4 sm:p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-semibold text-[var(--neutral-900)]">
                Evolución de Gastos
              </h3>
              <p className="text-sm text-[var(--neutral-500)]">
                {format(filters.dateFrom, "d MMM", { locale: es })} –{" "}
                {format(filters.dateTo, "d MMM yyyy", { locale: es })}
              </p>
            </div>
            <div className="flex items-center space-x-2 bg-[var(--neutral-50)] p-1.5 rounded-lg border border-[var(--neutral-100)]">
              <Label htmlFor="view-mode" className="text-xs font-medium text-[var(--neutral-500)]">
                Ver Desglose
              </Label>
              <Switch
                id="view-mode"
                checked={viewMode === 'breakdown'}
                onCheckedChange={(checked) => setViewMode(checked ? 'breakdown' : 'total')}
              />
            </div>
          </div>

          {chartData.length === 0 ? (
            <div className="h-[200px] sm:h-[280px] flex items-center justify-center text-[var(--neutral-400)]">
              No hay datos para el rango seleccionado
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={280} className="!h-[200px] sm:!h-[280px]">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--neutral-200)"
                  vertical={false}
                />
                <XAxis
                  dataKey="dateLabel"
                  stroke="var(--neutral-400)"
                  style={{ fontSize: "12px" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="var(--neutral-400)"
                  style={{ fontSize: "12px" }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) => `$${v.toLocaleString('es-AR')}`}
                  width={85}
                />
                <RechartsTooltip
                  content={<ChartTooltipContent hoveredCategory={hoveredCategory} />}
                  cursor={{ fill: 'var(--neutral-100)', opacity: 0.4 }}
                />

                {viewMode === 'total' ? (
                  <Bar
                    dataKey="total"
                    fill="var(--primary-main)"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={45}
                    onMouseEnter={() => setHoveredCategory('total')}
                    onMouseLeave={() => setHoveredCategory(null)}
                  />
                ) : (
                  categorySummary.map((cat, i) => (
                    <Bar
                      key={cat.name}
                      dataKey={cat.name}
                      stackId="a"
                      fill={cat.color}
                      radius={i === categorySummary.length - 1 ? [6, 6, 0, 0] : [0, 0, 0, 0]}
                      maxBarSize={45}
                      opacity={!hoveredCategory || hoveredCategory === cat.name ? 1 : 0.4}
                      onMouseEnter={() => setHoveredCategory(cat.name)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  ))
                )}
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* ─── Category Summary ─── */}
        <Card className="p-4 sm:p-6 mb-6">
          <h3 className="text-lg font-semibold text-[var(--neutral-900)] mb-3">
            Resumen por Categoría
          </h3>

          {categorySummary.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-[var(--neutral-400)]">
                No hay transacciones en este rango
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap justify-evenly gap-2">
              {categorySummary.map((item) => (
                <CategoryChip key={item.name} item={item} />
              ))}
            </div>
          )}
        </Card>

        {/* ─── Quick Actions ─── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <Button
            onClick={() => setIsDrawerOpen(true)}
            size="lg"
            className="flex-1 py-7 text-lg rounded-[16px]"
            leftIcon={<Plus className="w-5 h-5" />}
          >
            Añadir gasto
          </Button>
          <Button
            variant="secondary"
            asChild
            className="px-6 py-7 rounded-[16px] text-[#09090b] bg-white border border-[#E5E7EB] hover:bg-[#F9FAFB] shadow-sm"
          >
            <Link to="/history">
              <Clock className="w-5 h-5 mr-2" />
              <span className="font-semibold">Ver historial</span>
            </Link>
          </Button>
        </div>
      </main>

      {/* Add Transaction Drawer */}
      <AddTransactionDrawer
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false);
          refresh();
        }}
        categories={categories}
      />
    </div>
  );
}