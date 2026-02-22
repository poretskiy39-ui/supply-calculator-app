import React from 'react';
import styled from 'styled-components';
import { GeneralSettings } from '../../types';
import CurrencyInput from '../CurrencyInput';
import { SelectInput } from '../UI';
import { theme } from '../../styles/theme';

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
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.lg};
  border: 1px solid ${theme.colors.border};
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

interface Step3Props {
  settings: GeneralSettings;
  onUpdate: (newSettings: Partial<GeneralSettings>) => void;
}

function Step3Logistics({ settings, onUpdate }: Step3Props) {
  return (
    <Container>
      <Title>Логистика и услуги</Title>

      <Section>
        <SectionTitle>Транспорт</SectionTitle>
        <SelectInput
          value={settings.transportType}
          onChange={(e) => onUpdate({ transportType: e.target.value as GeneralSettings['transportType'] })}
        >
          <option value="sea">Море</option>
          <option value="avia">Авиа</option>
          <option value="rail">Ж/Д</option>
          <option value="auto">Авто</option>
        </SelectInput>
        <Grid style={{ marginTop: theme.spacing.md }}>
          <CurrencyInput
            label="Ставка логистики ($/кг)"
            value={settings.logisticsRate}
            onChange={(v) => onUpdate({ logisticsRate: v })}
            min={0}
            step={0.1}
          />
          <CurrencyInput
            label="Страховка (%)"
            value={settings.insurancePercent}
            onChange={(v) => onUpdate({ insurancePercent: v })}
            min={0}
            step={0.1}
          />
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Сборы в РФ</SectionTitle>
        <Grid>
          <CurrencyInput
            label="Таможенный сбор (₽)"
            value={settings.customsFee}
            onChange={(v) => onUpdate({ customsFee: v })}
            min={0}
            step={1}
          />
          <CurrencyInput
            label="Подача декларации (₽)"
            value={settings.declarationCost}
            onChange={(v) => onUpdate({ declarationCost: v })}
            min={0}
            step={1}
          />
          <CurrencyInput
            label="Терминал (₽)"
            value={settings.terminalCost}
            onChange={(v) => onUpdate({ terminalCost: v })}
            min={0}
            step={1}
          />
          <CurrencyInput
            label="Последняя миля (₽/кг)"
            value={settings.lastMileCostPerKg}
            onChange={(v) => onUpdate({ lastMileCostPerKg: v })}
            min={0}
            step={1}
          />
        </Grid>
      </Section>

      <Section>
        <SectionTitle>Агентское вознаграждение</SectionTitle>
        <CurrencyInput
          label="Агентское вознаграждение (%)"
          value={settings.agentRewardPercent}
          onChange={(v) => onUpdate({ agentRewardPercent: v })}
          min={0}
          step={0.1}
        />
      </Section>
    </Container>
  );
}

export default Step3Logistics;