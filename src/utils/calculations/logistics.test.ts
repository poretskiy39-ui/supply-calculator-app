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

  test('calculateLTL works without weight when only volume is provided', () => {
    const result = calculateLTL(
      {
        ...baseData,
        transportType: 'ltl',
        originCity: 'Chongqing',
        invoiceAmount: 300,
        invoiceCurrency: 'USD',
        insurancePercent: 0,
        ltlWeight: 0,
        ltlVolume: 3,
        ltlDestination: 'Москва',
        ltlPickup: false,
        ltlDelivery: false,
      },
      { usd: 80, eur: 100, cny: 13.2 }
    );

    expect(result.details.railFreightRub).toBeCloseTo(37200, 3);
    expect(result.details.agentCommissionRub).toBeCloseTo(1550, 3);
    expect(result.totalRub).toBeCloseTo(38750, 3);
  });

  test('calculateLTL uses presentation volume tiers (1-3 / 3.1-5 / 5.1-10 m3)', () => {
    const baseLtlPayload = {
      ...baseData,
      transportType: 'ltl' as const,
      originCity: 'Chongqing',
      invoiceAmount: 0,
      invoiceCurrency: 'USD' as const,
      insurancePercent: 0,
      ltlWeight: 0,
      ltlDestination: 'Москва' as const,
      ltlPickup: false,
      ltlDelivery: false,
    };

    const tier1 = calculateLTL({ ...baseLtlPayload, ltlVolume: 3 }, { usd: 80, eur: 100, cny: 13.2 });
    const tier2 = calculateLTL({ ...baseLtlPayload, ltlVolume: 3.1 }, { usd: 80, eur: 100, cny: 13.2 });
    const tier3 = calculateLTL({ ...baseLtlPayload, ltlVolume: 5.1 }, { usd: 80, eur: 100, cny: 13.2 });

    expect(tier1.details.railFreightRub).toBeCloseTo(37200, 3);
    expect(tier2.details.railFreightRub).toBeCloseTo(35960, 3);
    expect(tier3.details.railFreightRub).toBeCloseTo(55080, 3);
  });

  test('calculateAir uses matrix rates and skips terminal for factual weight 100kg', () => {
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

    expect(result.details.railFreightRub).toBeCloseTo(202869.12, 3);
    expect(result.details.lastMileRub).toBeCloseTo(0, 3);
    expect(result.details.insuranceRub).toBeCloseTo(200, 3);
    expect(result.totalRub).toBeCloseTo(211522, 3);
    expect(result.details.note).toContain('по матрице');
    expect(result.details.note).toContain('$19/кг');
  });

  test('calculateAir applies terminal for factual weight above 100kg', () => {
    const result = calculateAir(
      {
        ...baseData,
        transportType: 'air',
        invoiceAmount: 0,
        invoiceCurrency: 'USD',
        insurancePercent: 0,
        ltlWeight: 101,
        ltlVolume: 0.2,
        ltlDestination: 'Москва',
        ltlPickup: false,
        ltlDelivery: false,
      },
      { usd: 80, eur: 100, cny: 13.2 }
    );

    expect(result.details.railFreightRub).toBeCloseTo(149580.8, 3);
    expect(result.totalRub).toBeCloseTo(155813.3333, 3);
    expect(result.details.note).toContain('факт. вес');
  });
});
