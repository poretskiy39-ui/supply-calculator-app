import { LogisticsData, LogisticsResult } from '../../types';
import {
  AIR_PRICING,
  CONTAINER_PRICING,
  LOGISTICS_DEFAULTS,
  LTL_PRICING,
  type AirDensityTier,
  type AirWeightBreak,
} from '../../config/logisticsPricing';

const AGENT_COMMISSION_PERCENT = LOGISTICS_DEFAULTS.agentCommissionPercent;
const VAT_PERCENT = LOGISTICS_DEFAULTS.vatPercent;

type InvoiceCurrency = LogisticsData['invoiceCurrency'];
type RailRateBucket = { upTo24t?: number; from24to28t?: number; upTo26_5t?: number };

export interface LogisticsRates {
  usd: number;
  eur?: number;
  cny?: number;
}

const getInvoiceRates = (rates: LogisticsRates): Record<InvoiceCurrency, number> => ({
  USD: rates.usd,
  EUR: rates.eur ?? rates.usd * 1.1,
  CNY: rates.cny ?? rates.usd * 0.14,
});

const convertInvoiceToRub = (amount: number, currency: InvoiceCurrency, rates: Record<InvoiceCurrency, number>): number => {
  return amount * rates[currency];
};

const calculateInsuranceRub = (invoiceRub: number, insurancePercent: number): number => {
  if (invoiceRub <= 0 || insurancePercent <= 0) return 0;
  return invoiceRub * (insurancePercent / 100);
};

const calculateDutyAndVat = (
  customsValueRub: number,
  needCustoms: boolean,
  customsDutyPercent: number
): { dutyRub: number; vatRub: number } => {
  if (!needCustoms || customsValueRub <= 0) {
    return { dutyRub: 0, vatRub: 0 };
  }

  const dutyRub = customsValueRub * (customsDutyPercent / 100);
  const vatRub = (customsValueRub + dutyRub) * (VAT_PERCENT / 100);

  return { dutyRub, vatRub };
};

const calculateAgentCommission = (baseRub: number, agentCommissionPercent: number): number => {
  if (baseRub <= 0 || agentCommissionPercent <= 0) return 0;
  return baseRub / (1 - agentCommissionPercent / 100) - baseRub;
};

const getAirDensityTier = (densityKgPerM3: number): AirDensityTier => {
  if (densityKgPerM3 <= AIR_PRICING.densityTierLimitsKgPerM3.d300) return 'd300';
  if (densityKgPerM3 <= AIR_PRICING.densityTierLimitsKgPerM3.d500) return 'd500';
  if (densityKgPerM3 <= AIR_PRICING.densityTierLimitsKgPerM3.d800) return 'd800';
  return 'x';
};

const getAirWeightBreak = (chargeableWeight: number): AirWeightBreak => {
  if (chargeableWeight >= AIR_PRICING.weightBreakThresholdsKg.plus1000) return 'plus1000';
  if (chargeableWeight >= AIR_PRICING.weightBreakThresholdsKg.plus500) return 'plus500';
  if (chargeableWeight >= AIR_PRICING.weightBreakThresholdsKg.plus300) return 'plus300';
  if (chargeableWeight >= AIR_PRICING.weightBreakThresholdsKg.plus100) return 'plus100';
  if (chargeableWeight >= AIR_PRICING.weightBreakThresholdsKg.plus45) return 'plus45';
  return 'n';
};

const getLtlRatePerM3 = (destination: string, volumeM3: number): number => {
  const table = LTL_PRICING.ratesUsdPerM3[destination as keyof typeof LTL_PRICING.ratesUsdPerM3];
  if (volumeM3 <= 3) return table.upTo3;
  if (volumeM3 <= 5) return table.upTo5;
  return table.upTo10;
};

const normalizeOrigin = (origin?: string): string => (origin || '').trim().toLowerCase();

const resolveLtlRouteName = (originCity: string | undefined, destination: string): string => {
  const normalized = normalizeOrigin(originCity);

  if (destination === 'Москва') {
    if (normalized.includes('changsha') || normalized.includes('чаньша') || normalized.includes('чанша')) {
      return 'Changsha -> Селятино';
    }
    return 'Chongqing -> Селятино';
  }

  return 'Chongqing -> Шушары';
};

