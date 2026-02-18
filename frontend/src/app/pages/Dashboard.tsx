import { useState } from "react";
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
  TrendingUp,
  Zap,
  Calendar,
  Clock,
  Plane,
  Film,
  Circle,
  Loader2
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AddTransactionDrawer } from "../components/AddTransactionDrawer";
import { useAuth } from "../contexts/AuthContext";
import { useTransactions, useCategorySpending, useWeeklyCashFlow } from "../hooks/useData";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/card";

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
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
  return icons[iconName] || Circle;
};

export function Dashboard() {
  const { profile } = useAuth();
  const { transactions, loading: transactionsLoading, refresh: refreshTransactions } = useTransactions();
  const { categorySpending } = useCategorySpending();
  const { cashFlowData } = useWeeklyCashFlow();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Calculate metrics from real data
  const totalSpentThisMonth = transactions.reduce((sum, t) => sum + t.amount_original, 0);
  const availableToday = 2000 - (totalSpentThisMonth * 0.1); // Simplified calculation
  const projectedEndMonth = totalSpentThisMonth * 1.5;
  const potentialSavings = totalSpentThisMonth * 0.15;

  // Graceful loading for first-time data fetch
  if (transactionsLoading && transactions.length === 0) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mx-auto mb-4" />
          <p className="text-[#6B7280]">Cargando tus finanzas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-[var(--font-h2-size)] font-bold text-[var(--neutral-900)] mb-2">Bienvenido, {profile?.name || 'Usuario'}</h2>
          <p className="text-[var(--font-body-size)] text-[var(--neutral-500)]">Aquí tienes tu panorama financiero de la semana</p>
        </div>

        {/* Hero Section - Cash Flow Chart */}
        <div className="mb-8">
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-[var(--neutral-900)] mb-1">Flujo de Caja Semanal</h3>
                <p className="text-sm text-[var(--neutral-500)]">Gastos vs Presupuesto</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F43F5E]" />
                  <span className="text-sm text-[var(--neutral-500)]">Gastos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[var(--primary-main)]" />
                  <span className="text-sm text-[var(--neutral-500)]">Presupuesto</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorPresupuesto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary-main)" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="var(--primary-main)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#9CA3AF"
                  style={{ fontSize: '13px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke="#9CA3AF"
                  style={{ fontSize: '13px' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)',
                    padding: '12px'
                  }}
                  labelStyle={{ fontWeight: 600, color: '#09090b', marginBottom: '4px' }}
                />
                <Area
                  type="monotone"
                  dataKey="presupuesto"
                  stroke="var(--primary-main)"
                  strokeWidth={2}
                  fill="url(#colorPresupuesto)"
                />
                <Area
                  type="monotone"
                  dataKey="gastos"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  fill="url(#colorGastos)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Today */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#10B981]" />
              </div>
              <span className="px-2 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-medium rounded-full">
                Saludable
              </span>
            </div>
            <p className="text-sm text-[var(--neutral-500)] mb-2">Disponible hoy</p>
            <p className="text-4xl font-bold text-[var(--neutral-900)]">${availableToday.toFixed(2)}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[#10B981]">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% vs semana pasada</span>
            </div>
          </Card>

          {/* Projected End Month */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--primary-main)]/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[var(--primary-main)]" />
              </div>
              <span className="px-2 py-1 bg-[var(--primary-main)]/10 text-[var(--primary-main)] text-xs font-medium rounded-full">
                Proyección
              </span>
            </div>
            <p className="text-sm text-[var(--neutral-500)] mb-2">Gasto proyectado fin de mes</p>
            <p className="text-4xl font-bold text-[var(--neutral-900)]">${projectedEndMonth.toFixed(2)}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[var(--neutral-500)]">
              <span>Quedan 22 días</span>
            </div>
          </Card>

          {/* Potential Savings */}
          <Card className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <span className="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-full">
                Oportunidad
              </span>
            </div>
            <p className="text-sm text-[var(--neutral-500)] mb-2">Ahorro potencial</p>
            <p className="text-4xl font-bold text-[var(--neutral-900)]">${potentialSavings.toFixed(2)}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[var(--neutral-500)]">
              <span>Con pequeños ajustes</span>
            </div>
          </Card>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-[var(--neutral-900)] mb-1">Gasto por Categoría</h3>
              <p className="text-sm text-[var(--neutral-500)]">Análisis de este mes</p>
            </div>
          </div>

          {categorySpending.length === 0 ? (
            <Card className="p-12 text-center border-[var(--neutral-200)]">
              <p className="text-[var(--neutral-500)]">No hay gastos registrados aún</p>
            </Card>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categorySpending.map((category) => {
                const IconComponent = getIcon(category.icon);
                return (
                  <Card
                    key={category.id}
                    className="p-5 hover:shadow-md transition-all cursor-pointer group border-[var(--neutral-200)]"
                  >
                    <div className="flex flex-col items-center text-center">
                      {/* Icon with colored background */}
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${category.color}15` }}
                      >
                        <IconComponent
                          className="w-7 h-7"
                          style={{ color: category.color }}
                        />
                      </div>

                      {/* Category name */}
                      <p className="text-xs text-[var(--neutral-500)] mb-2">{category.name}</p>

                      {/* Amount - Large and prominent */}
                      <p className="text-xl font-bold text-[var(--neutral-900)] mb-1">
                        ${category.amount.toFixed(0)}
                      </p>

                      {/* Percentage */}
                      <div className="w-full bg-[#F3F4F6] rounded-full h-1.5 mb-2">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${category.percentage}%`,
                            backgroundColor: category.color
                          }}
                        />
                      </div>
                      <p className="text-xs font-medium" style={{ color: category.color }}>
                        {category.percentage}%
                      </p>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4">
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
          refreshTransactions();
        }}
      />
    </div>
  );
}