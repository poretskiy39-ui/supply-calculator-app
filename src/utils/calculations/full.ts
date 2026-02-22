import { Product, GeneralSettings, CalculationResult } from '../../types';

// Коэффициенты объёмного веса для разных типов транспорта (кг/м³)
const VOLUMETRIC_FACTORS = {
  avia: 167,
  sea: 1000,
  rail: 300,
  auto: 300,
};

// Расчёт платного веса для одного товара с учётом упаковки
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

export const calcTotalInvoice = (products: Product[]): number => {
  return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
};

export const calcTotalWeightNetto = (products: Product[]): number => {
  return products.reduce((sum, p) => sum + p.weightNetto * p.quantity, 0);
};

export const calcTotalMarking = (products: Product[]): number => {
  return products.reduce((sum, p) => {
    if (p.needMarking && p.markingPrice) {
      return sum + p.markingPrice * p.quantity;
    }
    return sum;
  }, 0);
};

export const calculateTotalCost = (
  products: Product[],
  settings: GeneralSettings
): CalculationResult => {
  const {
    invoiceCurrency,
    exchangeRate,
    euroRate,
    cnyRate,
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
  } = settings;

  let effectiveRate = exchangeRate;
  if (invoiceCurrency === 'EUR') effectiveRate = euroRate;
  else if (invoiceCurrency === 'CNY') effectiveRate = cnyRate;

  const totalInvoiceCurrency = calcTotalInvoice(products);
  const invoiceRub = totalInvoiceCurrency * effectiveRate;

  let totalPayableWeight = 0;
  products.forEach(p => {
    totalPayableWeight += calcProductPayableWeight(p, transportType);
  });
  const logisticsCurrency = totalPayableWeight * logisticsRate;
  const logisticsRub = logisticsCurrency * effectiveRate;

  const insuranceRub = (totalInvoiceCurrency + logisticsCurrency) * (insurancePercent / 100) * effectiveRate;
  const exporterCommissionRub = totalInvoiceCurrency * (exporterCommissionPercent / 100) * effectiveRate;

  const agentBase = totalInvoiceCurrency + (totalInvoiceCurrency * (exporterCommissionPercent / 100));
  const agentCommissionCurrency = agentBase * (agentCommissionPercent / 100) / (1 - agentCommissionPercent / 100);
  const agentCommissionRub = agentCommissionCurrency * effectiveRate;

  const customsValueRub = invoiceRub + logisticsRub + insuranceRub;

  let dutyRub = 0;
  products.forEach(p => {
    const productInvoice = p.price * p.quantity;
    const productShare = productInvoice / totalInvoiceCurrency;
    const productCustomsPart = customsValueRub * productShare;
    if (p.dutyPercent) {
      dutyRub += productCustomsPart * (p.dutyPercent / 100);
    } else if (p.dutyEuro) {
      dutyRub += p.dutyEuro * p.quantity * euroRate;
    }
  });

  const vatRub = (customsValueRub + dutyRub) * 0.2;
  const customsFeeRub = customsFee;
  const declarationCostRub = declarationCost;
  const terminalCostRub = terminalCost;

  const totalWeightNetto = calcTotalWeightNetto(products);
  const lastMileRub = totalWeightNetto * lastMileCostPerKg;

  const bankCommissionsRub = invoiceRub * (
    (bankCommissionPercent + bankTransferFeePercent + bankControlFeePercent) / 100
  );

  const markingRub = calcTotalMarking(products);

  const subtotalBeforeReward =
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

  const agentRewardRub = subtotalBeforeReward * (agentRewardPercent / 100);
  const totalRub = subtotalBeforeReward + agentRewardRub;
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
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