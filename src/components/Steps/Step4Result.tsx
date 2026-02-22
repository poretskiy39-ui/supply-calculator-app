import React from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import styled from 'styled-components';
import { CalculationResult, Product, GeneralSettings } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { theme } from '../../styles/theme';
import { PrimaryButton, SecondaryButton } from '../UI';
import PDFDocument from '../PDFDocument';

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

const CostPerItem = styled.div`
  text-align: right;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
`;

const Breakdown = styled.div`
  margin-top: ${theme.spacing.lg};
`;

const BreakdownGroup = styled.div`
  background: ${theme.colors.surface};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
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

const BackBtn = styled(SecondaryButton)`
  flex: 1;
  min-width: 120px;
`;
const ContactBtn = styled(PrimaryButton)`
  flex: 1;
  min-width: 120px;
`;
const PdfBtn = styled(PrimaryButton)`
  flex: 1;
  min-width: 120px;
  background: ${theme.colors.surfaceLight};
  color: ${theme.colors.text};
  border: 1px solid ${theme.colors.border};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};

  &:hover {
    background: ${theme.colors.surface};
  }
`;

interface Props {
  result: CalculationResult;
  products: Product[];
  settings: GeneralSettings;
  onBack: () => void;
  onContinue: () => void;
}

const Step4Result: React.FC<Props> = ({ result, products, settings, onBack, onContinue }) => {
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
        <BackBtn type="button" onClick={onBack}>← Назад</BackBtn>
        <PDFDownloadLink
          document={<PDFDocument products={products} settings={settings} result={result} />}
          fileName="SupplyMaster_calculation.pdf"
        >
          {({ loading }) => (
            <PdfBtn type="button" disabled={loading}>
              {loading ? '⏳ Генерация...' : 'Скачать PDF'}
            </PdfBtn>
          )}
        </PDFDownloadLink>
        <ContactBtn type="button" onClick={onContinue}>
          Оставить контакты
        </ContactBtn>
      </ButtonGroup>
    </Container>
  );
};

export default Step4Result;