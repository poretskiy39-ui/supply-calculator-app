import React, { useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.32);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 320px;
  text-align: center;
  border: 1px solid ${theme.colors.border};
  box-shadow: 0 20px 48px rgba(0, 0, 0, 0.16);
`;

const Title = styled.h3`
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.md};
`;

const Text = styled.p`
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.lg};
`;

const Spinner = styled.div`
  border: 2px solid ${theme.colors.border};
  border-top: 2px solid ${theme.colors.accent};
  border-radius: 50%;
  width: 32px;
  height: 32px;
  animation: spin 1s linear infinite;
  margin: 0 auto;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

interface Props {
  onClose: () => void;
}

const SuccessMessage: React.FC<Props> = ({ onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <Overlay>
      <Card>
        <Title>Спасибо!</Title>
        <Text>Заявка отправлена. Менеджер свяжется с вами в ближайшее время.</Text>
        <Spinner />
      </Card>
    </Overlay>
  );
};

export default SuccessMessage;