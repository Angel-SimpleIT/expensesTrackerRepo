import { Link } from "react-router";
import { 
  ArrowLeft, 
  Users, 
  TrendingUp, 
  DollarSign, 
  Shield,
  Download,
  Calendar,
  ChevronDown
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const spendingData = [
  { month: "Ene", value: 45000 },
  { month: "Feb", value: 52000 },
  { month: "Mar", value: 48000 },
  { month: "Abr", value: 61000 },
  { month: "May", value: 55000 },
  { month: "Jun", value: 67000 },
];

const categoryData = [
  { category: "Alimentación", amount: 18500, users: 245 },
  { category: "Transporte", amount: 12300, users: 189 },
  { category: "Entretenimiento", amount: 9800, users: 156 },
  { category: "Compras", amount: 15600, users: 201 },
  { category: "Salud", amount: 7200, users: 98 },
];

const recentUsers = [
  { id: "U-8491", status: "active", transactions: 234, spending: 4521 },
  { id: "U-7823", status: "active", transactions: 189, spending: 3876 },
  { id: "U-9012", status: "inactive", transactions: 56, spending: 1203 },
  { id: "U-6745", status: "active", transactions: 312, spending: 5643 },
  { id: "U-5234", status: "active", transactions: 198, spending: 4102 },
];

export function Analytics() {
  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[#09090b] mb-2">Dashboard B2B</h2>
            <p className="text-sm text-[#6B7280]">Vista general de análisis empresarial</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-[#6B7280] bg-white border border-[#E5E7EB] rounded-lg hover:bg-[#F9FAFB] transition-colors">
              <Calendar className="w-4 h-4" />
              <span>Últimos 30 días</span>
              <ChevronDown className="w-4 h-4" />
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm text-white bg-[#4F46E5] rounded-lg hover:bg-[#4338CA] transition-colors">
              <Download className="w-4 h-4" />
              <span>Exportar</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/10 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#4F46E5]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                +12.5%
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-1">Usuarios Activos</p>
            <p className="text-3xl font-bold text-[#09090b]">2,847</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#10B981]/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#10B981]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                +8.2%
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-1">Transacciones</p>
            <p className="text-3xl font-bold text-[#09090b]">45.2K</p>
          </div>

          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-lg bg-[#F59E0B]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <span className="text-xs font-medium text-[#10B981] bg-[#10B981]/10 px-2 py-1 rounded-full">
                +15.3%
              </span>
            </div>
            <p className="text-sm text-[#6B7280] mb-1">Volumen Total</p>
            <p className="text-3xl font-bold text-[#09090b]">€289K</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Spending Trend Chart */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-[#09090b] mb-1">Tendencia de Gastos</h3>
                <p className="text-sm text-[#6B7280]">Últimos 6 meses</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#6B7280]" />
                <span className="text-xs text-[#6B7280]">Datos anonimizados</span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={spendingData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="month" 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#4F46E5" 
                  strokeWidth={2}
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Category Distribution */}
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-[#09090b] mb-1">Categorías Principales</h3>
            <p className="text-sm text-[#6B7280] mb-6">Distribución por categoría</p>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={categoryData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="category" 
                  stroke="#6B7280"
                  style={{ fontSize: '11px' }}
                />
                <YAxis 
                  stroke="#6B7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                  }}
                />
                <Bar dataKey="amount" fill="#4F46E5" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* User Activity Table */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#E5E7EB]">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-[#09090b] mb-1">Actividad de Usuarios</h3>
                <p className="text-sm text-[#6B7280]">Usuarios más activos del mes</p>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-[#6B7280]" />
                <span className="text-xs text-[#6B7280]">IDs anonimizados</span>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#F9FAFB]">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    ID Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Transacciones
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-[#6B7280] uppercase tracking-wider">
                    Gasto Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {recentUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-[#F9FAFB] transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-[#09090b]">{user.id}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.status === "active" 
                            ? "bg-[#10B981]/10 text-[#10B981]" 
                            : "bg-[#6B7280]/10 text-[#6B7280]"
                        }`}
                      >
                        {user.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-[#6B7280]">
                      {user.transactions}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[#09090b]">
                      €{user.spending.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}