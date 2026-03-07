import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { API_BASE_URL, buildApiUrl } from '../../config/api';
import {
  mockAdminCreateShipment,
  mockAdminGetShipment,
  mockAdminListShipments,
  mockAdminNotifyShipment,
  mockAdminUpdateShipmentPayments,
  mockAdminUpdateShipmentStatus,
  mockManagerLogin,
  mockManagerLogout,
  mockManagerVerify,
} from '../../mocks/shipments';
import { theme } from '../../styles/theme';
import { ManagerSession, ShipmentDetails, ShipmentStatus } from '../../types';
import { GlassCard } from '../UI/GlassCard';
import { PrimaryButton, SecondaryButton } from '../UI';

const SESSION_STORAGE_KEY = 'admin_session_v1';
const DEFAULT_API_PLACEHOLDER = 'your-backend.up.railway.app';
const shipmentStatuses: ShipmentStatus[] = ['waiting', 'in_transit', 'customs', 'delivered', 'delayed'];
const statusLabels: Record<ShipmentStatus, string> = {
  waiting: 'Ожидание',
  in_transit: 'В пути',
  customs: 'Таможня',
  delivered: 'Доставлен',
  delayed: 'Задержан',
};

interface Props {
  onBack: () => void;
}

interface LoginResponse {
  token: string;
  expiresAt: string;
  user: {
    id: number;
    email: string;
    name: string;
    role: 'manager' | 'admin';
  };
}

interface LoginForm {
  email: string;
  password: string;
}

interface CreateShipmentForm {
  clientName: string;
  clientTelegramId: string;
  clientUsername: string;
  fromCity: string;
  toCity: string;
  cargoType: string;
  etaDate: string;
  vessel: string;
  container: string;
  weight: string;
  volume: string;
  firstEventDetail: string;
}

interface StatusForm {
  status: ShipmentStatus;
  title: string;
  detail: string;
  etaDate: string;
  notifyClient: boolean;
}

interface PaymentForm {
  paymentTotalRub: string;
  paymentPaidRub: string;
}

type AdminSection = 'shipments' | 'create';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  flex-wrap: wrap;
`;

const Title = styled.h2`
  margin: 0;
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
`;

const Subtitle = styled.p`
  margin: 6px 0 0;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
`;

const Row = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  flex-wrap: wrap;
`;

const Grid = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
`;

const TwoCols = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${theme.colors.textMuted};
`;

const Input = styled.input`
  padding: ${theme.spacing.md};
  border-radius: 10px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const Select = styled.select`
  padding: ${theme.spacing.md};
  border-radius: 10px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const Textarea = styled.textarea`
  min-height: 80px;
  padding: ${theme.spacing.md};
  border-radius: 10px;
  border: 1px solid ${theme.colors.border};
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  resize: vertical;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const StatusPill = styled.span<{ $status: ShipmentStatus }>`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid
    ${({ $status }) =>
      $status === 'delivered'
        ? 'rgba(42,107,58,0.6)'
        : $status === 'delayed'
          ? 'rgba(200,53,42,0.6)'
          : $status === 'customs'
            ? 'rgba(231,169,48,0.6)'
            : $status === 'in_transit'
              ? 'rgba(24,115,164,0.6)'
              : 'rgba(128,141,158,0.6)'};
  background: ${({ $status }) =>
    $status === 'delivered'
      ? 'rgba(42,107,58,0.22)'
      : $status === 'delayed'
        ? 'rgba(200,53,42,0.22)'
        : $status === 'customs'
          ? 'rgba(231,169,48,0.2)'
          : $status === 'in_transit'
            ? 'rgba(24,115,164,0.2)'
            : 'rgba(128,141,158,0.18)'};
  color: ${({ $status }) =>
    $status === 'delivered'
      ? '#2a6b3a'
      : $status === 'delayed'
        ? '#c8352a'
        : $status === 'customs'
          ? '#c67c00'
          : $status === 'in_transit'
            ? '#1873a4'
            : theme.colors.textSecondary};
