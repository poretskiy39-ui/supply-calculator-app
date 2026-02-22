import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { Product, GeneralSettings, CalculationResult } from '../types';
import { formatCurrency } from '../utils/formatters';

// Регистрируем шрифт Roboto
Font.register({
  family: 'Roboto',
  src: '/fonts/Roboto-Regular.ttf',
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 10 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  logo: { width: 60, height: 60, backgroundColor: '#C6A15B' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#C6A15B' },
  subtitle: { fontSize: 12, color: '#666', marginTop: 4 },
  section: { marginBottom: 20 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', backgroundColor: '#C6A15B', color: '#fff', padding: 8, marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '1 solid #eee' },
  label: { width: '50%', color: '#666' },
  value: { width: '50%', textAlign: 'right', fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, fontSize: 12, borderTop: '2 solid #C6A15B', paddingTop: 8 },
  totalLabel: { fontWeight: 'bold' },
  totalValue: { fontWeight: 'bold', color: '#C6A15B' },
  table: { marginTop: 10 },
  tableHeader: { flexDirection: 'row', backgroundColor: '#f2f2f2', padding: 8, fontWeight: 'bold', fontSize: 9 },
  tableRow: { flexDirection: 'row', padding: 8, borderBottom: '1 solid #eee', fontSize: 9 },
  col1: { width: '40%' },
  col2: { width: '15%', textAlign: 'right' },
  col3: { width: '15%', textAlign: 'right' },
  col4: { width: '15%', textAlign: 'right' },
  col5: { width: '15%', textAlign: 'right' },
  marketing: { marginTop: 30, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8 },
  marketingTitle: { fontSize: 14, fontWeight: 'bold', color: '#C6A15B', marginBottom: 10 },
  marketingText: { fontSize: 9, marginBottom: 4, color: '#333', lineHeight: 1.5 },
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', fontSize: 8, color: '#999', borderTop: '1 solid #eee', paddingTop: 10 },
});

interface Props {
  products: Product[];
  settings: GeneralSettings;
  result: CalculationResult;
}

const PDFDocument: React.FC<Props> = ({ products, settings, result }) => {
  // const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Шапка с логотипом и названием */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>MOVERS GROUP</Text>
            <Text style={styles.subtitle}>Профессиональный расчёт поставок</Text>
          </View>
          <Image src="/logo.png" style={styles.logo} />
        </View>

        {/* Маркетинговый блок */}
        <View style={styles.marketing}>
          <Text style={styles.marketingTitle}>Сколько на самом деле будет стоить ваш товар из Китая?</Text>
          <Text style={styles.marketingText}>
            Знакомо: запросили у фабрики цену, прикинули в уме фрахт и... получили итоговую стоимость на 30-40% выше? 😱
            Таможенные платежи, сертификация, сборы в портах — эти «скрытые» расходы съедают маржу.
          </Text>
          <Text style={styles.marketingText}>
            ✅ Детализированный юнит: Мы сделали инструмент, которого не хватало каждому селлеру.
            Вы видите финальную стоимость партии и цену за единицу — ту самую, с которой вы будете выходить на маркетплейс.
          </Text>
        </View>

        {/* Общие параметры */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Общие параметры</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Валюта инвойса:</Text>
            <Text style={styles.value}>{settings.invoiceCurrency}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Курс:</Text>
            <Text style={styles.value}>
              {settings.invoiceCurrency === 'USD' && settings.exchangeRate}
              {settings.invoiceCurrency === 'EUR' && settings.euroRate}
              {settings.invoiceCurrency === 'CNY' && settings.cnyRate} ₽
            </Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Базис поставки:</Text>
            <Text style={styles.value}>{settings.incoterms}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Транспорт:</Text>
            <Text style={styles.value}>
              {settings.transportType === 'avia' ? 'Авиа' :
               settings.transportType === 'sea' ? 'Море' :
               settings.transportType === 'rail' ? 'Ж/Д' : 'Авто'}
            </Text>
          </View>
        </View>

        {/* Таблица товаров */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Товары</Text>
          <View style={styles.table}>
            <View style={styles.tableHeader}>
              <Text style={styles.col1}>Наименование</Text>
              <Text style={styles.col2}>Кол-во</Text>
              <Text style={styles.col3}>Цена за шт.</Text>
              <Text style={styles.col4}>Вес нетто (кг)</Text>
              <Text style={styles.col5}>Сумма</Text>
            </View>
            {products.map((p, idx) => (
              <View key={idx} style={styles.tableRow}>
                <Text style={styles.col1}>{p.name || `Товар ${idx + 1}`}</Text>
                <Text style={styles.col2}>{p.quantity}</Text>
                <Text style={styles.col3}>{p.price.toFixed(2)}</Text>
                <Text style={styles.col4}>{p.weightNetto.toFixed(2)}</Text>
                <Text style={styles.col5}>{(p.price * p.quantity).toFixed(2)}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Детализация затрат */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Детализация затрат</Text>
          <View style={styles.row}><Text style={styles.label}>Инвойс</Text><Text style={styles.value}>{formatCurrency(result.details.invoiceRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Логистика</Text><Text style={styles.value}>{formatCurrency(result.details.logisticsRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Страховка</Text><Text style={styles.value}>{formatCurrency(result.details.insuranceRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Комиссия экспортёра</Text><Text style={styles.value}>{formatCurrency(result.details.exporterCommissionRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Комиссия платёжного агента</Text><Text style={styles.value}>{formatCurrency(result.details.agentCommissionRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Таможенная стоимость</Text><Text style={styles.value}>{formatCurrency(result.details.customsValueRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Пошлина</Text><Text style={styles.value}>{formatCurrency(result.details.dutyRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>НДС 20%</Text><Text style={styles.value}>{formatCurrency(result.details.vatRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Таможенный сбор</Text><Text style={styles.value}>{formatCurrency(result.details.customsFeeRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Подача декларации</Text><Text style={styles.value}>{formatCurrency(result.details.declarationCostRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Терминал</Text><Text style={styles.value}>{formatCurrency(result.details.terminalCostRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Последняя миля</Text><Text style={styles.value}>{formatCurrency(result.details.lastMileRub)}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Комиссии банков</Text><Text style={styles.value}>{formatCurrency(result.details.bankCommissionsRub)}</Text></View>
          {result.details.markingRub > 0 && <View style={styles.row}><Text style={styles.label}>Честный знак</Text><Text style={styles.value}>{formatCurrency(result.details.markingRub)}</Text></View>}
          <View style={styles.row}><Text style={styles.label}>Агентское вознаграждение</Text><Text style={styles.value}>{formatCurrency(result.details.agentRewardRub)}</Text></View>
        </View>

        {/* Итог */}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>ИТОГО</Text>
          <Text style={styles.totalValue}>{formatCurrency(result.totalRub)}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Себестоимость единицы (средняя)</Text>
          <Text style={styles.value}>{formatCurrency(result.costPerItem)}</Text>
        </View>

        {/* Этапы сотрудничества */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Этапы сотрудничества</Text>
          <Text style={styles.marketingText}>1. Консультация и анализ товара (ТН ВЭД, сертификация)</Text>
          <Text style={styles.marketingText}>2. Расчёт полной стоимости поставки (наш инструмент)</Text>
          <Text style={styles.marketingText}>3. Заключение договора и оплата</Text>
          <Text style={styles.marketingText}>4. Организация доставки «под ключ» (забор груза в Китае, логистика, таможня)</Text>
          <Text style={styles.marketingText}>5. Доставка до вашего склада в РФ</Text>
        </View>

        {/* Футер */}
        <Text style={styles.footer}>SupplyMaster — ваш надёжный партнёр в импорте из Китая</Text>
      </Page>
    </Document>
  );
};

export default PDFDocument;