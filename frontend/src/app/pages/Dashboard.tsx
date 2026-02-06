import { useState } from "react";
import { Link } from "react-router";
import { 
  Radio, 
  Coffee, 
  ShoppingBag, 
  Home, 
  Car, 
  Utensils,
  Smartphone,
  Heart,
  Plus,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Zap,
  Calendar,
  Clock
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { AddTransactionDrawer } from "../components/AddTransactionDrawer";

const cashFlowData = [
  { day: "Lun", gastos: 45, presupuesto: 60 },
  { day: "Mar", gastos: 52, presupuesto: 60 },
  { day: "Mié", gastos: 38, presupuesto: 60 },
  { day: "Jue", gastos: 65, presupuesto: 60 },
  { day: "Vie", gastos: 48, presupuesto: 60 },
  { day: "Sáb", gastos: 72, presupuesto: 80 },
  { day: "Dom", gastos: 55, presupuesto: 80 },
];

const categorySpending = [
  { id: "food", name: "Alimentación", amount: 285.40, percentage: 32, icon: "utensils", color: "#EF4444" },
  { id: "transport", name: "Transporte", amount: 156.20, percentage: 18, icon: "car", color: "#3B82F6" },
  { id: "shopping", name: "Compras", amount: 198.50, percentage: 22, icon: "shopping", color: "#8B5CF6" },
  { id: "home", name: "Hogar", amount: 124.80, percentage: 14, icon: "home", color: "#06B6D4" },
  { id: "coffee", name: "Café", amount: 45.30, percentage: 5, icon: "coffee", color: "#F59E0B" },
  { id: "entertainment", name: "Ocio", amount: 78.90, percentage: 9, icon: "smartphone", color: "#10B981" },
];

const getIcon = (iconName: string) => {
  const icons: Record<string, any> = {
    coffee: Coffee,
    shopping: ShoppingBag,
    car: Car,
    utensils: Utensils,
    phone: Smartphone,
    home: Home,
    health: Heart,
  };
  return icons[iconName] || Coffee;
};

export function Dashboard() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  const availableToday = 1847.50;
  const projectedEndMonth = 2345.80;
  const potentialSavings = 423.60;

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#4F46E5] rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold text-sm">S</span>
              </div>
              <h1 className="text-lg font-semibold text-[#09090b]">SmartSpend</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-2 bg-[#F9FAFB] rounded-lg">
              <Radio className="w-4 h-4 text-[#4F46E5]" />
              <span className="text-sm text-[#6B7280]">Bot activo</span>
              <span className="w-2 h-2 bg-[#10B981] rounded-full animate-pulse" />
            </div>
            <Link 
              to="/analytics"
              className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] hover:text-[#09090b] transition-colors"
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-[#09090b] mb-2">Bienvenido, Santi</h2>
          <p className="text-base text-[#6B7280]">Aquí tienes tu panorama financiero de la semana</p>
        </div>

        {/* Hero Section - Cash Flow Chart */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-[#09090b] mb-1">Flujo de Caja Semanal</h3>
                <p className="text-sm text-[#6B7280]">Gastos vs Presupuesto</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#F43F5E]" />
                  <span className="text-sm text-[#6B7280]">Gastos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-[#4F46E5]" />
                  <span className="text-sm text-[#6B7280]">Presupuesto</span>
                </div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={cashFlowData}>
                <defs>
                  <linearGradient id="colorGastos" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPresupuesto" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
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
                  stroke="#4F46E5" 
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
          </div>
        </div>

        {/* Metric Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Available Today */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#10B981]/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-[#10B981]" />
              </div>
              <span className="px-2 py-1 bg-[#10B981]/10 text-[#10B981] text-xs font-medium rounded-full">
                Saludable
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-2">Disponible hoy</p>
            <p className="text-4xl font-bold text-[#09090b]">€{availableToday.toFixed(2)}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[#10B981]">
              <TrendingUp className="w-4 h-4" />
              <span>+12.5% vs semana pasada</span>
            </div>
          </div>

          {/* Projected End Month */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#4F46E5]/10 flex items-center justify-center">
                <Calendar className="w-6 h-6 text-[#4F46E5]" />
              </div>
              <span className="px-2 py-1 bg-[#4F46E5]/10 text-[#4F46E5] text-xs font-medium rounded-full">
                Proyección
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-2">Gasto proyectado fin de mes</p>
            <p className="text-4xl font-bold text-[#09090b]">€{projectedEndMonth.toFixed(2)}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[#6B7280]">
              <span>Quedan 22 días</span>
            </div>
          </div>

          {/* Potential Savings */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center">
                <Zap className="w-6 h-6 text-[#F59E0B]" />
              </div>
              <span className="px-2 py-1 bg-[#F59E0B]/10 text-[#F59E0B] text-xs font-medium rounded-full">
                Oportunidad
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-2">Ahorro potencial</p>
            <p className="text-4xl font-bold text-[#09090b]">€{potentialSavings.toFixed(2)}</p>
            <div className="mt-4 flex items-center gap-1 text-sm text-[#6B7280]">
              <span>Con pequeños ajustes</span>
            </div>
          </div>
        </div>

        {/* Categories Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-[#09090b] mb-1">Gasto por Categoría</h3>
              <p className="text-sm text-[#6B7280]">Análisis de este mes</p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categorySpending.map((category) => {
              const IconComponent = getIcon(category.icon);
              return (
                <div 
                  key={category.id}
                  className="bg-white rounded-2xl border border-[#E5E7EB] p-5 shadow-sm hover:shadow-md transition-all cursor-pointer group"
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
                    <p className="text-xs text-[#6B7280] mb-2">{category.name}</p>
                    
                    {/* Amount - Large and prominent */}
                    <p className="text-xl font-bold text-[#09090b] mb-1">
                      €{category.amount.toFixed(0)}
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
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsDrawerOpen(true)}
            className="flex-1 bg-[#4F46E5] text-white rounded-2xl px-6 py-4 shadow-sm hover:bg-[#4338CA] hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-semibold">Añadir gasto</span>
          </button>
          <Link 
            to="/history"
            className="px-6 py-4 bg-white border border-[#E5E7EB] text-[#09090b] rounded-2xl shadow-sm hover:bg-[#F9FAFB] hover:shadow-md transition-all flex items-center justify-center gap-2"
          >
            <Clock className="w-5 h-5" />
            <span className="font-semibold">Ver historial</span>
          </Link>
        </div>
      </main>

      {/* Add Transaction Drawer */}
      <AddTransactionDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </div>
  );
}