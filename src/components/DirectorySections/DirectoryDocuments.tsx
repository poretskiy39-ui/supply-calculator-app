// src/components/DirectorySections/DirectoryDocuments.tsx
import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: ${theme.spacing.md};

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

const List = styled.ul`
  list-style-type: disc;
  padding-left: ${theme.spacing.xl};
  color: ${theme.colors.text};
  li {
    margin-bottom: ${theme.spacing.xs};
  }
`;

const DirectoryDocuments: React.FC = () => {
  return (
    <div>
      <h2>Документы и нетарифное регулирование</h2>
      <p>Перечень документов для прохождения таможенного оформления (ТО):</p>
      <List>
        <li>Техническое описание груза (от производителя) на русском языке</li>
        <li>Фотографии груза (если есть)</li>
        <li>Контракт со всеми приложениями, дополнениями и спецификациями</li>
        <li>УНК/ВБК (Паспорт сделки)</li>
        <li>Инвойс</li>
        <li>Упаковочный лист</li>
        <li>Транспортные документы (CMR, коносамент и т.д.)</li>
        <li>Информация о наличии денежных средств на ЕЛС для выпуска ДТ</li>
        <li>Сертификаты или декларации соответствия (если требуются)</li>
        <li>Страховой полис (если предусмотрено) и счет за страховку, либо письмо о нестраховании</li>
        <li>Счет за транспорт и транспортный договор (если предусмотрено) + оплата</li>
        <li>Оплата за границу (выписка банка и п/п)</li>
        <li>Сертификат происхождения (если есть)</li>
      </List>

      <h3>Сроки и стоимость оформления документов (ориентир)</h3>
      <Table>
        <thead>
          <tr><th>Документ</th><th>Кто делает</th><th>Срок (дней)</th><th>Срок действия</th><th>Стоимость (₽)</th></tr>
        </thead>
        <tbody>
          <tr><td>СС ГОСТ Р</td><td>Аккр. орган</td><td>от 10</td><td>3 года (серия) / бессрочно (партия)</td><td>6 000</td></tr>
          <tr><td>СС ТР ТС</td><td>Аккр. орган</td><td>от 10</td><td>1-3 года</td><td>10 000</td></tr>
          <tr><td>ДС ТР ТС</td><td>Аккр. орган</td><td>5</td><td>1-5 лет</td><td>10 000</td></tr>
          <tr><td>СГР</td><td>Роспотребнадзор</td><td>21</td><td>5 лет</td><td>30 000</td></tr>
          <tr><td>Отказное письмо</td><td>Аккр. орган</td><td>1-2</td><td>бессрочно</td><td>5 000</td></tr>
          <tr><td>Фитосанитарный сертификат</td><td>Органы по карантину</td><td>1</td><td>1 месяц</td><td>бесплатно / от 20 000</td></tr>
          {/* ... остальные строки из таблицы в файле */}
        </tbody>
      </Table>

      <h3>Термины и сокращения (ENG)</h3>
      <p>Здесь можно вывести алфавитный указатель, но для краткости разместим поиск и список. Лучше сделать отдельный раздел.</p>
    </div>
  );
};

export default DirectoryDocuments;