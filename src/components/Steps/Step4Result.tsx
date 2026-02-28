import React from 'react';
import styled from 'styled-components';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { theme } from '../../styles/theme';
import { GlassCard } from '../UI/GlassCard';
import AnimatedNumber from '../UI/AnimatedNumber';
import { formatCurrency } from '../../utils/formatters';
import PDFDocument from '../PDFDocument';
import { CalculationResult, Product, GeneralSettings } from '../../types';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
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
`;

const CostPerItem = styled.div`
  text-align: right;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
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

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const Button = styled.button<{ primary?: boolean }>`
  flex: 1;
  min-width: 120px;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${props => props.primary ? theme.colors.accent : 'transparent'};
  color: ${props => props.primary ? theme.colors.bg : theme.colors.text};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${props => props.primary ? theme.colors.accentHover : theme.colors.surfaceLight};
  }
`;

interface Props {
  result: CalculationResult;
  products: Product[];
  settings: GeneralSettings;
  onBack: () => void;
  onContinue: () => void;
}

export const Step4Result: React.FC<Props> = ({ result, products, settings, onBack, onContinue }) => {
  return (
    <Container>
      <Title>Результаты расчёта</Title>

      <GlassCard glow style={{ marginBottom: theme.spacing.lg }}>
        <TotalRow>
          <TotalLabel>ИТОГО:</TotalLabel>
          <TotalValue>
            <AnimatedNumber value={result.totalRub} /> ₽
          </TotalValue>
        </TotalRow>
        <CostPerItem>
          Себестоимость ед.: <AnimatedNumber value={result.costPerItem} /> ₽
        </CostPerItem>
      </GlassCard>

      <GlassCard style={{ marginBottom: theme.spacing.lg }}>
        <h3 style={{ fontSize: theme.typography.h2, marginBottom: theme.spacing.md }}>Детализация</h3>
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
        <BreakdownItem>
          <ItemName>Комиссия экспортёра</ItemName>
          <ItemValue>{formatCurrency(result.details.exporterCommissionRub)}</ItemValue>
        </BreakdownItem>
        <BreakdownItem>
          <ItemName>Комиссия платёжного агента</ItemName>
          <ItemValue>{formatCurrency(result.details.agentCommissionRub)}</ItemValue>
        </BreakdownItem>
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
        <BreakdownItem>
          <ItemName>Комиссии банков</ItemName>
          <ItemValue>{formatCurrency(result.details.bankCommissionsRub)}</ItemValue>
        </BreakdownItem>
        {result.details.markingRub > 0 && (
          <BreakdownItem>
            <ItemName>Честный знак</ItemName>
            <ItemValue>{formatCurrency(result.details.markingRub)}</ItemValue>
          </BreakdownItem>
        )}
        <BreakdownItem>
          <ItemName>Агентское вознаграждение</ItemName>
          <ItemValue>{formatCurrency(result.details.agentRewardRub)}</ItemValue>
        </BreakdownItem>
      </GlassCard>

      <ButtonGroup>
        <Button onClick={onBack}>← Назад</Button>
        <PDFDownloadLink
          document={<PDFDocument products={products} settings={settings} result={result} />}
          fileName="SupplyMaster_calculation.pdf"
        >
          {({ loading }) => (
            <Button primary disabled={loading}>
              {loading ? 'Генерация...' : 'Скачать PDF'}
            </Button>
          )}
        </PDFDownloadLink>
        <Button primary onClick={onContinue}>
          Оставить контакты
        </Button>
      </ButtonGroup>
    </Container>
  );
};