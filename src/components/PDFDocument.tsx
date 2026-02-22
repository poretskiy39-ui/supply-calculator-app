import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Product, GeneralSettings, CalculationResult } from '../types';
import { formatCurrency } from '../utils/formatters';

// Регистрируем шрифт Roboto с поддержкой кириллицы
Font.register({
  family: 'Roboto',
  src: '/fonts/Roboto-Regular.ttf', // путь от корня сайта (public)
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Roboto', fontSize: 11 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  section: { marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4, borderBottom: '1 solid #eee' },
  label: { width: '50%', color: '#666' },
  value: { width: '50%', textAlign: 'right', fontWeight: 'bold' },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, fontSize: 14 },
  totalValue: { color: '#C6A15B', fontWeight: 'bold' },
  marketing: { marginTop: 30, padding: 20, backgroundColor: '#f9f9f9', borderRadius: 8 },
  marketingText: { fontSize: 10, marginBottom: 5, lineHeight: 1.5 },
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
        
        {/* Маркетинговый блок (полный текст) */}
        <View style={styles.marketing}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>
            Сколько на самом деле будет стоить ваш товар из Китая? Считаем юнит-экономику.
          </Text>
          <Text style={styles.marketingText}>
            Знакомо: запросили у фабрики цену, прикинули в уме фрахт и... получили итоговую стоимость на 30-40% выше? 😱 Таможенные платежи, сертификация, сборы в портах — эти «скрытые» расходы съедают маржу и превращают выгодную закупку в убыточную.
          </Text>
          <Text style={styles.marketingText}>
            ❌ Обычный расчет: Цена товара + примерная доставка = «надеюсь, хватит».
          </Text>
          <Text style={styles.marketingText}>
            ✅ Детализированный юнит: Мы сделали инструмент, которого не хватало каждому селлеру. Вы видите финальную стоимость партии и цену за единицу — ту самую, с которой вы будете выходить на маркетплейс.
          </Text>
        </View>

        {/* Общие параметры */}
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Общие параметры</Text>
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
        </View>

        {/* Товары */}
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Товары</Text>
          {products.map((p, idx) => (
            <View key={idx} style={styles.row}>
              <Text style={styles.label}>{p.name || `Товар ${idx + 1}`}</Text>
              <Text style={styles.value}>
                {p.quantity} шт. × {p.price} {settings.invoiceCurrency}
              </Text>
            </View>
          ))}
        </View>

        {/* Итог */}
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

        {/* Этапы сотрудничества */}
        <View style={styles.section}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 10 }}>Этапы сотрудничества</Text>
          <Text style={styles.marketingText}>1. Консультация и анализ товара (ТН ВЭД, сертификация)</Text>
          <Text style={styles.marketingText}>2. Расчёт полной стоимости поставки (наш инструмент)</Text>
          <Text style={styles.marketingText}>3. Заключение договора и оплата</Text>
          <Text style={styles.marketingText}>4. Организация доставки «под ключ»</Text>
          <Text style={styles.marketingText}>5. Доставка до вашего склада в РФ</Text>
        </View>
      </Page>
    </Document>
  );
};

export default PDFDocument;