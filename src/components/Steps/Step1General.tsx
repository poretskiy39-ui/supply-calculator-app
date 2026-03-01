import React, { useEffect } from 'react';
import styled from 'styled-components';
import { GeneralSettings } from '../../types';
import CurrencyInput from '../CurrencyInput';
import { SelectInput } from '../UI';
import { theme } from '../../styles/theme';
import useExchangeRates from '../../hooks/useExchangeRates';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.lg};
`;

const Section = styled.section`
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 14px;
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
`;

const SectionTitle = styled.h3`
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${theme.colors.textMuted};
  margin: 0 0 ${theme.spacing.md};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const CurrencyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: ${theme.spacing.md};

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
`;

const Row = styled.div`
  margin-top: ${theme.spacing.md};
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
`;

const ErrorText = styled.div`
  color: ${theme.colors.error};
  font-size: ${theme.typography.small};
  margin-bottom: ${theme.spacing.md};
`;

interface Props {
  settings: GeneralSettings;
  onUpdate: (newSettings: Partial<GeneralSettings>) => void;
}

const Step1General: React.FC<Props> = ({ settings, onUpdate }) => {
  const { rates, loading, error } = useExchangeRates();

  useEffect(() => {
    if (!rates) return;
    onUpdate({
      exchangeRate: rates.usd,
      euroRate: rates.eur,
      cnyRate: rates.cny,
    });
  }, [rates, onUpdate]);

  return (
    <Container>
      <Title>Общие параметры</Title>

      {loading && <Row>Загрузка курсов валют...</Row>}
      {error && <ErrorText>{error}</ErrorText>}

      <Section>
        <SectionTitle>Валюты и курс</SectionTitle>
        <CurrencyGrid>
          <CurrencyInput
            label="Курс USD -> RUB"
            value={settings.exchangeRate}
            onChange={v => onUpdate({ exchangeRate: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Курс EUR -> RUB"
            value={settings.euroRate}
            onChange={v => onUpdate({ euroRate: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Курс CNY -> RUB"
            value={settings.cnyRate}
            onChange={v => onUpdate({ cnyRate: v })}
            min={0}
            step={0.01}
          />
        </CurrencyGrid>
        <Row>Валюта инвойса: {settings.invoiceCurrency}</Row>
        <SelectInput
          value={settings.invoiceCurrency}
          onChange={e => onUpdate({ invoiceCurrency: e.target.value as GeneralSettings['invoiceCurrency'] })}
        >
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="CNY">CNY</option>
        </SelectInput>
      </Section>

      <Section>
        <SectionTitle>Базис поставки</SectionTitle>
        <SelectInput
          value={settings.incoterms}
          onChange={e => onUpdate({ incoterms: e.target.value as GeneralSettings['incoterms'] })}
        >
          <option value="EXW">EXW (самовывоз)</option>
          <option value="FOB">FOB (погрузка на судно)</option>
          <option value="CIF">CIF (страховка и фрахт)</option>
          <option value="DAP">DAP (доставка до места)</option>
        </SelectInput>
      </Section>

      <Section>
        <SectionTitle>Комиссии по умолчанию</SectionTitle>
        <Grid>
          <CurrencyInput
            label="Платежный агент (%)"
            value={settings.agentCommissionPercent}
            onChange={v => onUpdate({ agentCommissionPercent: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Экспортер (%)"
            value={settings.exporterCommissionPercent}
            onChange={v => onUpdate({ exporterCommissionPercent: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Банк-агент (%)"
            value={settings.bankCommissionPercent}
            onChange={v => onUpdate({ bankCommissionPercent: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Комиссия за перевод (%)"
            value={settings.bankTransferFeePercent}
            onChange={v => onUpdate({ bankTransferFeePercent: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Банковский контроль (%)"
            value={settings.bankControlFeePercent}
            onChange={v => onUpdate({ bankControlFeePercent: v })}
            min={0}
            step={0.01}
          />
        </Grid>
      </Section>
    </Container>
  );
};

export default Step1General;
