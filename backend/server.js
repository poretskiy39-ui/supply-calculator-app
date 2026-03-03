const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
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

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const SHIPMENT_STATUSES = ['waiting', 'in_transit', 'customs', 'delivered', 'delayed'];
const EVENT_STATUSES = ['done', 'active', 'pending'];

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
  : '*';
const corsOptions = {
  origin: corsOrigins,
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Telegram-Init-Data'],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '250kb' }));

const isObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);
const safeText = (value, fallback = 'нет') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};
const MINI_APP_URL = safeText(process.env.MINI_APP_URL, 'https://app.routex.io');
const asString = (value) => {
  if (Array.isArray(value)) return asString(value[0]);
  if (typeof value === 'string') return value;
  return '';
};
const parsePositiveInt = (value) => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};
const formatRub = (value) => Math.round(Number(value) || 0).toLocaleString('ru-RU');
const nowRu = () => new Date().toLocaleString('ru-RU');
const nowIso = () => new Date().toISOString();
const statusToEventStatus = (status) => {
  if (status === 'delivered') return 'done';
  if (status === 'waiting' || status === 'delayed') return 'pending';
  return 'active';
};

const managersStore = [
  {
    id: 1,
    email: safeText(process.env.MANAGER_EMAIL, 'manager@routex.io').toLowerCase(),
    password: safeText(process.env.MANAGER_PASSWORD, 'manager123'),
    name: safeText(process.env.MANAGER_NAME, 'Main Manager'),
    role: 'manager',
    isActive: true,
  },
  {
    id: 2,
    email: safeText(process.env.ADMIN_EMAIL, 'admin@routex.io').toLowerCase(),
    password: safeText(process.env.ADMIN_PASSWORD, 'admin123'),
    name: safeText(process.env.ADMIN_NAME, 'Admin'),
    role: 'admin',
    isActive: true,
  },
];

const managerSessions = new Map();

const shipmentsStore = [
  {
    id: 'RTX-2026-001',
    clientTelegramId: 261559409,
    clientUsername: 'movers_group',
    clientName: 'Иван Петров',
    managerId: 1,
    managerName: 'Main Manager',
    fromCity: 'Shanghai',
    toCity: 'Москва',
    status: 'in_transit',
    etaDate: '2026-03-22',
    vessel: 'Ever Nimbus',
    container: 'MSCU4589021',
    weight: 18400,
    volume: 67.4,
    cargoType: 'Одежда',
    updatedAt: '2026-03-03T08:30:00.000Z',
    events: [
      {
        id: 1,
        title: 'Груз принят у отправителя',
        detail: 'Проверены документы и маркировка',
        status: 'done',
        notifySent: true,
        createdAt: '2026-02-24T10:10:00.000Z',
      },
      {
        id: 2,
        title: 'Контейнер отправлен из порта',
        detail: 'Выход из Shanghai по графику',
        status: 'active',
        notifySent: true,
        createdAt: '2026-03-01T06:20:00.000Z',
      },
      {
        id: 3,
        title: 'Ожидается прибытие в РФ',
        detail: 'Далее перегрузка на ЖД',
        status: 'pending',
        notifySent: false,
        createdAt: '2026-03-09T00:00:00.000Z',
      },
    ],
    notifications: [
      {
        id: 1,
        text: 'Отправление RTX-2026-001 вышло из Shanghai.',
        createdAt: '2026-03-01T06:25:00.000Z',
      },
    ],
  },
  {
    id: 'RTX-2026-002',
    clientTelegramId: 261559409,
    clientUsername: 'movers_group',
    clientName: 'Иван Петров',
    managerId: 2,
    managerName: 'Admin',
    fromCity: 'Ningbo',
    toCity: 'Санкт-Петербург',
    status: 'customs',
    etaDate: '2026-03-12',
    vessel: 'Sino Star',
    container: 'CSNU3201145',
    weight: 6200,
    volume: 21.3,
    cargoType: 'Электроника',
    updatedAt: '2026-03-03T09:50:00.000Z',
    events: [
      {
        id: 1,
        title: 'Груз прибыл на СВХ',
        detail: 'Передан в таможенный контур',
        status: 'done',
        notifySent: true,
        createdAt: '2026-02-27T11:05:00.000Z',
      },
      {
        id: 2,
        title: 'Таможенное оформление',
        detail: 'Ожидание выпуска ДТ',
        status: 'active',
        notifySent: false,
        createdAt: '2026-03-03T09:45:00.000Z',
      },
    ],
    notifications: [],
  },
  {
    id: 'RTX-2026-003',
    clientTelegramId: 111222333,
    clientUsername: 'demo_import',
    clientName: 'ООО Демо Импорт',
    managerId: 1,
    managerName: 'Main Manager',
    fromCity: 'Qingdao',
    toCity: 'Москва',
    status: 'waiting',
    etaDate: '2026-03-30',
    vessel: 'Haixin 22',
    container: 'TGBU7001456',
    weight: 3400,
    volume: 11.8,
    cargoType: 'Косметика',
    updatedAt: '2026-03-02T13:00:00.000Z',
    events: [
      {
        id: 1,
        title: 'Создано отправление',
        detail: 'Ожидается сдача груза на склад консолидации',
        status: 'active',
        notifySent: false,
        createdAt: '2026-03-02T13:00:00.000Z',
      },
    ],
    notifications: [],
  },
];

