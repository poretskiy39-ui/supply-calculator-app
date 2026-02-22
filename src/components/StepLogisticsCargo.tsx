import React from 'react';
import styled from 'styled-components';
import { LogisticsData, ChinaPort, DestinationCity, ContainerType } from '../types';
import CurrencyInput from './CurrencyInput';
import { SelectInput, PrimaryButton, SecondaryButton } from './UI';
import { theme } from '../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surfaceLight};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px rgba(198, 161, 91, 0.1);
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  cursor: pointer;
`;

const Note = styled.div`
  margin-top: ${theme.spacing.md};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surface};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  border-left: 3px solid ${theme.colors.accent};
`;

interface Props {
  data: LogisticsData;
  onUpdate: (field: keyof LogisticsData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepLogisticsCargo: React.FC<Props> = ({ data, onUpdate, onNext, onBack }) => {
  const isValid = data.productName && data.hsCode && data.invoiceAmount > 0 && data.weightGross > 0;

  const chinaPorts: ChinaPort[] = ['Shanghai', 'Ningbo', 'Xingang (Tianjin)', 'Qingdao', 'Dalian'];
  const cities: DestinationCity[] = ['Москва', 'Санкт-Петербург'];
  const containerTypes: ContainerType[] = ['20DC', '40HC'];

  return (
    <Container>
      <Title>Параметры груза (FOB)</Title>
      <Form>
        <Field>
          <Label>Наименование товара *</Label>
          <Input
            type="text"
            value={data.productName}
            onChange={e => onUpdate('productName', e.target.value)}
            placeholder="Например: Обувь кожаная"
          />
        </Field>

        <Field>
          <Label>Код ТН ВЭД *</Label>
          <Input
            type="text"
            value={data.hsCode}
            onChange={e => onUpdate('hsCode', e.target.value)}
            placeholder="6403 99 980 0"
          />
        </Field>

        <Grid>
          <CurrencyInput
            label="Стоимость товара по инвойсу *"
            value={data.invoiceAmount}
            onChange={v => onUpdate('invoiceAmount', v)}
            min={0}
            step={0.01}
          />
          <Field>
            <Label>Валюта инвойса</Label>
            <SelectInput
              value={data.invoiceCurrency}
              onChange={e => onUpdate('invoiceCurrency', e.target.value)}
            >
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CNY">CNY</option>
            </SelectInput>
          </Field>
        </Grid>

        <Grid>
          <CurrencyInput
            label="Вес брутто (кг) *"
            value={data.weightGross}
            onChange={v => onUpdate('weightGross', v)}
            min={0}
            step={0.1}
          />
          <Field>
            <Label>Тип контейнера</Label>
            <SelectInput
              value={data.containerType}
              onChange={e => onUpdate('containerType', e.target.value)}
            >
              {containerTypes.map(type => <option key={type} value={type}>{type}</option>)}
            </SelectInput>
          </Field>
        </Grid>

        <Grid>
          <Field>
            <Label>Порт погрузки в Китае</Label>
            <SelectInput
              value={data.portOfLoading}
              onChange={e => onUpdate('portOfLoading', e.target.value as ChinaPort)}
            >
              {chinaPorts.map(port => <option key={port} value={port}>{port}</option>)}
            </SelectInput>
          </Field>
          <Field>
            <Label>Город назначения в РФ</Label>
            <SelectInput
              value={data.destinationCity}
              onChange={e => onUpdate('destinationCity', e.target.value as DestinationCity)}
            >
              {cities.map(city => <option key={city} value={city}>{city}</option>)}
            </SelectInput>
          </Field>
        </Grid>

        <Field>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={data.needCustoms}
              onChange={e => onUpdate('needCustoms', e.target.checked)}
            />
            Нужно таможенное оформление
          </CheckboxLabel>
        </Field>

        {data.needCustoms && (
          <Grid>
            <CurrencyInput
              label="Ставка пошлины (%)"
              value={data.customsDutyPercent}
              onChange={v => onUpdate('customsDutyPercent', v)}
              min={0}
              step={0.1}
            />
            <CurrencyInput
              label="Страховка (% от инвойса)"
              value={data.insurancePercent}
              onChange={v => onUpdate('insurancePercent', v)}
              min={0}
              step={0.1}
            />
          </Grid>
        )}

        <Note>
          ⓘ В ставку входит: морской фрахт до порта Дальнего Востока, погрузка и выгрузка с судна.
          Затем ж/д перевозка до вашего города и довоз до склада клиента.
        </Note>

        <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <SecondaryButton onClick={onBack} style={{ flex: 1 }}>Назад</SecondaryButton>
          <PrimaryButton onClick={onNext} disabled={!isValid} style={{ flex: 1 }}>Далее</PrimaryButton>
        </div>
      </Form>
    </Container>
  );
};

export default StepLogisticsCargo;