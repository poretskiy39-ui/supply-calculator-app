import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const HeaderContainer = styled.header`
  background: linear-gradient(145deg, ${theme.colors.bg} 0%, ${theme.colors.surface} 100%);
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Title = styled.h1`
  font-size: ${theme.typography.h1};
  font-weight: 700;
  color: ${theme.colors.text};
  letter-spacing: -0.5px;
  margin: 0;
`;

const MenuButton = styled.button`
  background: ${theme.colors.surface};
  backdrop-filter: ${theme.blur};
  -webkit-backdrop-filter: ${theme.blur};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.text};
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  font-size: ${theme.typography.small};
  cursor: pointer;
  transition: all 0.2s;
  z-index: 2;

  &:hover {
    border-color: ${theme.colors.accent};
    background: ${theme.colors.surfaceLight};
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const Decoration = styled.div`
  position: absolute;
  top: -20px;
  right: -20px;
  width: 180px;
  height: 180px;
  background: radial-gradient(circle, ${theme.colors.accent}20 0%, transparent 70%);
  border-radius: 50%;
  z-index: 1;
`;

interface Props {
  onMenuClick?: () => void;
}

const Header: React.FC<Props> = ({ onMenuClick }) => {
  return (
    <HeaderContainer>
      <Title>MOVERS GROUP</Title>
      {onMenuClick && (
        <MenuButton onClick={onMenuClick}>
          ☰ Меню
        </MenuButton>
      )}
      <Decoration />
    </HeaderContainer>
  );
};

export default Header;