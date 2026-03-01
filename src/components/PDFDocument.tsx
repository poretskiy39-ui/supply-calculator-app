import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Product, GeneralSettings, CalculationResult } from '../types';
import { formatCurrency } from '../utils/formatters';

Font.register({
  family: 'Roboto',
  src: '/fonts/Roboto-Regular.ttf',
});

const styles = StyleSheet.create({
  page: {
    padding: 28,
    backgroundColor: '#F4F2EE',
    color: '#1C1C1C',
    fontFamily: 'Roboto',
    fontSize: 10,
  },
  header: {
    borderBottom: '1 solid #D7D3CC',
    paddingBottom: 10,
    marginBottom: 12,
  },
  brand: {
    fontSize: 20,
    letterSpacing: -0.4,
  },
  subbrand: {
    marginTop: 2,
    fontSize: 8,
    color: '#66635D',
    textTransform: 'uppercase',
  },
  section: {
    marginBottom: 10,
    backgroundColor: '#ECEAE5',
    border: '1 solid #DDD9D0',
    borderRadius: 8,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: 'uppercase',
    color: '#66635D',
    marginBottom: 7,
    letterSpacing: 0.6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingVertical: 4,
    borderBottom: '1 solid #DDD9D0',
  },
  label: {
    color: '#3A3A3A',
    width: '62%',
  },
  value: {
    width: '38%',
    textAlign: 'right',
    color: '#1C1C1C',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #D7D3CC',
    paddingBottom: 4,
    marginBottom: 2,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1 solid #E4E1DA',
    paddingVertical: 4,
  },
  c1: { width: '38%' },
  c2: { width: '14%', textAlign: 'right' },
  c3: { width: '16%', textAlign: 'right' },
  c4: { width: '16%', textAlign: 'right' },
  c5: { width: '16%', textAlign: 'right' },
  totalBlock: {
    marginTop: 6,
    paddingTop: 8,
    borderTop: '1.5 solid #1C1C1C',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 2,
  },
  totalLabel: {
    fontSize: 10,
    textTransform: 'uppercase',
  },
  totalValue: {
    fontSize: 15,
  },
  footer: {
    marginTop: 10,
    fontSize: 8,
    color: '#888880',
    textAlign: 'right',
  },
});

interface Props {
  products: Product[];
  settings: GeneralSettings;
  result: CalculationResult;
}

const transportMap: Record<GeneralSettings['transportType'], string> = {
  avia: 'Авиа',
  sea: 'Море',
  rail: 'ЖД',
  auto: 'Авто',
};

const PDFDocument: React.FC<Props> = ({ products, settings, result }) => {
  const rows = [
    ['Инвойс', result.details.invoiceRub],
    ['Логистика', result.details.logisticsRub],
    ['Страховка', result.details.insuranceRub],
    ['Комиссия экспортёра', result.details.exporterCommissionRub],
    ['Комиссия платёжного агента', result.details.agentCommissionRub],
    ['Наценка продаж: экспортёр', result.details.salesExporterMarkupRub],
    ['Наценка продаж: платёжный агент', result.details.salesAgentMarkupRub],
    ['Наценка продаж: логистика', result.details.salesLogisticsMarkupRub],
    ['Таможенная стоимость', result.details.customsValueRub],
    ['Пошлина', result.details.dutyRub],
    ['НДС 20%', result.details.vatRub],
    ['Таможенный сбор', result.details.customsFeeRub],
    ['Подача декларации', result.details.declarationCostRub],
    ['Терминал', result.details.terminalCostRub],
    ['Последняя миля', result.details.lastMileRub],
    ['Комиссии банков', result.details.bankCommissionsRub],
    ['Честный знак', result.details.markingRub],
    ['Агентское вознаграждение', result.details.agentRewardRub],
  ].filter(([, value]) => Number(value) > 0);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.brand}>MOVERS GROUP</Text>
          <Text style={styles.subbrand}>Global Logistics | Supply Calculator Report</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Параметры расчёта</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Валюта инвойса</Text>
            <Text style={styles.value}>{settings.invoiceCurrency}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Базис поставки</Text>
            <Text style={styles.value}>{settings.incoterms}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Тип транспорта</Text>
            <Text style={styles.value}>{transportMap[settings.transportType]}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Товары</Text>
          <View style={styles.tableHeader}>
            <Text style={styles.c1}>Наименование</Text>
            <Text style={styles.c2}>Кол-во</Text>
            <Text style={styles.c3}>Цена</Text>
            <Text style={styles.c4}>Вес, кг</Text>
            <Text style={styles.c5}>Сумма</Text>
          </View>
          {products.map((product, index) => (
            <View style={styles.tableRow} key={product.id || index}>
              <Text style={styles.c1}>{product.name || `Товар ${index + 1}`}</Text>
              <Text style={styles.c2}>{product.quantity}</Text>
              <Text style={styles.c3}>{product.price.toFixed(2)}</Text>
              <Text style={styles.c4}>{product.weightNetto.toFixed(2)}</Text>
              <Text style={styles.c5}>{(product.price * product.quantity).toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Детализация затрат</Text>
          {rows.map(([name, value]) => (
            <View key={name} style={styles.row}>
              <Text style={styles.label}>{name}</Text>
              <Text style={styles.value}>{formatCurrency(Number(value))}</Text>
            </View>
          ))}

          <View style={styles.totalBlock}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Итого</Text>
              <Text style={styles.totalValue}>{formatCurrency(result.totalRub)}</Text>
            </View>
            <View style={styles.totalRow}>
              <Text style={styles.label}>Себестоимость единицы</Text>
              <Text style={styles.value}>{formatCurrency(result.costPerItem)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>Сформировано автоматически в Supply Calculator</Text>
      </Page>
    </Document>
  );
};

export default PDFDocument;
