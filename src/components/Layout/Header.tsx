import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const HeaderContainer = styled.header`
  background: linear-gradient(145deg, ${theme.colors.bg} 0%, ${theme.colors.surface} 100%);
  padding: ${theme.spacing.xl} ${theme.spacing.lg};
  position: relative;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: ${theme.typography.h1};
  font-weight: 700;
  color: ${theme.colors.text};
  margin-bottom: ${theme.spacing.xs};
  letter-spacing: -0.5px;
`;

const Accent = styled.span`
  color: ${theme.colors.accent};
  font-weight: 600;
`;

const Subtitle = styled.p`
  font-size: ${theme.typography.small};
  color: ${theme.colors.textSecondary};
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

const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <Title>
        Supply<Accent>Master</Accent>
      </Title>
      <Subtitle>Профессиональный расчёт поставок</Subtitle>
      <Decoration />
    </HeaderContainer>
  );
};

export default Header;