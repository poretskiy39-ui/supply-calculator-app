import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { Product, GeneralSettings, CalculationResult } from '../types';
import { formatCurrency } from '../utils/formatters';

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '1 solid #eee' },
  label: { width: '50%', color: '#666' },
  value: { width: '50%', textAlign: 'right', fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, fontSize: 14 },
  totalValue: { color: '#C6A15B', fontWeight: 'bold' },
  marketing: { marginTop: 30, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8 },
});

interface Props {
  products: Product[];
  settings: GeneralSettings;
  result: CalculationResult;
}

const PDFDocument: React.FC<Props> = ({ products, settings, result }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>SupplyMaster</Text>
        <View style={styles.marketing}>
          <Text>Сколько на самом деле будет стоить ваш товар из Китая?</Text>
        </View>
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Общие параметры</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Валюта инвойса:</Text>
            <Text style={styles.value}>{settings.invoiceCurrency}</Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Товары</Text>
          {products.map((p, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{p.name || `Товар ${idx + 1}`}</Text>
              <Text style={styles.value}>{p.quantity} шт.</Text>
            </View>
          ))}
        </View>
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Итого</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Общая стоимость:</Text>
            <Text style={styles.value}>{formatCurrency(result.totalRub)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.label}>Себестоимость ед.:</Text>
            <Text style={styles.totalValue}>{formatCurrency(result.costPerItem)}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;