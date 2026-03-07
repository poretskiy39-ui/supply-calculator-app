// src/components/StepLogisticsResult.tsx
import React from 'react';
import styled from 'styled-components';
import { LogisticsResult, RouteType } from '../types';
import { formatCurrency } from '../utils/formatters';
import { theme } from '../styles/theme';
import { PrimaryButton, SecondaryButton } from './UI';

const Container = styled.div` padding: ${theme.spacing.lg}; `;
const Title = styled.h2`
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.lg};
`;
const RouteBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 7px;
  background: ${theme.colors.surfaceLight};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.lg};
`;
const SummaryCard = styled.div`
  background: ${theme.colors.text};
  color: ${theme.colors.bg};
  border-radius: 16px;
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
`;
const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;
const TotalLabel = styled.span`
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  opacity: 0.65;
`;
const TotalValue = styled.span`
  font-size: 30px;
  font-weight: 700;
  letter-spacing: -0.04em;
`;
const Breakdown = styled.div`
  background: ${theme.colors.surface};
  border-radius: 14px;
  border: 1px solid ${theme.colors.border};
  padding: ${theme.spacing.lg};
`;
const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  &:last-child { border-bottom: none; }
`;
const ItemName = styled.span``;
const ItemValue = styled.span`
  color: ${theme.colors.text};
  font-weight: 600;
`;
const SectionHeader = styled.div`
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${theme.colors.textMuted};
  padding: ${theme.spacing.sm} 0 4px;
  margin-top: ${theme.spacing.sm};
`;
const Note = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surfaceLight};
  border-radius: 12px;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  border: 1px solid ${theme.colors.border};
  white-space: pre-line;
`;
const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

interface Props {
  result: LogisticsResult;
  route?: RouteType;
  onBack: () => void;
  onContinue: () => void;
}

const StepLogisticsResult: React.FC<Props> = ({ result, route = 'china_ru', onBack, onContinue }) => {
  const { details } = result;
  const isEuTurkey = route === 'eu_tr_ru';

  return (
    <Container>
      <Title>Стоимость логистики</Title>

      <RouteBadge>
        {isEuTurkey ? '🇪🇺 ЕС → 🇹🇷 Турция → 🇷🇺 Россия' : '🇨🇳 Китай → 🇷🇺 Россия'}
      </RouteBadge>

      <SummaryCard>
        <TotalRow>
          <TotalLabel>Итого</TotalLabel>
          <TotalValue>{formatCurrency(result.totalRub)}</TotalValue>
        </TotalRow>
      </SummaryCard>

      <Breakdown>

        {/* ── EU→TR→RF специфика ── */}
        {isEuTurkey && (
          <>
            <SectionHeader>Турецкое плечо</SectionHeader>
            {(details.turkeyTraderCommissionRub ?? 0) > 0 && (
              <BreakdownItem>
                <ItemName>Комиссия трейдера TR</ItemName>
                <ItemValue>{formatCurrency(details.turkeyTraderCommissionRub!)}</ItemValue>
              </BreakdownItem>
            )}
            {(details.turkeyStorageRub ?? 0) > 0 && (
              <BreakdownItem>
                <ItemName>Хранение в Стамбуле</ItemName>
                <ItemValue>{formatCurrency(details.turkeyStorageRub!)}</ItemValue>
              </BreakdownItem>
            )}
            {(details.turkeyTruckRub ?? 0) > 0 && (
              <BreakdownItem>
                <ItemName>Фура Стамбул → РФ</ItemName>
                <ItemValue>{formatCurrency(details.turkeyTruckRub!)}</ItemValue>
              </BreakdownItem>
            )}
            <SectionHeader>Логистика в РФ</SectionHeader>
          </>
        )}

        {/* ── Китай: морской/ж/д фрахт ── */}
        {!isEuTurkey && details.oceanFreightRub > 0 && (
          <BreakdownItem>
            <ItemName>Морской фрахт</ItemName>
            <ItemValue>{formatCurrency(details.oceanFreightRub)}</ItemValue>
          </BreakdownItem>
        )}
        {!isEuTurkey && details.railFreightRub > 0 && (
          <BreakdownItem>
            <ItemName>{details.oceanFreightRub > 0 ? 'ЖД перевозка по РФ' : 'Стоимость перевозки'}</ItemName>
            <ItemValue>{formatCurrency(details.railFreightRub)}</ItemValue>
          </BreakdownItem>
        )}
        {details.lastMileRub > 0 && (
          <BreakdownItem>
            <ItemName>Последняя миля</ItemName>
            <ItemValue>{formatCurrency(details.lastMileRub)}</ItemValue>
          </BreakdownItem>
        )}

        {/* ── Общие строки ── */}
        <BreakdownItem>
          <ItemName>Комиссия платежного агента</ItemName>
          <ItemValue>{formatCurrency(details.agentCommissionRub)}</ItemValue>
        </BreakdownItem>
        <BreakdownItem>
          <ItemName>Страховка</ItemName>
          <ItemValue>{formatCurrency(details.insuranceRub)}</ItemValue>
        </BreakdownItem>

        {/* ── Таможня ── */}
        {details.customsValueRub > 0 && (
          <>
            <SectionHeader>Таможня</SectionHeader>
            <BreakdownItem>
              <ItemName>Таможенная стоимость</ItemName>
              <ItemValue>{formatCurrency(details.customsValueRub)}</ItemValue>
            </BreakdownItem>
            <BreakdownItem>
              <ItemName>Пошлина</ItemName>
              <ItemValue>{formatCurrency(details.dutyRub)}</ItemValue>
            </BreakdownItem>
            {/* ИСПРАВЛЕНО: было 22%, правильно 20% */}
            <BreakdownItem>
              <ItemName>НДС 22%</ItemName>
              <ItemValue>{formatCurrency(details.vatRub)}</ItemValue>
            </BreakdownItem>
            {(details.svhRub ?? 0) > 0 && (
              <BreakdownItem>
                <ItemName>СВХ (временное хранение)</ItemName>
                <ItemValue>{formatCurrency(details.svhRub!)}</ItemValue>
              </BreakdownItem>
            )}
          </>
        )}
      </Breakdown>

      {details.note && <Note>{details.note}</Note>}

      <ButtonGroup>
        <SecondaryButton style={{ flex: 1 }} onClick={onBack}>Назад</SecondaryButton>
        <PrimaryButton style={{ flex: 1 }} onClick={onContinue}>Оставить контакты</PrimaryButton>
      </ButtonGroup>
    </Container>
  );
};

export default StepLogisticsResult;
