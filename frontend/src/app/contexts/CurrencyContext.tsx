import { createContext, useContext, ReactNode, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { formatMoney as formatMoneyUtil } from '../../utils/format';

interface CurrencyContextType {
    homeCurrency: string;
    formatMoney: (amount: number) => string;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function CurrencyProvider({ children }: { children: ReactNode }) {
    const { profile } = useAuth();

    // Obtener la moneda del perfil del usuario o usar USD por defecto
    const homeCurrency = useMemo(() => {
        return profile?.home_currency || 'USD';
    }, [profile?.home_currency]);

    // Función de formato especializada para la moneda del usuario
    const formatMoney = (amount: number) => {
        return formatMoneyUtil(amount, homeCurrency);
    };

    return (
        <CurrencyContext.Provider value={{ homeCurrency, formatMoney }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