export const calculateContainer = (
  data: LogisticsData,
  rates: LogisticsRates,
  agentCommissionPercent: number = AGENT_COMMISSION_PERCENT
): LogisticsResult => {
  if (!data.containerType || !data.portOfLoading || !data.destinationCity || !data.weightGross) {
    throw new Error('Не все поля для контейнерной перевозки заполнены');
  }

  const usdRate = rates.usd;
  const invoiceRates = getInvoiceRates(rates);

  const oceanRatesForPort = CONTAINER_PRICING.oceanRates[data.portOfLoading as keyof typeof CONTAINER_PRICING.oceanRates];
  const destKey = data.destinationCity === 'Москва' ? 'toMsk' : 'toSpb';
  const oceanRateUsd = oceanRatesForPort[destKey][data.containerType === '20DC' ? 0 : 1];
  const oceanFreightRub = oceanRateUsd * usdRate;

  const railRatesForCity = CONTAINER_PRICING.railRatesRub[
    data.destinationCity as keyof typeof CONTAINER_PRICING.railRatesRub
  ][data.containerType] as RailRateBucket;
  const railFreightRub =
    data.containerType === '20DC'
      ? data.weightGross <= 24000
        ? railRatesForCity.upTo24t!
        : railRatesForCity.from24to28t!
      : railRatesForCity.upTo26_5t!;

  const lastMileRub =
    CONTAINER_PRICING.lastMileRatesRub[data.destinationCity as keyof typeof CONTAINER_PRICING.lastMileRatesRub];

  const invoiceInRub = convertInvoiceToRub(data.invoiceAmount, data.invoiceCurrency, invoiceRates);
  const insuranceRub = calculateInsuranceRub(invoiceInRub, data.insurancePercent);
  const agentBase = invoiceInRub / (1 - agentCommissionPercent / 100);
  const agentCommissionRub = agentBase - invoiceInRub;
  const customsValueRub = invoiceInRub + oceanFreightRub + insuranceRub + agentCommissionRub;

  const { dutyRub, vatRub } = calculateDutyAndVat(customsValueRub, data.needCustoms, data.customsDutyPercent);
  const totalRub = oceanFreightRub + railFreightRub + lastMileRub + insuranceRub + agentCommissionRub + dutyRub + vatRub;

  return {
    totalRub,
    details: {
      oceanFreightRub,
      railFreightRub,
      lastMileRub,
      customsValueRub,
      dutyRub,
      vatRub,
      agentCommissionRub,
      insuranceRub,
      note: 'Морской фрахт включает погрузку/выгрузку. ЖД перевозка рассчитана по весу.',
    },
    inputData: data,
  };
};

export const calculateLTL = (
  data: LogisticsData,
  rates: LogisticsRates,
  agentCommissionPercent: number = AGENT_COMMISSION_PERCENT
): LogisticsResult => {
  if (!data.ltlDestination || !LTL_PRICING.destinations.includes(data.ltlDestination)) {
    throw new Error('Неверный город назначения. Доступно: Москва, Санкт-Петербург');
  }

  const volume = data.ltlVolume || 0;
  if (volume <= 0) {
    throw new Error('Для LCL нужен объем груза (м3)');
  }

  const usdRate = rates.usd;
  const invoiceRates = getInvoiceRates(rates);
  const destination = data.ltlDestination;
  const routeName = resolveLtlRouteName(data.originCity, destination);

  const billedVolume = Math.max(volume, LTL_PRICING.minBillableVolumeM3);
  const rateUsdPerM3 = getLtlRatePerM3(destination, billedVolume);
  const ltlFreightUsd = billedVolume * rateUsdPerM3;
  const totalTransportRub = ltlFreightUsd * usdRate;

  const invoiceInRub = convertInvoiceToRub(data.invoiceAmount, data.invoiceCurrency, invoiceRates);
  const insuranceRub = calculateInsuranceRub(invoiceInRub, data.insurancePercent);
  const agentCommissionRub = calculateAgentCommission(totalTransportRub, agentCommissionPercent);
  const customsValueRub = invoiceInRub + totalTransportRub + insuranceRub + agentCommissionRub;

  const { dutyRub, vatRub } = calculateDutyAndVat(customsValueRub, data.needCustoms, data.customsDutyPercent);
  const totalRub = totalTransportRub + insuranceRub + agentCommissionRub + dutyRub + vatRub;

  return {
    totalRub,
    details: {
      oceanFreightRub: 0,
      railFreightRub: totalTransportRub,
      lastMileRub: 0,
      customsValueRub,
      dutyRub,
      vatRub,
      agentCommissionRub,
      insuranceRub,
      note:
        `${LTL_PRICING.title}\n` +
        `- Маршрут: ${routeName}\n` +
        `- Объем: ${volume.toFixed(3)} м3 (тарифицируемый: ${billedVolume.toFixed(3)} м3)\n` +
        `- Ставка: $${rateUsdPerM3}/м3\n` +
        `- Фрахт LCL: $${ltlFreightUsd.toFixed(2)}\n` +
        `- Курс USD: ${usdRate} ₽`,
    },
    inputData: data,
  };
};

