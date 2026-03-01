import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const StyledSelect = styled.select`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  padding-right: 42px;
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  border-radius: 11px;
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  width: 100%;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  letter-spacing: 0.01em;

  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%233A3A3A' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.md} center;
  background-size: 14px;

  &:hover {
    border-color: ${theme.colors.accent40};
    background-color: ${theme.colors.surfaceLight};
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function SelectInput({ children, ...rest }: SelectProps) {
  return <StyledSelect {...rest}>{children}</StyledSelect>;
}
