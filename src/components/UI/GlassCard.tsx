import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: keyof typeof theme.spacing;
  glow?: boolean;
}

const StyledCard = styled.div<{ padding: keyof typeof theme.spacing; glow?: boolean }>`
  background: ${theme.colors.surface};
  border-radius: 14px;
  padding: ${({ padding }) => theme.spacing[padding]};
  border: 1px solid ${theme.colors.border};
  box-shadow: ${({ glow }) => (glow ? `0 8px 24px ${theme.colors.accent20}` : 'none')};
  transition: border-color 0.2s ease, transform 0.2s ease;

  &:hover {
    border-color: ${theme.colors.accent40};
    transform: translateY(-1px);
  }
`;

export const GlassCard: React.FC<GlassCardProps> = ({ children, padding = 'lg', glow, ...rest }) => {
  return (
    <StyledCard padding={padding} glow={glow} {...rest}>
      {children}
    </StyledCard>
  );
};
