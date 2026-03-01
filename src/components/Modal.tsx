import React, { useEffect } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContainer = styled.div`
  background: ${theme.colors.surface};
  border-radius: ${theme.borderRadius.lg};
  max-width: 820px;
  width: min(92vw, 820px);
  max-height: 90vh;
  overflow-y: auto;
  padding: ${theme.spacing.xl};
  position: relative;
  border: 1px solid ${theme.colors.border};
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.2);
`;

const CloseButton = styled.button`
  position: absolute;
  top: ${theme.spacing.md};
  right: ${theme.spacing.md};
  background: ${theme.colors.surfaceLight};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${theme.colors.surface};
    border-color: ${theme.colors.accent};
  }
`;

interface Props {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ onClose, children }) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={e => e.stopPropagation()}>
        <CloseButton onClick={onClose}>✕</CloseButton>
        {children}
      </ModalContainer>
    </Overlay>
  );
};

export default Modal;