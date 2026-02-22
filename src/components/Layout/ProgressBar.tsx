import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.lg} ${theme.spacing.lg} ${theme.spacing.md};
  background: ${theme.colors.surface};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
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
  flex: 1;
  text-align: center;
`;

const Bar = styled.div`
  height: 5px;
  background: ${theme.colors.border};
  border-radius: 5px;
  overflow: hidden;
`;

interface FillProps {
  width: string;
}

const Fill = styled.div<FillProps>`
  height: 100%;
  background: linear-gradient(90deg, ${theme.colors.accent} 0%, ${theme.colors.accentHover} 100%);
  width: ${props => props.width};
  transition: width 0.3s ease;
`;

interface Props {
  step: number;
  steps: string[];
}

const ProgressBar: React.FC<Props> = ({ step, steps }) => {
  const percent = `${(step / steps.length) * 100}%`;

  return (
    <Container>
      <Steps>
        {steps.map((name, i) => (
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