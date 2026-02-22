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

const DirectoryWagons: React.FC = () => {
  return (
    <div>
      <h2>Железнодорожные вагоны</h2>

      <Section>
        <Title>Крытые вагоны</Title>
        <p>Для штучных и тарно-упаковочных грузов, требующих защиты от атмосферных воздействий.</p>
        <Table>
          <thead><tr><th>Тип</th><th>Грузоподъёмность (т)</th><th>Объём (м³)</th><th>Внутренние размеры (мм)</th></tr></thead>
          <tbody>
            <tr><td>11-066</td><td>66</td><td>86,4</td><td>13800×2760×2790</td></tr>
            <tr><td>11-286</td><td>68</td><td>138</td><td>15720×2770×2800</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Полувагоны</Title>
        <p>Для насыпных грузов (руда, уголь). Без крыши, с люками в полу.</p>
        <Table>
          <thead><tr><th>Внутренние размеры (мм)</th><th>Вес (т)</th><th>Объём (м³)</th><th>Загрузка (т)</th></tr></thead>
          <tbody>
            <tr><td>12120×2880×2730</td><td>23</td><td>73</td><td>69</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Платформы</Title>
        <p>Для длинномерных, тяжеловесных грузов, контейнеров.</p>
        <ul>
          <li>4-осные: грузоподъёмность до 71 т</li>
          <li>8-осные: до 120 т</li>
        </ul>
      </Section>

      <Section>
        <Title>Цистерны</Title>
        <p>Для наливных грузов. Общего назначения (нефтепродукты) и специализированные.</p>
        <ul>
          <li>4-осные: до 60 т</li>
          <li>8-осные: до 120 т</li>
        </ul>
      </Section>

      <Section>
        <Title>Хопперы</Title>
        <p>Для сыпучих грузов с разгрузкой через нижние люки. Зерно, цемент, минеральные удобрения.</p>
      </Section>

      <Section>
        <Title>Думпкары</Title>
        <p>Саморазгружающиеся с опрокидыванием кузова. Для руды, угля.</p>
      </Section>

      <Section>
        <Title>Транспортёры</Title>
        <p>Для сверхнегабаритных и сверхтяжёлых грузов (трансформаторы, реакторы). Грузоподъёмность до 480 т.</p>
      </Section>

      <Section>
        <Title>Автомобилевозы</Title>
        <p>Двухъярусные для легковых автомобилей. Крытые или открытые.</p>
      </Section>
    </div>
  );
};

export default DirectoryWagons;