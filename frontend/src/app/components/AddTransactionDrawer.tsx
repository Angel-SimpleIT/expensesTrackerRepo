import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Coffee,
  ShoppingBag,
  Home,
  Car,
  Utensils,
  Smartphone,
  Heart,
  Plane,
  Film,
  Loader2,
  ChevronDown,
  Calendar,
  AlertCircle,
  Clock
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { Category } from "../hooks/useData";
import { getCurrencySymbol } from "../../utils/format";
import { fetchExchangeRates, convertCurrency } from "../../utils/currency";
import { format, subDays, isSameDay, startOfDay } from "date-fns";
import { es } from "date-fns/locale";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface AddTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
}

const iconMap: Record<string, any> = {
  coffee: Coffee,
  shopping: ShoppingBag,
  home: Home,
  transport: Car,
  food: Utensils,
  phone: Smartphone,
  health: Heart,
  travel: Plane,
  entertainment: Film,
  "shopping-bag": ShoppingBag,
  utensils: Utensils,
  car: Car,
  smartphone: Smartphone,
  heart: Heart,
  plane: Plane,
  film: Film,
};

const colorMap: Record<string, string> = {
  coffee: "#F59E0B",
  shopping: "#8B5CF6",
  "shopping-bag": "#8B5CF6",
  home: "#06B6D4",
  transport: "#3B82F6",
  car: "#3B82F6",
  food: "#EF4444",
  utensils: "#EF4444",
  phone: "#10B981",
  smartphone: "#10B981",
  health: "#F43F5E",
  heart: "#F43F5E",
  travel: "#EC4899",
  plane: "#EC4899",
  entertainment: "#F97316",
  film: "#F97316",
};

