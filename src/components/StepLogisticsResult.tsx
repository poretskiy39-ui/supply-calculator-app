import React from 'react';
import styled from 'styled-components';
import { LogisticsResult } from '../types';
import { formatCurrency } from '../utils/formatters';
import { theme } from '../styles/theme';
import { PrimaryButton, SecondaryButton } from './UI';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.lg};
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

  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span``;
const ItemValue = styled.span`
  color: ${theme.colors.text};
  font-weight: 600;
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

const BackBtn = styled(SecondaryButton)`
  flex: 1;
`;

const ContinueBtn = styled(PrimaryButton)`
  flex: 1;
`;

interface Props {
  result: LogisticsResult;
  onBack: () => void;
  onContinue: () => void;
}

const StepLogisticsResult: React.FC<Props> = ({ result, onBack, onContinue }) => {
  const { details } = result;

  return (
    <Container>
      <Title>Стоимость логистики</Title>

      <SummaryCard>
        <TotalRow>
          <TotalLabel>Итого</TotalLabel>
          <TotalValue>{formatCurrency(result.totalRub)}</TotalValue>
        </TotalRow>
      </SummaryCard>

      <Breakdown>
        {details.oceanFreightRub > 0 && (
          <BreakdownItem>
            <ItemName>Морской фрахт</ItemName>
            <ItemValue>{formatCurrency(details.oceanFreightRub)}</ItemValue>
          </BreakdownItem>
        )}
        {details.railFreightRub > 0 && (
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
        <BreakdownItem>
          <ItemName>Комиссия платежного агента</ItemName>
          <ItemValue>{formatCurrency(details.agentCommissionRub)}</ItemValue>
        </BreakdownItem>
        <BreakdownItem>
          <ItemName>Страховка</ItemName>
          <ItemValue>{formatCurrency(details.insuranceRub)}</ItemValue>
        </BreakdownItem>
        {details.customsValueRub > 0 && (
          <>
            <BreakdownItem>
              <ItemName>Таможенная стоимость</ItemName>
              <ItemValue>{formatCurrency(details.customsValueRub)}</ItemValue>
            </BreakdownItem>
            <BreakdownItem>
              <ItemName>Пошлина</ItemName>
              <ItemValue>{formatCurrency(details.dutyRub)}</ItemValue>
            </BreakdownItem>
            <BreakdownItem>
              <ItemName>НДС 22%</ItemName>
              <ItemValue>{formatCurrency(details.vatRub)}</ItemValue>
            </BreakdownItem>
          </>
        )}
      </Breakdown>

      {details.note && <Note>{details.note}</Note>}

      <ButtonGroup>
        <BackBtn onClick={onBack}>Назад</BackBtn>
        <ContinueBtn onClick={onContinue}>Оставить контакты</ContinueBtn>
      </ButtonGroup>
    </Container>
  );
};

export default StepLogisticsResult;
