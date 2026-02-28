import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { useState } from 'react';
import { cn } from '@/utils/cn';
import { Check } from 'lucide-react';

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

interface CurrencySelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (currencyCode: string) => void;
    isLoading?: boolean;
}

export function CurrencySelectionModal({ isOpen, onClose, onConfirm, isLoading }: CurrencySelectionModalProps) {
    const [selectedCurrency, setSelectedCurrency] = useState<string>('');

    const handleConfirm = () => {
        if (selectedCurrency) {
            onConfirm(selectedCurrency);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && !isLoading && onClose()}>
            <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 shrink-0">
                    <DialogTitle className="text-xl">Selecciona tu moneda principal</DialogTitle>
                    <DialogDescription>
                        Esta será la moneda base para todos tus reportes y balances.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 py-4 max-h-[400px] overflow-y-auto">
                    <div className="grid gap-2">
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
                            disabled={!selectedCurrency || isLoading}
                            isLoading={isLoading}
                            className="flex-1"
                        >
                            Confirmar y Registrarme
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
