export interface Product {
  id: string;
  name: string;
  price: number;               // в валюте инвойса
  quantity: number;
  weightNetto: number;          // кг
  length: number;               // см
  width: number;
  height: number;
  // Упаковка (опционально)
  packingQtyPerBox?: number;    // шт в мастер-боксе
  packingBoxLength?: number;
  packingBoxWidth?: number;
  packingBoxHeight?: number;
  packingBoxWeight?: number;    // кг брутто бокса
  // Таможенные данные
  hsCode?: string;
  dutyPercent?: number;         // % пошлины
  dutyEuro?: number;            // фикс евро (за товар)
  needMarking?: boolean;        // Честный знак
  markingPrice?: number;        // цена за ед.
}

export interface GeneralSettings {
  invoiceCurrency: 'USD' | 'EUR' | 'CNY';
  exchangeRate: number;          // курс USD → RUB
  euroRate: number;              // курс EUR → RUB
  cnyRate: number;               // курс CNY → RUB
  incoterms: 'EXW' | 'FOB' | 'CIF' | 'DAP';
  // Комиссии по умолчанию (можно редактировать)
  agentCommissionPercent: number;
  exporterCommissionPercent: number;
  bankCommissionPercent: number;     // комиссия банка-агента
  bankTransferFeePercent: number;    // КВ банка за перевод
  bankControlFeePercent: number;     // за ведомость
  // Фиксированные сборы
  customsFee: number;                // таможенный сбор (руб)
  declarationCost: number;           // подача декларации (руб)
  terminalCost: number;              // терминал (руб)
  lastMileCostPerKg: number;         // последняя миля (руб/кг)
  // Логистика
  transportType: 'avia' | 'sea' | 'rail' | 'auto';
  logisticsRate: number;              // $/кг
  insurancePercent: number;
  // Агентское вознаграждение
  agentRewardPercent: number;
}

export interface CalculationResult {
  totalRub: number;
  costPerItem: number;            // средняя себестоимость единицы
  details: {
    invoiceRub: number;
    logisticsRub: number;
    insuranceRub: number;
    exporterCommissionRub: number;
    agentCommissionRub: number;
    customsValueRub: number;
    dutyRub: number;
    vatRub: number;
    customsFeeRub: number;
    declarationCostRub: number;
    terminalCostRub: number;
    lastMileRub: number;
    bankCommissionsRub: number;
    markingRub: number;
    agentRewardRub: number;
  };
}

export interface ExchangeRates {
  usd: number;
  eur: number;
  cny: number;
  date: string;
}