import { useState } from "react";
import { Link } from "react-router";
import { 
  ArrowLeft,
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
  TrendingDown,
  TrendingUp
} from "lucide-react";
import { EditTransactionModal } from "../components/EditTransactionModal";

interface Transaction {
  id: string;
  merchant: string;
  merchantInitial: string;
  category: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  type: "income" | "expense";
  originalText: string;
  date: string;
  timestamp: string;
}

const mockTransactions: Transaction[] = [
  {
    id: "1",
    merchant: "Starbucks",
    merchantInitial: "S",
    category: "Café",
    categoryIcon: "coffee",
    categoryColor: "#F59E0B",
    amount: 4.50,
    type: "expense",
    originalText: "4.50 en cafe",
    date: "2026-02-06",
    timestamp: "Hoy, 10:30",
  },
  {
    id: "2",
    merchant: "Amazon",
    merchantInitial: "A",
    category: "Compras",
    categoryIcon: "shopping",
    categoryColor: "#8B5CF6",
    amount: 125.00,
    type: "expense",
    originalText: "125 amazon auriculares",
    date: "2026-02-05",
    timestamp: "Ayer, 15:20",
  },
  {
    id: "3",
    merchant: "Uber",
    merchantInitial: "U",
    category: "Transporte",
    categoryIcon: "car",
    categoryColor: "#3B82F6",
    amount: 12.30,
    type: "expense",
    originalText: "12.30 uber centro",
    date: "2026-02-05",
    timestamp: "Ayer, 09:15",
  },
  {
    id: "4",
    merchant: "La Tagliatella",
    merchantInitial: "T",
    category: "Restaurante",
    categoryIcon: "utensils",
    categoryColor: "#EF4444",
    amount: 56.80,
    type: "expense",
    originalText: "cena 56.80",
    date: "2026-02-04",
    timestamp: "4 Feb",
  },
  {
    id: "5",
    merchant: "Empresa SA",
    merchantInitial: "E",
    category: "Salario",
    categoryIcon: "trending-up",
    categoryColor: "#10B981",
    amount: 3200.00,
    type: "income",
    originalText: "salario febrero",
    date: "2026-02-01",
    timestamp: "1 Feb",
  },
  {
    id: "6",
    merchant: "Mercadona",
    merchantInitial: "M",
    category: "Compras",
    categoryIcon: "shopping",
    categoryColor: "#8B5CF6",
    amount: 45.60,
    type: "expense",
    originalText: "45 mercadona",
    date: "2026-01-31",
    timestamp: "31 Ene",
  },
  {
    id: "7",
    merchant: "Netflix",
    merchantInitial: "N",
    category: "Entretenimiento",
    categoryIcon: "film",
    categoryColor: "#F43F5E",
    amount: 15.99,
    type: "expense",
    originalText: "netflix mensual",
    date: "2026-01-30",
    timestamp: "30 Ene",
  },
  {
    id: "8",
    merchant: "Vodafone",
    merchantInitial: "V",
    category: "Teléfono",
    categoryIcon: "phone",
    categoryColor: "#10B981",
    amount: 35.00,
    type: "expense",
    originalText: "35 telefono",
    date: "2026-01-29",
    timestamp: "29 Ene",
  },
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
    plane: Plane,
    film: Film,
    "trending-up": TrendingUp,
    "trending-down": TrendingDown,
  };
  return icons[iconName] || Coffee;
};

export function History() {
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTransactions = mockTransactions.filter((transaction) => {
    const query = searchQuery.toLowerCase();
    return (
      transaction.merchant.toLowerCase().includes(query) ||
      transaction.category.toLowerCase().includes(query) ||
      transaction.originalText.toLowerCase().includes(query)
    );
  });

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
              <p className="text-[#6B7280]">No se encontraron transacciones</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {filteredTransactions.map((transaction) => {
                const IconComponent = getIcon(transaction.categoryIcon);
                return (
                  <button
                    key={transaction.id}
                    onClick={() => setSelectedTransaction(transaction)}
                    className="w-full p-5 hover:bg-[#F9FAFB] transition-colors text-left"
                  >
                    <div className="flex items-center gap-4">
                      {/* Merchant Logo */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center flex-shrink-0 shadow-sm">
                        <span className="text-white font-semibold text-lg">
                          {transaction.merchantInitial}
                        </span>
                      </div>

                      {/* Transaction Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-[#09090b]">
                            {transaction.merchant}
                          </p>
                          {/* Category Badge */}
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full" style={{ backgroundColor: `${transaction.categoryColor}15` }}>
                            <IconComponent 
                              className="w-3 h-3" 
                              style={{ color: transaction.categoryColor }}
                            />
                            <span className="text-xs font-medium" style={{ color: transaction.categoryColor }}>
                              {transaction.category}
                            </span>
                          </div>
                        </div>
                        <p className="text-sm text-[#6B7280] mb-1">
                          "{transaction.originalText}"
                        </p>
                        <p className="text-xs text-[#9CA3AF]">
                          {transaction.timestamp}
                        </p>
                      </div>

                      {/* Amount */}
                      <div className="text-right flex-shrink-0">
                        <p 
                          className="text-xl font-bold"
                          style={{ 
                            color: transaction.type === "income" ? "#10B981" : "#F43F5E" 
                          }}
                        >
                          {transaction.type === "income" ? "+" : "-"}€{transaction.amount.toFixed(2)}
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
              -€{mockTransactions
                .filter(t => t.type === "expense")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-sm">
            <p className="text-sm text-[#6B7280] mb-2">Total Ingresos</p>
            <p className="text-3xl font-bold text-[#10B981]">
              +€{mockTransactions
                .filter(t => t.type === "income")
                .reduce((sum, t) => sum + t.amount, 0)
                .toFixed(2)}
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