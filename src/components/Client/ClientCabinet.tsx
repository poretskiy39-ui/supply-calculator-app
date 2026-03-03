import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { buildApiUrl } from '../../config/api';
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
  waiting: 'Ожидание',
  in_transit: 'В пути',
  customs: 'Таможня',
  delivered: 'Доставлен',
  delayed: 'Задержан',
};

const eventLabels: Record<ShipmentEventStatus, string> = {
  done: 'Выполнено',
  active: 'Текущий этап',
  pending: 'Ожидается',
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
  border: 1px solid ${theme.colors.border};
  background: ${({ $status }) =>
    $status === 'delivered'
      ? 'rgba(42,107,58,0.22)'
      : $status === 'delayed'
        ? 'rgba(200,53,42,0.22)'
        : theme.colors.surfaceLight};
  color: ${theme.colors.text};
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

const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString('ru-RU');
};

const parseErrorMessage = async (response: Response): Promise<string> => {
  try {
    const data = await response.json();
    return typeof data?.error === 'string' ? data.error : `HTTP ${response.status}`;
  } catch {
    return `HTTP ${response.status}`;
  }
};

const ClientCabinet: React.FC<Props> = ({ tgUser, onBack }) => {
  const [shipments, setShipments] = useState<ShipmentSummary[]>([]);
  const [selectedShipment, setSelectedShipment] = useState<ShipmentDetails | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identityQuery = useMemo(() => {
    if (tgUser?.id) return `telegramId=${encodeURIComponent(String(tgUser.id))}`;
    if (tgUser?.username) return `username=${encodeURIComponent(tgUser.username)}`;
    return 'demo=1';
  }, [tgUser?.id, tgUser?.username]);

  const loadShipments = useCallback(async () => {
    setIsLoadingList(true);
    setError(null);
    try {
      const response = await fetch(buildApiUrl(`/api/client/shipments?${identityQuery}`));
      if (!response.ok) {
        throw new Error(await parseErrorMessage(response));
      }
      const data = (await response.json()) as { items: ShipmentSummary[] };
      setShipments(Array.isArray(data.items) ? data.items : []);
    } catch (err) {
      setShipments([]);
      setError(err instanceof Error ? err.message : 'Не удалось загрузить отправления');
    } finally {
      setIsLoadingList(false);
    }
  }, [identityQuery]);

  const loadShipmentDetails = useCallback(
    async (shipmentId: string) => {
      setIsLoadingDetails(true);
      setError(null);
      try {
        const response = await fetch(buildApiUrl(`/api/client/shipments/${shipmentId}?${identityQuery}`));
        if (!response.ok) {
          throw new Error(await parseErrorMessage(response));
        }
        const data = (await response.json()) as { item: ShipmentDetails };
        setSelectedShipment(data.item);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Не удалось загрузить детали отправления');
      } finally {
        setIsLoadingDetails(false);
      }
    },
    [identityQuery]
  );

  useEffect(() => {
    void loadShipments();
  }, [loadShipments]);

  return (
    <Container>
      <HeaderRow>
        <div>
          <Title>Кабинет клиента</Title>
          <Subtitle>
            {tgUser?.first_name
              ? `Пользователь: ${tgUser.first_name}`
              : 'Режим просмотра статусов отправлений'}
          </Subtitle>
        </div>
      </HeaderRow>

      {error && <Empty>{error}</Empty>}

      {selectedShipment ? (
        <div>
          <ShipmentCard>
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
          </ShipmentCard>

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

          <ActionBar>
            <ActionButtonSecondary onClick={() => setSelectedShipment(null)}>
              К списку
            </ActionButtonSecondary>
            <ActionButton onClick={onBack}>На главную</ActionButton>
          </ActionBar>
        </div>
      ) : (
        <div>
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
              {shipments.map((shipment) => (
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
                  </Meta>
                </ShipmentCard>
              ))}
            </List>
          )}

          <ActionBar>
            <ActionButtonSecondary onClick={onBack}>На главную</ActionButtonSecondary>
            <ActionButton onClick={() => void loadShipments()} disabled={isLoadingList}>
              {isLoadingList ? 'Обновляем...' : 'Обновить'}
            </ActionButton>
          </ActionBar>
        </div>
      )}

      {isLoadingDetails && <Empty>Загружаем детали отправления...</Empty>}
    </Container>
  );
};

export default ClientCabinet;
