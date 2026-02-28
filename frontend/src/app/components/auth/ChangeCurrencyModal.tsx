import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Check, AlertTriangle } from 'lucide-react';

interface Currency {
    code: string;
    name: string;
    symbol: string;
    flag: string;
}

const SUPPORTED_CURRENCIES: Currency[] = [
    { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', flag: '🇺🇸' },
    { code: 'UYU', name: 'Peso Uruguayo', symbol: '$U', flag: '🇺🇾' },
    { code: 'ARS', name: 'Peso Argentino', symbol: '$', flag: '🇦🇷' },
    { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺' },
    { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', flag: '🇧🇷' },
    { code: 'PYG', name: 'Guaraní Paraguayo', symbol: '₲', flag: '🇵🇾' },
    { code: 'MXN', name: 'Peso Mexicano', symbol: '$', flag: '🇲🇽' },
    { code: 'COP', name: 'Peso Colombiano', symbol: '$', flag: '🇨🇴' },
];

interface ChangeCurrencyModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (currencyCode: string) => void;
    currentCurrency?: string;
    isLoading?: boolean;
}

export function ChangeCurrencyModal({ isOpen, onClose, onConfirm, currentCurrency, isLoading }: ChangeCurrencyModalProps) {
    const [selectedCurrency, setSelectedCurrency] = useState<string>(currentCurrency || '');

    const handleConfirm = () => {
        if (selectedCurrency && selectedCurrency !== currentCurrency) {
            onConfirm(selectedCurrency);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-red-100">
                <DialogHeader className="p-6 pb-2 shrink-0 bg-red-50/30">
                    <DialogTitle className="text-xl flex items-center gap-2 text-red-700">
                        <AlertTriangle className="w-5 h-5" />
                        Cambiar moneda principal
                    </DialogTitle>
                    <DialogDescription className="text-red-600/80">
                        Esta es una acción importante que afecta cómo visualizas tus finanzas.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4">
                    {/* Warning Box */}
                    <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                        <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div className="text-sm text-amber-800 space-y-2">
                            <p className="font-semibold">Implicancias de este cambio:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                <li><strong>Registros pasados:</strong> Los gastos ya registrados NO se recalcularán automáticamente.</li>
                                <li><strong>Historial:</strong> Los totales históricos seguirán basados en el tipo de cambio del momento del registro original.</li>
                                <li><strong>Visualización:</strong> A partir de ahora, los nuevos registros usarán esta moneda como base.</li>
                            </ul>
                        </div>
                    </div>

                    <div className="grid gap-2 max-h-[300px] overflow-y-auto pr-1">
                        {SUPPORTED_CURRENCIES.map((currency) => (
                            <button
                                key={currency.code}
                                type="button"
                                onClick={() => setSelectedCurrency(currency.code)}
                                className={cn(
                                    "flex items-center justify-between p-3 rounded-xl border-2 transition-all text-left",
                                    selectedCurrency === currency.code
                                        ? "border-[var(--primary-main)] bg-[var(--primary-main)]/5"
                                        : "border-[var(--neutral-100)] hover:border-[var(--neutral-200)] bg-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{currency.flag}</span>
                                    <div>
                                        <p className="font-semibold text-[var(--neutral-900)]">
                                            {currency.code} - {currency.symbol}
                                        </p>
                                        <p className="text-sm text-[var(--neutral-500)]">
                                            {currency.name}
                                        </p>
                                    </div>
                                </div>
                                {selectedCurrency === currency.code && (
                                    <Check className="w-5 h-5 text-[var(--primary-main)]" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                <DialogFooter className="p-6 pt-2 shrink-0 border-t border-[var(--neutral-200)] bg-white dark:bg-zinc-950">
                    <div className="flex flex-col sm:flex-row gap-3 w-full">
                        <Button
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            onClick={handleConfirm}
                            disabled={!selectedCurrency || selectedCurrency === currentCurrency || isLoading}
                            isLoading={isLoading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white border-transparent"
                        >
                            Confirmar Cambio
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
