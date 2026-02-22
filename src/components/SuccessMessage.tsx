import React, { useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const Card = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  max-width: 300px;
  text-align: center;
  border: 1px solid ${theme.colors.accent};
`;

const Title = styled.h3`
  color: ${theme.colors.accent};
  margin-bottom: ${theme.spacing.md};
`;

const Text = styled.p`
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.lg};
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
        <Text>Заявка отправлена. Менеджер свяжется с вами.</Text>
      </Card>
    </Overlay>
  );
};

export default SuccessMessage;