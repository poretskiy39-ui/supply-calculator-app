import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface NeonButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  fullWidth?: boolean;
}

const StyledNeonButton = styled.button<NeonButtonProps>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md} ${theme.spacing.xl};
  border-radius: 10px;
  font-weight: 600;
  font-size: ${theme.typography.small};
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  border: 1px solid ${theme.colors.border};
  transition: all 0.2s ease;
  width: ${({ fullWidth }) => (fullWidth ? '100%' : 'auto')};
  
  ${({ variant = 'primary' }) =>
    variant === 'primary'
      ? `
        background: ${theme.colors.text};
        color: ${theme.colors.bg};
        &:hover {
          background: ${theme.colors.accentHover};
          transform: translateY(-1px);
        }
      `
      : `
        background: ${theme.colors.surface};
        color: ${theme.colors.text};
        &:hover {
          border-color: ${theme.colors.accent};
          background: ${theme.colors.surfaceLight};
          transform: translateY(-1px);
        }
      `}
  
  &:active {
    transform: translateY(0);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

export const NeonButton: React.FC<NeonButtonProps> = ({ children, variant = 'primary', fullWidth, ...rest }) => {
  return (
    <StyledNeonButton variant={variant} fullWidth={fullWidth} {...rest}>
      {children}
    </StyledNeonButton>
  );
};
