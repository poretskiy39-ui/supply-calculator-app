import { useState } from 'react';
import { 
  Product, GeneralSettings, CalculationResult, ContactInfo, 
  ServiceType, LogisticsData, LogisticsResult 
} from '../types';
import { calculateTotalCost } from '../utils/calculations/full'; // теперь путь правильный
import { calculateLogistics } from '../utils/calculations/logistics';

const defaultSettings: GeneralSettings = {
  invoiceCurrency: 'USD',
  exchangeRate: 80,
  euroRate: 90,
  cnyRate: 11.3,
  incoterms: 'EXW',
  agentCommissionPercent: 1.99,
  exporterCommissionPercent: 0.3,
  bankCommissionPercent: 0.4,
  bankTransferFeePercent: 0.15,
  bankControlFeePercent: 0.5,
  customsFee: 3000,
  declarationCost: 30500,
  terminalCost: 5000,
  lastMileCostPerKg: 50,
  transportType: 'sea',
  logisticsRate: 2.5,
  insurancePercent: 0.5,
  agentRewardPercent: 10,
};

const defaultLogisticsData: LogisticsData = {
  productName: '',
  hsCode: '',
  invoiceAmount: 0,
  invoiceCurrency: 'USD',
  weightGross: 0,
  containerType: '20DC',
  portOfLoading: 'Shanghai',
  destinationCity: 'Москва',
  needCustoms: false,
  customsDutyPercent: 5,
  insurancePercent: 0.5,
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
    if (!logisticsData.weightGross || !logisticsData.invoiceAmount) return null;
    const result = calculateLogistics(logisticsData, settings.exchangeRate);
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