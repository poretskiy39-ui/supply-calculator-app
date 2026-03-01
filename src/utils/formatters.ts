export const formatNumber = (num: number, decimals = 2): string => {
  return new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
};

export const formatCurrency = (num: number, currency = '₽'): string => {
  return `${formatNumber(num)} ${currency}`;
};

export const formatPercent = (num: number): string => {
  return `${num.toFixed(2)}%`;
};
