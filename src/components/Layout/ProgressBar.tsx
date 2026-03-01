import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Container = styled.div`
  padding: 10px ${theme.spacing.lg} 12px;
  background: ${theme.colors.surface};
  border-bottom: 1px solid ${theme.colors.border};
`;

const Steps = styled.div`
  display: flex;
  justify-content: space-between;
  gap: ${theme.spacing.xs};
  margin-bottom: 8px;
  font-size: 8px;
  letter-spacing: 0.05em;
  text-transform: uppercase;
`;

const Step = styled.span<{ $active: boolean }>`
  color: ${({ $active }) => ($active ? theme.colors.text : theme.colors.textMuted)};
  flex: 1;
  text-align: center;
`;

const Bar = styled.div`
  height: 3px;
  background: ${theme.colors.border};
  border-radius: 3px;
  overflow: hidden;
`;

const Fill = styled.div<{ width: string }>`
  height: 100%;
  background: ${theme.colors.text};
  width: ${({ width }) => width};
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
        {steps.map((name, index) => (
          <Step key={name + index} $active={index + 1 === step}>
            {name}
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
