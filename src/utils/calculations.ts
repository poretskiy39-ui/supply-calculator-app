import { Product, GeneralSettings, CalculationResult } from '../types';

// Расчёт объёмного веса (коэффициент 200 для всех типов транспорта, можно уточнить)
const VOLUMETRIC_FACTOR = 200; // кг/м³

// Расчёт платного веса для одного товара с учётом упаковки
export const calcProductPayableWeight = (
  product: Product,
  transportType: string
): number => {
  // Если есть упаковка, используем данные мастер-бокса
  let totalWeight = 0;
  let totalVolume = 0;

  if (product.packingQtyPerBox && product.packingQtyPerBox > 0) {
    // Рассчитываем количество коробок
    const boxes = Math.ceil(product.quantity / product.packingQtyPerBox);
    // Вес брутто всех коробок
    if (product.packingBoxWeight) {
      totalWeight = boxes * product.packingBoxWeight;
    } else {
      // Если нет веса бокса, используем вес нетто * количество
      totalWeight = product.weightNetto * product.quantity;
    }
    // Объём всех коробок
    if (product.packingBoxLength && product.packingBoxWidth && product.packingBoxHeight) {
      const boxVolumeM3 = (product.packingBoxLength * product.packingBoxWidth * product.packingBoxHeight) / 1_000_000;
      totalVolume = boxes * boxVolumeM3;
    } else {
      // Если нет габаритов бокса, считаем объём товара * количество
      const itemVolumeM3 = (product.length * product.width * product.height) / 1_000_000;
      totalVolume = itemVolumeM3 * product.quantity;
    }
  } else {
    // Без упаковки
    totalWeight = product.weightNetto * product.quantity;
    const itemVolumeM3 = (product.length * product.width * product.height) / 1_000_000;
    totalVolume = itemVolumeM3 * product.quantity;
  }

  // Объёмный вес
  const volumetricWeight = totalVolume * VOLUMETRIC_FACTOR;
  return Math.max(totalWeight, volumetricWeight);
};

// Расчёт общей стоимости инвойса в валюте
export const calcTotalInvoice = (products: Product[]): number => {
  return products.reduce((sum, p) => sum + p.price * p.quantity, 0);
};

// Расчёт общей массы нетто (для последней мили)
export const calcTotalWeightNetto = (products: Product[]): number => {
  return products.reduce((sum, p) => sum + p.weightNetto * p.quantity, 0);
};

// Расчёт общей стоимости Честного знака
export const calcTotalMarking = (products: Product[]): number => {
  return products.reduce((sum, p) => {
    if (p.needMarking && p.markingPrice) {
      return sum + p.markingPrice * p.quantity;
    }
    return sum;
  }, 0);
};

// Основная функция расчёта всех затрат
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

  // Выбираем курс в зависимости от валюты инвойса
  let effectiveRate = exchangeRate; // по умолчанию USD
  if (invoiceCurrency === 'EUR') effectiveRate = euroRate;
  else if (invoiceCurrency === 'CNY') effectiveRate = cnyRate;

  // 1. Инвойс в рублях
  const totalInvoiceCurrency = calcTotalInvoice(products);
  const invoiceRub = totalInvoiceCurrency * effectiveRate;

  // 2. Логистика
  let totalPayableWeight = 0;
  products.forEach(p => {
    totalPayableWeight += calcProductPayableWeight(p, transportType);
  });
  const logisticsCurrency = totalPayableWeight * logisticsRate; // в USD
  const logisticsRub = logisticsCurrency * effectiveRate;

  // 3. Страховка (обычно % от инвойса + логистика)
  const insuranceRub = (totalInvoiceCurrency + logisticsCurrency) * (insurancePercent / 100) * effectiveRate;

  // 4. Комиссия экспортёра (от инвойса)
  const exporterCommissionRub = totalInvoiceCurrency * (exporterCommissionPercent / 100) * effectiveRate;

  // 5. Комиссия платёжного агента (от инвойса + комиссия экспортёра)
  const agentBase = totalInvoiceCurrency + (totalInvoiceCurrency * (exporterCommissionPercent / 100));
  const agentCommissionRub = agentBase * (agentCommissionPercent / 100) * effectiveRate;

  // 6. Таможенная стоимость = инвойс + логистика до границы + страховка
  const customsValueRub = invoiceRub + logisticsRub + insuranceRub;

  // 7. Пошлина (пропорционально доле товара)
  let dutyRub = 0;
  products.forEach(p => {
    const productInvoice = p.price * p.quantity;
    const productShare = productInvoice / totalInvoiceCurrency; // доля товара в инвойсе
    const productCustomsPart = customsValueRub * productShare; // часть таможенной стоимости, приходящаяся на товар
    if (p.dutyPercent) {
      dutyRub += productCustomsPart * (p.dutyPercent / 100);
    } else if (p.dutyEuro) {
      // Предполагаем, что dutyEuro указана за единицу товара
      dutyRub += p.dutyEuro * p.quantity * euroRate;
    }
  });

  // 8. НДС = (таможенная стоимость + пошлина) * 20%
  const vatRub = (customsValueRub + dutyRub) * 0.2;

  // 9. Таможенный сбор (фикс)
  const customsFeeRub = customsFee;

  // 10. Подача декларации
  const declarationCostRub = declarationCost;

  // 11. Терминальная обработка
  const terminalCostRub = terminalCost;

  // 12. Последняя миля (за кг нетто)
  const totalWeightNetto = calcTotalWeightNetto(products);
  const lastMileRub = totalWeightNetto * lastMileCostPerKg;

  // 13. Комиссии банков (от инвойса в рублях)
  const bankCommissionsRub = invoiceRub * (
    (bankCommissionPercent + bankTransferFeePercent + bankControlFeePercent) / 100
  );

  // 14. Честный знак
  const markingRub = calcTotalMarking(products);

  // 15. Агентское вознаграждение (от всех затрат до него)
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

  // Итого
  const totalRub = subtotalBeforeReward + agentRewardRub;

  // Средняя себестоимость единицы
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