export const calculateAir = (
  data: LogisticsData,
  rates: LogisticsRates,
  agentCommissionPercent: number = AGENT_COMMISSION_PERCENT
): LogisticsResult => {
  if (!data.ltlDestination || !AIR_PRICING.destinations.includes(data.ltlDestination)) {
    throw new Error('Неверный город назначения. Доступно: Москва, Санкт-Петербург');
  }

  const weight = data.ltlWeight || 0;
  const volume = data.ltlVolume || 0;
  if (weight <= 0 || volume <= 0) {
    throw new Error('Для авиа нужны вес и объем груза');
  }

  const usdRate = rates.usd;
  const invoiceRates = getInvoiceRates(rates);
  const cnyRate = invoiceRates.CNY;

  const volumetricWeight = volume * AIR_PRICING.volumeFactor;
  const chargeableWeight = Math.max(weight, volumetricWeight);
  const densityKgPerM3 = weight / volume;
  const densityTier = getAirDensityTier(densityKgPerM3);
  const weightBreak = getAirWeightBreak(chargeableWeight);
  const rateUsdPerKg = AIR_PRICING.rateMatrixUsdPerKg[densityTier][weightBreak];

  const calculatedAirFreightUsd = chargeableWeight * rateUsdPerKg;
  const airFreightUsd = Math.max(calculatedAirFreightUsd, AIR_PRICING.minChargeUsd);
  const isMinChargeApplied = airFreightUsd !== calculatedAirFreightUsd;

  const preCarriageCny = AIR_PRICING.preCarriageCnyByDestination[data.ltlDestination] || 700;
  const preCarriageRub = preCarriageCny * cnyRate;

  const terminalRub =
    chargeableWeight > 100
      ? Math.max(chargeableWeight * AIR_PRICING.terminalRubPerKg, AIR_PRICING.terminalMinRub) +
        AIR_PRICING.borderFormalitiesRub
      : 0;

  const totalTransportRub = airFreightUsd * usdRate + preCarriageRub + terminalRub;

  const invoiceInRub = convertInvoiceToRub(data.invoiceAmount, data.invoiceCurrency, invoiceRates);
  const insuranceRub = calculateInsuranceRub(invoiceInRub, data.insurancePercent);
  const agentCommissionRub = calculateAgentCommission(totalTransportRub, agentCommissionPercent);
  const customsValueRub = invoiceInRub + totalTransportRub + insuranceRub + agentCommissionRub;

  const { dutyRub, vatRub } = calculateDutyAndVat(customsValueRub, data.needCustoms, data.customsDutyPercent);
  const totalRub = totalTransportRub + insuranceRub + agentCommissionRub + dutyRub + vatRub;

  return {
    totalRub,
    details: {
      oceanFreightRub: 0,
      railFreightRub: totalTransportRub,
      lastMileRub: 0,
      customsValueRub,
      dutyRub,
      vatRub,
      agentCommissionRub,
      insuranceRub,
      note:
        `${AIR_PRICING.title}\n` +
        `- Вес: ${weight.toFixed(2)} кг | Объем: ${volume.toFixed(3)} м3\n` +
        `- Объемный вес: ${volumetricWeight.toFixed(2)} кг | Плотность: ${densityKgPerM3.toFixed(0)} кг/м3\n` +
        `- Оплачиваемый вес: ${chargeableWeight.toFixed(2)} кг | Тариф: $${rateUsdPerKg}/кг (${weightBreak})\n` +
        `- Авиафрахт: $${airFreightUsd.toFixed(2)}${isMinChargeApplied ? ' (минимальный M-чардж)' : ''}\n` +
        `- Pre-carriage: ${preCarriageCny} CNY\n` +
        `- Терминал Шереметьево: ${terminalRub.toFixed(2)} ₽\n` +
        `- Курсы: USD ${usdRate} ₽, CNY ${cnyRate} ₽`,
    },
    inputData: data,
  };
};
