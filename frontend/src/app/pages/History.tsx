import { useState, useEffect } from "react";
import {
  Search,
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
  Loader2,
  Calendar as CalendarIcon,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DateRange } from "react-day-picker";

import { EditTransactionModal } from "../components/EditTransactionModal";
import { useTransactions, useCategories } from "../hooks/useData";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Calendar } from "../components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../components/ui/popover";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "../components/ui/pagination";
import { cn } from "../components/ui/utils";

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
    TrendingUp: TrendingUp,
    TrendingDown: TrendingDown,
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
  // --- STATE ---
  const [date, setDate] = useState<DateRange | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [selectedTransaction, setSelectedTransaction] = useState<any | null>(null);

  // --- SEARCH STATE ---
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset page when search actually changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery]);

  const { transactions, loading, error, totalPages, totalCount, updateTransaction, deleteTransaction } = useTransactions({
    page: currentPage,
    pageSize: PAGE_SIZE,
    startDate: date?.from,
    endDate: date?.to,
    searchQuery: debouncedSearchQuery,
  });

  const { categories } = useCategories();

  // --- HANDLERS ---
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDate(newDate);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setDate(undefined);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setCurrentPage(1);
  };

  const handleSave = async (updatedTransaction: any) => {
    const { error } = await updateTransaction(updatedTransaction.id, {
      amount_original: updatedTransaction.amount,
      category_id: updatedTransaction.category_id,
      created_at: new Date(updatedTransaction.date).toISOString(),
    });

    if (!error) {
      setSelectedTransaction(null);
    } else {
      alert("Error al actualizar la transacción: " + error.message);
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await deleteTransaction(id);
    if (!error) {
      setSelectedTransaction(null);
    } else {
      alert("Error al eliminar la transacción: " + error.message);
    }
  };

  // Graceful loading for first-time data fetch
  if (loading && transactions.length === 0 && !date) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[var(--primary-main)] mx-auto mb-4" />
          <p className="text-[var(--neutral-500)]">Cargando historial...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[var(--bg-default)] flex items-center justify-center">
        <div className="text-center">
          <p className="text-[var(--error-text)]">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-default)]">
      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 sm:px-8">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#09090b] mb-1">Historial de Transacciones</h1>
          <p className="text-sm text-[#6B7280]">Revisa y edita tus movimientos</p>
        </div>

        {/* Search and Filter Bar */}
        <div className="mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
          <div className="flex-1 relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--neutral-400)]" />
            <Input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full sm:w-[280px] justify-start text-left font-normal bg-white",
                  !date && "text-muted-foreground"
                )}
                leftIcon={<CalendarIcon className="mr-2 h-4 w-4" />}
              >
                {date?.from ? (
                  date.to ? (
                    <>
                      {format(date.from, "d MMM, y", { locale: es })} -{" "}
                      {format(date.to, "d MMM, y", { locale: es })}
                    </>
                  ) : (
                    format(date.from, "d MMM, y", { locale: es })
                  )
                ) : (
                  <span>Filtrar por fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={date?.from}
                selected={date}
                onSelect={handleDateSelect}
                numberOfMonths={2}
                locale={es}
              />
            </PopoverContent>
          </Popover>

          {(date || searchQuery) && (
            <Button
              variant="ghost"
              onClick={clearFilters}
              className="text-red-500 hover:text-red-600 hover:bg-red-50 sm:w-auto w-full"
            >
              Limpiar
            </Button>
          )}
        </div>

        {/* Transactions List */}
        <Card className="overflow-hidden border border-[#E5E7EB] shadow-sm bg-white p-0">
          {transactions.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-[#6B7280]">
                No se encontraron transacciones
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#E5E7EB]">
              {transactions.map((transaction) => {
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
                      category_id: transaction.category_id,
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
        </Card>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col items-center gap-2">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage - 1);
                    }}
                    className={cn(currentPage === 1 && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>

                {/* Dynamic Pagination Pages */}
                {(() => {
                  const pages = [];
                  let startPage = Math.max(1, currentPage - 2);
                  let endPage = Math.min(totalPages, startPage + 4);

                  if (endPage - startPage < 4) {
                    startPage = Math.max(1, endPage - 4);
                  }

                  if (startPage > 1) {
                    pages.push(
                      <PaginationItem key="1">
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(1); }}>1</PaginationLink>
                      </PaginationItem>
                    );
                    if (startPage > 2) {
                      pages.push(
                        <PaginationItem key="ellipsis-start">
                          <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">...</span>
                        </PaginationItem>
                      );
                    }
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <PaginationItem key={i}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === i}
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange(i);
                          }}
                        >
                          {i}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  }

                  if (endPage < totalPages) {
                    if (endPage < totalPages - 1) {
                      pages.push(
                        <PaginationItem key="ellipsis-end">
                          <span className="flex h-9 w-9 items-center justify-center text-muted-foreground">...</span>
                        </PaginationItem>
                      );
                    }
                    pages.push(
                      <PaginationItem key={totalPages}>
                        <PaginationLink href="#" onClick={(e) => { e.preventDefault(); handlePageChange(totalPages); }}>{totalPages}</PaginationLink>
                      </PaginationItem>
                    );
                  }

                  return pages;
                })()}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(currentPage + 1);
                    }}
                    className={cn(currentPage === totalPages && "pointer-events-none opacity-50")}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
            <div className="text-center text-xs text-muted-foreground">
              Mostrando {((currentPage - 1) * PAGE_SIZE) + 1} - {Math.min(currentPage * PAGE_SIZE, totalCount)} de {totalCount} transacciones
            </div>
          </div>
        )}

        {/* Summary Footer */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="p-6">
            <p className="text-sm text-[#6B7280] mb-2">Total Gastos (Página)</p>
            <p className="text-3xl font-bold text-[#F43F5E]">
              -${transactions.reduce((sum, t) => sum + t.amount_original, 0).toFixed(2)}
            </p>
          </Card>
          <Card className="p-6">
            <p className="text-sm text-[#6B7280] mb-2">Transacciones</p>
            <p className="text-3xl font-bold text-[#4F46E5]">
              {totalCount}
            </p>
            <p className="text-xs text-[#6B7280] mt-1">Total acumulado</p>
          </Card>
        </div>
      </main>

      {/* Edit Transaction Modal */}
      {selectedTransaction && (
        <EditTransactionModal
          transaction={selectedTransaction}
          categories={categories}
          onClose={() => setSelectedTransaction(null)}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}