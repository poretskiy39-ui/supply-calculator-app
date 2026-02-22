import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const baseStyles = `
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.body};
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, background 0.2s ease, border-color 0.2s ease;

  &:active {
    transform: scale(0.98);
  }
`;

export const PrimaryButton = styled.button`
  ${baseStyles}
  background: ${theme.colors.accent};
  border: none;
  color: ${theme.colors.bg};

  &:hover {
    background: ${theme.colors.accentHover};
  }
`;

export const SecondaryButton = styled.button`
  ${baseStyles}
  background: transparent;
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};

  &:hover {
    background: ${theme.colors.surfaceLight};
    border-color: ${theme.colors.textMuted};
  }
`;

export const AdditiveButton = styled.button`
  ${baseStyles}
  background: ${theme.colors.surface};
  border: 2px dashed ${theme.colors.border};
  color: ${theme.colors.accent};
  width: 100%;
  margin-bottom: ${theme.spacing.lg};

  &:hover {
    border-color: ${theme.colors.accent};
    background: ${theme.colors.surfaceLight};
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