`;

const ShipmentRow = styled(GlassCard)<{ $active?: boolean }>`
  cursor: pointer;
  border-color: ${({ $active }) =>
    $active ? `${theme.colors.accent}66` : theme.colors.border};
`;

const ShipmentHead = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: 8px;
`;

const ShipmentId = styled.div`
  font-family: var(--font-heading);
  font-size: 17px;
`;

const Meta = styled.div`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
  line-height: 1.5;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
`;

const ErrorText = styled(GlassCard)`
  border-color: rgba(200, 53, 42, 0.6);
  color: ${theme.colors.text};
`;

const Empty = styled(GlassCard)`
  color: ${theme.colors.textSecondary};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
`;

const SectionMenu = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.lg};
`;

const SectionMenuButton = styled.button<{ $active: boolean }>`
  flex: 1;
  border: 1px solid ${({ $active }) => ($active ? `${theme.colors.accent}66` : theme.colors.border)};
  background: ${({ $active }) => ($active ? `${theme.colors.accent}14` : theme.colors.surface)};
  color: ${({ $active }) => ($active ? theme.colors.accent : theme.colors.textSecondary)};
  border-radius: 10px;
  padding: 10px 12px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${theme.colors.accent}88;
    color: ${theme.colors.accent};
  }
`;

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return typeof data?.error === 'string' ? data.error : `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

const shouldUseMockFallback = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return (
    message.includes('failed to fetch') ||
    message.includes('networkerror') ||
    message.includes('load failed') ||
    message.includes('fetch failed') ||
    message.includes('econnrefused') ||
    message.includes('timeout') ||
    /^http\s+\d{3}$/.test(message)
  );
};

const getDefaultStatusTitle = (status: ShipmentStatus): string => {
  if (status === 'waiting') return 'Отправление ожидает отгрузки';
  if (status === 'in_transit') return 'Отправление в пути';
  if (status === 'customs') return 'Отправление на таможне';
  if (status === 'delivered') return 'Отправление доставлено';
  return 'Отправление задержано';
};

const formatRub = (value: number): string =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);

const getPaymentSnapshot = (shipment: ShipmentDetails) => {
  const total = Math.max(0, Math.round(Number(shipment.paymentTotalRub ?? shipment.planRevenueRub ?? shipment.planCostRub ?? 0)));
  const paid = Math.max(0, Math.round(Number(shipment.paymentPaidRub ?? 0)));
  const normalizedTotal = Math.max(total, paid);
  const remaining = Math.max(normalizedTotal - paid, 0);
  return { total: normalizedTotal, paid, remaining };
};

async function requestJson<T>(path: string, init?: RequestInit, token?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(init?.headers as Record<string, string> | undefined),
  };

  const response = await fetch(buildApiUrl(path), {
    ...init,
    headers,
  });
  if (!response.ok) {
    throw new Error(await parseApiError(response));
  }
  return (await response.json()) as T;
}

const defaultCreateForm: CreateShipmentForm = {
  clientName: '',
  clientTelegramId: '',
  clientUsername: '',
  fromCity: '',
  toCity: '',
  cargoType: '',
  etaDate: '',
  vessel: '',
  container: '',
  weight: '',
  volume: '',
  firstEventDetail: '',
};

const defaultStatusForm: StatusForm = {
  status: 'waiting',
  title: '',
  detail: '',
  etaDate: '',
  notifyClient: false,
};

const defaultPaymentForm: PaymentForm = {
  paymentTotalRub: '',
  paymentPaidRub: '',
};

