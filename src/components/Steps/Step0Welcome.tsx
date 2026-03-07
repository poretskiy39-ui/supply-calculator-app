// src/components/Steps/Step0Welcome.tsx
import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';
import { RouteType, ROUTE_LABELS } from '../../types';

const Container = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  min-height: 62vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;
const Greeting = styled.p`
  font-size: 8px;
  color: ${theme.colors.textMuted};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 8px;
`;
const Title = styled.h1`
  font-family: var(--font-heading);
  font-size: 31px;
  line-height: 1.06;
  margin: 0 0 ${theme.spacing.md};
  max-width: 340px;
`;
const Accent = styled.span`
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  color: ${theme.colors.textMuted};
`;
const Subtitle = styled.p`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.xl};
  max-width: 340px;
  line-height: 1.58;
`;
const SectionLabel = styled.div`
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${theme.colors.textMuted};
  margin-bottom: ${theme.spacing.sm};
`;
const RouteGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.sm};
`;
const RouteChip = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 11px ${theme.spacing.md};
  border-radius: 10px;
  border: 1px solid ${({ $active }) => $active ? theme.colors.accent : theme.colors.border};
  background: ${({ $active }) => $active ? theme.colors.accent + '18' : theme.colors.surface};
  color: ${({ $active }) => $active ? theme.colors.accent : theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { border-color: ${theme.colors.accent}; color: ${theme.colors.accent}; }
`;
const RouteNote = styled.div`
  font-size: 11px;
  color: ${theme.colors.textMuted};
  margin-bottom: ${theme.spacing.xl};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${theme.colors.surfaceLight};
  border-radius: 8px;
  border: 1px solid ${theme.colors.border};
  line-height: 1.55;
`;
const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
`;
const ServiceButton = styled.button`
  width: 100%;
  padding: 15px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  color: ${theme.colors.text};
  font-size: ${theme.typography.small};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: ${theme.colors.accent}66;
    background: ${theme.colors.surfaceLight};
    transform: translateY(-1px);
  }
`;
const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: ${theme.spacing.lg} 0 ${theme.spacing.md};
`;
const SecondaryLinks = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;
const LinkButton = styled.button`
  flex: 1;
  padding: 10px;
  background: transparent;
  border: 1px solid ${theme.colors.border};
  border-radius: 10px;
  color: ${theme.colors.textMuted};
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;
  &:hover { color: ${theme.colors.text}; border-color: ${theme.colors.accent}55; }
`;

const ROUTE_NOTES: Record<RouteType, string> = {
  china_ru: 'Контейнер / сборное авто / авиа. Порты: Шанхай, Нинбо, Циндао → ВМТП, Новороссийск, СПб.',
  eu_tr_ru: 'Товар из ЕС через турецкого трейдера. Авто Стамбул → граница РФ. Комплаенс включён.',
};

interface Props {
  onSelectService: (service: 'full' | 'logistics', route: RouteType) => void;
  onOpenAdmin?: () => void;
  onOpenCabinet?: () => void;
}

const Step0Welcome: React.FC<Props> = ({ onSelectService, onOpenAdmin, onOpenCabinet }) => {
  const [selectedRoute, setSelectedRoute] = useState<RouteType>('china_ru');

  return (
    <Container>
      <Greeting>{'// Добро пожаловать'}</Greeting>
      <Title>
        Ваши поставки.<br />
        <Accent>Под контролем.</Accent>
      </Title>
      <Subtitle>
        Расчёт себестоимости, логистики и таможенных платежей в одном инструменте. Строго, быстро, без лишнего.
      </Subtitle>

      <SectionLabel>Маршрут поставки</SectionLabel>
      <RouteGroup>
        {(Object.keys(ROUTE_LABELS) as RouteType[]).map(r => (
          <RouteChip key={r} $active={selectedRoute === r} onClick={() => setSelectedRoute(r)}>
            {ROUTE_LABELS[r]}
          </RouteChip>
        ))}
      </RouteGroup>
      <RouteNote>{ROUTE_NOTES[selectedRoute]}</RouteNote>

      <ButtonGroup>
        <ServiceButton onClick={() => onSelectService('full', selectedRoute)}>
          Поставка под ключ
        </ServiceButton>
        <ServiceButton onClick={() => onSelectService('logistics', selectedRoute)}>
          Только логистика
        </ServiceButton>
      </ButtonGroup>

      {(onOpenAdmin || onOpenCabinet) && (
        <>
          <Divider />
          <SecondaryLinks>
            {onOpenCabinet && <LinkButton onClick={onOpenCabinet}>Мои заявки</LinkButton>}
            {onOpenAdmin && <LinkButton onClick={onOpenAdmin}>Управление</LinkButton>}
          </SecondaryLinks>
        </>
      )}
    </Container>
  );
};

export default Step0Welcome;
