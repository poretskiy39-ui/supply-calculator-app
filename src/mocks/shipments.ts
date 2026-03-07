import {
  ManagerSession,
  ManagerUser,
  ShipmentDetails,
  ShipmentEvent,
  ShipmentEventStatus,
  ShipmentNotification,
  ShipmentStatus,
  ShipmentSummary,
} from '../types';

const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
const shipmentStatuses: ShipmentStatus[] = ['waiting', 'in_transit', 'customs', 'delivered', 'delayed'];

interface MockManagerRecord extends ManagerUser {
  password: string;
  isActive: boolean;
}

interface MockSessionRecord {
  managerId: number;
  expiresAt: number;
}

interface ClientIdentity {
  telegramId?: number | null;
  username?: string;
  demo?: boolean;
}

interface AdminListParams {
  status?: string;
  search?: string;
}

interface CreateShipmentPayload {
  clientName: string;
  clientTelegramId?: number | string | null;
  clientUsername?: string;
  fromCity: string;
  toCity: string;
  cargoType: string;
  etaDate?: string;
  vessel?: string;
  container?: string;
  weight?: number | string;
  volume?: number | string;
  firstEventDetail?: string;
  paymentTotalRub?: number | string;
  paymentPaidRub?: number | string;
}

interface UpdateStatusPayload {
  status: ShipmentStatus;
  title: string;
  detail?: string;
  etaDate?: string;
  notifyClient?: boolean;
}

interface UpdatePaymentPayload {
  paymentTotalRub?: number | string;
  paymentPaidRub?: number | string;
}

const managersStore: MockManagerRecord[] = [
  {
    id: 1,
    email: 'manager@routex.io',
    password: 'manager123',
    name: 'Main Manager',
    role: 'manager',
    isActive: true,
  },
  {
    id: 2,
    email: 'admin@routex.io',
    password: 'admin123',
    name: 'Admin',
    role: 'admin',
    isActive: true,
  },
];

const managerSessions = new Map<string, MockSessionRecord>();

const nowIso = () => new Date().toISOString();
const sleep = (ms = 120) => new Promise((resolve) => setTimeout(resolve, ms));

const toPublicManager = (manager: MockManagerRecord): ManagerUser => ({
  id: manager.id,
  email: manager.email,
  name: manager.name,
  role: manager.role,
});

const statusToEventStatus = (status: ShipmentStatus): ShipmentEventStatus => {
  if (status === 'delivered') return 'done';
  if (status === 'waiting' || status === 'delayed') return 'pending';
  return 'active';
};

const makeEvent = (
  id: number,
  title: string,
  detail: string,
  status: ShipmentEventStatus,
  createdAt: string,
  notifySent = false
): ShipmentEvent => ({
  id,
  title,
  detail,
  status,
  createdAt,
  notifySent,
});

const makeNotification = (id: number, text: string, createdAt: string): ShipmentNotification => ({
  id,
  text,
  createdAt,
});

const makeShipment = (input: Omit<ShipmentDetails, 'lastEvent'>): ShipmentDetails => ({
  ...input,
  lastEvent: input.events[input.events.length - 1] || null,
});

