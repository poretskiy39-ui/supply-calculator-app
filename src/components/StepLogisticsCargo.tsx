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
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.lg};
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
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${theme.colors.textMuted};
`;

const Input = styled.input`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 11px;
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${theme.spacing.md};

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  color: ${theme.colors.text};
  font-size: ${theme.typography.small};
  cursor: pointer;
`;

const Note = styled.div`
  margin-top: ${theme.spacing.sm};
  padding: ${theme.spacing.md};
  background: ${theme.colors.surfaceLight};
  border-radius: 12px;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.small};
  border: 1px solid ${theme.colors.border};
`;

const ToggleGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  margin-bottom: ${theme.spacing.md};
`;

const ToggleButton = styled.button<{ active: boolean }>`
  flex: 1;
  padding: ${theme.spacing.md};
  background: ${({ active }) => (active ? theme.colors.text : theme.colors.surface)};
  color: ${({ active }) => (active ? theme.colors.bg : theme.colors.text)};
  border: 1px solid ${theme.colors.border};
  border-radius: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  font-size: ${theme.typography.small};
  cursor: pointer;
`;

interface Props {
  data: LogisticsData;
  onUpdate: (field: keyof LogisticsData, value: any) => void;
  onNext: () => void;
  onBack: () => void;
}

const StepLogisticsCargo: React.FC<Props> = ({ data, onUpdate, onNext, onBack }) => {
  const isValid = Boolean(
    data.productName &&
      data.hsCode &&
      data.invoiceAmount > 0 &&
      ((data.transportType === 'container' && data.weightGross && data.weightGross > 0) ||
        (data.transportType === 'ltl' && data.ltlWeight && data.ltlWeight > 0))
  );

  const chinaPorts: ChinaPort[] = ['Shanghai', 'Ningbo', 'Xingang (Tianjin)', 'Qingdao', 'Dalian'];
  const cities: DestinationCity[] = ['Москва', 'Санкт-Петербург'];
  const containerTypes: ContainerType[] = ['20DC', '40HC'];

  return (
    <Container>
      <Title>Параметры груза (FOB)</Title>

      <ToggleGroup>
        <ToggleButton active={data.transportType === 'container'} onClick={() => onUpdate('transportType', 'container')}>
          Контейнер
        </ToggleButton>
        <ToggleButton active={data.transportType === 'ltl'} onClick={() => onUpdate('transportType', 'ltl')}>
          Сборное авто
        </ToggleButton>
      </ToggleGroup>

      <Form>
        <Field>
          <Label>Наименование товара *</Label>
          <Input
            type="text"
            value={data.productName}
            onChange={e => onUpdate('productName', e.target.value)}
            placeholder="Например: обувь кожаная"
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
            label="Стоимость по инвойсу *"
            value={data.invoiceAmount}
            onChange={v => onUpdate('invoiceAmount', v)}
            min={0}
            step={0.01}
          />
          <Field>
            <Label>Валюта инвойса</Label>
            <SelectInput value={data.invoiceCurrency} onChange={e => onUpdate('invoiceCurrency', e.target.value)}>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="CNY">CNY</option>
            </SelectInput>
          </Field>
        </Grid>

        {data.transportType === 'container' ? (
          <>
            <Grid>
              <CurrencyInput
                label="Вес брутто (кг) *"
                value={data.weightGross || 0}
                onChange={v => onUpdate('weightGross', v)}
                min={0}
                step={0.1}
              />
              <Field>
                <Label>Тип контейнера</Label>
                <SelectInput value={data.containerType} onChange={e => onUpdate('containerType', e.target.value)}>
                  {containerTypes.map(type => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </Grid>

            <Grid>
              <Field>
                <Label>Порт погрузки</Label>
                <SelectInput value={data.portOfLoading} onChange={e => onUpdate('portOfLoading', e.target.value as ChinaPort)}>
                  {chinaPorts.map(port => (
                    <option key={port} value={port}>
                      {port}
                    </option>
                  ))}
                </SelectInput>
              </Field>
              <Field>
                <Label>Город назначения</Label>
                <SelectInput value={data.destinationCity} onChange={e => onUpdate('destinationCity', e.target.value as DestinationCity)}>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </Grid>
          </>
        ) : (
          <>
            <Grid>
              <Field>
                <Label>Город отправления (Китай)</Label>
                <Input
                  type="text"
                  value={data.originCity || ''}
                  onChange={e => onUpdate('originCity', e.target.value)}
                  placeholder="Например: Шэньчжэнь"
                />
              </Field>
              <Field>
                <Label>Город назначения *</Label>
                <SelectInput value={data.ltlDestination} onChange={e => onUpdate('ltlDestination', e.target.value as DestinationCity)}>
                  {cities.map(city => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </SelectInput>
              </Field>
            </Grid>

            <Grid>
              <CurrencyInput
                label="Вес (кг) *"
                value={data.ltlWeight || 0}
                onChange={v => onUpdate('ltlWeight', v)}
                min={0}
                step={0.1}
              />
              <CurrencyInput
                label="Объем (м3)"
                value={data.ltlVolume || 0}
                onChange={v => onUpdate('ltlVolume', v)}
                min={0}
                step={0.01}
              />
            </Grid>

            <Grid>
              <CheckboxLabel>
                <input type="checkbox" checked={data.ltlPickup || false} onChange={e => onUpdate('ltlPickup', e.target.checked)} />
                Забор груза в Китае
              </CheckboxLabel>
              <CheckboxLabel>
                <input type="checkbox" checked={data.ltlDelivery || false} onChange={e => onUpdate('ltlDelivery', e.target.checked)} />
                Доставка по городу назначения
              </CheckboxLabel>
            </Grid>
          </>
        )}

        <Field>
          <CheckboxLabel>
            <input type="checkbox" checked={data.needCustoms} onChange={e => onUpdate('needCustoms', e.target.checked)} />
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

        {data.transportType === 'container' && (
          <Note>
            В ставку включены морской фрахт до Дальнего Востока, перегрузка, далее ЖД и довоз до склада.
          </Note>
        )}

        {data.transportType === 'ltl' && (
          <Note>
            Стоимость считается по тарифу 2.8 USD/кг (минимум 300 USD). Если объемный вес выше фактического,
            используется объемный вес 250 кг/м3.
          </Note>
        )}

        <div style={{ display: 'flex', gap: theme.spacing.md, marginTop: theme.spacing.xl }}>
          <SecondaryButton onClick={onBack} style={{ flex: 1 }}>
            Назад
          </SecondaryButton>
          <PrimaryButton onClick={onNext} disabled={!isValid} style={{ flex: 1 }}>
            Далее
          </PrimaryButton>
        </div>
      </Form>
    </Container>
  );
};

export default StepLogisticsCargo;