function managerPublic(manager) {
  return {
    id: manager.id,
    email: manager.email,
    name: manager.name,
    role: manager.role,
  };
}

function cleanupExpiredSessions() {
  const now = Date.now();
  for (const [token, session] of managerSessions.entries()) {
    if (session.expiresAt <= now) {
      managerSessions.delete(token);
    }
  }
}

function createSession(manager) {
  cleanupExpiredSessions();
  const token = crypto.randomBytes(24).toString('hex');
  const expiresAt = Date.now() + SESSION_TTL_MS;
  managerSessions.set(token, {
    managerId: manager.id,
    expiresAt,
  });
  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
    user: managerPublic(manager),
  };
}

function requireManager(req, res, next) {
  cleanupExpiredSessions();
  const authHeader = asString(req.headers.authorization);
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.slice(7).trim();
  const session = managerSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid session' });
  }

  const manager = managersStore.find((item) => item.id === session.managerId && item.isActive);
  if (!manager) {
    managerSessions.delete(token);
    return res.status(401).json({ error: 'Manager is inactive' });
  }

  req.manager = manager;
  req.managerToken = token;
  return next();
}

function findShipmentById(id) {
  return shipmentsStore.find((shipment) => shipment.id === id);
}

function shipmentSummary(shipment) {
  return {
    id: shipment.id,
    fromCity: shipment.fromCity,
    toCity: shipment.toCity,
    status: shipment.status,
    etaDate: shipment.etaDate,
    vessel: shipment.vessel,
    container: shipment.container,
    weight: shipment.weight,
    volume: shipment.volume,
    cargoType: shipment.cargoType,
    updatedAt: shipment.updatedAt,
    lastEvent: shipment.events[shipment.events.length - 1] || null,
  };
}

function shipmentDetailed(shipment) {
  return {
    ...shipmentSummary(shipment),
    clientTelegramId: shipment.clientTelegramId,
    clientUsername: shipment.clientUsername,
    clientName: shipment.clientName,
    managerId: shipment.managerId,
    managerName: shipment.managerName,
    events: shipment.events,
    notifications: shipment.notifications,
  };
}

function nextShipmentId() {
  const year = new Date().getFullYear();
  const prefix = `RTX-${year}-`;
  let maxNum = 0;
  for (const shipment of shipmentsStore) {
    if (shipment.id.startsWith(prefix)) {
      const num = Number(shipment.id.slice(prefix.length));
      if (Number.isInteger(num) && num > maxNum) {
        maxNum = num;
      }
    }
  }
  return `${prefix}${String(maxNum + 1).padStart(3, '0')}`;
}

function nextEventId(shipment) {
  return shipment.events.reduce((maxValue, event) => Math.max(maxValue, Number(event.id) || 0), 0) + 1;
}

