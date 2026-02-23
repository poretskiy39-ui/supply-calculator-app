export type ServiceType = 'full' | 'logistics';
export type TransportType = 'container' | 'ltl'; // новый тип

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  weightNetto: number;
  length: number;
  width: number;
  height: number;
  packingQtyPerBox?: number;
  packingBoxLength?: number;
  packingBoxWidth?: number;
  packingBoxHeight?: number;
  packingBoxWeight?: number;
  hsCode?: string;
  dutyPercent?: number;
  dutyEuro?: number;
  needMarking?: boolean;
  markingPrice?: number;
}

export interface GeneralSettings {
  invoiceCurrency: 'USD' | 'EUR' | 'CNY';
  exchangeRate: number;
  euroRate: number;
  cnyRate: number;
  incoterms: 'EXW' | 'FOB' | 'CIF' | 'DAP';
  agentCommissionPercent: number;
  exporterCommissionPercent: number;
  bankCommissionPercent: number;
  bankTransferFeePercent: number;
  bankControlFeePercent: number;
  customsFee: number;
  declarationCost: number;
  terminalCost: number;
  lastMileCostPerKg: number;
  transportType: 'avia' | 'sea' | 'rail' | 'auto';
  logisticsRate: number;
  insurancePercent: number;
  agentRewardPercent: number;
}

export interface CalculationResult {
  totalRub: number;
  costPerItem: number;
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

export interface ContactInfo {
  name: string;
  company: string;
  phone: string;
  email: string;
}

// ===== Логистика =====
export type ContainerType = '20DC' | '40HC';
export type ChinaPort = 'Shanghai' | 'Ningbo' | 'Xingang (Tianjin)' | 'Qingdao' | 'Dalian';
export type DestinationCity = 'Москва' | 'Санкт-Петербург';

export interface LogisticsData {
  transportType: TransportType;
  productName: string;
  hsCode: string;
  invoiceAmount: number;
  invoiceCurrency: 'USD' | 'EUR' | 'CNY';
  needCustoms: boolean;
  customsDutyPercent: number;
  insurancePercent: number;

  // Для контейнера
  containerType?: ContainerType;
  portOfLoading?: ChinaPort;
  destinationCity?: DestinationCity;
  weightGross?: number;

  // Для LTL
  originCity?: string;           // город в Китае (свободный ввод)
  ltlWeight?: number;
  ltlVolume?: number;
  ltlDestination?: DestinationCity;
  ltlPickup?: boolean;
  ltlDelivery?: boolean;
}

export interface LogisticsResult {
  totalRub: number;
  details: {
    oceanFreightRub: number;
    railFreightRub: number;   // для LTL сюда идёт стоимость перевозки
    lastMileRub: number;
    customsValueRub: number;
    dutyRub: number;
    vatRub: number;
    agentCommissionRub: number;
    insuranceRub: number;
    note?: string;
  };
  inputData: LogisticsData;
}