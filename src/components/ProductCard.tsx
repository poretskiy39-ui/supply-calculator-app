import React from 'react';
import styled from 'styled-components';
import { Product } from '../types';
import CurrencyInput from './CurrencyInput';
import { theme } from '../styles/theme';

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: 14px;
  padding: ${theme.spacing.lg};
  margin-bottom: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
  transition: border-color 0.2s, transform 0.2s;

  &:hover {
    border-color: ${theme.colors.accent40};
    transform: translateY(-1px);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${theme.spacing.md};
`;

const Title = styled.input`
  background: transparent;
  border: none;
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  font-weight: 600;
  padding: ${theme.spacing.xs} 0;
  border-bottom: 1px dashed ${theme.colors.border};
  width: 72%;

  &:focus {
    outline: none;
    border-bottom-color: ${theme.colors.accent40};
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

const RemoveButton = styled.button`
  background: ${theme.colors.surfaceLight};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textMuted};
  cursor: pointer;
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  min-width: 42px;
  min-height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: all 0.2s;

  &:hover {
    color: ${theme.colors.text};
    border-color: ${theme.colors.accent40};
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

const SectionTitle = styled.h4`
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
  margin: ${theme.spacing.md} 0 ${theme.spacing.sm};
`;

interface Props {
  product: Product;
  onUpdate: (field: keyof Product, value: any) => void;
  onRemove: () => void;
  canRemove: boolean;
}

const ProductCard: React.FC<Props> = ({ product, onUpdate, onRemove, canRemove }) => {
  return (
    <Card>
      <Header>
        <Title
          type="text"
          placeholder="Наименование товара"
          value={product.name}
          onChange={e => onUpdate('name', e.target.value)}
        />
        {canRemove && (
          <RemoveButton type="button" onClick={onRemove} aria-label="Удалить товар">
            ×
          </RemoveButton>
        )}
      </Header>

      <Grid>
        <CurrencyInput label="Цена за шт." value={product.price} onChange={v => onUpdate('price', v)} min={0} step={0.01} />
        <CurrencyInput label="Количество" value={product.quantity} onChange={v => onUpdate('quantity', v)} min={1} step={1} />
        <CurrencyInput label="Вес нетто (кг)" value={product.weightNetto} onChange={v => onUpdate('weightNetto', v)} min={0} step={0.01} />
        <CurrencyInput label="Длина (см)" value={product.length} onChange={v => onUpdate('length', v)} min={0} step={0.1} />
        <CurrencyInput label="Ширина (см)" value={product.width} onChange={v => onUpdate('width', v)} min={0} step={0.1} />
        <CurrencyInput label="Высота (см)" value={product.height} onChange={v => onUpdate('height', v)} min={0} step={0.1} />
      </Grid>

      <SectionTitle>Таможня и маркировка</SectionTitle>
      <Grid>
        <CurrencyInput label="Пошлина (%)" value={product.dutyPercent || 0} onChange={v => onUpdate('dutyPercent', v)} min={0} step={0.1} />
        <CurrencyInput label="Пошлина (евро)" value={product.dutyEuro || 0} onChange={v => onUpdate('dutyEuro', v)} min={0} step={0.01} />
      </Grid>

      <Grid style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm }}>
          <input
            type="checkbox"
            id={`marking-${product.id}`}
            checked={product.needMarking || false}
            onChange={e => onUpdate('needMarking', e.target.checked)}
          />
          <label htmlFor={`marking-${product.id}`}>Честный знак</label>
        </div>
        {product.needMarking && (
          <CurrencyInput
            label="Цена за ед. (₽)"
            value={product.markingPrice || 0}
            onChange={v => onUpdate('markingPrice', v)}
            min={0}
            step={0.01}
          />
        )}
      </Grid>
    </Card>
  );
};

export default ProductCard;
