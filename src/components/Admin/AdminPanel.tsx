import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { buildApiUrl } from '../../config/api';
import { theme } from '../../styles/theme';
import { ManagerSession, ShipmentDetails, ShipmentStatus } from '../../types';
import { GlassCard } from '../UI/GlassCard';
import { PrimaryButton, SecondaryButton } from '../UI';

const SESSION_STORAGE_KEY = 'admin_session_v1';
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
  border: 1px solid ${theme.colors.border};
  background: ${({ $status }) =>
    $status === 'delivered'
      ? 'rgba(42,107,58,0.22)'
      : $status === 'delayed'
        ? 'rgba(200,53,42,0.22)'
        : theme.colors.surfaceLight};
`;

const ShipmentRow = styled(GlassCard)`
  cursor: pointer;
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

const parseApiError = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return typeof data?.error === 'string' ? data.error : `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
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

const AdminPanel: React.FC<Props> = ({ onBack }) => {
  const [session, setSession] = useState<ManagerSession | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: 'manager@routex.io',
    password: 'manager123',
  });
  const [error, setError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const [shipments, setShipments] = useState<ShipmentDetails[]>([]);
  const [selected, setSelected] = useState<ShipmentDetails | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [createForm, setCreateForm] = useState<CreateShipmentForm>(defaultCreateForm);
  const [statusForm, setStatusForm] = useState<StatusForm>(defaultStatusForm);
  const [notifyText, setNotifyText] = useState('');

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

      const data = await requestJson<{ items: ShipmentDetails[] }>(path, undefined, authToken);
      setShipments(Array.isArray(data.items) ? data.items : []);

      if (selected) {
        const refreshed = data.items.find((item) => item.id === selected.id) || null;
        setSelected(refreshed);
        if (refreshed) {
          syncStatusFormWithShipment(refreshed);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отправления');
    } finally {
      setIsBusy(false);
    }
  }, [authToken, search, selected, statusFilter, syncStatusFormWithShipment]);

  const loadShipmentDetails = useCallback(
    async (shipmentId: string) => {
      if (!authToken) return;
      setIsBusy(true);
      setError(null);
      try {
        const data = await requestJson<{ item: ShipmentDetails }>(
          `/admin/shipments/${shipmentId}`,
          undefined,
          authToken
        );
        setSelected(data.item);
        syncStatusFormWithShipment(data.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить отправление');
      } finally {
        setIsBusy(false);
      }
    },
    [authToken, syncStatusFormWithShipment]
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
        await requestJson<{ user: ManagerSession['user'] }>('/auth/verify', { method: 'GET' }, saved.token);
        setSession(saved);
      } catch {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      } finally {
        setIsCheckingSession(false);
      }
    };

    void bootstrap();
  }, []);

  useEffect(() => {
    if (authToken) {
      void loadShipments();
    }
  }, [authToken, loadShipments]);

  const handleLogin = async () => {
    setIsBusy(true);
    setError(null);
    try {
      const data = await requestJson<LoginResponse>('/auth/manager/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
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
        await requestJson<{ success: boolean }>('/auth/manager/logout', { method: 'POST' }, authToken);
      }
    } catch {
      // no-op
    } finally {
      localStorage.removeItem(SESSION_STORAGE_KEY);
      setSession(null);
      setSelected(null);
      setShipments([]);
    }
  };

  const handleCreateShipment = async () => {
    if (!authToken) return;
    setIsBusy(true);
    setError(null);
    try {
      await requestJson<{ item: ShipmentDetails }>(
        '/admin/shipments',
        {
          method: 'POST',
          body: JSON.stringify({
            ...createForm,
            clientTelegramId: createForm.clientTelegramId ? Number(createForm.clientTelegramId) : null,
            weight: createForm.weight ? Number(createForm.weight) : 0,
            volume: createForm.volume ? Number(createForm.volume) : 0,
          }),
        },
        authToken
      );
      setCreateForm(defaultCreateForm);
      await loadShipments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось создать отправление');
    } finally {
      setIsBusy(false);
    }
  };

  const handleUpdateStatus = async () => {
    if (!authToken || !selected) return;
    setIsBusy(true);
    setError(null);
    try {
      await requestJson<{ item: ShipmentDetails }>(
        `/admin/shipments/${selected.id}/status`,
        {
          method: 'PATCH',
          body: JSON.stringify(statusForm),
        },
        authToken
      );
      await loadShipmentDetails(selected.id);
      await loadShipments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось обновить статус');
    } finally {
      setIsBusy(false);
    }
  };

  const handleNotifyClient = async () => {
    if (!authToken || !selected || !notifyText.trim()) return;
    setIsBusy(true);
    setError(null);
    try {
      await requestJson<{ success: boolean }>(
        `/admin/shipments/${selected.id}/notify`,
        {
          method: 'POST',
          body: JSON.stringify({ text: notifyText.trim() }),
        },
        authToken
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
            {session.user.name} ({session.user.role}) • {session.user.email}
          </Subtitle>
        </div>
        <Row>
          <SecondaryButton onClick={onBack}>На главную</SecondaryButton>
          <SecondaryButton onClick={handleLogout}>Выйти</SecondaryButton>
        </Row>
      </Header>

      {error && <ErrorText>{error}</ErrorText>}

      <TwoCols>
        <GlassCard>
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

        <GlassCard>
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
              shipments.map((shipment) => (
                <ShipmentRow key={shipment.id} onClick={() => void loadShipmentDetails(shipment.id)}>
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
                  </Meta>
                </ShipmentRow>
              ))
            )}
          </Grid>
        </GlassCard>
      </TwoCols>

      {selected && (
        <GlassCard style={{ marginTop: theme.spacing.lg }}>
          <SectionTitle>{`Отправление ${selected.id}`}</SectionTitle>
          <Meta>
            {selected.fromCity} → {selected.toCity}
            <br />
            Клиент: {selected.clientName} ({selected.clientUsername || 'без username'})
            <br />
            Текущий статус: {statusLabels[selected.status]}
          </Meta>

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
            <PrimaryButton onClick={handleUpdateStatus} disabled={isBusy || !statusForm.title.trim()}>
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
    </Container>
  );
};

export default AdminPanel;
