import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const baseStyles = `
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.body};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

export const PrimaryButton = styled.button`
  ${baseStyles}
  background: ${theme.colors.accent};
  border: none;
  color: ${theme.colors.bg};
  box-shadow: 0 4px 14px rgba(198, 161, 91, 0.2);

  &:hover:not(:disabled) {
    background: ${theme.colors.accentHover};
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(198, 161, 91, 0.4);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  ${baseStyles}
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover:not(:disabled) {
    background: ${theme.colors.surfaceLight};
    border-color: ${theme.colors.textMuted};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AdditiveButton = styled.button`
  ${baseStyles}
  background: ${theme.colors.surface};
  border: 2px dashed ${theme.colors.border};
  color: ${theme.colors.accent};
  width: 100%;
  margin-bottom: ${theme.spacing.lg};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.accent};
    background: ${theme.colors.surfaceLight};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'additive';
  children: React.ReactNode;
}

const StyledByVariant = {
  primary: PrimaryButton,
  secondary: SecondaryButton,
  additive: AdditiveButton,
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  ...rest
}) => {
  const Styled = StyledByVariant[variant];
  return <Styled {...rest}>{children}</Styled>;
};