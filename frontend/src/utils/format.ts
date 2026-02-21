/**
 * Formato de moneda usando Intl.NumberFormat.
 * 
 * @param amount El monto a formatear.
 * @param currency El código de moneda (ISO 4217), ej. 'USD', 'EUR', 'PYG'.
 * @returns El string formateado con el símbolo correcto.
 */
/**
 * Obtiene el símbolo de una moneda.
 */
export function getCurrencySymbol(currency: string = 'USD'): string {
    try {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: currency.toUpperCase(),
            currencyDisplay: 'narrowSymbol',
        })
            .formatToParts(0)
            .find(part => part.type === 'currency')?.value || currency;
    } catch (e) {
        return currency;
    }
}

export function formatMoney(amount: number, currency: string = 'USD'): string {
    try {
        // Configuraciones especiales para ciertas monedas si es necesario
        const options: Intl.NumberFormatOptions = {
            style: 'currency',
            currency: currency.toUpperCase(),
            currencyDisplay: 'narrowSymbol',
            minimumFractionDigits: currency.toUpperCase() === 'PYG' ? 0 : 2,
            maximumFractionDigits: currency.toUpperCase() === 'PYG' ? 0 : 2,
        };

        // Usar 'es-AR' como base para el formato numérico (comas/puntos)
        // Pero el símbolo vendrá determinado por la moneda.
        return new Intl.NumberFormat('es-AR', options).format(amount);
    } catch (error) {
        console.error('Error formatting money:', error);
        // Fallback básico
        return `${currency} ${amount.toLocaleString('es-AR')}`;
    }
}
