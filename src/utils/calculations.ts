import { Product, GeneralSettings, CalculationResult } from '../types';

// Коэффициенты объёмного веса для разных типов транспорта (кг/м³)
const VOLUMETRIC_FACTORS = {
  avia: 167,   // для авиа обычно 167 кг/м³
  sea: 1000,   // для моря 1000 кг/м³ (т.е. 1 м³ = 1000 кг)
  rail: 300,   // для ЖД часто 300-350
  auto: 300,   // для авто тоже около 300
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

  // 2. Логистика (платный вес зависит от транспорта)
  let totalPayableWeight = 0;
  products.forEach(p => {
    totalPayableWeight += calcProductPayableWeight(p, transportType);
  });
  const logisticsCurrency = totalPayableWeight * logisticsRate;
  const logisticsRub = logisticsCurrency * effectiveRate;

  // 3. Страховка
  const insuranceRub = (totalInvoiceCurrency + logisticsCurrency) * (insurancePercent / 100) * effectiveRate;

  // 4. Комиссия экспортёра
  const exporterCommissionRub = totalInvoiceCurrency * (exporterCommissionPercent / 100) * effectiveRate;

  // 5. Комиссия платежного агента (обратный процент)
  // Сумма, которую нужно отправить агенту, чтобы после удержания комиссии фабрика получила чистый инвойс
  const agentBaseCurrency = totalInvoiceCurrency + (totalInvoiceCurrency * (exporterCommissionPercent / 100)); // уже с комиссией экспортёра
  const agentCommissionCurrency = agentBaseCurrency * (agentCommissionPercent / 100) / (1 - agentCommissionPercent / 100); // обратный процент
  const agentCommissionRub = agentCommissionCurrency * effectiveRate;

  // 6. Таможенная стоимость (упрощённо: инвойс + логистика + страховка)
  const customsValueRub = invoiceRub + logisticsRub + insuranceRub;

  // 7. Пошлина (пропорционально доле товара)
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

  // 8. НДС
  const vatRub = (customsValueRub + dutyRub) * 0.2;

  // 9. Таможенный сбор
  const customsFeeRub = customsFee;

  // 10. Подача декларации
  const declarationCostRub = declarationCost;

  // 11. Терминал
  const terminalCostRub = terminalCost;

  // 12. Последняя миля
  const totalWeightNetto = calcTotalWeightNetto(products);
  const lastMileRub = totalWeightNetto * lastMileCostPerKg;

  // 13. Комиссии банков (от инвойса)
  const bankCommissionsRub = invoiceRub * (
    (bankCommissionPercent + bankTransferFeePercent + bankControlFeePercent) / 100
  );

  // 14. Честный знак
  const markingRub = calcTotalMarking(products);

  // 15. Агентское вознаграждение
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