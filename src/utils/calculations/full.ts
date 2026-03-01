import { Product, GeneralSettings, CalculationResult } from '../../types';

const VOLUMETRIC_FACTORS = {
  avia: 167,
  sea: 1000,
  rail: 300,
  auto: 300,
};

const AGENT_REWARD_THRESHOLD_RUB = 1_000_000;
const AGENT_REWARD_MIN_RUB = 100_000;
const AGENT_REWARD_VAT_MULTIPLIER = 1.22;

export const calcProductPayableWeight = (
  product: Product,
  transportType: keyof typeof VOLUMETRIC_FACTORS
): number => {
  let totalWeight = 0;
  let totalVolume = 0;

  if (product.packingQtyPerBox && product.packingQtyPerBox > 0) {
    const boxes = Math.ceil(product.quantity / product.packingQtyPerBox);
    if (product.packingBoxWeight) {
      totalWeight = boxes * product.packingBoxWeight;
    } else {
      totalWeight = product.weightNetto * product.quantity;
    }

    if (product.packingBoxLength && product.packingBoxWidth && product.packingBoxHeight) {
      const boxVolumeM3 = (product.packingBoxLength * product.packingBoxWidth * product.packingBoxHeight) / 1_000_000;
      totalVolume = boxes * boxVolumeM3;
    } else {
      const itemVolumeM3 = (product.length * product.width * product.height) / 1_000_000;
      totalVolume = itemVolumeM3 * product.quantity;
    }
  } else {
    totalWeight = product.weightNetto * product.quantity;
    const itemVolumeM3 = (product.length * product.width * product.height) / 1_000_000;
    totalVolume = itemVolumeM3 * product.quantity;
  }

  const volumetricWeight = totalVolume * VOLUMETRIC_FACTORS[transportType];
  return Math.max(totalWeight, volumetricWeight);
};

export const calcProductGrossWeight = (product: Product): number => {
  if (product.packingQtyPerBox && product.packingQtyPerBox > 0 && product.packingBoxWeight) {
    const boxes = Math.ceil(product.quantity / product.packingQtyPerBox);
    return boxes * product.packingBoxWeight;
  }
  return product.weightNetto * product.quantity;
};

export const calcTotalInvoice = (products: Product[]): number => {
  return products.reduce((sum, product) => sum + product.price * product.quantity, 0);
};

export const calcTotalWeightNetto = (products: Product[]): number => {
  return products.reduce((sum, product) => sum + product.weightNetto * product.quantity, 0);
};

export const calcTotalMarking = (products: Product[]): number => {
  return products.reduce((sum, product) => {
    if (product.needMarking && product.markingPrice) {
      return sum + product.markingPrice * product.quantity;
    }
    return sum;
  }, 0);
};

export const getEffectiveRate = (settings: GeneralSettings): number => {
  if (settings.invoiceCurrency === 'EUR') return settings.euroRate;
  if (settings.invoiceCurrency === 'CNY') return settings.cnyRate;
  return settings.exchangeRate;
};

export const calcReversePercentCommission = (baseAmount: number, percent: number): number => {
  if (baseAmount <= 0 || percent <= 0) return 0;
  const share = percent / 100;
  if (share >= 1) return 0;
  return baseAmount / (1 - share) - baseAmount;
};

export const calcCustomsFeeByValue = (customsValueRub: number): number => {
  if (customsValueRub <= 200000) return 1231;
  if (customsValueRub <= 450000) return 2134;
  if (customsValueRub <= 1200000) return 4269;
  if (customsValueRub <= 2700000) return 11746;
  if (customsValueRub <= 4200000) return 16524;
  if (customsValueRub <= 5500000) return 21344;
  if (customsValueRub <= 7000000) return 27540;
  if (customsValueRub <= 9999999) return 30000;
  return 73860;
};

export const calcLogistics = (
  products: Product[],
  transportType: GeneralSettings['transportType'],
  logisticsRate: number,
  effectiveRate: number
): { payableWeight: number; logisticsCurrency: number; logisticsRub: number } => {
  const payableWeight = products.reduce(
    (sum, product) => sum + calcProductPayableWeight(product, transportType),
    0
  );

  const logisticsCurrency = payableWeight * logisticsRate;
  const logisticsRub = logisticsCurrency * effectiveRate;

  return { payableWeight, logisticsCurrency, logisticsRub };
};

export const calcInsuranceRub = (
  totalInvoiceCurrency: number,
  logisticsCurrency: number,
  insurancePercent: number,
  effectiveRate: number
): number => {
  if (insurancePercent <= 0) return 0;
  return (totalInvoiceCurrency + logisticsCurrency) * (insurancePercent / 100) * effectiveRate;
};

export const calcDutyRub = (
  products: Product[],
  totalInvoiceCurrency: number,
  customsValueRub: number,
  euroRate: number
): number => {
  if (customsValueRub <= 0 || totalInvoiceCurrency <= 0) return 0;

  return products.reduce((sum, product) => {
    const productInvoice = product.price * product.quantity;
    const productShare = productInvoice > 0 ? productInvoice / totalInvoiceCurrency : 0;
    const productCustomsPart = customsValueRub * productShare;

    const percentDuty = product.dutyPercent ? productCustomsPart * (product.dutyPercent / 100) : 0;
    const euroDuty = product.dutyEuro ? product.dutyEuro * calcProductGrossWeight(product) * euroRate : 0;

    return sum + percentDuty + euroDuty;
  }, 0);
};

