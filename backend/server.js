const express = require('express');
const cors = require('cors');
const { Telegraf } = require('telegraf');
require('dotenv').config();

const requiredEnv = ['BOT_TOKEN', 'ADMIN_CHAT_ID'];
const missingEnv = requiredEnv.filter((envName) => !process.env[envName]);
if (missingEnv.length > 0) {
  throw new Error(`Missing required env vars: ${missingEnv.join(', ')}`);
}

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const bot = new Telegraf(process.env.BOT_TOKEN);
const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : '*';
const corsOptions = {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '100kb' }));

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeText = (value, fallback = 'нет') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};
const formatRub = (value) => Math.round(Number(value) || 0).toLocaleString('ru-RU');
const nowRu = () => new Date().toLocaleString('ru-RU');

function validatePayload(data) {
  const errors = [];

  if (!isObject(data)) {
    return ['Request body must be a JSON object'];
  }

  if (data.serviceType !== 'full' && data.serviceType !== 'logistics') {
    errors.push('serviceType must be "full" or "logistics"');
  }

  if (!isObject(data.contact)) {
    errors.push('contact is required');
  } else {
    if (!safeText(data.contact.name, '')) errors.push('contact.name is required');
    if (!safeText(data.contact.phone, '')) errors.push('contact.phone is required');
    if (!safeText(data.contact.email, '')) errors.push('contact.email is required');
  }

  if (data.serviceType === 'full') {
    if (!Array.isArray(data.products) || data.products.length === 0) {
      errors.push('products must be a non-empty array for serviceType="full"');
    }
    if (!isObject(data.result) || typeof data.result.totalRub !== 'number') {
      errors.push('result.totalRub must be a number for serviceType="full"');
    }
  }

  if (data.serviceType === 'logistics') {
    if (!isObject(data.logisticsData)) {
      errors.push('logisticsData is required for serviceType="logistics"');
    } else {
      const transportType = data.logisticsData.transportType;
      if (!['container', 'air', 'ltl'].includes(transportType)) {
        errors.push('logisticsData.transportType must be one of: container, air, ltl');
      }
      if (!safeText(data.logisticsData.productName, '')) {
        errors.push('logisticsData.productName is required');
      }
    }
    if (!isObject(data.result) || typeof data.result.totalRub !== 'number') {
      errors.push('result.totalRub must be a number for serviceType="logistics"');
    }
  }

  return errors;
}

function buildContactLine(contact) {
  return `👤 Контакт: ${safeText(contact.name, 'не указан')} (${safeText(contact.company, 'без компании')})`;
}

function buildTelegramUserLine(telegramUser) {
  return `🆔 Telegram: ${safeText(telegramUser?.username)} (ID: ${telegramUser?.id ?? 'нет'})`;
}

function buildFullMessage(data) {
  const contact = data.contact || {};
  const result = data.result || {};
  return `
📦 ПОСТАВКА ПОД КЛЮЧ
${buildContactLine(contact)}
📞 Телефон: ${safeText(contact.phone, 'не указан')}
✉️ Email: ${safeText(contact.email, 'не указан')}
${buildTelegramUserLine(data.telegramUser)}
📦 Товаров: ${Array.isArray(data.products) ? data.products.length : 0}
💰 Итого: ${formatRub(result.totalRub)} ₽
📊 Себестоимость ед.: ${formatRub(result.costPerItem)} ₽
🕐 ${nowRu()}
  `.trim();
}

function buildLogisticsMessage(data) {
  const contact = data.contact || {};
  const logisticsData = data.logisticsData || {};
  const result = data.result || {};
  const logisticsTypeLabel =
    logisticsData.transportType === 'container'
      ? 'Контейнер'
      : logisticsData.transportType === 'air'
        ? 'Авиа'
        : 'Сборное авто';
  const cargoInfo =
    logisticsData.transportType === 'container'
      ? `Вес: ${logisticsData.weightGross ?? 0} кг, Контейнер: ${safeText(logisticsData.containerType)}`
      : `Вес: ${logisticsData.ltlWeight ?? 0} кг, Объем: ${logisticsData.ltlVolume ?? 0} м3`;
  const routeInfo =
    logisticsData.transportType === 'container'
      ? `${safeText(logisticsData.portOfLoading)} -> ${safeText(logisticsData.destinationCity)}`
      : `${safeText(logisticsData.originCity, 'Китай')} -> ${safeText(logisticsData.ltlDestination)}`;

  return `
🚢 ТОЛЬКО ЛОГИСТИКА (FOB)
${buildContactLine(contact)}
📞 Телефон: ${safeText(contact.phone, 'не указан')}
✉️ Email: ${safeText(contact.email, 'не указан')}
${buildTelegramUserLine(data.telegramUser)}

📦 Товар: ${safeText(logisticsData.productName, 'не указан')}
🚛 Тип перевозки: ${logisticsTypeLabel}
📏 ${cargoInfo}
🧭 Маршрут: ${routeInfo}
💰 Стоимость товара: ${formatRub(logisticsData.invoiceAmount)} ${safeText(logisticsData.invoiceCurrency, 'USD')}
${logisticsData.needCustoms ? '🛃 Таможня: да' : '🛃 Таможня: нет'}

💰 ИТОГО: ${formatRub(result.totalRub)} ₽
🕐 ${nowRu()}
  `.trim();
}

app.post('/api/contact', async (req, res, next) => {
  try {
    const data = req.body;
    const errors = validatePayload(data);
    if (errors.length > 0) {
      return res.status(400).json({ error: 'Invalid request', details: errors });
    }

    console.log('Received application type:', data.serviceType);
    const message = data.serviceType === 'full' ? buildFullMessage(data) : buildLogisticsMessage(data);
    await bot.telegram.sendMessage(ADMIN_CHAT_ID, message);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

app.get('/health', (req, res) => res.send('OK'));

app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  console.error('Error:', err);
  return res.status(500).json({ error: 'Internal error' });
});

process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason) => console.error('Unhandled Rejection:', reason));

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