function nextNotificationId(shipment) {
  return shipment.notifications.reduce((maxValue, item) => Math.max(maxValue, Number(item.id) || 0), 0) + 1;
}

function resolveClientIdentity(req) {
  const demo = asString(req.query.demo) === '1';
  const telegramId = parsePositiveInt(asString(req.query.telegramId));
  const username = safeText(asString(req.query.username), '').toLowerCase();
  return {
    demo,
    telegramId,
    username,
  };
}

function canAccessClientShipment(shipment, identity) {
  if (identity.demo) return true;
  if (identity.telegramId && shipment.clientTelegramId === identity.telegramId) return true;
  if (identity.username && shipment.clientUsername.toLowerCase() === identity.username) return true;
  return false;
}

function validateContactPayload(data) {
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

function buildTrackingInlineKeyboard(shipmentId) {
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: 'Открыть трекинг',
            web_app: { url: `${MINI_APP_URL}?tab=tracking&id=${shipmentId}` },
          },
        ],
      ],
    },
  };
}

async function notifyClient(shipment, messageText) {
  if (!shipment.clientTelegramId) {
    return false;
  }

  await bot.telegram.sendMessage(
    shipment.clientTelegramId,
    messageText,
    buildTrackingInlineKeyboard(shipment.id)
  );
  return true;
}

