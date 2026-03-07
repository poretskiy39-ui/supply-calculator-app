// src/config/logisticsPricing.ts
import type { DestinationCity } from '../types';

export type AirDensityTier = 'x' | 'd300' | 'd500' | 'd800';
export type AirWeightBreak = 'n' | 'plus45' | 'plus100' | 'plus300' | 'plus500' | 'plus1000';

export const LOGISTICS_DEFAULTS = {
  agentCommissionPercent: 4,
  vatPercent: 22, // НДС 22% (с 2025 года)
} as const;

export const CONTAINER_PRICING = {
  oceanRates: {
    Shanghai:            { toMsk: [1400, 2200], toSpb: [1300, 2000] },
    Ningbo:              { toMsk: [1450, 2300], toSpb: [1350, 2000] },
    'Xingang (Tianjin)': { toMsk: [1450, 2300], toSpb: [1350, 2100] },
    Qingdao:             { toMsk: [1450, 2300], toSpb: [1350, 2000] },
    Dalian:              { toMsk: [1450, 2300], toSpb: [1350, 2100] },
  } as const,
  railRatesRub: {
    Москва: {
      '20DC': { upTo24t: 195300, from24to28t: 228300 },
      '40HC': { upTo26_5t: 298300 },
    },
    'Санкт-Петербург': {
      '20DC': { upTo24t: 191300, from24to28t: 221300 },
      '40HC': { upTo26_5t: 331300 },
    },
  } as const,
  lastMileRatesRub: {
    Москва:            45000,
    'Санкт-Петербург': 33000,
  } as const,
} as const;

export const LTL_PRICING = {
  title: 'Сборное авто (LCL) из Китая',
  destinations: ['Москва', 'Санкт-Петербург'] as const,
  ratesUsdPerM3: {
    Москва:            { upTo3: 155, upTo5: 145, upTo10: 135 },
    'Санкт-Петербург': { upTo3: 160, upTo5: 150, upTo10: 140 },
  } as const,
  minBillableVolumeM3: 1,
} as const;

export const AIR_PRICING = {
  title: 'Авиадоставка из Китая (по матрице)',
  volumeFactor: 167,
  destinations: ['Москва', 'Санкт-Петербург'] as const,
  densityTierLimitsKgPerM3: { d300: 300, d500: 500, d800: 800 },
  weightBreakThresholdsKg:  { plus45: 45, plus100: 100, plus300: 300, plus500: 500, plus1000: 1000 },
  rateMatrixUsdPerKg: {
    x:    { n: 68, plus45: 40, plus100: 22, plus300: 21, plus500: 20, plus1000: 19 },
    d300: { n: 68, plus45: 40, plus100: 19, plus300: 18, plus500: 17, plus1000: 16 },
    d500: { n: 68, plus45: 40, plus100: 18, plus300: 17, plus500: 16, plus1000: 15 },
    d800: { n: 68, plus45: 40, plus100: 17, plus300: 16, plus500: 15, plus1000: 14 },
  } as const,
  preCarriageCnyByDestination: {
    Москва:            600,
    'Санкт-Петербург': 800,
  } satisfies Record<DestinationCity, number>,
  minChargeUsd:         350,
  terminalRubPerKg:     28.8,
  terminalMinRub:       2270,
  borderFormalitiesRub: 1392,
} as const;

// ── EU → TR → RF ─────────────────────────────────────────────────────────────
export const EU_TR_RU_PRICING = {
  title: 'ЕС → Турция → Россия (авто через границу)',
  traderCommissionDefaultPercent: 5,   // % от инвойса
  istanbulStorageRubPerDay: 3500,       // руб/день хранения Стамбул
  truckIstanbulToRuFix: 280_000,        // фура Стамбул → граница РФ (руб)
  svhRuDefaultRubPerDay: 5_000,         // СВХ Россия (руб/день)
  svhDefaultDays: 3,
  customsFeeRub: 8_530,
  declarationCostRub: 30_500,
} as const;
