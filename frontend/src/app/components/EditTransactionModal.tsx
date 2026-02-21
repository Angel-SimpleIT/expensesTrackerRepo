import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Trash2,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Smartphone,
  Heart,
  Plane,
  Film,
  TrendingUp,
  TrendingDown,
  Calendar as CalendarIcon,
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "./ui/select";

interface Transaction {
  id: string;
  merchant: string;
  merchantInitial: string;
  category: string;
  category_id?: string;
  categoryIcon: string;
  categoryColor: string;
  amount: number;
  currency: string;
  type: "income" | "expense";
  originalText: string;
  date: string;
  timestamp: string;
}

interface Category {
  id: string;
  name: string;
  icon: string | null;
}

interface EditTransactionModalProps {
  transaction: Transaction;
  categories: Category[];
  onClose: () => void;
  onSave: (transaction: Transaction & { currency?: string }) => void;
  onDelete: (id: string) => void;
}

// Color palette for categories (fallback)
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

export function EditTransactionModal({ transaction, categories, onClose, onSave, onDelete }: EditTransactionModalProps) {
  const [amount, setAmount] = useState(transaction.amount.toString());
  const [selectedCurrency, setSelectedCurrency] = useState(transaction.currency || "USD");
  const [selectedCategoryId, setSelectedCategoryId] = useState(transaction.category_id || "");
  const [date, setDate] = useState(transaction.date);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
      TrendingUp: TrendingUp,
      TrendingDown: TrendingDown,
    };
    const icon = icons[iconName];
    return icon || Coffee;
  };

  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSave = () => {
    const selectedCategory = categories.find(c => c.id === selectedCategoryId);
    if (!amount) return;

    const updatedTransaction: Transaction & { currency: string } = {
      ...transaction,
      amount: parseFloat(amount),
      currency: selectedCurrency,
      category: selectedCategory?.name || transaction.category,
      category_id: selectedCategoryId,
      categoryIcon: selectedCategory?.icon || transaction.categoryIcon,
      categoryColor: selectedCategory ? (CATEGORY_COLORS[selectedCategory.name] || DEFAULT_COLOR) : transaction.categoryColor,
      date: date,
    };

    onSave(updatedTransaction);
  };

  const handleDelete = () => {
    onDelete(transaction.id);
  };

  return (
    <AnimatePresence>
      <>
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/20 z-40"
        />

        {/* Slide-over Panel */}
        <motion.div
          initial={{ x: "100%" }}
          animate={{ x: 0 }}
          exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 30, stiffness: 300 }}
          className="fixed right-0 top-0 bottom-0 w-full md:w-[480px] bg-white shadow-2xl z-50 overflow-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-[#E5E7EB] px-8 py-6 z-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-[#09090b]">Editar Transacción</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[#F9FAFB] transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>
            <div className="flex items-center gap-3 p-4 bg-[#F9FAFB] rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#4F46E5] to-[#6366F1] flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-white font-semibold text-lg">
                  {transaction.merchantInitial}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-[#09090b] mb-0.5">{transaction.merchant}</p>
                <p className="text-sm text-[#6B7280]">"{transaction.originalText}"</p>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-8 py-6">
            {/* Amount Field */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#09090b] mb-3">
                Monto
              </label>
              <div className="flex items-center gap-2">
                <Select
                  value={selectedCurrency}
                  onValueChange={setSelectedCurrency}
                >
                  <SelectTrigger className="w-auto h-auto p-3 pr-4 border border-[#E5E7EB] bg-[#F9FAFB] hover:bg-[#F3F4F6] focus:ring-0 rounded-2xl transition-all flex items-center gap-1.5 [&_svg]:hidden group">
                    <span className="text-xl font-bold text-[#4B5563]">
                      {selectedCurrency}
                    </span>
                    <ChevronDown className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors translate-y-0.5" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-[#E5E7EB] shadow-lg">
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                    <SelectItem value="PYG">PYG (Gs)</SelectItem>
                    <SelectItem value="UYU">UYU ($U)</SelectItem>
                    <SelectItem value="ARS">ARS ($)</SelectItem>
                    <SelectItem value="MXN">MXN ($)</SelectItem>
                  </SelectContent>
                </Select>
                <input
                  type="text"
                  inputMode="decimal"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="flex-1 px-5 py-4 text-2xl font-bold text-[#09090b] bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Selection */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#09090b] mb-3">
                Categoría
              </label>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const IconComponent = getIcon(category.icon || "circle");
                  const isSelected = selectedCategoryId === category.id;
                  const categoryColor = CATEGORY_COLORS[category.name] || DEFAULT_COLOR;

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategoryId(category.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${isSelected
                        ? "bg-[#4F46E5] border-[#4F46E5] shadow-md"
                        : "bg-white border-[#E5E7EB] hover:border-[#4F46E5]/30 hover:bg-[#F9FAFB]"
                        }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${isSelected ? "bg-white/20" : ""
                          }`}
                        style={{
                          backgroundColor: isSelected ? "transparent" : `${categoryColor}15`
                        }}
                      >
                        <IconComponent
                          className="w-5 h-5"
                          style={{ color: isSelected ? "#FFFFFF" : categoryColor }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium ${isSelected ? "text-white" : "text-[#6B7280]"
                          }`}
                      >
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Date Field */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-[#09090b] mb-3">
                Fecha
              </label>
              <div className="relative">
                <CalendarIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-14 pr-5 py-4 text-base text-[#09090b] bg-[#F9FAFB] border border-[#E5E7EB] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:border-transparent"
                />
              </div>
            </div>

            {/* Transaction Type Info */}
            <div className="mb-8 p-4 bg-[#F9FAFB] rounded-2xl border border-[#E5E7EB]">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[#6B7280]">Tipo de transacción</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${transaction.type === "income"
                    ? "bg-[#10B981]/10 text-[#10B981]"
                    : "bg-[#F43F5E]/10 text-[#F43F5E]"
                    }`}
                >
                  {transaction.type === "income" ? "Ingreso" : "Gasto"}
                </span>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-8 py-6">
            {/* Delete Confirmation */}
            <AnimatePresence>
              {showDeleteConfirm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 p-4 bg-[#FEF2F2] border border-[#FCA5A5] rounded-2xl"
                >
                  <p className="text-sm text-[#DC2626] font-medium mb-3">
                    ¿Estás seguro de que quieres eliminar esta transacción?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handleDelete}
                      className="flex-1 px-4 py-2 bg-[#DC2626] text-white rounded-xl font-medium hover:bg-[#B91C1C] transition-colors"
                    >
                      Sí, eliminar
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="flex-1 px-4 py-2 bg-white border border-[#E5E7EB] text-[#6B7280] rounded-xl font-medium hover:bg-[#F9FAFB] transition-colors"
                    >
                      Cancelar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex gap-3">
              {!showDeleteConfirm && (
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center justify-center gap-2 px-6 py-4 bg-white border border-[#E5E7EB] text-[#DC2626] rounded-2xl font-semibold hover:bg-[#FEF2F2] hover:border-[#FCA5A5] transition-all"
                >
                  <Trash2 className="w-5 h-5" />
                  <span>Eliminar</span>
                </button>
              )}
              <button
                onClick={handleSave}
                disabled={!amount}
                className={`flex-1 py-4 rounded-2xl font-semibold text-white transition-all ${amount
                  ? "bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm hover:shadow-md"
                  : "bg-[#E5E7EB] cursor-not-allowed"
                  }`}
              >
                Guardar Cambios
              </button>
            </div>
          </div>
        </motion.div>
      </>
    </AnimatePresence>
  );
}
