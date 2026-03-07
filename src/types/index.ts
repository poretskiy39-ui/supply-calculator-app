// src/types/index.ts

export type ServiceType = 'full' | 'logistics';
export type TransportType = 'container' | 'ltl' | 'air';

// ── Маршруты ──────────────────────────────────────────────────────────────────
export type RouteType = 'china_ru' | 'eu_tr_ru';

export const ROUTE_LABELS: Record<RouteType, string> = {
  china_ru: '🇨🇳 Китай → Россия',
  eu_tr_ru: '🇪🇺 ЕС → Турция → Россия',
};

// ─────────────────────────────────────────────────────────────────────────────

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
  salesExporterMarkupPercent: number;
  salesAgentMarkupPercent: number;
  salesLogisticsMarkupCurrency: number;
  // СВХ
  svhDays?: number;
  svhRatePerDay?: number;
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
    salesExporterMarkupRub: number;
    salesAgentMarkupRub: number;
    salesLogisticsMarkupRub: number;
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
    svhRub?: number;
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

export type ContainerType = '20DC' | '40HC';
export type ChinaPort = 'Shanghai' | 'Ningbo' | 'Xingang (Tianjin)' | 'Qingdao' | 'Dalian';
export type DestinationCity = 'Москва' | 'Санкт-Петербург';

export interface LogisticsData {
  transportType: TransportType;
  route?: RouteType;              // ← НОВОЕ: маршрут (по умолчанию china_ru)
  productName: string;
  hsCode: string;
  invoiceAmount: number;
  invoiceCurrency: 'USD' | 'EUR' | 'CNY';
  needCustoms: boolean;
  customsDutyPercent: number;
  insurancePercent: number;

  // Контейнер (Китай → РФ)
  containerType?: ContainerType;
  portOfLoading?: ChinaPort;
  destinationCity?: DestinationCity;
  weightGross?: number;

  // LTL / Авиа (Китай → РФ)
  originCity?: string;
  ltlWeight?: number;
  ltlVolume?: number;
  ltlDestination?: DestinationCity;
  ltlPickup?: boolean;
  ltlDelivery?: boolean;

  // ── EU → TR → RF ─────────────────────────────────────────────────────
  euOriginCity?: string;              // город отправки в ЕС
  traderCommissionPercent?: number;   // комиссия турецкого трейдера (%)
  istanbulStorageDays?: number;       // дней хранения в Стамбуле
  svhDays?: number;                   // дней СВХ в России
}

export interface LogisticsResult {
  totalRub: number;
  details: {
    oceanFreightRub: number;
    railFreightRub: number;
    lastMileRub: number;
    customsValueRub: number;
    dutyRub: number;
    vatRub: number;
    agentCommissionRub: number;
    insuranceRub: number;
    // EU→TR→RF специфика
    turkeyTraderCommissionRub?: number;
    turkeyStorageRub?: number;
    turkeyTruckRub?: number;
    svhRub?: number;
    note?: string;
  };
  inputData: LogisticsData;
}

// ── Статусы отправления ───────────────────────────────────────────────────────
export type ShipmentStatus = 'waiting' | 'in_transit' | 'customs' | 'delivered' | 'delayed';
export type ShipmentEventStatus = 'done' | 'active' | 'pending';

export interface ShipmentEvent {
  id: number;
  title: string;
  detail: string;
  status: ShipmentEventStatus;
  notifySent: boolean;
  createdAt: string;
}

export interface ShipmentNotification {
  id: number;
  text: string;
  createdAt: string;
}

export interface ShipmentSummary {
  id: string;
  clientName: string;
  fromCity: string;
  toCity: string;
  status: ShipmentStatus;
  etaDate: string;
  vessel: string;
  container: string;
  weight: number;
  volume: number;
  cargoType: string;
  updatedAt: string;
  lastEvent: ShipmentEvent | null;
  paymentTotalRub?: number;
  paymentPaidRub?: number;
  route?: RouteType;
}

export interface ShipmentDetails extends ShipmentSummary {
  clientTelegramId: number | null;
  clientUsername: string;
  clientName: string;
  managerId: number;
  managerName: string;
  events: ShipmentEvent[];
  notifications: ShipmentNotification[];
  // Финансы (план/факт)
  invoiceUsd?: number;
  planCostRub?: number;
  planRevenueRub?: number;
  planMarginRub?: number;
  planMarginPercent?: number;
  factCostRub?: number;
  factMarginRub?: number;
}

export interface ManagerUser {
  id: number;
  email: string;
  name: string;
  role: 'manager' | 'admin';
}

export interface ManagerSession {
  token: string;
  expiresAt: string;
  user: ManagerUser;
}
