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
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
`;

const Section = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
`;

const SectionTitle = styled.h3`
  font-size: ${theme.typography.body};
  color: ${theme.colors.accent};
  margin-bottom: ${theme.spacing.md};
  font-weight: 600;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.sm};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
`;

const ErrorText = styled.div`
  color: ${theme.colors.error};
  text-align: center;
  margin-top: ${theme.spacing.md};
`;

interface Props {
  settings: GeneralSettings;
  onUpdate: (newSettings: Partial<GeneralSettings>) => void;
}

const Step1General: React.FC<Props> = ({ settings, onUpdate }) => {
  const { rates, loading, error } = useExchangeRates();

  useEffect(() => {
    if (rates) {
      onUpdate({
        exchangeRate: rates.usd,
        euroRate: rates.eur,
        cnyRate: rates.cny,
      });
    }
  }, [rates, onUpdate]); // добавили onUpdate в зависимости

  return (
    <Container>
      <Title>Общие параметры</Title>

      {loading && <Row>Загрузка курсов валют...</Row>}
      {error && <ErrorText>{error}</ErrorText>}

      <Section>
        <SectionTitle>Валюты и курс</SectionTitle>
        <Grid>
          <CurrencyInput
            label="Курс USD → RUB"
            value={settings.exchangeRate}
            onChange={v => onUpdate({ exchangeRate: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Курс EUR → RUB"
            value={settings.euroRate}
            onChange={v => onUpdate({ euroRate: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Курс CNY → RUB"
            value={settings.cnyRate}
            onChange={v => onUpdate({ cnyRate: v })}
            min={0}
            step={0.01}
          />
        </Grid>
        <Row style={{ marginTop: theme.spacing.md }}>
          Валюта инвойса: {settings.invoiceCurrency}
        </Row>
        <SelectInput
          value={settings.invoiceCurrency}
          onChange={e => onUpdate({ invoiceCurrency: e.target.value as any })}
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
          onChange={e => onUpdate({ incoterms: e.target.value as any })}
        >
          <option value="EXW">EXW (самовывоз)</option>
          <option value="FOB">FOB (погрузка на судно)</option>
          <option value="CIF">CIF (страховка+фрахт)</option>
          <option value="DAP">DAP (доставка до места)</option>
        </SelectInput>
      </Section>

      <Section>
        <SectionTitle>Комиссии по умолчанию</SectionTitle>
        <Grid>
          <CurrencyInput
            label="Платёжный агент (%)"
            value={settings.agentCommissionPercent}
            onChange={v => onUpdate({ agentCommissionPercent: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="Экспортёр (%)"
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
            label="КВ банка за перевод (%)"
            value={settings.bankTransferFeePercent}
            onChange={v => onUpdate({ bankTransferFeePercent: v })}
            min={0}
            step={0.01}
          />
          <CurrencyInput
            label="За ведомость (%)"
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