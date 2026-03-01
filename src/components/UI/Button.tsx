import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const baseStyles = `
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: 10px;
  font-size: ${theme.typography.small};
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;

  &:active {
    transform: translateY(0);
  }
`;

export const PrimaryButton = styled.button`
  ${baseStyles}
  background: ${theme.colors.text};
  border: 1px solid ${theme.colors.text};
  color: ${theme.colors.bg};

  &:hover:not(:disabled) {
    background: ${theme.colors.accentHover};
    border-color: ${theme.colors.accentHover};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const SecondaryButton = styled.button`
  ${baseStyles}
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};

  &:hover:not(:disabled) {
    background: ${theme.colors.surfaceLight};
    border-color: ${theme.colors.accent40};
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AdditiveButton = styled.button`
  ${baseStyles}
  background: ${theme.colors.surface};
  border: 1px dashed ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  width: 100%;
  margin-bottom: ${theme.spacing.lg};

  &:hover:not(:disabled) {
    border-color: ${theme.colors.accent40};
    background: ${theme.colors.surfaceLight};
    color: ${theme.colors.text};
    transform: translateY(-1px);
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

export const Button: React.FC<ButtonProps> = ({ variant = 'primary', children, ...rest }) => {
  const Styled = StyledByVariant[variant];
  return <Styled {...rest}>{children}</Styled>;
};
