import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import { theme } from '../../styles/theme';
import { GlassCard } from '../UI/GlassCard';
import AnimatedNumber from '../UI/AnimatedNumber';
import { formatCurrency } from '../../utils/formatters';
import PDFDocument from '../PDFDocument';
import { CalculationResult, Product, GeneralSettings } from '../../types';
import { NeonButton } from '../UI/NeonButton';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.lg};
`;

const Hero = styled(GlassCard)`
  margin-bottom: ${theme.spacing.lg};
`;

const HeroLabel = styled.div`
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
  margin-bottom: 8px;
`;

const HeroRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${theme.spacing.md};
`;

const HeroTotal = styled.div`
  font-family: var(--font-heading);
  font-size: 34px;
  line-height: 1;
  font-weight: 800;
  color: ${theme.colors.text};
`;

const HeroMeta = styled.div`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  text-align: right;
  line-height: 1.5;
`;

const Section = styled(GlassCard)`
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  margin: 0 0 ${theme.spacing.md};
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  color: ${theme.colors.textMuted};
`;

const BreakdownItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: ${theme.spacing.md};
  padding: ${theme.spacing.sm} 0;
  border-bottom: 1px solid ${theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
`;

const ItemName = styled.span`
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
`;

const ItemValue = styled.span`
  color: ${theme.colors.text};
  font-size: ${theme.typography.small};
  font-weight: 700;
  text-align: right;
`;

const Divider = styled.div`
  height: 1px;
  background: ${theme.colors.border};
  margin: ${theme.spacing.sm} 0;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.md};
`;

const Action = styled.div`
  flex: 1;
  min-width: 180px;
`;

interface Props {
  result: CalculationResult;
  products: Product[];
  settings: GeneralSettings;
  onBack: () => void;
  onContinue: () => void;
}

type Row = {
  name: string;
  value: number;
  hidden?: boolean;
};

export const Step4Result: React.FC<Props> = ({ result, products, settings, onBack, onContinue }) => {
  const [isSharing, setIsSharing] = useState(false);

  const rows = useMemo<Row[]>(
    () => [
      { name: 'Инвойс', value: result.details.invoiceRub },
      { name: 'Логистика', value: result.details.logisticsRub },
      { name: 'Страховка', value: result.details.insuranceRub },
      { name: 'Комиссия экспортёра', value: result.details.exporterCommissionRub },
      { name: 'Комиссия платёжного агента', value: result.details.agentCommissionRub },
      { name: 'Наценка продаж: экспортёр', value: result.details.salesExporterMarkupRub, hidden: result.details.salesExporterMarkupRub <= 0 },
      { name: 'Наценка продаж: платёжный агент', value: result.details.salesAgentMarkupRub, hidden: result.details.salesAgentMarkupRub <= 0 },
      { name: 'Наценка продаж: логистика', value: result.details.salesLogisticsMarkupRub, hidden: result.details.salesLogisticsMarkupRub <= 0 },
      { name: 'Таможенная стоимость', value: result.details.customsValueRub },
      { name: 'Пошлина', value: result.details.dutyRub },
      { name: 'НДС 20%', value: result.details.vatRub },
      { name: 'Таможенный сбор', value: result.details.customsFeeRub },
      { name: 'Подача декларации', value: result.details.declarationCostRub },
      { name: 'Терминал', value: result.details.terminalCostRub },
      { name: 'Последняя миля', value: result.details.lastMileRub },
      { name: 'Комиссии банков', value: result.details.bankCommissionsRub },
      { name: 'Честный знак', value: result.details.markingRub, hidden: result.details.markingRub <= 0 },
      { name: 'Агентское вознаграждение', value: result.details.agentRewardRub },
    ],
    [result]
  );

  const handleSharePdf = async () => {
    setIsSharing(true);
    try {
      const blob = await pdf(<PDFDocument products={products} settings={settings} result={result} />).toBlob();
      const fileName = 'SupplyMaster_calculation.pdf';
      const file = new File([blob], fileName, { type: 'application/pdf' });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: 'Расчёт поставки',
          text: 'PDF с расчётом поставки',
          files: [file],
        });
      } else {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <Container>
      <Title>Результаты расчёта</Title>

      <Hero glow>
        <HeroLabel>Итоговая стоимость</HeroLabel>
        <HeroRow>
          <HeroTotal>
            <AnimatedNumber value={result.totalRub} /> ₽
          </HeroTotal>
          <HeroMeta>
            Себестоимость единицы:
            <br />
            <AnimatedNumber value={result.costPerItem} /> ₽
          </HeroMeta>
        </HeroRow>
      </Hero>

      <Section>
        <SectionTitle>Детализация</SectionTitle>
        {rows.map((row) =>
          row.hidden ? null : (
            <BreakdownItem key={row.name}>
              <ItemName>{row.name}</ItemName>
              <ItemValue>{formatCurrency(row.value)}</ItemValue>
            </BreakdownItem>
          )
        )}
        <Divider />
        <BreakdownItem>
          <ItemName>Итого</ItemName>
          <ItemValue>{formatCurrency(result.totalRub)}</ItemValue>
        </BreakdownItem>
      </Section>

      <Actions>
        <Action>
          <NeonButton onClick={onBack} fullWidth>
            Назад
          </NeonButton>
        </Action>
        <Action>
          <PDFDownloadLink
            document={<PDFDocument products={products} settings={settings} result={result} />}
            fileName="SupplyMaster_calculation.pdf"
            style={{ display: 'block' }}
          >
            {({ loading }) => (
              <NeonButton variant="primary" fullWidth disabled={loading}>
                {loading ? 'Генерация PDF...' : 'Скачать PDF'}
              </NeonButton>
            )}
          </PDFDownloadLink>
        </Action>
        <Action>
          <NeonButton variant="secondary" onClick={handleSharePdf} fullWidth disabled={isSharing}>
            {isSharing ? 'Подготовка...' : 'Отправить PDF'}
          </NeonButton>
        </Action>
        <Action>
          <NeonButton variant="primary" onClick={onContinue} fullWidth>
            Оставить контакты
          </NeonButton>
        </Action>
      </Actions>
    </Container>
  );
};
