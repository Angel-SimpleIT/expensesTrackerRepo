import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Smartphone,
  Heart,
  Plane,
  Film,
  Circle,
  Loader2
} from "lucide-react";
import { EditTransactionModal } from "../components/EditTransactionModal";
import { useTransactions } from "../hooks/useData";

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

// Format date to relative or absolute string
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    return `Hoy, ${date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
  } else if (diffDays === 1) {
    return `Ayer, ${date.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString('es', { day: 'numeric', month: 'short' });
  }
};

export function History() {
  const { transactions, loading, error } = useTransactions();
  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter transactions based on search query
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;

    const query = searchQuery.toLowerCase();
    return transactions.filter((t) =>
      t.merchant_name?.toLowerCase().includes(query) ||
      t.category_name?.toLowerCase().includes(query) ||
      t.raw_text?.toLowerCase().includes(query)
    );
  }, [transactions, searchQuery]);

  // Calculate totals
  const totalExpenses = useMemo(() =>
    transactions.reduce((sum, t) => sum + t.amount_original, 0),
    [transactions]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5] mx-auto mb-4" />
          <p className="text-[#6B7280]">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[#F43F5E]">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-8 py-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#09090b] mb-1">Historial de Transacciones</h1>
          <p className="text-sm text-[#6B7280]">Revisa y edita tus movimientos</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Buscar por comercio, categoría o descripción..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-sm text-[#09090b] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-3 bg-white border border-[#E5E7EB] rounded-2xl text-sm text-[#6B7280] hover:bg-[#F9FAFB] transition-colors">
            <Filter className="w-4 h-4" />
            <span>Filtros</span>
          </button>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
          {filteredTransactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#6B7280]">
                {transactions.length === 0
                  ? "No tienes transacciones registradas"
                  : "No se encontraron transacciones"}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {filteredTransactions.map((transaction) => {
                const categoryColor = CATEGORY_COLORS[transaction.category_name || ''] || DEFAULT_COLOR;
                const IconComponent = getIcon(transaction.category_icon || 'circle');
                const merchantInitial = (transaction.merchant_name || 'X')[0].toUpperCase();

                return (
                  <button
                    key={transaction.id}
                    onClick={() => setSelectedTransaction({
                      id: transaction.id,
                      merchant: transaction.merchant_name || 'Sin comercio',
                      merchantInitial,
                      category: transaction.category_name || 'Sin categoría',
                      categoryIcon: transaction.category_icon || 'circle',
                      categoryColor,
                      amount: transaction.amount_original,
                      type: 'expense' as const,
                      originalText: transaction.raw_text || '',
                      date: transaction.created_at.split('T')[0],
                      timestamp: formatDate(transaction.created_at),
                    })}
                    className="w-full p-5 hover:bg-[#F9FAFB] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      {/* Merchant Logo */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-semibold text-lg">
                          {merchantInitial}
                        </span>
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-[#09090b]">
                            {transaction.merchant_name || 'Sin comercio'}
                          </p>
                          {/* Category Badge */}
                          <div
                            className="flex items-center gap-1 px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: `${categoryColor}15` }}
                          >
                            <IconComponent
                              className="w-3 h-3"
                              style={{ color: categoryColor }}
                            />
                            <span
                              className="text-xs font-medium"
                              style={{ color: categoryColor }}
                            >
                              {transaction.category_name || 'Sin categoría'}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[#6B7280] mb-1">
                          "{transaction.raw_text || 'Sin descripción'}"
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p className="text-xl font-bold text-[#F43F5E]">
                          -${transaction.amount_original.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Summary Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <p className="text-sm text-[#6B7280] mb-2">Total Gastos</p>
            <p className="text-3xl font-bold text-[#F43F5E]">
              -${totalExpenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <p className="text-sm text-[#6B7280] mb-2">Transacciones</p>
            <p className="text-3xl font-bold text-[#4F46E5]">
              {transactions.length}
            </p>
          </div>
        </div>
      </main>

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onSave={(updatedTransaction) => {
            console.log("Updated transaction:", updatedTransaction);
            setSelectedTransaction(null);
          }}
          onDelete={(id) => {
            console.log("Delete transaction:", id);
            setSelectedTransaction(null);
          }}
        />
      )}
    </div>
  );
}