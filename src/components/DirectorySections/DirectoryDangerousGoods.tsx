import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: ${theme.spacing.md} 0;

  th, td {
    padding: ${theme.spacing.sm};
    text-align: left;
    border-bottom: 1px solid ${theme.colors.border};
    color: ${theme.colors.text};
  }

  th {
    background: ${theme.colors.surfaceLight};
    color: ${theme.colors.accent};
  }
`;

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h3`
  color: ${theme.colors.accent};
  margin: ${theme.spacing.lg} 0 ${theme.spacing.md};
`;

const DirectoryDangerousGoods: React.FC = () => {
  return (
    <div>
      <h2>Классификация опасных грузов (ДОПОГ/ADR)</h2>
      
      <Section>
        <Title>Класс 1 – Взрывчатые вещества и изделия</Title>
        <Table>
          <thead><tr><th>Категория</th><th>Описание</th></tr></thead>
          <tbody>
            <tr><td>1.1</td><td>Вещества и изделия с опасностью взрыва массой</td></tr>
            <tr><td>1.2</td><td>Опасность разбрасывания, но не взрыв массой</td></tr>
            <tr><td>1.3</td><td>Опасность загорания, незначительная опасность взрыва или разбрасывания</td></tr>
            <tr><td>1.4</td><td>Незначительная опасность</td></tr>
            <tr><td>1.5</td><td>Вещества очень низкой чувствительности с опасностью взрыва массой</td></tr>
            <tr><td>1.6</td><td>Изделия чрезвычайно низкой чувствительности</td></tr>
          </tbody>
        </Table>
        <p><em>Примеры: патроны, фейерверки, безопасные взрыватели.</em></p>
      </Section>

      <Section>
        <Title>Класс 2 – Газы</Title>
        <Table>
          <thead><tr><th>Категория</th><th>Описание</th></tr></thead>
          <tbody>
            <tr><td>2.1</td><td>Легковоспламеняющиеся газы (RFG) – зажигалки, пропан</td></tr>
            <tr><td>2.2</td><td>Невоспламеняющиеся нетоксичные газы (RNG) – углекислый газ, кислород</td></tr>
            <tr><td>2.3</td><td>Токсичные газы (RPG)</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Класс 3 – Легковоспламеняющиеся жидкости (RFL)</Title>
        <p>Краски, лаки, растворители, бензин, спирты.</p>
      </Section>

      <Section>
        <Title>Класс 4 – Легковоспламеняющиеся твердые вещества</Title>
        <Table>
          <thead><tr><th>Категория</th><th>Описание</th></tr></thead>
          <tbody>
            <tr><td>4.1</td><td>Легковоспламеняющиеся твердые вещества (RFS) – сера</td></tr>
            <tr><td>4.2</td><td>Самовозгорающиеся вещества (RSC) – белый/желтый фосфор</td></tr>
            <tr><td>4.3</td><td>Вещества, выделяющие легковоспламеняющиеся газы при контакте с водой (RFW) – литий</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Класс 5 – Окисляющие вещества и органические перекиси</Title>
        <Table>
          <thead><tr><th>Категория</th><th>Описание</th></tr></thead>
          <tbody>
            <tr><td>5.1</td><td>Окисляющие вещества (ROX)</td></tr>
            <tr><td>5.2</td><td>Органические перекиси (ROP)</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Класс 6 – Токсичные и инфекционные вещества</Title>
        <Table>
          <thead><tr><th>Категория</th><th>Описание</th></tr></thead>
          <tbody>
            <tr><td>6.1</td><td>Токсичные вещества (RPB) – мышьяк, цианиды</td></tr>
            <tr><td>6.2</td><td>Инфекционные вещества (RIS) – бактерии, вирусы</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Класс 7 – Радиоактивные материалы</Title>
        <p>Категории: I-Белая (RRW), II-Желтая (RRY), III-Желтая (RRY). Примеры: кобальт, йод, цезий.</p>
      </Section>

      <Section>
        <Title>Класс 8 – Коррозионные вещества (RCM)</Title>
        <p>Кислоты, ртуть, серная кислота.</p>
      </Section>

      <Section>
        <Title>Класс 9 – Прочие опасные вещества и изделия (RMD)</Title>
        <p>Сухой лёд, намагниченные материалы, полимерная смола.</p>
      </Section>
    </div>
  );
};

export default DirectoryDangerousGoods;