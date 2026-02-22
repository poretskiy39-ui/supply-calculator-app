export const formatNumber = (num: number, decimals = 2): string => {
    return num.toFixed(decimals).replace(/\d(?=(\d{3})+\.)/g, '$&,');
  };
  
  export const formatCurrency = (num: number, currency = '₽'): string => {
    return `${formatNumber(num)} ${currency}`;
  };
  
  export const formatPercent = (num: number): string => {
    return `${num.toFixed(2)}%`;
  };