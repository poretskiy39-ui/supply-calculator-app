import React from 'react';
import styled, { keyframes } from 'styled-components';
import { theme } from '../../styles/theme';

// const rotate = keyframes`
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// `;

const Container = styled.div`
  padding: ${theme.spacing.xl};
  text-align: center;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;
// Закоментил лого, пока не придумаю где найти качество лучше
// const Logo = styled.img`
//   width: 120px;
//   height: 120px;
//   animation: ${rotate} 10s linear infinite;
//   margin-bottom: ${theme.spacing.xl};
// `;

// const Title = styled.h1`
//   font-size: 32px;
//   color: ${theme.colors.accent};
//   margin-bottom: ${theme.spacing.md};
// `;

const Subtitle = styled.p`
  font-size: ${theme.typography.body};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xl};
  max-width: 300px;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  width: 100%;
  max-width: 300px;
`;

const ServiceButton = styled.button`
  padding: ${theme.spacing.lg};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.lg};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: ${theme.colors.accent};
    background: ${theme.colors.surfaceLight};
  }
`;

interface Props {
  onSelectService: (service: 'full' | 'logistics') => void;
}

const Step0Welcome: React.FC<Props> = ({ onSelectService }) => {
  return (
    <Container>
    {/* <Logo src="/logo.png" alt="Movers Group" /> */}
      
      <Subtitle>В вашем распоряжение мощный и быстрый инструмент для расчетов</Subtitle>
      <ButtonGroup>
        <ServiceButton onClick={() => onSelectService('full')}>
          Поставка под ключ
        </ServiceButton>
        <ServiceButton onClick={() => onSelectService('logistics')}>
          Только логистика
        </ServiceButton>
      </ButtonGroup>
    </Container>
  );
};

export default Step0Welcome;