export function AddTransactionDrawer({ isOpen, onClose, categories }: AddTransactionDrawerProps) {
  const { user, profile } = useAuth();
  const { homeCurrency } = useCurrency();
  const [amount, setAmount] = useState("");
  const [selectedCurrency, setSelectedCurrency] = useState(homeCurrency);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [transactionDate, setTransactionDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Derive if it's a backdated transaction
  const isBackdated = transactionDate && !isSameDay(new Date(transactionDate + "T12:00:00"), new Date());

  const quickDates = [
    { label: "Hoy", date: new Date() },
    { label: "Ayer", date: subDays(new Date(), 1) },
    { label: format(subDays(new Date(), 2), "EEEE", { locale: es }), date: subDays(new Date(), 2) },
    { label: format(subDays(new Date(), 3), "EEEE", { locale: es }), date: subDays(new Date(), 3) },
  ];

  // Sync selectedCurrency with homeCurrency when profile loads
  useEffect(() => {
    if (homeCurrency) {
      setSelectedCurrency(homeCurrency);
    }
  }, [homeCurrency]);

  // Reset state when drawer opens
  useEffect(() => {
    if (isOpen) {
      setAmount("");
      setSelectedCategory(null);
      setSelectedCurrency(homeCurrency);
      setTransactionDate(format(new Date(), "yyyy-MM-dd"));
    }
  }, [isOpen, homeCurrency]);

  const handleAmountChange = (value: string) => {
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = async () => {
    if (!amount || !selectedCategory || !user) return;

    setIsSubmitting(true);
    try {
      const numAmount = parseFloat(amount);

      // Fetch rates and calculate base amount (home_currency) and USD amount
      const ratesData = await fetchExchangeRates();
      let amountBase = numAmount;
      let amountUsd = numAmount;

      if (ratesData) {
        if (selectedCurrency !== homeCurrency) {
          amountBase = convertCurrency(
            numAmount,
            selectedCurrency,
            homeCurrency,
            ratesData.rates
          );
        }

        if (selectedCurrency !== 'USD') {
          amountUsd = convertCurrency(
            numAmount,
            selectedCurrency,
            'USD',
            ratesData.rates
          );
        }
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount_original: numAmount,
          amount_base: amountBase,
          amount_usd: amountUsd,
          currency_original: selectedCurrency,
          category_id: selectedCategory,
          is_ai_confirmed: true,
          // If it's today, use full current timestamp. If it's a past date, use that date + current time.
          created_at: (() => {
            const now = new Date();
            const selected = new Date(transactionDate + "T00:00:00");
            selected.setHours(now.getHours(), now.getMinutes(), now.getSeconds());
            return selected.toISOString();
          })(),
        });

      if (error) throw error;

      onClose();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Error al guardar el gasto. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-auto"
          >
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-[#E5E7EB] rounded-full" />
            </div>

            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-xl font-semibold text-[#09090b]">Nuevo Gasto</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F9FAFB] transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            <div className="px-6 py-8 border-b border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-3 text-center">Cantidad</p>
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center gap-2">
                  <Select
                    value={selectedCurrency}
                    onValueChange={setSelectedCurrency}
                  >
                    <SelectTrigger className="w-auto h-auto p-2 pr-3 border-none bg-[#F3F4F6] hover:bg-[#E5E7EB] focus:ring-0 rounded-2xl transition-all flex items-center gap-1.5 [&_svg]:hidden group">
                      <span className="text-2xl font-bold text-[#4B5563]">
                        {selectedCurrency}
                      </span>
                      <ChevronDown className="w-4 h-4 text-[#9CA3AF] group-hover:text-[#6B7280] transition-colors translate-y-0.5" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-[#E5E7EB] shadow-lg">
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="BRL">BRL (R$)</SelectItem>
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
                    placeholder="0.00"
                    className="text-5xl font-bold text-[#09090b] bg-transparent border-none outline-none text-center w-48"
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="px-6 py-6 border-b border-[#E5E7EB] bg-[#F9FAFB]/50">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-[#09090b]">Fecha del Gasto</p>
                {isBackdated && (
                  <motion.div
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-1.5 text-[10px] font-medium text-[#B45309] bg-[#FFFBEB] px-2 py-1 rounded-full border border-[#FEF3C7]"
                  >
                    <AlertCircle className="w-3 h-3" />
                    Registro de día anterior
                  </motion.div>
                )}
              </div>

              {/* Quick Date Selectors */}
              <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
                {quickDates.map((qd) => {
                  const qdString = format(qd.date, "yyyy-MM-dd");
                  const isActive = transactionDate === qdString;
                  return (
                    <button
                      key={qdString}
                      onClick={() => setTransactionDate(qdString)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${isActive
                        ? "bg-[#025864] text-white border-[#025864]"
                        : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#025864]/30"
                        }`}
                    >
                      {qd.label.charAt(0).toUpperCase() + qd.label.slice(1)}
                    </button>
                  );
                })}
              </div>

              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#9CA3AF] group-focus-within:text-[#025864] transition-colors">
                  <Calendar className="w-5 h-5" />
                </div>
                <input
                  type="date"
                  value={transactionDate}
                  onChange={(e) => setTransactionDate(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-white border border-[#E5E7EB] focus:border-[#025864] focus:ring-1 focus:ring-[#025864] rounded-2xl text-sm text-[#09090b] outline-none transition-all"
                />
              </div>
            </div>

            <div className="px-6 py-6">
              <p className="text-sm font-medium text-[#09090b] mb-4">Categoría</p>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const iconKey = category.icon || "";
                  const IconComponent = iconMap[iconKey] || ShoppingBag;
                  const isSelected = selectedCategory === category.id;
                  const color = colorMap[iconKey] || "#6B7280";

                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${isSelected
                        ? "bg-[#025864] shadow-md"
                        : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                        }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${isSelected ? "bg-white/20" : ""
                          }`}
                        style={{
                          backgroundColor: isSelected ? "transparent" : `${color}15`
                        }}
                      >
                        <IconComponent
                          className="w-6 h-6"
                          style={{ color: isSelected ? "#FFFFFF" : color }}
                        />
                      </div>
                      <span
                        className={`text-xs font-medium text-center truncate w-full ${isSelected ? "text-white" : "text-[#6B7280]"
                          }`}
                      >
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="px-6 py-6 border-t border-[#E5E7EB]">
              <button
                onClick={handleSubmit}
                disabled={!amount || !selectedCategory || isSubmitting}
                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${amount && selectedCategory && !isSubmitting
                  ? "bg-[#025864] hover:bg-[#013E47] shadow-sm"
                  : "bg-[#E5E7EB] cursor-not-allowed"
                  }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  "Añadir Gasto"
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
