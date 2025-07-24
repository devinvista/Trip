// Utilitários compartilhados entre frontend e backend
export function formatBrazilianCurrency(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return 'R$ 0,00';
  
  return numValue.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function formatBrazilianNumber(value: number | string): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return '0,00';
  
  return numValue.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

export function parseBrazilianNumber(value: string): number {
  if (!value) return 0;
  
  // Remove currency symbols and spaces
  const cleanValue = value.replace(/[R$\s]/g, '');
  
  // Replace comma with dot for parsing
  const standardValue = cleanValue.replace(',', '.');
  
  const parsed = parseFloat(standardValue);
  return isNaN(parsed) ? 0 : parsed;
}

export function formatCurrencyByCode(value: number | string, currency: string = 'BRL'): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return `${getCurrencySymbol(currency)} 0,00`;

  switch (currency) {
    case 'BRL':
      return numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      });
    case 'USD':
      return numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace('.', ',');
    case 'EUR':
      return numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace('.', ',');
    case 'GBP':
      return numValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      }).replace('.', ',');
    default:
      return `${currency} ${formatBrazilianNumber(numValue)}`;
  }
}

export function getCurrencySymbol(currency: string): string {
  switch (currency) {
    case 'BRL': return 'R$';
    case 'USD': return 'US$';
    case 'EUR': return '€';
    case 'GBP': return '£';
    default: return currency;
  }
}

// Para inputs de formulário - converte valor brasileiro para formato padrão
export function convertBrazilianToStandard(value: string): string {
  return value.replace(',', '.');
}

// Para exibição - converte valor padrão para formato brasileiro
export function convertStandardToBrazilian(value: string | number): string {
  const strValue = typeof value === 'number' ? value.toString() : value;
  return strValue.replace('.', ',');
}