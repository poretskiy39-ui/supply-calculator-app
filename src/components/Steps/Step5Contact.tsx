import React from 'react';
import styled from 'styled-components';
import { ContactInfo } from '../../types';
import { theme } from '../../styles/theme';
import { PrimaryButton, SecondaryButton } from '../UI';

const Container = styled.div`
  padding: ${theme.spacing.lg};
`;

const Title = styled.h2`
  font-size: ${theme.typography.h2};
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
`;

const Form = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.xl};
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const Label = styled.label`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
`;

const Input = styled.input`
  padding: ${theme.spacing.md} ${theme.spacing.lg};
  background: ${theme.colors.surfaceLight};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: ${theme.colors.accent};
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: ${theme.spacing.md};
  margin-top: ${theme.spacing.xl};
`;

const BackBtn = styled(SecondaryButton)`
  flex: 1;
`;
const SubmitBtn = styled(PrimaryButton)`
  flex: 1;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

interface Props {
  contact: ContactInfo;
  onUpdate: (field: keyof ContactInfo, value: string) => void;
  onBack: () => void;
  onSubmit: () => void;
}

const Step5Contact: React.FC<Props> = ({ contact, onUpdate, onBack, onSubmit }) => {
  const isValid = contact.name.trim() && contact.phone.trim() && contact.email.trim();

  return (
    <Container>
      <Title>Контакты для связи</Title>
      <Form>
        <Field>
          <Label>Ваше имя *</Label>
          <Input
            type="text"
            value={contact.name}
            onChange={e => onUpdate('name', e.target.value)}
            placeholder="Иван Пукин"
          />
        </Field>
        <Field>
          <Label>Компания</Label>
          <Input
            type="text"
            value={contact.company}
            onChange={e => onUpdate('company', e.target.value)}
            placeholder="ООО 'БНАЛ'"
          />
        </Field>
        <Field>
          <Label>Телефон *</Label>
          <Input
            type="tel"
            value={contact.phone}
            onChange={e => onUpdate('phone', e.target.value)}
            placeholder="+7 (999) 123-45-67"
          />
        </Field>
        <Field>
          <Label>Email *</Label>
          <Input
            type="email"
            value={contact.email}
            onChange={e => onUpdate('email', e.target.value)}
            placeholder="ivan@example.com"
          />
        </Field>
      </Form>
      <ButtonGroup>
        <BackBtn type="button" onClick={onBack}>← Назад</BackBtn>
        <SubmitBtn type="button" onClick={onSubmit} disabled={!isValid}>
          Отправить заявку
        </SubmitBtn>
      </ButtonGroup>
    </Container>
  );
};

export default Step5Contact;