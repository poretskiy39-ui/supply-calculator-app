import React from 'react';
import styled from 'styled-components';
import { CalculationResult } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { theme } from '../../styles/theme';
import { PrimaryButton, SecondaryButton } from '../UI';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
`;

const SummaryCard = styled.div`
  background: linear-gradient(145deg, ${theme.colors.surface} 0%, ${theme.colors.surfaceLight} 100%);
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.accent}40;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
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

const CostPerItem = styled.div`
  text-align: right;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
`;

const Breakdown = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const BreakdownGroup = styled.div`
  margin-bottom: ${theme.spacing.lg};
`;

const GroupTitle = styled.h4`
  font-size: ${theme.typography.small};
  font-weight: 600;
  color: ${theme.colors.accent};
  margin: 0 0 ${theme.spacing.sm} 0;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
`;

const ItemName = styled.span``;
const ItemValue = styled.span`
  color: ${theme.colors.text};
  font-weight: 500;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const BackBtn = styled(SecondaryButton)`
  flex: 1;
`;
const SubmitBtn = styled(PrimaryButton)`
  flex: 1;
`;

interface Props {
  result: CalculationResult;
  onBack: () => void;
  onContinue: () => void;
}

const Step4Result: React.FC<Props> = ({ result, onBack, onContinue }) => {
  return (
    <Container>
      <Title>Результаты расчёта</Title>

      <SummaryCard>
        <TotalRow>
          <TotalLabel>ИТОГО:</TotalLabel>
          <TotalValue>{formatCurrency(result.totalRub)}</TotalValue>
        </TotalRow>
        <CostPerItem>Себестоимость ед.: {formatCurrency(result.costPerItem)}</CostPerItem>
      </SummaryCard>

      <Breakdown>
        <BreakdownGroup>
          <GroupTitle>Стоимость и логистика</GroupTitle>
          <BreakdownItem>
            <ItemName>Инвойс</ItemName>
            <ItemValue>{formatCurrency(result.details.invoiceRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Логистика</ItemName>
            <ItemValue>{formatCurrency(result.details.logisticsRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Страховка</ItemName>
            <ItemValue>{formatCurrency(result.details.insuranceRub)}</ItemValue>
          </BreakdownItem>
        </BreakdownGroup>

        <BreakdownGroup>
          <GroupTitle>Комиссии</GroupTitle>
          <BreakdownItem>
            <ItemName>Комиссия экспортёра</ItemName>
            <ItemValue>{formatCurrency(result.details.exporterCommissionRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Комиссия платёжного агента</ItemName>
            <ItemValue>{formatCurrency(result.details.agentCommissionRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Комиссии банков</ItemName>
            <ItemValue>{formatCurrency(result.details.bankCommissionsRub)}</ItemValue>
          </BreakdownItem>
        </BreakdownGroup>

        <BreakdownGroup>
          <GroupTitle>Таможня и сборы</GroupTitle>
          <BreakdownItem>
            <ItemName>Таможенная стоимость</ItemName>
            <ItemValue>{formatCurrency(result.details.customsValueRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Пошлина</ItemName>
            <ItemValue>{formatCurrency(result.details.dutyRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>НДС 20%</ItemName>
            <ItemValue>{formatCurrency(result.details.vatRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Таможенный сбор</ItemName>
            <ItemValue>{formatCurrency(result.details.customsFeeRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Подача декларации</ItemName>
            <ItemValue>{formatCurrency(result.details.declarationCostRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Терминал</ItemName>
            <ItemValue>{formatCurrency(result.details.terminalCostRub)}</ItemValue>
          </BreakdownItem>
          <BreakdownItem>
            <ItemName>Последняя миля</ItemName>
            <ItemValue>{formatCurrency(result.details.lastMileRub)}</ItemValue>
          </BreakdownItem>
          {result.details.markingRub > 0 && (
            <BreakdownItem>
              <ItemName>Честный знак</ItemName>
              <ItemValue>{formatCurrency(result.details.markingRub)}</ItemValue>
            </BreakdownItem>
          )}
        </BreakdownGroup>

        <BreakdownGroup>
          <GroupTitle>Вознаграждение</GroupTitle>
          <BreakdownItem>
            <ItemName>Агентское вознаграждение</ItemName>
            <ItemValue>{formatCurrency(result.details.agentRewardRub)}</ItemValue>
          </BreakdownItem>
        </BreakdownGroup>
      </Breakdown>

      <ButtonGroup>
        <BackBtn type="button" onClick={onBack} aria-label="Вернуться к логистике">← Назад</BackBtn>
        <SubmitBtn type="button" onClick={onContinue} aria-label="Отправить заявку менеджеру">Отправить заявку</SubmitBtn>
      </ButtonGroup>
    </Container>
  );
};

export default Step4Result;