import { LogisticsData, LogisticsResult } from '../../types';

const AGENT_COMMISSION_PERCENT = 4;
const VAT_PERCENT = 22;

const OCEAN_RATES: Record<string, { toMsk: [number, number]; toSpb: [number, number] }> = {
  Shanghai: { toMsk: [1400, 2200], toSpb: [1300, 2000] },
  Ningbo: { toMsk: [1450, 2300], toSpb: [1350, 2000] },
  'Xingang (Tianjin)': { toMsk: [1450, 2300], toSpb: [1350, 2100] },
  Qingdao: { toMsk: [1450, 2300], toSpb: [1350, 2000] },
  Dalian: { toMsk: [1450, 2300], toSpb: [1350, 2100] },
};

const RAIL_RATES: Record<string, Record<string, { upTo24t?: number; from24to28t?: number; upTo26_5t?: number }>> = {
  Москва: {
    '20DC': { upTo24t: 195300, from24to28t: 228300 },
    '40HC': { upTo26_5t: 298300 },
  },
  'Санкт-Петербург': {
    '20DC': { upTo24t: 191300, from24to28t: 221300 },
    '40HC': { upTo26_5t: 331300 },
  },
};

const LAST_MILE_RATES: Record<string, number> = {
  Москва: 45000,
  'Санкт-Петербург': 33000,
};

const LTL_CONFIG = {
  volumeFactor: 250,
  baseRateUsd: 2.8,
  pickupRateUsd: 0.3,
  deliveryRateUsd: 0.2,
  minChargeUsd: 300,
  destinations: ['Москва', 'Санкт-Петербург'],
};

export const calculateContainer = (
  data: LogisticsData,
  usdRate: number,
  agentCommissionPercent: number = AGENT_COMMISSION_PERCENT
): LogisticsResult => {
  if (!data.containerType || !data.portOfLoading || !data.destinationCity || !data.weightGross) {
    throw new Error('Не все поля для контейнерной перевозки заполнены');
  }

  const oceanRatesForPort = OCEAN_RATES[data.portOfLoading];
  const destKey = data.destinationCity === 'Москва' ? 'toMsk' : 'toSpb';
  const oceanRateUsd = oceanRatesForPort[destKey][data.containerType === '20DC' ? 0 : 1];
  const oceanFreightRub = oceanRateUsd * usdRate;

  const railRatesForCity = RAIL_RATES[data.destinationCity][data.containerType];
  const railFreightRub =
    data.containerType === '20DC'
      ? data.weightGross <= 24000
        ? railRatesForCity.upTo24t!
        : railRatesForCity.from24to28t!
      : railRatesForCity.upTo26_5t!;

  const lastMileRub = LAST_MILE_RATES[data.destinationCity];

  let invoiceInRub = data.invoiceAmount;
  if (data.invoiceCurrency === 'USD') invoiceInRub = data.invoiceAmount * usdRate;
  else if (data.invoiceCurrency === 'EUR') invoiceInRub = data.invoiceAmount * usdRate * 1.1;
  else if (data.invoiceCurrency === 'CNY') invoiceInRub = data.invoiceAmount * usdRate * 0.14;

  const insuranceRub = invoiceInRub * (data.insurancePercent / 100);
  const agentBase = invoiceInRub / (1 - agentCommissionPercent / 100);
  const agentCommissionRub = agentBase - invoiceInRub;
  const customsValueRub = invoiceInRub + oceanFreightRub + insuranceRub + agentCommissionRub;

  let dutyRub = 0;
  let vatRub = 0;
  if (data.needCustoms) {
    dutyRub = customsValueRub * (data.customsDutyPercent / 100);
    vatRub = (customsValueRub + dutyRub) * (VAT_PERCENT / 100);
  }

  const totalRub =
    oceanFreightRub +
    railFreightRub +
    lastMileRub +
    agentCommissionRub +
    insuranceRub +
    dutyRub +
    vatRub;

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
  usdRate: number,
  agentCommissionPercent: number = AGENT_COMMISSION_PERCENT
): LogisticsResult => {
  if (!data.ltlDestination || !LTL_CONFIG.destinations.includes(data.ltlDestination)) {
    throw new Error('Неверный город назначения. Доступно: Москва, Санкт-Петербург');
  }

  const weight = data.ltlWeight || 0;
  const volume = data.ltlVolume || 0;
  const volumetricWeight = volume * LTL_CONFIG.volumeFactor;
  const payableWeight = Math.max(weight, volumetricWeight);

  let transportCostUsd = payableWeight * LTL_CONFIG.baseRateUsd;
  if (transportCostUsd < LTL_CONFIG.minChargeUsd) {
    transportCostUsd = LTL_CONFIG.minChargeUsd;
  }

  const pickupCostUsd = data.ltlPickup ? weight * LTL_CONFIG.pickupRateUsd : 0;
  const deliveryCostUsd = data.ltlDelivery ? weight * LTL_CONFIG.deliveryRateUsd : 0;
  const totalTransportUsd = transportCostUsd + pickupCostUsd + deliveryCostUsd;
  const totalTransportRub = totalTransportUsd * usdRate;

  let invoiceInRub = data.invoiceAmount;
  if (data.invoiceCurrency === 'USD') invoiceInRub = data.invoiceAmount * usdRate;
  else if (data.invoiceCurrency === 'EUR') invoiceInRub = data.invoiceAmount * usdRate * 1.1;
  else if (data.invoiceCurrency === 'CNY') invoiceInRub = data.invoiceAmount * usdRate * 0.14;

  const agentBase = totalTransportRub / (1 - agentCommissionPercent / 100);
  const agentCommissionRub = agentBase - totalTransportRub;
  const customsValueRub = invoiceInRub + totalTransportRub + agentCommissionRub;

  let dutyRub = 0;
  let vatRub = 0;
  if (data.needCustoms) {
    dutyRub = customsValueRub * (data.customsDutyPercent / 100);
    vatRub = (customsValueRub + dutyRub) * (VAT_PERCENT / 100);
  }

  const totalRub = totalTransportRub + agentCommissionRub + dutyRub + vatRub;

  return {
    totalRub,
    details: {
      oceanFreightRub: 0,
      railFreightRub: totalTransportRub,
      lastMileRub: deliveryCostUsd * usdRate,
      customsValueRub,
      dutyRub,
      vatRub,
      agentCommissionRub,
      insuranceRub: 0,
      note:
        `Сборное авто из Китая в ${data.ltlDestination}\n` +
        `- Вес: ${weight} кг | Объем: ${volume} м3\n` +
        `- Оплачиваемый вес: ${payableWeight.toFixed(0)} кг\n` +
        `- Базовая ставка: $${LTL_CONFIG.baseRateUsd}/кг\n` +
        `- Забор груза: ${data.ltlPickup ? `да (+$${pickupCostUsd.toFixed(2)})` : 'нет'}\n` +
        `- Доставка: ${data.ltlDelivery ? `да (+$${deliveryCostUsd.toFixed(2)})` : 'нет'}\n` +
        `- Стоимость товара: ${invoiceInRub.toFixed(0)} ₽\n` +
        `- Таможенная стоимость: ${customsValueRub.toFixed(0)} ₽\n` +
        `- Курс USD: ${usdRate} ₽`,
    },
    inputData: data,
  };
};
