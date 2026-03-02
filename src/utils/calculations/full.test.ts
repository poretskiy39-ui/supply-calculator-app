import { GeneralSettings, Product } from '../../types';
import { calcProductPayableWeight, calculateTotalCost, getEffectiveRate } from './full';

const baseProduct: Product = {
  id: '1',
  name: 'Test',
  price: 100,
  quantity: 1,
  weightNetto: 2,
  length: 50,
  width: 40,
  height: 30,
  needMarking: false,
};

const baseSettings: GeneralSettings = {
  invoiceCurrency: 'USD',
  exchangeRate: 80,
  euroRate: 95,
  cnyRate: 12,
  incoterms: 'EXW',
  agentCommissionPercent: 0,
  exporterCommissionPercent: 0,
  bankCommissionPercent: 0,
  bankTransferFeePercent: 0,
  bankControlFeePercent: 0,
  customsFee: 0,
  declarationCost: 0,
  terminalCost: 0,
  lastMileCostPerKg: 0,
  transportType: 'sea',
  logisticsRate: 0,
  insurancePercent: 0,
  agentRewardPercent: 0,
  salesExporterMarkupPercent: 0,
  salesAgentMarkupPercent: 0,
  salesLogisticsMarkupCurrency: 0,
};

describe('full calculations', () => {
  test('getEffectiveRate returns selected invoice currency rate', () => {
    expect(getEffectiveRate({ ...baseSettings, invoiceCurrency: 'USD' })).toBe(80);
    expect(getEffectiveRate({ ...baseSettings, invoiceCurrency: 'EUR' })).toBe(95);
    expect(getEffectiveRate({ ...baseSettings, invoiceCurrency: 'CNY' })).toBe(12);
  });

  test('calcProductPayableWeight uses volumetric factor for avia', () => {
    const payableWeight = calcProductPayableWeight(baseProduct, 'avia');
    expect(payableWeight).toBeCloseTo(10.02, 2);
  });

  test('calculateTotalCost uses CNY rate in invoice and total', () => {
    const result = calculateTotalCost([baseProduct], {
      ...baseSettings,
      invoiceCurrency: 'CNY',
      cnyRate: 12,
      transportType: 'avia',
    });

    expect(result.details.invoiceRub).toBeCloseTo(1200, 2);
    expect(result.details.customsValueRub).toBeCloseTo(1200, 2);
    expect(result.details.vatRub).toBeCloseTo(240, 2);
    expect(result.details.customsFeeRub).toBeCloseTo(1231, 2);
    expect(result.totalRub).toBeCloseTo(2671, 2);
  });
});
