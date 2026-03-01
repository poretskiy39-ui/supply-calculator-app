import React from 'react';
import styled from 'styled-components';
import { Product } from '../../types';
import ProductCard from '../ProductCard';
import { AdditiveButton } from '../UI';
import { theme } from '../../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-family: var(--font-heading);
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin: 0 0 ${theme.spacing.sm};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textMuted};
  margin: 0 0 ${theme.spacing.lg};
`;

interface Props {
  products: Product[];
  onAdd: () => void;
  onUpdate: (id: string, field: keyof Product, value: any) => void;
  onRemove: (id: string) => void;
}

const Step2Products: React.FC<Props> = ({ products, onAdd, onUpdate, onRemove }) => {
  return (
    <Container>
      <Title>Товары</Title>
      <Subtitle>Заполните состав партии для точного расчёта под ключ.</Subtitle>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onUpdate={(field, value) => onUpdate(product.id, field, value)}
          onRemove={() => onRemove(product.id)}
          canRemove={products.length > 1}
        />
      ))}
      <AdditiveButton type="button" onClick={onAdd}>+ Добавить ещё товар</AdditiveButton>
    </Container>
  );
};

export default Step2Products;
