import { useState } from "react";
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
  Film
} from "lucide-react";

interface AddTransactionDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categories = [
  { id: "coffee", name: "Café", icon: Coffee, color: "#F59E0B" },
  { id: "shopping", name: "Compras", icon: ShoppingBag, color: "#8B5CF6" },
  { id: "home", name: "Hogar", icon: Home, color: "#06B6D4" },
  { id: "transport", name: "Transporte", icon: Car, color: "#3B82F6" },
  { id: "food", name: "Comida", icon: Utensils, color: "#EF4444" },
  { id: "phone", name: "Teléfono", icon: Smartphone, color: "#10B981" },
  { id: "health", name: "Salud", icon: Heart, color: "#F43F5E" },
  { id: "travel", name: "Viajes", icon: Plane, color: "#EC4899" },
  { id: "entertainment", name: "Ocio", icon: Film, color: "#F97316" },
];

export function AddTransactionDrawer({ isOpen, onClose }: AddTransactionDrawerProps) {
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleAmountChange = (value: string) => {
    // Only allow numbers and decimal point
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setAmount(value);
    }
  };

  const handleSubmit = () => {
    if (amount && selectedCategory) {
      // Handle transaction submission
      console.log("Transaction:", { amount, category: selectedCategory });
      onClose();
      setAmount("");
      setSelectedCategory(null);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-50 max-h-[85vh] overflow-auto"
          >
            {/* Handle Bar */}
            <div className="flex justify-center pt-4 pb-2">
              <div className="w-12 h-1 bg-[#E5E7EB] rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E7EB]">
              <h3 className="text-xl font-semibold text-[#09090b]">Nuevo Gasto</h3>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F9FAFB] transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            </div>

            {/* Amount Input */}
            <div className="px-6 py-8 border-b border-[#E5E7EB]">
              <p className="text-sm text-[#6B7280] mb-3 text-center">Cantidad</p>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-bold text-[#09090b]">€</span>
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

            {/* Category Selection */}
            <div className="px-6 py-6">
              <p className="text-sm font-medium text-[#09090b] mb-4">Categoría</p>
              <div className="grid grid-cols-3 gap-3">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl transition-all ${
                        isSelected
                          ? "bg-[#4F46E5] shadow-md"
                          : "bg-[#F9FAFB] hover:bg-[#F3F4F6]"
                      }`}
                    >
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center ${
                          isSelected ? "bg-white/20" : ""
                        }`}
                        style={{ 
                          backgroundColor: isSelected ? "transparent" : `${category.color}15` 
                        }}
                      >
                        <IconComponent 
                          className="w-6 h-6"
                          style={{ color: isSelected ? "#FFFFFF" : category.color }}
                        />
                      </div>
                      <span 
                        className={`text-xs font-medium ${
                          isSelected ? "text-white" : "text-[#6B7280]"
                        }`}
                      >
                        {category.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Action Button */}
            <div className="px-6 py-6 border-t border-[#E5E7EB]">
              <button
                onClick={handleSubmit}
                disabled={!amount || !selectedCategory}
                className={`w-full py-4 rounded-2xl font-semibold text-white transition-all ${
                  amount && selectedCategory
                    ? "bg-[#4F46E5] hover:bg-[#4338CA] shadow-sm"
                    : "bg-[#E5E7EB] cursor-not-allowed"
                }`}
              >
                Añadir Gasto
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
