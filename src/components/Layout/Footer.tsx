import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const FooterContainer = styled.footer`
  padding: 10px ${theme.spacing.lg} 16px;
  text-align: center;
  background: ${theme.colors.bg};
  border-top: 1px solid ${theme.colors.border};
  color: ${theme.colors.textMuted};
  font-size: 8px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
`;

const Footer: React.FC = () => {
  return <FooterContainer>Supply Calculator | Movers Group</FooterContainer>;
};

export default Footer;
