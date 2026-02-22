import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../styles/theme';

const Container = styled.div`
  padding: ${theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
`;

const Nav = styled.nav`
  margin-bottom: ${theme.spacing.xl};
  display: flex;
  flex-wrap: wrap;
  gap: ${theme.spacing.sm};
`;

const NavItem = styled.button<{ active: boolean }>`
  padding: ${theme.spacing.sm} ${theme.spacing.md};
  background: ${props => props.active ? theme.colors.accent : theme.colors.surface};
  color: ${props => props.active ? theme.colors.bg : theme.colors.text};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all 0.2s;
  font-size: ${theme.typography.small};

  &:hover {
    background: ${props => props.active ? theme.colors.accentHover : theme.colors.surfaceLight};
  }
`;

const Content = styled.div`
  background: ${theme.colors.surface};
  backdrop-filter: ${theme.blur};
  border-radius: ${theme.borderRadius.lg};
  padding: ${theme.spacing.xl};
  border: 1px solid ${theme.colors.border};
`;

const Search = styled.input`
  width: 100%;
  padding: ${theme.spacing.md};
  margin-bottom: ${theme.spacing.lg};
  background: ${theme.colors.surfaceLight};
  border: 1px solid ${theme.colors.border};
  border-radius: ${theme.borderRadius.md};
  color: ${theme.colors.text};
  font-size: ${theme.typography.body};
`;

interface Section {
  id: string;
  title: string;
  component: React.ReactNode;
}

interface Props {
  sections: Section[];
}

const Directory: React.FC<Props> = ({ sections }) => {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSections = sections.filter(section =>
    section.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Search
        type="text"
        placeholder="Поиск по разделам..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
      />
      <Nav>
        {filteredSections.map(section => (
          <NavItem
            key={section.id}
            active={activeSection === section.id}
            onClick={() => setActiveSection(section.id)}
          >
            {section.title}
          </NavItem>
        ))}
      </Nav>
      <Content>
        {sections.find(s => s.id === activeSection)?.component}
      </Content>
    </Container>
  );
};

export default Directory;