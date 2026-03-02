import { LogisticsData } from '../../types';
import { calculateAir, calculateContainer, calculateLTL } from './logistics';

const baseData: LogisticsData = {
  transportType: 'container',
  productName: 'Test cargo',
  hsCode: '6403999800',
  invoiceAmount: 0,
  invoiceCurrency: 'USD',
  needCustoms: false,
  customsDutyPercent: 5,
  insurancePercent: 0,
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

describe('logistics calculations', () => {
  test('calculateContainer uses provided EUR rate', () => {
    const result = calculateContainer(
      {
        ...baseData,
        transportType: 'container',
        invoiceAmount: 100,
        invoiceCurrency: 'EUR',
        weightGross: 22000,
        insurancePercent: 0,
      },
      { usd: 80, eur: 100, cny: 13.2 }
    );

    expect(result.details.customsValueRub).toBeCloseTo(122416.6667, 3);
    expect(result.details.agentCommissionRub).toBeCloseTo(416.6667, 3);
    expect(result.totalRub).toBeCloseTo(352716.6667, 3);
  });

  test('calculateLTL includes insurance and CNY conversion by cny rate', () => {
    const result = calculateLTL(
      {
        ...baseData,
        transportType: 'ltl',
        originCity: 'Changsha',
        invoiceAmount: 1000,
        invoiceCurrency: 'CNY',
        insurancePercent: 1.5,
        ltlWeight: 100,
        ltlVolume: 2,
        ltlDestination: 'Москва',
        ltlPickup: false,
        ltlDelivery: false,
      },
      { usd: 80, eur: 100, cny: 13.2 }
    );

    expect(result.details.insuranceRub).toBeCloseTo(198, 3);
    expect(result.details.railFreightRub).toBeCloseTo(24800, 3);
    expect(result.details.customsValueRub).toBeCloseTo(39231.3333, 3);
    expect(result.totalRub).toBeCloseTo(26031.3333, 3);
  });

  test('calculateAir uses matrix rates, pre-carriage and terminal charges', () => {
    const result = calculateAir(
      {
        ...baseData,
        transportType: 'air',
        invoiceAmount: 500,
        invoiceCurrency: 'USD',
        insurancePercent: 0.5,
        ltlWeight: 100,
        ltlVolume: 0.768,
        ltlDestination: 'Москва',
        ltlPickup: true,
        ltlDelivery: true,
      },
      { usd: 80, eur: 100, cny: 13.2 }
    );

    expect(result.details.railFreightRub).toBeCloseTo(207954.8928, 3);
    expect(result.details.lastMileRub).toBeCloseTo(0, 3);
    expect(result.details.insuranceRub).toBeCloseTo(200, 3);
    expect(result.totalRub).toBeCloseTo(216819.68, 3);
    expect(result.details.note).toContain('по матрице');
  });
});