const AdminPanel: React.FC<Props> = ({ onBack }) => {
  const [session, setSession] = useState<ManagerSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: 'manager@routex.io',
    password: 'manager123',
  });
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [useMockApi, setUseMockApi] = useState(API_BASE_URL.includes(DEFAULT_API_PLACEHOLDER));

  const [shipments, setShipments] = useState<ShipmentDetails[]>([]);
  const [selected, setSelected] = useState<ShipmentDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [createForm, setCreateForm] = useState<CreateShipmentForm>(defaultCreateForm);
  const [statusForm, setStatusForm] = useState<StatusForm>(defaultStatusForm);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>(defaultPaymentForm);
  const [notifyText, setNotifyText] = useState('');
  const [activeSection, setActiveSection] = useState<AdminSection>('shipments');

  const authToken = session?.token || '';

  const syncStatusFormWithShipment = useCallback((shipment: ShipmentDetails) => {
    setStatusForm({
      status: shipment.status,
      title: '',
      detail: '',
      etaDate: shipment.etaDate || '',
      notifyClient: false,
    });
  }, []);

  const syncPaymentFormWithShipment = useCallback((shipment: ShipmentDetails) => {
    const payment = getPaymentSnapshot(shipment);
    setPaymentForm({
      paymentTotalRub: payment.total ? String(payment.total) : '',
      paymentPaidRub: payment.paid ? String(payment.paid) : '',
    });
  }, []);

  const runWithApiFallback = useCallback(
    async <T,>(apiRequest: () => Promise<T>, mockRequest: () => Promise<T>): Promise<T> => {
      if (useMockApi) {
        return mockRequest();
      }

      try {
        return await apiRequest();
      } catch (error) {
        if (shouldUseMockFallback(error)) {
          setUseMockApi(true);
          return mockRequest();
        }
        throw error;
      }
    },
    [useMockApi]
  );

  const loadShipments = useCallback(async () => {
    if (!authToken) return;
    setIsBusy(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (search.trim()) params.set('search', search.trim());
      const query = params.toString();
      const path = query ? `/admin/shipments?${query}` : '/admin/shipments';

      const data = await runWithApiFallback(
        () => requestJson<{ items: ShipmentDetails[] }>(path, undefined, authToken),
        () => mockAdminListShipments({ status: statusFilter, search: search.trim() })
      );
      const nextShipments = Array.isArray(data.items) ? data.items : [];
      setShipments(nextShipments);

      if (nextShipments.length === 0) {
        setSelected(null);
        setPaymentForm(defaultPaymentForm);
        return;
      }

      if (selected) {
        const refreshed = nextShipments.find((item) => item.id === selected.id) || nextShipments[0];
        setSelected(refreshed);
        syncStatusFormWithShipment(refreshed);
        syncPaymentFormWithShipment(refreshed);
        return;
      }

      const firstShipment = nextShipments[0];
      setSelected(firstShipment);
      syncStatusFormWithShipment(firstShipment);
      syncPaymentFormWithShipment(firstShipment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отправления');
    } finally {
      setIsBusy(false);
    }
  }, [authToken, runWithApiFallback, search, selected, statusFilter, syncPaymentFormWithShipment, syncStatusFormWithShipment]);

  const loadShipmentDetails = useCallback(
    async (shipmentId: string) => {
      if (!authToken) return;
      setIsBusy(true);
      setError(null);
      try {
        const data = await runWithApiFallback(
          () =>
            requestJson<{ item: ShipmentDetails }>(
              `/admin/shipments/${shipmentId}`,
              undefined,
              authToken
            ),
          () => mockAdminGetShipment(shipmentId)
        );
        setSelected(data.item);
        syncStatusFormWithShipment(data.item);
        syncPaymentFormWithShipment(data.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить отправление');
      } finally {
        setIsBusy(false);
      }
    },
    [authToken, runWithApiFallback, syncPaymentFormWithShipment, syncStatusFormWithShipment]
  );

  useEffect(() => {
    const bootstrap = async () => {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) {
        setIsCheckingSession(false);
        return;
      }
      try {
        const saved = JSON.parse(raw) as ManagerSession;
        if (!saved.token) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          setIsCheckingSession(false);
          return;
        }
        const verifyResponse = await runWithApiFallback(
          () => requestJson<{ user: ManagerSession['user'] }>('/auth/verify', { method: 'GET' }, saved.token),
          () => mockManagerVerify(saved.token)
        );
        setSession({
          ...saved,
          user: verifyResponse.user,
        });
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void bootstrap();
  }, [runWithApiFallback]);

  useEffect(() => {
    if (authToken) {
      void loadShipments();
    }
  }, [authToken, loadShipments]);

  const handleLogin = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const data = await runWithApiFallback(
        () =>
          requestJson<LoginResponse>('/auth/manager/login', {
            method: 'POST',
            body: JSON.stringify(loginForm),
          }),
        () => mockManagerLogin(loginForm.email, loginForm.password)
      );
      setSession(data);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ошибка авторизации');
    } finally {
      setIsBusy(false);
    }
  };

  const handleLogout = async () => {
    try {
      if (authToken) {
        await runWithApiFallback(
          () => requestJson<{ success: boolean }>('/auth/manager/logout', { method: 'POST' }, authToken),
          () => mockManagerLogout(authToken)
        );
      }
    } catch {
      // no-op
    } finally {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSession(null);
      setSelected(null);
      setShipments([]);
      setPaymentForm(defaultPaymentForm);
    }
  };

  const handleCreateShipment = async () => {
    if (!authToken || !session) return;
    setIsBusy(true);
    setError(null);
    try {
      const payload = {
        ...createForm,
        clientTelegramId: createForm.clientTelegramId ? Number(createForm.clientTelegramId) : null,
        weight: createForm.weight ? Number(createForm.weight) : 0,
        volume: createForm.volume ? Number(createForm.volume) : 0,
      };

      await runWithApiFallback(
        () =>
          requestJson<{ item: ShipmentDetails }>(
            '/admin/shipments',
            {
              method: 'POST',
              body: JSON.stringify(payload),
            },
            authToken
          ),
        () => mockAdminCreateShipment(payload, session.user)
      );
      setCreateForm(defaultCreateForm);
      await loadShipments();
      setActiveSection('shipments');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать отправление');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!authToken || !selected) return;
    const title = statusForm.title.trim() || getDefaultStatusTitle(statusForm.status);
    const payload = {
      ...statusForm,
      title,
    };

    setIsBusy(true);
    setError(null);
    try {
      await runWithApiFallback(
        () =>
          requestJson<{ item: ShipmentDetails }>(
            `/admin/shipments/${selected.id}/status`,
            {
              method: 'PATCH',
              body: JSON.stringify(payload),
            },
            authToken
          ),
        () =>
          mockAdminUpdateShipmentStatus(selected.id, payload).then(({ item }) => ({
            item,
          }))
      );
      await loadShipmentDetails(selected.id);
      await loadShipments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdatePayments = async () => {
    if (!authToken || !selected) return;

    const paymentTotalRub = Math.max(0, Math.round(Number(paymentForm.paymentTotalRub) || 0));
    const paymentPaidRub = Math.max(0, Math.round(Number(paymentForm.paymentPaidRub) || 0));

    setIsBusy(true);
    setError(null);
    try {
      await runWithApiFallback(
        () =>
          requestJson<{ item: ShipmentDetails }>(
            `/admin/shipments/${selected.id}/payment`,
            {
              method: 'PATCH',
              body: JSON.stringify({ paymentTotalRub, paymentPaidRub }),
            },
            authToken
          ),
        () => mockAdminUpdateShipmentPayments(selected.id, { paymentTotalRub, paymentPaidRub })
      );
      await loadShipmentDetails(selected.id);
      await loadShipments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить информацию об оплате');
    } finally {
      setIsBusy(false);
    }
  };

  const handleNotifyClient = async () => {
    const trimmedNotifyText = notifyText.trim();
    if (!authToken || !selected || !trimmedNotifyText) return;
    setIsBusy(true);
    setError(null);
    try {
      await runWithApiFallback(
        () =>
          requestJson<{ success: boolean }>(
            `/admin/shipments/${selected.id}/notify`,
            {
              method: 'POST',
              body: JSON.stringify({ text: trimmedNotifyText }),
            },
            authToken
          ),
        () =>
          mockAdminNotifyShipment(selected.id, trimmedNotifyText).then(({ success }) => ({
            success,
          }))
      );
      setNotifyText('');
      await loadShipmentDetails(selected.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось отправить уведомление');
    } finally {
      setIsBusy(false);
    }
  };

  const canCreate = useMemo(() => {
    return (
      Boolean(createForm.clientName.trim()) &&
      Boolean(createForm.fromCity.trim()) &&
      Boolean(createForm.toCity.trim()) &&
      Boolean(createForm.cargoType.trim())
    );
  }, [createForm]);

  const selectedPayment = selected ? getPaymentSnapshot(selected) : null;

  if (isCheckingSession) {
    return (
      <Container>
        <Empty>Проверяем сессию менеджера...</Empty>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container>
        <Header>
          <div>
            <Title>Админ-панель</Title>
            <Subtitle>Вход для менеджеров и администраторов</Subtitle>
          </div>
        </Header>

        {error && <ErrorText>{error}</ErrorText>}

        <GlassCard>
          <Grid>
            <Field>
              <Label>Email</Label>
              <Input
                value={loginForm.email}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="manager@routex.io"
              />
            </Field>
            <Field>
              <Label>Пароль</Label>
              <Input
                type="password"
                value={loginForm.password}
                onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
                placeholder="password"
              />
            </Field>
            <Row>
              <SecondaryButton onClick={onBack}>На главную</SecondaryButton>
              <PrimaryButton onClick={handleLogin} disabled={isBusy}>
                {isBusy ? 'Вход...' : 'Войти'}
              </PrimaryButton>
            </Row>
          </Grid>
        </GlassCard>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <div>
          <Title>Админ-панель</Title>
          <Subtitle>
            {session.user.name} ({session.user.role}) • {session.user.email} •{' '}
            {useMockApi ? 'режим demo-данных' : 'режим API'}
          </Subtitle>
        </div>
        <Row>
          <SecondaryButton onClick={onBack}>На главную</SecondaryButton>
          <SecondaryButton onClick={handleLogout}>Выйти</SecondaryButton>
        </Row>
      </Header>

      {error && <ErrorText>{error}</ErrorText>}

      <SectionMenu>
        <SectionMenuButton
          type="button"
          $active={activeSection === 'shipments'}
          onClick={() => setActiveSection('shipments')}
        >
          Текущие поставки
        </SectionMenuButton>
        <SectionMenuButton
          type="button"
          $active={activeSection === 'create'}
          onClick={() => setActiveSection('create')}
        >
          Новая поставка
        </SectionMenuButton>
      </SectionMenu>

      <TwoCols>
        {activeSection === 'create' && (
        <GlassCard style={{ gridColumn: '1 / -1' }}>
          <SectionTitle>Создать отправление</SectionTitle>
          <Grid>
            <Field>
              <Label>Клиент</Label>
              <Input
                value={createForm.clientName}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, clientName: e.target.value }))}
                placeholder="Иван Петров"
              />
            </Field>
            <TwoCols>
              <Field>
                <Label>Telegram ID</Label>
                <Input
                  value={createForm.clientTelegramId}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, clientTelegramId: e.target.value }))}
                  placeholder="261559409"
                />
              </Field>
              <Field>
                <Label>Username</Label>
                <Input
                  value={createForm.clientUsername}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, clientUsername: e.target.value }))}
                  placeholder="movers_group"
                />
              </Field>
            </TwoCols>
            <TwoCols>
              <Field>
                <Label>Откуда</Label>
                <Input
                  value={createForm.fromCity}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, fromCity: e.target.value }))}
                  placeholder="Shanghai"
                />
              </Field>
              <Field>
                <Label>Куда</Label>
                <Input
                  value={createForm.toCity}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, toCity: e.target.value }))}
                  placeholder="Москва"
                />
              </Field>
            </TwoCols>
            <Field>
              <Label>Тип груза</Label>
              <Input
                value={createForm.cargoType}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, cargoType: e.target.value }))}
                placeholder="Одежда"
              />
            </Field>
            <TwoCols>
              <Field>
                <Label>Вес (кг)</Label>
                <Input
                  value={createForm.weight}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, weight: e.target.value }))}
                  placeholder="12000"
                />
              </Field>
              <Field>
                <Label>Объем (м3)</Label>
                <Input
                  value={createForm.volume}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, volume: e.target.value }))}
                  placeholder="54"
                />
              </Field>
            </TwoCols>
            <TwoCols>
              <Field>
                <Label>Судно</Label>
                <Input
                  value={createForm.vessel}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, vessel: e.target.value }))}
                  placeholder="Ever Nimbus"
                />
              </Field>
              <Field>
                <Label>Контейнер</Label>
                <Input
                  value={createForm.container}
                  onChange={(e) => setCreateForm((prev) => ({ ...prev, container: e.target.value }))}
                  placeholder="MSCU1234567"
                />
              </Field>
            </TwoCols>
            <Field>
              <Label>ETA</Label>
              <Input
                type="date"
                value={createForm.etaDate}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, etaDate: e.target.value }))}
              />
            </Field>
            <Field>
              <Label>Комментарий первого события</Label>
              <Textarea
                value={createForm.firstEventDetail}
                onChange={(e) => setCreateForm((prev) => ({ ...prev, firstEventDetail: e.target.value }))}
                placeholder="Ожидается сдача груза на склад"
              />
            </Field>
            <PrimaryButton onClick={handleCreateShipment} disabled={!canCreate || isBusy}>
              {isBusy ? 'Сохраняем...' : 'Создать отправление'}
            </PrimaryButton>
          </Grid>
        </GlassCard>
        )}

        {activeSection === 'shipments' && (
        <GlassCard style={{ gridColumn: '1 / -1' }}>
          <SectionTitle>Список отправлений</SectionTitle>
          <TwoCols>
            <Field>
              <Label>Статус</Label>
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">Все</option>
                {shipmentStatuses.map((status) => (
                  <option key={status} value={status}>
                    {statusLabels[status]}
                  </option>
                ))}
              </Select>
            </Field>
            <Field>
              <Label>Поиск</Label>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ID / клиент / маршрут"
              />
            </Field>
          </TwoCols>
          <Row>
            <SecondaryButton onClick={() => void loadShipments()} disabled={isBusy}>
              {isBusy ? 'Обновляем...' : 'Применить'}
            </SecondaryButton>
          </Row>

          <Grid>
            {shipments.length === 0 ? (
              <Empty>Отправлений нет.</Empty>
            ) : (
              shipments.map((shipment) => {
                const payment = getPaymentSnapshot(shipment);
                return (
                  <ShipmentRow
                    key={shipment.id}
                    $active={selected?.id === shipment.id}
                    onClick={() => void loadShipmentDetails(shipment.id)}
                  >
                    <ShipmentHead>
                      <ShipmentId>{shipment.id}</ShipmentId>
                      <StatusPill $status={shipment.status}>{statusLabels[shipment.status]}</StatusPill>
                    </ShipmentHead>
                    <Meta>
                      {shipment.fromCity} → {shipment.toCity}
                      <br />
                      Клиент: {shipment.clientName}
                      <br />
                      ETA: {shipment.etaDate || 'не указан'}
                      <br />
                      Оплачено: {formatRub(payment.paid)} • Осталось: {formatRub(payment.remaining)}
                    </Meta>
                  </ShipmentRow>
                );
              })
            )}
          </Grid>
        </GlassCard>
        )}
      </TwoCols>

      {activeSection === 'shipments' && selected && (
        <GlassCard style={{ marginTop: theme.spacing.lg }}>
          <SectionTitle>{`Отправление ${selected.id}`}</SectionTitle>
          <Meta>
            {selected.fromCity} → {selected.toCity}
            <br />
            Клиент: {selected.clientName} ({selected.clientUsername || 'без username'})
            <br />
            Текущий статус: {statusLabels[selected.status]}
          </Meta>

          {selectedPayment && (
            <Grid style={{ marginTop: theme.spacing.md }}>
              <SectionTitle>Финансы клиента</SectionTitle>
              <Meta>
                Общая сумма: {formatRub(selectedPayment.total)}
                <br />
                Оплачено: {formatRub(selectedPayment.paid)}
                <br />
                Осталось: {formatRub(selectedPayment.remaining)}
              </Meta>
              <TwoCols>
                <Field>
                  <Label>Сумма к оплате (₽)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={paymentForm.paymentTotalRub}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentTotalRub: e.target.value }))}
                    placeholder="0"
                  />
                </Field>
                <Field>
                  <Label>Оплачено (₽)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={paymentForm.paymentPaidRub}
                    onChange={(e) => setPaymentForm((prev) => ({ ...prev, paymentPaidRub: e.target.value }))}
                    placeholder="0"
                  />
                </Field>
              </TwoCols>
              <SecondaryButton onClick={handleUpdatePayments} disabled={isBusy}>
                {isBusy ? 'Сохраняем...' : 'Сохранить оплату'}
              </SecondaryButton>
            </Grid>
          )}

          <Grid style={{ marginTop: theme.spacing.md }}>
            <TwoCols>
              <Field>
                <Label>Новый статус</Label>
                <Select
                  value={statusForm.status}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, status: e.target.value as ShipmentStatus }))}
                >
                  {shipmentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {statusLabels[status]}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field>
                <Label>ETA</Label>
                <Input
                  type="date"
                  value={statusForm.etaDate}
                  onChange={(e) => setStatusForm((prev) => ({ ...prev, etaDate: e.target.value }))}
                />
              </Field>
            </TwoCols>
            <Field>
              <Label>Заголовок события</Label>
              <Input
                value={statusForm.title}
                onChange={(e) => setStatusForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Контейнер передан в таможню"
              />
            </Field>
            <Field>
              <Label>Детали</Label>
              <Textarea
                value={statusForm.detail}
                onChange={(e) => setStatusForm((prev) => ({ ...prev, detail: e.target.value }))}
                placeholder="Комментарий менеджера"
              />
            </Field>
            <Checkbox>
              <input
                type="checkbox"
                checked={statusForm.notifyClient}
                onChange={(e) => setStatusForm((prev) => ({ ...prev, notifyClient: e.target.checked }))}
              />
              Уведомить клиента в Telegram
            </Checkbox>
            <PrimaryButton onClick={handleUpdateStatus} disabled={isBusy}>
              {isBusy ? 'Сохраняем...' : 'Обновить статус'}
            </PrimaryButton>
          </Grid>

          <Grid style={{ marginTop: theme.spacing.lg }}>
            <SectionTitle>Ручное уведомление</SectionTitle>
            <Field>
              <Label>Текст</Label>
              <Textarea
                value={notifyText}
                onChange={(e) => setNotifyText(e.target.value)}
                placeholder="Ваш груз ожидает выпуска ДТ"
              />
            </Field>
            <SecondaryButton onClick={handleNotifyClient} disabled={isBusy || !notifyText.trim()}>
              Отправить уведомление
            </SecondaryButton>
          </Grid>
        </GlassCard>
      )}

      {activeSection === 'shipments' && !selected && (
        <Empty style={{ marginTop: theme.spacing.lg }}>
          Выберите поставку из списка, чтобы изменить статус, оплату или отправить уведомление.
        </Empty>
      )}
    </Container>
  );
};

export default AdminPanel;
