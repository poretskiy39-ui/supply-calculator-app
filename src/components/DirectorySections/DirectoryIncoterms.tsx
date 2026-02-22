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

const DirectoryIncoterms: React.FC = () => {
  return (
    <div>
      <h2>Условия поставок (Инкотермс)</h2>
      
      <Section>
        <Title>Группы условий</Title>
        <p>Условия делятся на группы E, F, C, D по нарастанию обязанностей продавца.</p>
        <ul>
          <li><strong>Группа E</strong> — самовывоз со склада поставщика (EXW).</li>
          <li><strong>Группа F</strong> — поставщик проходит таможню в своей стране, основная перевозка не оплачена (FCA, FAS, FOB).</li>
          <li><strong>Группа C</strong> — основная перевозка оплачена продавцом, но риск переходит после передачи перевозчику (CFR, CIF, CPT, CIP).</li>
          <li><strong>Группа D</strong> — продавец доставляет товар в указанное место, несёт все риски и расходы (DAP, DPU, DDP).</li>
        </ul>
      </Section>

      <Section>
        <Title>Таблица базисов поставки</Title>
        <Table>
          <thead>
            <tr><th>Термин</th><th>Обязанности продавца</th><th>Обязанности покупателя</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>EXW</strong> (Ex Works)</td><td>Передать товар на своём складе</td><td>Забрать, погрузить, экспортная/импортная очистка, доставка</td></tr>
            <tr><td><strong>FCA</strong> (Free Carrier)</td><td>Передать товар перевозчику, экспортная очистка</td><td>Основная перевозка, импортная очистка</td></tr>
            <tr><td><strong>FAS</strong> (Free Alongside Ship)</td><td>Разместить товар вдоль борта судна, экспортная очистка</td><td>Основная перевозка, импортная очистка</td></tr>
            <tr><td><strong>FOB</strong> (Free On Board)</td><td>Погрузить товар на судно, экспортная очистка</td><td>Основная перевозка, импортная очистка</td></tr>
            <tr><td><strong>CFR</strong> (Cost and Freight)</td><td>Оплатить фрахт до порта назначения, экспортная очистка</td><td>Импортная очистка, риски с момента погрузки</td></tr>
            <tr><td><strong>CIF</strong> (Cost, Insurance and Freight)</td><td>То же, что CFR + страхование</td><td>Импортная очистка</td></tr>
            <tr><td><strong>CPT</strong> (Carriage Paid To)</td><td>Оплатить перевозку до места назначения, экспортная очистка</td><td>Импортная очистка, риски после передачи перевозчику</td></tr>
            <tr><td><strong>CIP</strong> (Carriage and Insurance Paid To)</td><td>То же, что CPT + страхование</td><td>Импортная очистка</td></tr>
            <tr><td><strong>DAP</strong> (Delivered At Place)</td><td>Доставка до указанного места, экспортная очистка</td><td>Импортная очистка, разгрузка</td></tr>
            <tr><td><strong>DPU</strong> (Delivered at Place Unloaded)</td><td>Доставка и выгрузка в указанном месте, экспортная очистка</td><td>Импортная очистка</td></tr>
            <tr><td><strong>DDP</strong> (Delivered Duty Paid)</td><td>Доставка с оплатой всех пошлин (импортная очистка включена)</td><td>Разгрузка</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Морские условия (FILO, LIFO, LILO, FIFO)</Title>
        <p><strong>LILO (Liner In/Liner Out):</strong> Погрузка и выгрузка включены в стоимость фрахта.</p>
        <p><strong>LIFO (Liner In/Free Out):</strong> Погрузка включена, выгрузка — за счёт получателя.</p>
        <p><strong>FILO (Free In/Liner Out):</strong> Погрузка за счёт отправителя, выгрузка включена.</p>
        <p><strong>FIFO (Free In/Free Out):</strong> Ни погрузка, ни выгрузка не включены.</p>
      </Section>
    </div>
  );
};

export default DirectoryIncoterms;