const shipmentsStore: ShipmentDetails[] = [
  makeShipment({
    id: 'RTX-2026-001',
    route: 'china_ru',
    clientTelegramId: 261559409,
    clientUsername: 'movers_group',
    clientName: 'Ivan Petrov',
    managerId: 1,
    managerName: 'Main Manager',
    fromCity: 'Shanghai',
    toCity: 'Moscow',
    status: 'in_transit',
    etaDate: '2026-03-22',
    vessel: 'Ever Nimbus',
    container: 'MSCU4589021',
    weight: 18400,
    volume: 67.4,
    cargoType: 'Textile',
    updatedAt: '2026-03-03T08:30:00.000Z',
    events: [
      makeEvent(1, 'Cargo accepted', 'Documents checked and loaded for departure.', 'done', '2026-02-24T10:10:00.000Z', true),
      makeEvent(2, 'Container departed', 'Vessel departed from Shanghai by schedule.', 'active', '2026-03-01T06:20:00.000Z', true),
      makeEvent(3, 'Arrival expected', 'Transfer to rail is planned after port arrival.', 'pending', '2026-03-09T00:00:00.000Z'),
    ],
    notifications: [makeNotification(1, 'Shipment RTX-2026-001 departed from Shanghai.', '2026-03-01T06:25:00.000Z')],
    invoiceUsd: 56000,
    planCostRub: 4250000,
    planRevenueRub: 4860000,
    planMarginRub: 610000,
    planMarginPercent: 12.55,
    paymentTotalRub: 4860000,
    paymentPaidRub: 2430000,
  }),
  makeShipment({
    id: 'RTX-2026-002',
    route: 'china_ru',
    clientTelegramId: 261559409,
    clientUsername: 'movers_group',
    clientName: 'Ivan Petrov',
    managerId: 2,
    managerName: 'Admin',
    fromCity: 'Ningbo',
    toCity: 'Saint Petersburg',
    status: 'customs',
    etaDate: '2026-03-12',
    vessel: 'Sino Star',
    container: 'CSNU3201145',
    weight: 6200,
    volume: 21.3,
    cargoType: 'Electronics',
    updatedAt: '2026-03-03T09:50:00.000Z',
    events: [
      makeEvent(1, 'Arrived at customs warehouse', 'Shipment transferred to customs broker.', 'done', '2026-02-27T11:05:00.000Z', true),
      makeEvent(2, 'Customs processing', 'Awaiting declaration release.', 'active', '2026-03-03T09:45:00.000Z'),
    ],
    notifications: [],
    paymentTotalRub: 1980000,
    paymentPaidRub: 1220000,
  }),
  makeShipment({
    id: 'RTX-2026-003',
    route: 'china_ru',
    clientTelegramId: 111222333,
    clientUsername: 'demo_import',
    clientName: 'Demo Import LLC',
    managerId: 1,
    managerName: 'Main Manager',
    fromCity: 'Qingdao',
    toCity: 'Moscow',
    status: 'waiting',
    etaDate: '2026-03-30',
    vessel: 'Haixin 22',
    container: 'TGBU7001456',
    weight: 3400,
    volume: 11.8,
    cargoType: 'Cosmetics',
    updatedAt: '2026-03-02T13:00:00.000Z',
    events: [makeEvent(1, 'Shipment created', 'Waiting for handover to consolidation warehouse.', 'active', '2026-03-02T13:00:00.000Z')],
    notifications: [],
    paymentTotalRub: 950000,
    paymentPaidRub: 0,
  }),
];


const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value)) as T;

const sanitizeText = (value: unknown, fallback = ''): string => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed || fallback;
};

const parsePositiveInt = (value: unknown): number | null => {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
};

const parseNonNegativeNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return Math.round(parsed);
};

const shipmentSummary = (shipment: ShipmentDetails): ShipmentSummary => ({
  id: shipment.id,
  route: shipment.route,
  clientName: shipment.clientName,
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
  paymentTotalRub: shipment.paymentTotalRub,
  paymentPaidRub: shipment.paymentPaidRub,
});

const nextShipmentId = () => {
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
};

const nextEventId = (shipment: ShipmentDetails): number =>
  shipment.events.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

const nextNotificationId = (shipment: ShipmentDetails): number =>
  shipment.notifications.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

const findShipment = (id: string): ShipmentDetails | undefined =>
  shipmentsStore.find((shipment) => shipment.id === id);

const normalizePaymentFields = (shipment: ShipmentDetails) => {
  const total = parseNonNegativeNumber(shipment.paymentTotalRub, 0);
  const paid = parseNonNegativeNumber(shipment.paymentPaidRub, 0);
  shipment.paymentTotalRub = Math.max(total, paid);
  shipment.paymentPaidRub = Math.min(paid, shipment.paymentTotalRub);
};

shipmentsStore.forEach((shipment) => normalizePaymentFields(shipment));

