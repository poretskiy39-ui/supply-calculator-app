import React from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const InputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  width: 100%;
`;

const Label = styled.label`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
`;

const StyledInput = styled.input`
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surfaceLight};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
    box-shadow: 0 0 0 3px ${theme.colors.accent}30;
  }

  &::placeholder {
    color: ${theme.colors.textMuted};
  }
`;

interface Props {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  step?: number;
  placeholder?: string;
  disabled?: boolean;
}

const CurrencyInput: React.FC<Props> = ({
  label,
  value,
  onChange,
  min = 0,
  step = 0.01,
  placeholder,
  disabled,
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= min) {
      onChange(val);
    } else if (e.target.value === '') {
      onChange(0);
    }
  };

  return (
    <InputWrapper>
      <Label>{label}</Label>
      <StyledInput
        type="number"
        value={value || ''}
        onChange={handleChange}
        min={min}
        step={step}
        placeholder={placeholder}
        disabled={disabled}
      />
    </InputWrapper>
  );
};

export default CurrencyInput;