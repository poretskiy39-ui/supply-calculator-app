import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { API_BASE_URL, buildApiUrl } from '../../config/api';
import { mockClientGetShipment, mockClientListShipments } from '../../mocks/shipments';
import { ShipmentDetails, ShipmentEventStatus, ShipmentStatus, ShipmentSummary } from '../../types';
import { GlassCard } from '../UI/GlassCard';
import { PrimaryButton, SecondaryButton } from '../UI';

interface TelegramUser {
  id?: number;
  username?: string;
  first_name?: string;
}

interface Props {
  tgUser?: TelegramUser | null;
  onBack: () => void;
}

const statusLabels: Record<ShipmentStatus, string> = {
  waiting: 'РћР¶РёРґР°РЅРёРµ',
  in_transit: 'Р’ РїСѓС‚Рё',
  customs: 'РўР°РјРѕР¶РЅСЏ',
  delivered: 'Р”РѕСЃС‚Р°РІР»РµРЅ',
  delayed: 'Р—Р°РґРµСЂР¶Р°РЅ',
};

const eventLabels: Record<ShipmentEventStatus, string> = {
  done: 'Р’С‹РїРѕР»РЅРµРЅРѕ',
  active: 'РўРµРєСѓС‰РёР№ СЌС‚Р°Рї',
  pending: 'РћР¶РёРґР°РµС‚СЃСЏ',
};

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
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

const List = styled.div`
  display: grid;
  gap: ${theme.spacing.md};
`;

const ShipmentCard = styled(GlassCard)`
  cursor: pointer;
`;

const CardTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;

const ShipmentId = styled.div`
  font-family: var(--font-heading);
  font-size: 17px;
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

const Route = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  margin-bottom: 4px;
`;

const Meta = styled.div`
  color: ${theme.colors.textMuted};
  font-size: 12px;
  line-height: 1.5;
`;

const PaymentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const PaymentCard = styled.div<{ $kind: 'total' | 'paid' | 'left' }>`
  border: 1px solid ${theme.colors.border};
  border-radius: 10px;
  background: ${({ $kind }) =>
    $kind === 'paid'
      ? 'rgba(42,107,58,0.14)'
      : $kind === 'left'
        ? 'rgba(200,53,42,0.12)'
        : theme.colors.surfaceLight};
  padding: ${theme.spacing.sm};
`;

const PaymentLabel = styled.div`
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${theme.colors.textMuted};
`;

const PaymentValue = styled.div`
  margin-top: 4px;
  color: ${theme.colors.text};
  font-size: ${theme.typography.small};
  font-weight: 600;
`;

const ProgressBar = styled.div`
  margin-top: ${theme.spacing.sm};
  height: 8px;
  border-radius: 999px;
  background: ${theme.colors.surfaceLight};
  overflow: hidden;
`;

const ProgressFill = styled.div<{ $percent: number }>`
  width: ${({ $percent }) => `${Math.min(Math.max($percent, 0), 100)}%`};
  height: 100%;
  background: linear-gradient(90deg, #2a6b3a 0%, #1f8f4f 100%);
  transition: width 0.2s ease;
`;

const Timeline = styled.div`
  display: grid;
  gap: ${theme.spacing.sm};
  margin-top: ${theme.spacing.md};
`;

const TimelineItem = styled(GlassCard)`
  padding: ${theme.spacing.md};
`;

const EventTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${theme.spacing.sm};
  margin-bottom: 6px;
`;

const EventTitle = styled.div`
  color: ${theme.colors.text};
  font-size: ${theme.typography.small};
  font-weight: 600;
`;

const EventBadge = styled.span`
  color: ${theme.colors.textMuted};
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
`;

const EventDetail = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  margin-bottom: 6px;
`;

const EventDate = styled.div`
  color: ${theme.colors.textMuted};
  font-size: 11px;
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.sm};
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
`;

const Empty = styled(GlassCard)`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  line-height: 1.6;
`;

const ActionBar = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.lg};
`;

const ActionButton = styled(PrimaryButton)`
  flex: 1;
`;

const ActionButtonSecondary = styled(SecondaryButton)`
  flex: 1;
`;

const DetailsOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1200;
  background: rgba(10, 16, 24, 0.68);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.lg};
`;

const DetailsSheet = styled(GlassCard)`
  width: min(760px, 100%);
  max-height: calc(100vh - 36px);
  overflow: auto;
  padding: ${theme.spacing.lg};
`;

const DetailsTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.md};
`;

const DetailsTitle = styled.h3`
  margin: 0;
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
`;

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
};

const formatRub = (value: number): string =>
  new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);

const getPaymentSnapshot = (shipment: ShipmentSummary | ShipmentDetails) => {
  const detailsShipment = shipment as ShipmentDetails;
  const total = Math.max(
    0,
    Math.round(Number(shipment.paymentTotalRub ?? detailsShipment.planRevenueRub ?? detailsShipment.planCostRub ?? 0))
  );
  const paid = Math.max(0, Math.round(Number(shipment.paymentPaidRub ?? 0)));
  const normalizedTotal = Math.max(total, paid);
  const remaining = Math.max(normalizedTotal - paid, 0);
  const progress = normalizedTotal > 0 ? (paid / normalizedTotal) * 100 : 0;
  return { total: normalizedTotal, paid, remaining, progress };
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return typeof data?.error === 'string' ? data.error : `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

const DEFAULT_API_PLACEHOLDER = 'your-backend.up.railway.app';

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

const ClientCabinet: React.FC<Props> = ({ tgUser, onBack }) => {
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDetails | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [useMockApi, setUseMockApi] = useState(API_BASE_URL.includes(DEFAULT_API_PLACEHOLDER));

  const identityQuery = useMemo(() => {
    if (tgUser?.id) return `telegramId=${encodeURIComponent(String(tgUser.id))}`;
    if (tgUser?.username) return `username=${encodeURIComponent(tgUser.username)}`;
    return 'demo=1';
  }, [tgUser?.id, tgUser?.username]);

  const clientIdentity = useMemo(
    () => ({
      telegramId: tgUser?.id,
      username: tgUser?.username,
      demo: !tgUser?.id && !tgUser?.username,
    }),
    [tgUser?.id, tgUser?.username]
  );

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
    setIsLoadingList(true);
    setError(null);
    try {
      const data = await runWithApiFallback(
        async () => {
          const response = await fetch(buildApiUrl(`/api/client/shipments?${identityQuery}`));
          if (!response.ok) {
            throw new Error(await parseErrorMessage(response));
          }
          return (await response.json()) as { items: ShipmentSummary[] };
        },
        () =>
          mockClientListShipments(clientIdentity).then(({ items }) => ({
            items,
          }))
      );
      setShipments(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setShipments([]);
      setError(err instanceof Error ? err.message : 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РѕС‚РїСЂР°РІР»РµРЅРёСЏ');
    } finally {
      setIsLoadingList(false);
    }
  }, [clientIdentity, identityQuery, runWithApiFallback]);

  const loadShipmentDetails = useCallback(
    async (shipmentId: string) => {
      setIsLoadingDetails(true);
      setError(null);
      try {
        const data = await runWithApiFallback(
          async () => {
            const response = await fetch(buildApiUrl(`/api/client/shipments/${shipmentId}?${identityQuery}`));
            if (!response.ok) {
              throw new Error(await parseErrorMessage(response));
            }
            return (await response.json()) as { item: ShipmentDetails };
          },
          () => mockClientGetShipment(shipmentId, clientIdentity)
        );
        setSelectedShipment(data.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'РќРµ СѓРґР°Р»РѕСЃСЊ Р·Р°РіСЂСѓР·РёС‚СЊ РґРµС‚Р°Р»Рё РѕС‚РїСЂР°РІР»РµРЅРёСЏ');
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [clientIdentity, identityQuery, runWithApiFallback]
  );

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  useEffect(() => {
    if (!selectedShipment) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedShipment]);

  const selectedPayment = selectedShipment ? getPaymentSnapshot(selectedShipment) : null;

  return (
    <Container>
      <HeaderRow>
        <div>
          <Title>РљР°Р±РёРЅРµС‚ РєР»РёРµРЅС‚Р°</Title>
          <Subtitle>
            {tgUser?.first_name
              ? `РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ: ${tgUser.first_name}`
              : 'Р РµР¶РёРј РїСЂРѕСЃРјРѕС‚СЂР° СЃС‚Р°С‚СѓСЃРѕРІ РѕС‚РїСЂР°РІР»РµРЅРёР№'}
          </Subtitle>
        </div>
      </HeaderRow>

      {error && <Empty>{error}</Empty>}

      {isLoadingList ? (
        <Empty>Загружаем отправления...</Empty>
      ) : shipments.length === 0 ? (
        <Empty>
          Для этого пользователя пока нет отправлений.
          <br />
          Создайте отправление из админ-панели.
        </Empty>
      ) : (
        <List>
          {shipments.map((shipment) => {
            const payment = getPaymentSnapshot(shipment);
            return (
              <ShipmentCard
                key={shipment.id}
                onClick={() => {
                  if (!isLoadingDetails) {
                    void loadShipmentDetails(shipment.id);
                  }
                }}
              >
                <CardTop>
                  <ShipmentId>{shipment.id}</ShipmentId>
                  <StatusPill $status={shipment.status}>{statusLabels[shipment.status]}</StatusPill>
                </CardTop>
                <Route>
                  {shipment.fromCity} → {shipment.toCity}
                </Route>
                <Meta>
                  ETA: {shipment.etaDate || 'не указан'}
                  <br />
                  {shipment.lastEvent ? `Последнее событие: ${shipment.lastEvent.title}` : 'Событий пока нет'}
                  <br />
                  Оплачено примерно: {formatRub(payment.paid)} • Осталось: {formatRub(payment.remaining)}
                  <br />
                  Нажмите, чтобы открыть полную карточку поставки.
                </Meta>
              </ShipmentCard>
            );
          })}
        </List>
      )}

      <ActionBar>
        <ActionButtonSecondary onClick={onBack}>На главную</ActionButtonSecondary>
        <ActionButton onClick={() => void loadShipments()} disabled={isLoadingList}>
          {isLoadingList ? 'Обновляем...' : 'Обновить'}
        </ActionButton>
      </ActionBar>

      {selectedShipment && (
        <DetailsOverlay onClick={() => setSelectedShipment(null)}>
          <DetailsSheet onClick={(event) => event.stopPropagation()}>
            <DetailsTop>
              <DetailsTitle>Детали поставки {selectedShipment.id}</DetailsTitle>
              <SecondaryButton onClick={() => setSelectedShipment(null)}>Закрыть</SecondaryButton>
            </DetailsTop>

            <ShipmentCard style={{ marginBottom: theme.spacing.md }}>
              <CardTop>
                <ShipmentId>{selectedShipment.id}</ShipmentId>
                <StatusPill $status={selectedShipment.status}>{statusLabels[selectedShipment.status]}</StatusPill>
              </CardTop>
              <Route>
                {selectedShipment.fromCity} → {selectedShipment.toCity}
              </Route>
              <Meta>
                ETA: {selectedShipment.etaDate || 'не указан'}
                <br />
                Контейнер: {selectedShipment.container || 'нет'}
                <br />
                Судно: {selectedShipment.vessel || 'нет'}
                <br />
                Обновлено: {formatDateTime(selectedShipment.updatedAt)}
              </Meta>
              {selectedPayment && (
                <>
                  <PaymentGrid>
                    <PaymentCard $kind="total">
                      <PaymentLabel>Сумма поставки</PaymentLabel>
                      <PaymentValue>{formatRub(selectedPayment.total)}</PaymentValue>
                    </PaymentCard>
                    <PaymentCard $kind="paid">
                      <PaymentLabel>Уже оплачено (примерно)</PaymentLabel>
                      <PaymentValue>{formatRub(selectedPayment.paid)}</PaymentValue>
                    </PaymentCard>
                    <PaymentCard $kind="left">
                      <PaymentLabel>Осталось оплатить (примерно)</PaymentLabel>
                      <PaymentValue>{formatRub(selectedPayment.remaining)}</PaymentValue>
                    </PaymentCard>
                  </PaymentGrid>
                  <ProgressBar>
                    <ProgressFill $percent={selectedPayment.progress} />
                  </ProgressBar>
                </>
              )}
            </ShipmentCard>

            <SectionTitle>Этапы поставки</SectionTitle>
            <Timeline>
              {selectedShipment.events.map((event) => (
                <TimelineItem key={`${selectedShipment.id}-${event.id}`}>
                  <EventTop>
                    <EventTitle>{event.title}</EventTitle>
                    <EventBadge>{eventLabels[event.status]}</EventBadge>
                  </EventTop>
                  {event.detail && <EventDetail>{event.detail}</EventDetail>}
                  <EventDate>{formatDateTime(event.createdAt)}</EventDate>
                </TimelineItem>
              ))}
            </Timeline>
          </DetailsSheet>
        </DetailsOverlay>
      )}
      {isLoadingDetails && <Empty>Р—Р°РіСЂСѓР¶Р°РµРј РґРµС‚Р°Р»Рё РѕС‚РїСЂР°РІР»РµРЅРёСЏ...</Empty>}
    </Container>
  );
};

export default ClientCabinet;

