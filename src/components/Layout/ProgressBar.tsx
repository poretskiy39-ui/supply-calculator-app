import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
`;

const Steps = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.xs};
  margin-bottom: ${theme.spacing.sm};
  font-size: ${theme.typography.small};
  font-weight: 500;
`;

interface StepProps {
  $active: boolean;
}

const Step = styled.span<StepProps>`
  color: ${props => (props.$active ? theme.colors.accent : theme.colors.textMuted)};
  transition: color 0.2s;
  min-width: 0;
  flex: 1;
  text-align: center;

  @media (max-width: 360px) {
    font-size: 12px;
  }
`;

const Bar = styled.div`
  height: 5px;
  background: ${theme.colors.border};
  border-radius: 5px;
  overflow: hidden;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.2);
`;

interface FillProps {
  width: string;
}

const Fill = styled.div<FillProps>`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.accent} 0%, ${theme.colors.accentHover} 100%);
  width: ${props => props.width};
  transition: width 0.3s ease;
  border-radius: 5px;
`;

interface Props {
  step: number;
}

const ProgressBar: React.FC<Props> = ({ step }) => {
  const stepNames = ['Общие', 'Товары', 'Логистика', 'Итог'];
  const percent = `${(step / 4) * 100}%`;

  return (
    <Container>
      <Steps>
        {stepNames.map((name, i) => (
          <Step key={i} $active={i + 1 === step}>
            {i + 1}. {name}
          </Step>
        ))}
      </Steps>
      <Bar>
        <Fill width={percent} />
      </Bar>
    </Container>
  );
};

export default ProgressBar;