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
  Loader2
} from "lucide-react";
import { supabase } from "../../utils/supabase";
import { useAuth } from "../contexts/AuthContext";

interface AddTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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

interface Category {
  id: string;
  name: string;
  icon: string;
}

export function AddTransactionDrawer({ isOpen, onClose }: AddTransactionDrawerProps) {
  const { user, profile } = useAuth();
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingCategories, setIsLoadingCategories] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  const fetchCategories = async () => {
    setIsLoadingCategories(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, icon')
        .or('user_id.is.null,user_id.eq.' + user?.id);

      if (error) throw error;
      if (data) setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoadingCategories(false);
    }
  };

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
      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount_original: numAmount,
          amount_base: numAmount, // Assuming same as base for now
          currency_original: profile?.home_currency || 'EUR',
          category_id: selectedCategory,
          is_ai_confirmed: true, // Manual entry is considered confirmed
        });

      if (error) throw error;

      onClose();
      setAmount("");
      setSelectedCategory(null);
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
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-[#09090b]">
                  {profile?.home_currency === 'USD' ? '$' : '€'}
                </span>
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

            <div className="px-6 py-6">
              <p className="text-sm font-medium text-[#09090b] mb-4">Categoría</p>
              {isLoadingCategories ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin text-[#4F46E5]" />
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {categories.map((category) => {
                    const IconComponent = iconMap[category.icon] || ShoppingBag;
                    const isSelected = selectedCategory === category.id;
                    const color = colorMap[category.icon] || "#6B7280";

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${isSelected
                            ? "bg-[#4F46E5] shadow-md"
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
              )}
            </div>

            <div className="px-6 py-6 border-t border-[#E5E7EB]">
              <button
                onClick={handleSubmit}
                disabled={!amount || !selectedCategory || isSubmitting}
                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${amount && selectedCategory && !isSubmitting
                    ? "bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm"
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
