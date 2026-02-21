import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const FooterContainer = styled.footer`
  padding: ${theme.spacing.lg} ${theme.spacing.lg};
  text-align: center;
  background: ${theme.colors.surface};
  border-top: 1px solid ${theme.colors.border};
  color: ${theme.colors.textMuted};
  font-size: ${theme.typography.small};
`;

const Footer: React.FC = () => {
  return (
    <FooterContainer>
      © 2026 Supply Master · Для профессионалов импорта
    </FooterContainer>
  );
};

export default Footer;