const canAccessClientShipment = (shipment: ShipmentDetails, identity: ClientIdentity): boolean => {
  if (identity.demo) return true;
  if (identity.telegramId && shipment.clientTelegramId === identity.telegramId) return true;
  if (identity.username && shipment.clientUsername.toLowerCase() === identity.username.toLowerCase()) return true;
  return false;
};

const cleanupExpiredSessions = () => {
  const now = Date.now();
  managerSessions.forEach((session, token) => {
    if (session.expiresAt <= now) {
      managerSessions.delete(token);
    }
  });
};

const getSessionManager = (token: string): MockManagerRecord => {
  cleanupExpiredSessions();
  const session = managerSessions.get(token);
  if (!session) {
    throw new Error('Invalid session');
  }

  const manager = managersStore.find((item) => item.id === session.managerId && item.isActive);
  if (!manager) {
    managerSessions.delete(token);
    throw new Error('Manager is inactive');
  }

  return manager;
};

export const mockManagerLogin = async (email: string, password: string): Promise<ManagerSession> => {
  await sleep();
  const normalizedEmail = sanitizeText(email).toLowerCase();
  const normalizedPassword = sanitizeText(password);

  const manager = managersStore.find(
    (item) => item.email === normalizedEmail && item.password === normalizedPassword && item.isActive
  );

  if (!manager) {
    throw new Error('Invalid email or password');
  }

  const token = `mock_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  const expiresAt = Date.now() + SESSION_TTL_MS;
  managerSessions.set(token, { managerId: manager.id, expiresAt });

  return {
    token,
    expiresAt: new Date(expiresAt).toISOString(),
    user: toPublicManager(manager),
  };
};

export const mockManagerVerify = async (token: string): Promise<{ user: ManagerUser }> => {
  await sleep();
  const manager = getSessionManager(token);
  return { user: toPublicManager(manager) };
};

export const mockManagerLogout = async (token: string): Promise<{ success: boolean }> => {
  await sleep();
  managerSessions.delete(token);
  return { success: true };
};

export const mockAdminListShipments = async (params: AdminListParams): Promise<{ items: ShipmentDetails[] }> => {
  await sleep();
  const status = sanitizeText(params.status);
  const search = sanitizeText(params.search).toLowerCase();

  const filtered = shipmentsStore.filter((shipment) => {
    if (status && shipment.status !== status) return false;
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
      return haystack.includes(search);
    }
    return true;
  });

  return { items: clone(filtered) };
};

export const mockAdminGetShipment = async (shipmentId: string): Promise<{ item: ShipmentDetails }> => {
  await sleep();
  const shipment = findShipment(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }
  return { item: clone(shipment) };
};

export const mockAdminCreateShipment = async (
  payload: CreateShipmentPayload,
  manager: ManagerUser
): Promise<{ item: ShipmentDetails }> => {
  await sleep();

  const clientName = sanitizeText(payload.clientName);
  const fromCity = sanitizeText(payload.fromCity);
  const toCity = sanitizeText(payload.toCity);
  const cargoType = sanitizeText(payload.cargoType);

  if (!clientName || !fromCity || !toCity || !cargoType) {
    throw new Error('fromCity, toCity, cargoType and clientName are required');
  }

  const shipment = makeShipment({
    id: nextShipmentId(),
    route: 'china_ru',
    clientTelegramId: parsePositiveInt(payload.clientTelegramId),
    clientUsername: sanitizeText(payload.clientUsername, 'demo_client'),
    clientName,
    managerId: manager.id,
    managerName: manager.name,
    fromCity,
    toCity,
    status: 'waiting',
    etaDate: sanitizeText(payload.etaDate),
    vessel: sanitizeText(payload.vessel, 'TBD'),
    container: sanitizeText(payload.container, 'TBD'),
    weight: Number(payload.weight) || 0,
    volume: Number(payload.volume) || 0,
    cargoType,
    updatedAt: nowIso(),
    events: [
      makeEvent(
        1,
        'Shipment created',
        sanitizeText(payload.firstEventDetail, 'Waiting for pickup from supplier.'),
        'active',
        nowIso()
      ),
    ],
    notifications: [],
    paymentTotalRub: parseNonNegativeNumber(payload.paymentTotalRub, 0),
    paymentPaidRub: parseNonNegativeNumber(payload.paymentPaidRub, 0),
  });

  normalizePaymentFields(shipment);
  shipmentsStore.unshift(shipment);
  return { item: clone(shipment) };
};

export const mockAdminUpdateShipmentStatus = async (
  shipmentId: string,
  payload: UpdateStatusPayload
): Promise<{ item: ShipmentDetails; notificationSent: boolean }> => {
  await sleep();

  const shipment = findShipment(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  if (!shipmentStatuses.includes(payload.status)) {
    throw new Error(`status must be one of: ${shipmentStatuses.join(', ')}`);
  }

  const title = sanitizeText(payload.title);
  if (!title) {
    throw new Error('title is required');
  }

  shipment.status = payload.status;
  if (sanitizeText(payload.etaDate)) {
    shipment.etaDate = sanitizeText(payload.etaDate, shipment.etaDate);
  }
  shipment.updatedAt = nowIso();

  const event = makeEvent(
    nextEventId(shipment),
    title,
    sanitizeText(payload.detail),
    statusToEventStatus(payload.status),
    nowIso(),
    Boolean(payload.notifyClient && shipment.clientTelegramId)
  );
  shipment.events.push(event);

  let notificationSent = false;
  if (payload.notifyClient && shipment.clientTelegramId) {
    notificationSent = true;
    shipment.notifications.push(makeNotification(nextNotificationId(shipment), title, nowIso()));
  }

  shipment.lastEvent = shipment.events[shipment.events.length - 1] || null;
  return { item: clone(shipment), notificationSent };
};

export const mockAdminUpdateShipmentPayments = async (
  shipmentId: string,
  payload: UpdatePaymentPayload
): Promise<{ item: ShipmentDetails }> => {
  await sleep();

  const shipment = findShipment(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  const nextTotal = parseNonNegativeNumber(payload.paymentTotalRub, shipment.paymentTotalRub ?? 0);
  const nextPaid = parseNonNegativeNumber(payload.paymentPaidRub, shipment.paymentPaidRub ?? 0);

  shipment.paymentTotalRub = Math.max(nextTotal, nextPaid);
  shipment.paymentPaidRub = Math.min(nextPaid, shipment.paymentTotalRub);
  shipment.updatedAt = nowIso();

  return { item: clone(shipment) };
};

export const mockAdminNotifyShipment = async (
  shipmentId: string,
  text: string
): Promise<{ success: boolean; sent: boolean }> => {
  await sleep();

  const shipment = findShipment(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  const message = sanitizeText(text);
  if (!message) {
    throw new Error('text is required');
  }

  const sent = Boolean(shipment.clientTelegramId);
  if (sent) {
    shipment.notifications.push(makeNotification(nextNotificationId(shipment), message, nowIso()));
    shipment.updatedAt = nowIso();
  }

  return { success: true, sent };
};

export const mockClientListShipments = async (
  identity: ClientIdentity
): Promise<{ items: ShipmentSummary[]; mode: 'demo' | 'user' }> => {
  await sleep();

  const hasIdentity = Boolean(identity.demo || identity.telegramId || sanitizeText(identity.username));
  if (!hasIdentity) {
    throw new Error('telegramId or username is required');
  }

  const items = shipmentsStore
    .filter((shipment) => canAccessClientShipment(shipment, identity))
    .map((shipment) => shipmentSummary(shipment));

  return {
    items: clone(items),
    mode: identity.demo ? 'demo' : 'user',
  };
};

export const mockClientGetShipment = async (
  shipmentId: string,
  identity: ClientIdentity
): Promise<{ item: ShipmentDetails }> => {
  await sleep();

  const shipment = findShipment(shipmentId);
  if (!shipment) {
    throw new Error('Shipment not found');
  }

  if (!canAccessClientShipment(shipment, identity)) {
    throw new Error('Access denied for this shipment');
  }

  return { item: clone(shipment) };
};
