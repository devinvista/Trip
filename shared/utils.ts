// ====================================
// SISTEMA OTIMIZADO DE FORMATAÇÃO NUMÉRICA
// ====================================

// Tipo para configurações de formatação
interface FormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  useGrouping?: boolean;
}

// Cache para formatadores para melhor performance
const formatterCache = new Map<string, Intl.NumberFormat>();

// Função helper para obter ou criar formatador com cache
function getFormatter(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}-${JSON.stringify(options)}`;
  
  if (!formatterCache.has(key)) {
    formatterCache.set(key, new Intl.NumberFormat(locale, options));
  }
  
  return formatterCache.get(key)!;
}

// Função principal para conversão segura de valores
function safeNumber(value: number | string | null | undefined): number {
  if (value === null || value === undefined || value === '') return 0;
  
  if (typeof value === 'number') {
    return isNaN(value) || !isFinite(value) ? 0 : value;
  }
  
  if (typeof value === 'string') {
    // Remove espaços em branco
    const cleaned = value.trim();
    if (!cleaned) return 0;
    
    // Remove símbolos de moeda e espaços
    const withoutSymbols = cleaned.replace(/[R$\s€£US]/g, '');
    
    // Converte vírgula para ponto (formato brasileiro para padrão)
    const standardized = withoutSymbols.replace(',', '.');
    
    const parsed = parseFloat(standardized);
    return isNaN(parsed) || !isFinite(parsed) ? 0 : parsed;
  }
  
  return 0;
}

// ====================================
// FUNÇÕES DE FORMATAÇÃO BRASILEIRA
// ====================================

export function formatBrazilianCurrency(value: number | string | null | undefined): string {
  const numValue = safeNumber(value);
  
  const formatter = getFormatter('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(numValue);
}

export function formatBrazilianNumber(value: number | string | null | undefined, options: FormatOptions = {}): string {
  const numValue = safeNumber(value);
  
  const defaultOptions = {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    useGrouping: true,
    ...options
  };
  
  const formatter = getFormatter('pt-BR', defaultOptions);
  return formatter.format(numValue);
}

// Versão compacta para números grandes (ex: 1.2K, 1.5M)
export function formatCompactNumber(value: number | string | null | undefined): string {
  const numValue = safeNumber(value);
  
  const formatter = getFormatter('pt-BR', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 1
  });
  
  return formatter.format(numValue);
}

// ====================================
// FUNÇÕES DE FORMATAÇÃO MULTI-MOEDA
// ====================================

const currencyConfigs = {
  BRL: { locale: 'pt-BR', symbol: 'R$' },
  USD: { locale: 'en-US', symbol: 'US$' },
  EUR: { locale: 'de-DE', symbol: '€' },
  GBP: { locale: 'en-GB', symbol: '£' }
} as const;

export function formatCurrencyByCode(value: number | string | null | undefined, currency: string = 'BRL'): string {
  const numValue = safeNumber(value);
  const config = currencyConfigs[currency as keyof typeof currencyConfigs];
  
  if (!config) {
    return `${currency} ${formatBrazilianNumber(numValue)}`;
  }
  
  const formatter = getFormatter(config.locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  
  return formatter.format(numValue);
}

export function getCurrencySymbol(currency: string): string {
  const config = currencyConfigs[currency as keyof typeof currencyConfigs];
  return config?.symbol || currency;
}

// ====================================
// FUNÇÕES DE PARSING E CONVERSÃO
// ====================================

export function parseBrazilianNumber(value: string | null | undefined): number {
  return safeNumber(value);
}

export function parseNumber(value: any): number {
  return safeNumber(value);
}

// Converte formato brasileiro para formato padrão JavaScript
export function convertBrazilianToStandard(value: string): string {
  if (!value) return '0';
  return value.replace(',', '.');
}

// Converte formato padrão JavaScript para formato brasileiro
export function convertStandardToBrazilian(value: string | number): string {
  const strValue = typeof value === 'number' ? value.toString() : String(value || '0');
  return strValue.replace('.', ',');
}

// ====================================
// FUNÇÕES DE CÁLCULO E OPERAÇÕES
// ====================================

// Divide valor por número de pessoas com tratamento de erros
export function calculatePerPerson(total: number | string | null | undefined, people: number | null | undefined): number {
  const totalValue = safeNumber(total);
  const peopleCount = safeNumber(people);
  
  if (peopleCount <= 0) return 0;
  return totalValue / peopleCount;
}

// Calcula porcentagem com proteção contra divisão por zero
export function calculatePercentage(part: number | string | null | undefined, total: number | string | null | undefined): number {
  const partValue = safeNumber(part);
  const totalValue = safeNumber(total);
  
  if (totalValue === 0) return 0;
  return (partValue / totalValue) * 100;
}

// Soma array de valores de forma segura
export function sumValues(values: (number | string | null | undefined)[]): number {
  return values.reduce((sum: number, value) => sum + safeNumber(value), 0);
}

// ====================================
// FUNÇÕES DE FORMATAÇÃO ESPECIALIZADA
// ====================================

// Formata valor com sufixo (ex: "R$ 100,00/pessoa")
export function formatWithSuffix(value: number | string | null | undefined, suffix: string = ''): string {
  const formatted = formatBrazilianCurrency(value);
  return suffix ? `${formatted}${suffix}` : formatted;
}

// Formata preço baseado no tipo (grátis, por pessoa, por grupo)
export function formatPrice(amount: number | string | null | undefined, type: 'free' | 'per_person' | 'per_group' | 'fixed' = 'fixed'): string {
  const numValue = safeNumber(amount);
  
  if (numValue === 0 || type === 'free') {
    return 'Grátis';
  }
  
  const baseFormat = formatBrazilianCurrency(numValue);
  
  switch (type) {
    case 'per_person':
      return `${baseFormat}/pessoa`;
    case 'per_group':
      return `${baseFormat}/grupo`;
    default:
      return baseFormat;
  }
}

// Formata range de preços (ex: "R$ 50,00 - R$ 200,00")
export function formatPriceRange(min: number | string | null | undefined, max: number | string | null | undefined): string {
  const minValue = safeNumber(min);
  const maxValue = safeNumber(max);
  
  if (minValue === 0 && maxValue === 0) return 'Grátis';
  if (minValue === maxValue) return formatBrazilianCurrency(minValue);
  
  return `${formatBrazilianCurrency(minValue)} - ${formatBrazilianCurrency(maxValue)}`;
}

// ====================================
// UTILITÁRIOS DE VALIDAÇÃO
// ====================================

export function isValidNumber(value: any): boolean {
  const num = safeNumber(value);
  return num !== 0 || (typeof value === 'number' && value === 0);
}

export function isPositiveNumber(value: any): boolean {
  return safeNumber(value) > 0;
}

// ====================================
// FUNÇÕES LEGADAS (PARA COMPATIBILIDADE)
// ====================================

export const formatCurrency = formatBrazilianCurrency;
export const parsePrice = parseBrazilianNumber;