export type ServiceType = 'full' | 'logistics';
export type TransportType = 'container' | 'ltl' | 'air';

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
  productName: string;
  hsCode: string;
  invoiceAmount: number;
  invoiceCurrency: 'USD' | 'EUR' | 'CNY';
  needCustoms: boolean;
  customsDutyPercent: number;
  insurancePercent: number;

  containerType?: ContainerType;
  portOfLoading?: ChinaPort;
  destinationCity?: DestinationCity;
  weightGross?: number;

  originCity?: string;
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
    railFreightRub: number;
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
}

export interface ShipmentDetails extends ShipmentSummary {
  clientTelegramId: number | null;
  clientUsername: string;
  clientName: string;
  managerId: number;
  managerName: string;
  events: ShipmentEvent[];
  notifications: ShipmentNotification[];
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