export const calcBankCommissionsRub = (
  customsValueRub: number,
  bankCommissionPercent: number,
  bankTransferFeePercent: number,
  bankControlFeePercent: number
): number => {
  const totalBankPercent = (bankCommissionPercent + bankTransferFeePercent + bankControlFeePercent) / 100;
  return customsValueRub * totalBankPercent;
};

export const applyPercentMarkup = (baseAmount: number, markupPercent: number): number => {
  if (baseAmount <= 0 || markupPercent <= 0) return baseAmount;
  return baseAmount * (1 + markupPercent / 100);
};

export const calcAgentRewardRub = (
  invoiceRub: number,
  agentRewardPercent: number
): number => {
  if (agentRewardPercent <= 0 || invoiceRub <= 0) return 0;

  const rewardBaseRub = invoiceRub >= AGENT_REWARD_THRESHOLD_RUB
    ? invoiceRub * (agentRewardPercent / 100)
    : AGENT_REWARD_MIN_RUB;

  return rewardBaseRub * AGENT_REWARD_VAT_MULTIPLIER;
};

export const calculateTotalCost = (
  products: Product[],
  settings: GeneralSettings
): CalculationResult => {
  const {
    euroRate,
    agentCommissionPercent,
    exporterCommissionPercent,
    bankCommissionPercent,
    bankTransferFeePercent,
    bankControlFeePercent,
    customsFee,
    declarationCost,
    terminalCost,
    lastMileCostPerKg,
    transportType,
    logisticsRate,
    insurancePercent,
    agentRewardPercent,
    salesExporterMarkupPercent,
    salesAgentMarkupPercent,
    salesLogisticsMarkupCurrency,
  } = settings;

  const effectiveRate = getEffectiveRate(settings);

  const totalInvoiceCurrency = calcTotalInvoice(products);
  const invoiceRub = totalInvoiceCurrency * effectiveRate;

  const { logisticsCurrency } = calcLogistics(
    products,
    transportType,
    logisticsRate,
    effectiveRate
  );

  const insuranceRub = calcInsuranceRub(
    totalInvoiceCurrency,
    logisticsCurrency,
    insurancePercent,
    effectiveRate
  );

  const exporterCommissionCurrency = calcReversePercentCommission(
    totalInvoiceCurrency,
    exporterCommissionPercent
  );
  const exporterCommissionWithSalesCurrency = applyPercentMarkup(
    exporterCommissionCurrency,
    salesExporterMarkupPercent
  );
  const salesExporterMarkupRub = (exporterCommissionWithSalesCurrency - exporterCommissionCurrency) * effectiveRate;
  const exporterCommissionRub = exporterCommissionWithSalesCurrency * effectiveRate;

  const agentBaseCurrency = totalInvoiceCurrency + exporterCommissionCurrency;
  const agentCommissionCurrency = calcReversePercentCommission(agentBaseCurrency, agentCommissionPercent);
  const agentCommissionWithSalesCurrency = applyPercentMarkup(
    agentCommissionCurrency,
    salesAgentMarkupPercent
  );
  const salesAgentMarkupRub = (agentCommissionWithSalesCurrency - agentCommissionCurrency) * effectiveRate;
  const agentCommissionRub = agentCommissionWithSalesCurrency * effectiveRate;

  const logisticsWithSalesCurrency = logisticsCurrency + Math.max(salesLogisticsMarkupCurrency, 0);
  const salesLogisticsMarkupRub = Math.max(salesLogisticsMarkupCurrency, 0) * effectiveRate;
  const logisticsRub = logisticsWithSalesCurrency * effectiveRate;

  const customsValueRub =
    invoiceRub +
    insuranceRub +
    exporterCommissionRub +
    agentCommissionRub +
    logisticsRub;

  const dutyRub = calcDutyRub(products, totalInvoiceCurrency, customsValueRub, euroRate);
  const vatRub = (customsValueRub + dutyRub) * 0.2;

  const customsFeeRub = customsFee > 0 ? customsFee : calcCustomsFeeByValue(customsValueRub);
  const declarationCostRub = declarationCost;
  const terminalCostRub = terminalCost;

  const totalWeightNetto = calcTotalWeightNetto(products);
  const lastMileRub = totalWeightNetto * lastMileCostPerKg;

  const bankCommissionsRub = calcBankCommissionsRub(
    customsValueRub,
    bankCommissionPercent,
    bankTransferFeePercent,
    bankControlFeePercent
  );

  const markingRub = calcTotalMarking(products);

  const subtotalBeforeRewardRub =
    invoiceRub +
    logisticsRub +
    insuranceRub +
    exporterCommissionRub +
    agentCommissionRub +
    dutyRub +
    vatRub +
    customsFeeRub +
    declarationCostRub +
    terminalCostRub +
    lastMileRub +
    bankCommissionsRub +
    markingRub;

  const agentRewardRub = calcAgentRewardRub(invoiceRub, agentRewardPercent);

  const totalRub = subtotalBeforeRewardRub + agentRewardRub;
  const totalQuantity = products.reduce((sum, product) => sum + product.quantity, 0);
  const costPerItem = totalQuantity > 0 ? totalRub / totalQuantity : 0;

  return {
    totalRub,
    costPerItem,
    details: {
      invoiceRub,
      logisticsRub,
      insuranceRub,
      exporterCommissionRub,
      agentCommissionRub,
      salesExporterMarkupRub,
      salesAgentMarkupRub,
      salesLogisticsMarkupRub,
      customsValueRub,
      dutyRub,
      vatRub,
      customsFeeRub,
      declarationCostRub,
      terminalCostRub,
      lastMileRub,
      bankCommissionsRub,
      markingRub,
      agentRewardRub,
    },
  };
};
