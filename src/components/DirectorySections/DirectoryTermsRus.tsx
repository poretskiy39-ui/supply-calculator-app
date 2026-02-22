import React, { useState } from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

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

const TermsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
`;

const TermItem = styled.div`
  padding: ${theme.spacing.sm};
  border-bottom: 1px solid ${theme.colors.border};
  
  strong {
    color: ${theme.colors.accent};
  }
`;

const DirectoryTermsRus: React.FC = () => {
  const [search, setSearch] = useState('');

  const terms = [
    { term: 'Аккредитив', definition: 'Форма расчёта, при которой банк обязуется произвести платеж по поручению клиента.' },
    { term: 'Брокер', definition: 'Посредник при заключении сделок (торговых, фрахтовых, страховых).' },
    { term: 'Варрант', definition: 'Складское свидетельство, товарораспорядительный документ.' },
    { term: 'Грузовая накладная', definition: 'Документ, подтверждающий заключение договора перевозки.' },
    { term: 'Грузоотправитель', definition: 'Лицо, сдающее груз к перевозке.' },
    { term: 'Грузополучатель', definition: 'Лицо, уполномоченное принять груз.' },
    { term: 'Декларант', definition: 'Лицо, декларирующее товары при таможенном оформлении.' },
    { term: 'Демередж', definition: 'Плата за простой судна или вагона сверх нормативного времени.' },
    { term: 'Детеншн', definition: 'Штраф за сверхнормативное использование контейнера.' },
    { term: 'Диспашер', definition: 'Эксперт по распределению убытков при общей аварии.' },
    { term: 'ДТ (ГТД)', definition: 'Декларация на товары – основной документ для таможни.' },
    { term: 'Инкотермс', definition: 'Международные правила толкования торговых терминов.' },
    { term: 'Коносамент', definition: 'Товарораспорядительный документ при морской перевозке.' },
    { term: 'Консолидация', definition: 'Объединение нескольких мелких партий в одну.' },
    { term: 'Контейнер', definition: 'Многоборотная тара для перевозки грузов.' },
    { term: 'Негабарит', definition: 'Груз, размеры которого превышают стандартные.' },
    { term: 'Отказное письмо', definition: 'Документ, подтверждающий, что товар не подлежит обязательной сертификации.' },
    { term: 'Паллет', definition: 'Поддон для пакетирования грузов.' },
    { term: 'ПД', definition: 'Платёжное поручение.' },
    { term: 'Претензия', definition: 'Требование о возмещении убытков.' },
    { term: 'Растаможка', definition: 'Таможенная очистка (оформление).' },
    { term: 'СГР', definition: 'Свидетельство о государственной регистрации (для определённых товаров).' },
    { term: 'Сертификат происхождения', definition: 'Документ, подтверждающий страну происхождения товара.' },
    { term: 'ТТН', definition: 'Товарно-транспортная накладная.' },
    { term: 'УПД', definition: 'Универсальный передаточный документ.' },
    { term: 'Фиттинг', definition: 'Угловое крепление контейнера.' },
    { term: 'Фрахт', definition: 'Плата за перевозку.' },
    { term: 'Экспедитор', definition: 'Лицо, организующее перевозку груза.' },
  ].filter(t => t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2>Термины и сокращения (РУС)</h2>
      <Search
        type="text"
        placeholder="Поиск термина..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <TermsList>
        {terms.map((t, i) => (
          <TermItem key={i}>
            <strong>{t.term}</strong> – {t.definition}
          </TermItem>
        ))}
      </TermsList>
    </div>
  );
};

export default DirectoryTermsRus;