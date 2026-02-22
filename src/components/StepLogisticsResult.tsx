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
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
`;

const SummaryCard = styled.div`
  background: ${theme.colors.surface};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.accent}40;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  transition: transform 0.2s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 28px rgba(198, 161, 91, 0.2);
  }
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: ${theme.spacing.sm};
`;

const TotalLabel = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.body};
  font-weight: 600;
`;

const TotalValue = styled.span`
  font-size: 28px;
  font-weight: 700;
  color: ${theme.colors.accent};
  letter-spacing: -0.5px;
`;

const Breakdown = styled.div`
  background: ${theme.colors.surface};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-top: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
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
  font-weight: 500;
`;

const Note = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surfaceLight};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textSecondary};
  font-style: italic;
  border-left: 3px solid ${theme.colors.accent};
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
          <TotalLabel>ИТОГО:</TotalLabel>
          <TotalValue>{formatCurrency(result.totalRub)}</TotalValue>
        </TotalRow>
      </SummaryCard>

      <Breakdown>
        <BreakdownItem>
          <ItemName>Морской фрахт (порт Китая → порт ДВ)</ItemName>
          <ItemValue>{formatCurrency(details.oceanFreightRub)}</ItemValue>
        </BreakdownItem>
        <BreakdownItem>
          <ItemName>Ж/Д перевозка (порт ДВ → город назначения)</ItemName>
          <ItemValue>{formatCurrency(details.railFreightRub)}</ItemValue>
        </BreakdownItem>
        <BreakdownItem>
          <ItemName>Довоз до склада</ItemName>
          <ItemValue>{formatCurrency(details.lastMileRub)}</ItemValue>
        </BreakdownItem>
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
        <BackBtn onClick={onBack}>← Назад</BackBtn>
        <ContinueBtn onClick={onContinue}>Оставить контакты</ContinueBtn>
      </ButtonGroup>
    </Container>
  );
};

export default StepLogisticsResult;