app.post('/api/contact', async (req, res, next) => {
  try {
    const data = req.body;
    const errors = validateContactPayload(data);
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

app.get('/api/client/shipments', (req, res) => {
  const identity = resolveClientIdentity(req);
  const hasClientIdentity = Boolean(identity.telegramId || identity.username || identity.demo);

  if (!hasClientIdentity) {
    return res.status(400).json({ error: 'telegramId or username is required' });
  }

  const shipments = shipmentsStore.filter((shipment) => canAccessClientShipment(shipment, identity));
  return res.json({
    items: shipments.map(shipmentSummary),
    mode: identity.demo ? 'demo' : 'user',
  });
});

app.get('/api/client/shipments/:id', (req, res) => {
  const identity = resolveClientIdentity(req);
  const shipment = findShipmentById(req.params.id);

  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }

  if (!canAccessClientShipment(shipment, identity)) {
    return res.status(403).json({ error: 'Access denied for this shipment' });
  }

  return res.json({ item: shipmentDetailed(shipment) });
});

app.post('/auth/manager/login', (req, res) => {
  const email = safeText(req.body?.email, '').toLowerCase();
  const password = safeText(req.body?.password, '');
  if (!email || !password) {
    return res.status(400).json({ error: 'email and password are required' });
  }

  const manager = managersStore.find(
    (item) => item.email === email && item.password === password && item.isActive
  );
  if (!manager) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const session = createSession(manager);
  return res.json(session);
});

app.get('/auth/verify', requireManager, (req, res) => {
  return res.json({
    user: managerPublic(req.manager),
  });
});

app.post('/auth/manager/logout', requireManager, (req, res) => {
  managerSessions.delete(req.managerToken);
  return res.json({ success: true });
});

app.get('/admin/shipments', requireManager, (req, res) => {
  const statusFilter = safeText(asString(req.query.status), '');
  const managerIdFilter = parsePositiveInt(asString(req.query.managerId));
  const search = safeText(asString(req.query.search), '').toLowerCase();

  const filtered = shipmentsStore.filter((shipment) => {
    if (statusFilter && shipment.status !== statusFilter) return false;
    if (managerIdFilter && shipment.managerId !== managerIdFilter) return false;
    if (search) {
      const haystack = [
        shipment.id,
        shipment.clientName,
        shipment.clientUsername,
        shipment.fromCity,
        shipment.toCity,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  return res.json({
    items: filtered.map(shipmentDetailed),
  });
});

app.get('/admin/shipments/:id', requireManager, (req, res) => {
  const shipment = findShipmentById(req.params.id);
  if (!shipment) {
    return res.status(404).json({ error: 'Shipment not found' });
  }
  return res.json({ item: shipmentDetailed(shipment) });
});

app.post('/admin/shipments', requireManager, (req, res) => {
  const payload = req.body || {};
  const fromCity = safeText(payload.fromCity, '');
  const toCity = safeText(payload.toCity, '');
  const cargoType = safeText(payload.cargoType, '');
  const clientName = safeText(payload.clientName, '');

  if (!fromCity || !toCity || !cargoType || !clientName) {
    return res.status(400).json({
      error: 'fromCity, toCity, cargoType and clientName are required',
    });
  }

  const shipment = {
    id: nextShipmentId(),
    clientTelegramId: parsePositiveInt(payload.clientTelegramId),
    clientUsername: safeText(payload.clientUsername, 'нет'),
    clientName,
    managerId: req.manager.id,
    managerName: req.manager.name,
    fromCity,
    toCity,
    status: 'waiting',
    etaDate: safeText(payload.etaDate, ''),
    vessel: safeText(payload.vessel, 'TBD'),
    container: safeText(payload.container, 'TBD'),
    weight: Number(payload.weight) || 0,
    volume: Number(payload.volume) || 0,
    cargoType,
    updatedAt: nowIso(),
    events: [
      {
        id: 1,
        title: 'Отправление создано',
        detail: safeText(payload.firstEventDetail, 'Ожидается приемка на склад'),
        status: 'active',
        notifySent: false,
        createdAt: nowIso(),
      },
    ],
    notifications: [],
  };

  shipmentsStore.unshift(shipment);
  return res.status(201).json({ item: shipmentDetailed(shipment) });
});

app.patch('/admin/shipments/:id/status', requireManager, async (req, res, next) => {
  try {
    const shipment = findShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const status = safeText(req.body?.status, '');
    const title = safeText(req.body?.title, '');
    const detail = safeText(req.body?.detail, '');
    const notifyClientFlag = Boolean(req.body?.notifyClient);

    if (!SHIPMENT_STATUSES.includes(status)) {
      return res.status(400).json({ error: `status must be one of: ${SHIPMENT_STATUSES.join(', ')}` });
    }
    if (!title) {
      return res.status(400).json({ error: 'title is required' });
    }

    shipment.status = status;
    if (safeText(req.body?.etaDate, '')) {
      shipment.etaDate = safeText(req.body.etaDate, shipment.etaDate);
    }
    shipment.updatedAt = nowIso();

    const event = {
      id: nextEventId(shipment),
      title,
      detail,
      status: statusToEventStatus(status),
      notifySent: false,
      createdAt: nowIso(),
    };
    if (!EVENT_STATUSES.includes(event.status)) {
      event.status = 'active';
    }
    shipment.events.push(event);

    let notificationSent = false;
    if (notifyClientFlag) {
      const notifyMessage = [
        `⚠️ Обновление по отправлению ${shipment.id}`,
        `${title}${detail ? `\n${detail}` : ''}`,
        `Новый статус: ${status}`,
        shipment.etaDate ? `ETA: ${shipment.etaDate}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      try {
        notificationSent = await notifyClient(shipment, notifyMessage);
      } catch (notifyError) {
        console.error('Failed to notify client:', notifyError);
      }
    }

    event.notifySent = notificationSent;
    if (notificationSent) {
      shipment.notifications.push({
        id: nextNotificationId(shipment),
        text: title,
        createdAt: nowIso(),
      });
    }

    return res.json({
      item: shipmentDetailed(shipment),
      notificationSent,
    });
  } catch (err) {
    return next(err);
  }
});

app.post('/admin/shipments/:id/notify', requireManager, async (req, res, next) => {
  try {
    const shipment = findShipmentById(req.params.id);
    if (!shipment) {
      return res.status(404).json({ error: 'Shipment not found' });
    }

    const text = safeText(req.body?.text, '');
    if (!text) {
      return res.status(400).json({ error: 'text is required' });
    }

    const sent = await notifyClient(shipment, `🔔 ${shipment.id}\n${text}`);
    if (sent) {
      shipment.notifications.push({
        id: nextNotificationId(shipment),
        text,
        createdAt: nowIso(),
      });
    }

    return res.json({ success: true, sent });
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
