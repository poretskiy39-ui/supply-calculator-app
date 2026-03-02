import { useState } from 'react';
import {
  Product,
  GeneralSettings,
  CalculationResult,
  ContactInfo,
  ServiceType,
  LogisticsData,
  LogisticsResult,
} from '../types';
import { calculateTotalCost } from '../utils/calculations/full';
import { calculateAir, calculateContainer, calculateLTL } from '../utils/calculations/logistics';

const defaultSettings: GeneralSettings = {
  invoiceCurrency: 'USD',
  exchangeRate: 80,
  euroRate: 90,
  cnyRate: 11.3,
  incoterms: 'EXW',
  agentCommissionPercent: 0.3,
  exporterCommissionPercent: 1.99,
  bankCommissionPercent: 1.99,
  bankTransferFeePercent: 0.4,
  bankControlFeePercent: 0.15,
  customsFee: 0,
  declarationCost: 30500,
  terminalCost: 5000,
  lastMileCostPerKg: 50,
  transportType: 'sea',
  logisticsRate: 2.5,
  insurancePercent: 0.5,
  agentRewardPercent: 10,
  salesExporterMarkupPercent: 1.99,
  salesAgentMarkupPercent: 0,
  salesLogisticsMarkupCurrency: 0,
};

const defaultLogisticsData: LogisticsData = {
  transportType: 'container',
  productName: '',
  hsCode: '',
  invoiceAmount: 0,
  invoiceCurrency: 'USD',
  needCustoms: false,
  customsDutyPercent: 5,
  insurancePercent: 0.5,
  containerType: '20DC',
  portOfLoading: 'Shanghai',
  destinationCity: 'Москва',
  weightGross: 0,
  originCity: '',
  ltlWeight: 0,
  ltlVolume: 0,
  ltlDestination: 'Москва',
  ltlPickup: false,
  ltlDelivery: false,
};

const useCalculator = () => {
  const [serviceType, setServiceType] = useState<ServiceType>('full');
  const [step, setStep] = useState(0);
  const [settings, setSettings] = useState<GeneralSettings>(defaultSettings);
  const [products, setProducts] = useState<Product[]>([
    {
      id: Date.now().toString(),
      name: '',
      price: 0,
      quantity: 1,
      weightNetto: 0,
      length: 0,
      width: 0,
      height: 0,
      needMarking: false,
    },
  ]);
  const [contact, setContact] = useState<ContactInfo>({
    name: '',
    company: '',
    phone: '',
    email: '',
  });
  const [logisticsData, setLogisticsData] = useState<LogisticsData>(defaultLogisticsData);
  const [logisticsResult, setLogisticsResult] = useState<LogisticsResult | null>(null);

  const addProduct = () => {
    const newProduct: Product = {
      id: Date.now().toString() + Math.random(),
      name: '',
      price: 0,
      quantity: 1,
      weightNetto: 0,
      length: 0,
      width: 0,
      height: 0,
      needMarking: false,
    };
    setProducts([...products, newProduct]);
  };

  const removeProduct = (id: string) => {
    if (products.length > 1) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const updateProduct = (id: string, field: keyof Product, value: any) => {
    setProducts(products.map(p => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const updateContact = (field: keyof ContactInfo, value: string) => {
    setContact(prev => ({ ...prev, [field]: value }));
  };

  const updateLogisticsData = (field: keyof LogisticsData, value: any) => {
    setLogisticsData(prev => ({ ...prev, [field]: value }));
  };

  const calculateFull = (): CalculationResult | null => {
    const valid = products.some(p => p.price > 0 && p.quantity > 0);
    if (!valid) return null;
    return calculateTotalCost(products, settings);
  };

  const calculateLogisticsCost = (): LogisticsResult | null => {
    const rates = {
      usd: settings.exchangeRate,
      eur: settings.euroRate,
      cny: settings.cnyRate,
    };

    if (logisticsData.transportType === 'container') {
      if (!logisticsData.weightGross || !logisticsData.invoiceAmount) return null;
      const result = calculateContainer(logisticsData, rates, settings.agentCommissionPercent);
      setLogisticsResult(result);
      return result;
    }

    if (logisticsData.transportType === 'air') {
      if (!logisticsData.ltlWeight || !logisticsData.ltlVolume || !logisticsData.invoiceAmount) return null;
      const result = calculateAir(logisticsData, rates, settings.agentCommissionPercent);
      setLogisticsResult(result);
      return result;
    }

    if (!logisticsData.ltlWeight || !logisticsData.ltlVolume || !logisticsData.invoiceAmount) return null;
    const result = calculateLTL(logisticsData, rates, settings.agentCommissionPercent);
    setLogisticsResult(result);
    return result;
  };

  return {
    serviceType,
    setServiceType,
    step,
    setStep,
    settings,
    setSettings,
    products,
    addProduct,
    removeProduct,
    updateProduct,
    contact,
    updateContact,
    logisticsData,
    updateLogisticsData,
    logisticsResult,
    calculateFull,
    calculateLogisticsCost,
  };
};

export default useCalculator;
