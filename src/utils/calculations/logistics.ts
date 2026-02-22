import { LogisticsData, LogisticsResult } from '../../types';

const AGENT_COMMISSION_PERCENT = 4;
const VAT_PERCENT = 22;

const OCEAN_RATES: Record<string, { toMsk: [number, number]; toSpb: [number, number] }> = {
  'Shanghai': { toMsk: [1400, 2200], toSpb: [1300, 2000] },
  'Ningbo': { toMsk: [1450, 2300], toSpb: [1350, 2000] },
  'Xingang (Tianjin)': { toMsk: [1450, 2300], toSpb: [1350, 2100] },
  'Qingdao': { toMsk: [1450, 2300], toSpb: [1350, 2000] },
  'Dalian': { toMsk: [1450, 2300], toSpb: [1350, 2100] },
};

const RAIL_RATES: Record<string, Record<string, { upTo24t?: number; from24to28t?: number; upTo26_5t?: number }>> = {
  'Москва': {
    '20DC': { upTo24t: 195300, from24to28t: 228300 },
    '40HC': { upTo26_5t: 298300 },
  },
  'Санкт-Петербург': {
    '20DC': { upTo24t: 191300, from24to28t: 221300 },
    '40HC': { upTo26_5t: 331300 },
  },
};

const LAST_MILE_RATES: Record<string, number> = {
  'Москва': 45000,
  'Санкт-Петербург': 33000,
};

export const calculateLogistics = (
  data: LogisticsData,
  usdRate: number
): LogisticsResult => {
  const oceanRatesForPort = OCEAN_RATES[data.portOfLoading];
  const destKey = data.destinationCity === 'Москва' ? 'toMsk' : 'toSpb';
  const oceanRateUsd = oceanRatesForPort[destKey][data.containerType === '20DC' ? 0 : 1];
  const oceanFreightRub = oceanRateUsd * usdRate;

  const railRatesForCity = RAIL_RATES[data.destinationCity][data.containerType];
  let railFreightRub = 0;
  if (data.containerType === '20DC') {
    if (data.weightGross <= 24000) railFreightRub = railRatesForCity.upTo24t!;
    else railFreightRub = railRatesForCity.from24to28t!;
  } else {
    railFreightRub = railRatesForCity.upTo26_5t!;
  }

  const lastMileRub = LAST_MILE_RATES[data.destinationCity];

  let invoiceInRub = data.invoiceAmount;
  if (data.invoiceCurrency === 'USD') invoiceInRub = data.invoiceAmount * usdRate;
  else if (data.invoiceCurrency === 'EUR') invoiceInRub = data.invoiceAmount * usdRate * 1.1;
  else if (data.invoiceCurrency === 'CNY') invoiceInRub = data.invoiceAmount * usdRate * 0.14;

  const insuranceRub = invoiceInRub * (data.insurancePercent / 100);
  const agentBase = invoiceInRub / (1 - AGENT_COMMISSION_PERCENT / 100);
  const agentCommissionRub = agentBase - invoiceInRub;

  const customsValueRub = invoiceInRub + oceanFreightRub + insuranceRub + agentCommissionRub;

  let dutyRub = 0, vatRub = 0;
  if (data.needCustoms) {
    dutyRub = customsValueRub * (data.customsDutyPercent / 100);
    vatRub = (customsValueRub + dutyRub) * (VAT_PERCENT / 100);
  }

  const totalRub = oceanFreightRub + railFreightRub + lastMileRub + agentCommissionRub + insuranceRub + dutyRub + vatRub;

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
      note: 'Морской фрахт включает погрузку и выгрузку в порту. ЖД перевозка рассчитана по весу груза.',
    },
    inputData: data,
  };
};