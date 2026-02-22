import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const StyledSelect = styled.select`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  padding-right: 44px;
  background: ${theme.colors.surfaceLight};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  width: 100%;
  cursor: pointer;
  transition: border-color 0.2s;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23C6A15B' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right ${theme.spacing.md} center;
  background-size: 18px;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
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
