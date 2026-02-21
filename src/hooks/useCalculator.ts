import { useState } from 'react';
import { Product, GeneralSettings, CalculationResult } from '../types';
import { calculateTotalCost } from '../utils/calculations';

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

const useCalculator = () => {
  const [step, setStep] = useState(1);
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

  const calculate = (): CalculationResult | null => {
    // Валидация: хотя бы один товар с ценой > 0
    const valid = products.some(p => p.price > 0 && p.quantity > 0);
    if (!valid) return null;
    return calculateTotalCost(products, settings);
  };

  return {
    step,
    setStep,
    settings,
    setSettings,
    products,
    addProduct,
    removeProduct,
    updateProduct,
    calculate,
  };
};

export default useCalculator;