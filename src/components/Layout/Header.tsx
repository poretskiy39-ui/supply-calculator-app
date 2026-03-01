import React from 'react';
import styled from 'styled-components';
import { theme, ThemeMode } from '../../styles/theme';

const HeaderContainer = styled.header`
  background: linear-gradient(180deg, ${theme.colors.bg} 0%, ${theme.colors.surface} 100%);
  padding: 12px ${theme.spacing.lg} 14px;
  border-bottom: 1px solid ${theme.colors.border};
`;

const TopLine = styled.div`
  display: flex;
  justify-content: center;
  font-size: 9px;
  letter-spacing: 0.06em;
  color: ${theme.colors.textMuted};
  margin-bottom: 10px;
`;

const NavLine = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const LogoWrap = styled.div`
  display: flex;
  flex-direction: column;
`;

const Title = styled.h1`
  font-family: var(--font-heading);
  font-size: 20px;
  font-weight: 800;
  color: ${theme.colors.text};
  letter-spacing: -0.04em;
  margin: 0;
`;

const Subtitle = styled.span`
  font-size: 7px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${theme.colors.textMuted};
`;

const Controls = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
`;

const MenuButton = styled.button`
  min-width: 34px;
  height: 34px;
  border: 1px solid ${theme.colors.border};
  border-radius: 9px;
  background: ${theme.colors.surface};
  color: ${theme.colors.text};
  cursor: pointer;
  transition: all 0.2s;
  padding: 0 10px;
  font-size: 9px;
  letter-spacing: 0.08em;
  text-transform: uppercase;

  &:hover {
    border-color: ${theme.colors.accent40};
    background: ${theme.colors.surfaceLight};
    transform: translateY(-1px);
  }
`;

interface Props {
  onMenuClick?: () => void;
  onDirectoryClick?: () => void;
  onThemeToggle?: () => void;
  themeMode?: ThemeMode;
}

const Header: React.FC<Props> = ({ onMenuClick, onDirectoryClick, onThemeToggle, themeMode = 'dark' }) => {
  return (
    <HeaderContainer>
      <TopLine>
        <span>SUPPLY CALCULATOR</span>
      </TopLine>
      <NavLine>
        <LogoWrap>
          <Title>MOVERS GROUP</Title>
          <Subtitle>Global Logistics</Subtitle>
        </LogoWrap>
        <Controls>
          {onThemeToggle && (
            <MenuButton onClick={onThemeToggle} aria-label="Р В Р Р‹Р В РЎВР В Р’ВµР В Р вЂ¦Р В РЎвЂР РЋРІР‚С™Р РЋР Р‰ Р РЋРІР‚С™Р В Р’ВµР В РЎВР РЋРЎвЂњ">
              {themeMode === 'swiss-light' ? 'Moon' : 'Light'}
            </MenuButton>
          )}
          {onDirectoryClick && (
            <MenuButton onClick={onDirectoryClick} aria-label="Р В Р Р‹Р В РЎвЂ”Р РЋР вЂљР В Р’В°Р В Р вЂ Р В РЎвЂўР РЋРІР‚РЋР В Р вЂ¦Р В РЎвЂР В РЎвЂќ">
              Docs
            </MenuButton>
          )}
          {onMenuClick && (
            <MenuButton onClick={onMenuClick} aria-label="Р В РІР‚СљР В Р’В»Р В Р’В°Р В Р вЂ Р В Р вЂ¦Р В Р’В°Р РЋР РЏ">
              Home
            </MenuButton>
          )}
        </Controls>
      </NavLine>
    </HeaderContainer>
  );
};

export default Header;
