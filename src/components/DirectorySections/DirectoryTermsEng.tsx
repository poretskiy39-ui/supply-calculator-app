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

const DirectoryTermsEng: React.FC = () => {
  const [search, setSearch] = useState('');

  // Словарь терминов (сокращённый, можно дополнить из файла)
  const terms = [
    { term: '3PL', definition: 'Third Party Logistics — логистика третьей стороны, аутсорсинг логистических услуг.' },
    { term: 'AWB', definition: 'Air Waybill — авиагрузовая накладная.' },
    { term: 'BAF', definition: 'Bunker Adjustment Factor — бункерная надбавка к фрахту.' },
    { term: 'B/L', definition: 'Bill of Lading — коносамент.' },
    { term: 'CBM', definition: 'Cubic Meter — кубический метр.' },
    { term: 'CFR', definition: 'Cost and Freight — стоимость и фрахт (Инкотермс).' },
    { term: 'CIF', definition: 'Cost, Insurance and Freight — стоимость, страхование и фрахт.' },
    { term: 'CMR', definition: 'Международная товарно-транспортная накладная (авто).' },
    { term: 'CY', definition: 'Container Yard — контейнерный терминал.' },
    { term: 'DDP', definition: 'Delivered Duty Paid — поставка с уплатой пошлины.' },
    { term: 'DTHC', definition: 'Destination Terminal Handling Charge — терминальный сбор в порту назначения.' },
    { term: 'ETA', definition: 'Estimated Time of Arrival — расчетное время прибытия.' },
    { term: 'ETD', definition: 'Estimated Time of Departure — расчетное время отправления.' },
    { term: 'EXW', definition: 'Ex Works — франко-завод (самовывоз).' },
    { term: 'FCL', definition: 'Full Container Load — полная загрузка контейнера.' },
    { term: 'FEU', definition: 'Forty-foot Equivalent Unit — эквивалент 40-футового контейнера.' },
    { term: 'FOB', definition: 'Free On Board — свободно на борту.' },
    { term: 'GRI', definition: 'General Rate Increase — общее повышение тарифов.' },
    { term: 'HAWB', definition: 'House Air Waybill — внутренняя авианакладная экспедитора.' },
    { term: 'IMO', definition: 'International Maritime Organization — Международная морская организация (обозначение опасных грузов).' },
    { term: 'LCL', definition: 'Less than Container Load — сборный груз.' },
    { term: 'LIFO', definition: 'Liner In / Free Out — погрузка включена, выгрузка — за счёт получателя.' },
    { term: 'MSDS', definition: 'Material Safety Data Sheet — паспорт безопасности вещества.' },
    { term: 'NVOCC', definition: 'Non-Vessel Operating Common Carrier — оператор смешанной перевозки, не владеющий судами.' },
    { term: 'O/F', definition: 'Ocean Freight — морской фрахт.' },
    { term: 'OTHC', definition: 'Origin Terminal Handling Charge — терминальный сбор в порту отправления.' },
    { term: 'POD', definition: 'Port of Discharge — порт выгрузки.' },
    { term: 'POL', definition: 'Port of Loading — порт погрузки.' },
    { term: 'PSS', definition: 'Peak Season Surcharge — надбавка за высокий сезон.' },
    { term: 'SOC', definition: 'Shipper Owned Container — контейнер, принадлежащий грузоотправителю.' },
    { term: 'TEU', definition: 'Twenty-foot Equivalent Unit — эквивалент 20-футового контейнера.' },
    { term: 'THC', definition: 'Terminal Handling Charge — терминальный сбор.' },
    { term: 'TIR', definition: 'Transports Internationaux Routiers — международные дорожные перевозки.' },
    { term: 'WRS', definition: 'War Risk Surcharge — надбавка за военный риск.' },
  ].filter(t => t.term.toLowerCase().includes(search.toLowerCase()) || t.definition.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h2>Термины и сокращения (ENG)</h2>
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

export default DirectoryTermsEng;