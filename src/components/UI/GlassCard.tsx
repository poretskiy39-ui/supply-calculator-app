import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: keyof typeof theme.spacing;
  glow?: boolean;
}

const StyledGlassCard = styled.div<{ padding: keyof typeof theme.spacing; glow?: boolean }>`
  background: rgba(26, 31, 38, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 32px;
  padding: ${({ padding }) => theme.spacing[padding]};
  border: 1px solid rgba(255, 255, 255, 0.05);
  position: relative;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 32px;
    padding: 1px;
    background: linear-gradient(145deg, 
      rgba(160, 170, 180, 0.8), 
      rgba(200, 180, 150, 0.6), 
      rgba(160, 170, 180, 0.8)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 32px;
    background: radial-gradient(circle at 30% 30%, rgba(230, 200, 150, 0.2), transparent 70%);
    opacity: ${({ glow }) => (glow ? 0.5 : 0)};
    transition: opacity 0.3s;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 30px 60px rgba(0, 0, 0, 0.5);
    &::after {
      opacity: 0.3;
    }
  }
`;

export const GlassCard: React.FC<GlassCardProps> = ({ children, padding = 'lg', glow, ...rest }) => {
  return (
    <StyledGlassCard padding={padding} glow={glow} {...rest}>
      {children}
    </StyledGlassCard>
  );
};