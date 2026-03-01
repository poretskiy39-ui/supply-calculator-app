import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  min-height: 62vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Greeting = styled.p`
  font-size: 8px;
  color: ${theme.colors.textMuted};
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin: 0 0 8px;
`;

const Title = styled.h1`
  font-family: var(--font-heading);
  font-size: 31px;
  line-height: 1.06;
  margin: 0 0 ${theme.spacing.md};
  max-width: 340px;
`;

const Accent = styled.span`
  font-family: var(--font-serif);
  font-style: italic;
  font-weight: 300;
  color: ${theme.colors.textMuted};
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
  margin: 0 0 ${theme.spacing.xl};
  max-width: 340px;
  line-height: 1.58;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.sm};
  width: 100%;
`;

const ServiceButton = styled.button`
  width: 100%;
  padding: 15px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 12px;
  color: ${theme.colors.text};
  font-size: ${theme.typography.small};
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.accent40};
    background: ${theme.colors.surfaceLight};
    transform: translateY(-1px);
  }
`;

interface Props {
  onSelectService: (service: 'full' | 'logistics') => void;
}

const Step0Welcome: React.FC<Props> = ({ onSelectService }) => {
  return (
    <Container>
      <Greeting>{'// Добро пожаловать'}</Greeting>
      <Title>
        Ваши поставки.
        <br />
        <Accent>Под контролем.</Accent>
      </Title>
      <Subtitle>
        Расчёт себестоимости, логистики и таможенных платежей в одном инструменте. Строго, быстро, без лишнего.
      </Subtitle>
      <ButtonGroup>
        <ServiceButton onClick={() => onSelectService('full')}>Поставка под ключ</ServiceButton>
        <ServiceButton onClick={() => onSelectService('logistics')}>Только логистика</ServiceButton>
      </ButtonGroup>
    </Container>
  );
};

export default Step0Welcome;
