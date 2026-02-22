import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin: ${theme.spacing.md} 0;
  font-size: 0.9rem;

  th, td {
    padding: ${theme.spacing.xs} ${theme.spacing.sm};
    text-align: center;
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

const DirectoryContainers: React.FC = () => {
  return (
    <div>
      <h2>Контейнеры</h2>
      
      <Section>
        <Title>Типы и размеры</Title>
        <Table>
          <thead>
            <tr>
              <th>Тип</th>
              <th>Внешние размеры (м)</th>
              <th>Внутренние размеры (м)</th>
              <th>Вес (т)</th>
              <th>Грузоподъемность (т)</th>
              <th>Объём (м³)</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>20ft DC</td><td>6,058×2,438×2,591</td><td>5,898×2,350×2,390</td><td>2,1</td><td>21,9</td><td>33</td></tr>
            <tr><td>20ft HC</td><td>6,058×2,438×2,896</td><td>5,898×2,350×2,693</td><td>2,3</td><td>21,7</td><td>37</td></tr>
            <tr><td>40ft DC</td><td>12,192×2,438×2,591</td><td>12,093×2,330×2,372</td><td>3,6</td><td>24,4</td><td>67</td></tr>
            <tr><td>40ft HC</td><td>12,192×2,438×2,896</td><td>12,093×2,350×2,693</td><td>3,7</td><td>28,3</td><td>76</td></tr>
            <tr><td>45ft PW</td><td>13,716×2,500×2,750</td><td>13,513×2,444×2,549</td><td>4,1</td><td>29,9</td><td>85</td></tr>
            <tr><td>45ft HCPW</td><td>13,716×2,500×2,896</td><td>13,513×2,444×2,670</td><td>4,3</td><td>30,7</td><td>89</td></tr>
            <tr><td>3 тонны</td><td>2,100×1,325×2,400</td><td>1,930×1,225×2,090</td><td>0,6</td><td>2,4</td><td>4,9</td></tr>
            <tr><td>5 тонн</td><td>2,650×2,100×2,400</td><td>2,520×2,000×2,150</td><td>1,2</td><td>3,8</td><td>10,4</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Вместимость по паллетам</Title>
        <Table>
          <thead>
            <tr><th>Тип контейнера</th><th>Европаллеты (800×1200)</th><th>Стандартные (1000×1200)</th><th>Азия-паллеты (1100×1100)</th></tr>
          </thead>
          <tbody>
            <tr><td>20ft</td><td>11</td><td>10</td><td>10</td></tr>
            <tr><td>40ft</td><td>24</td><td>21</td><td>22</td></tr>
            <tr><td>40 PW</td><td>30</td><td>24</td><td>24</td></tr>
            <tr><td>45ft</td><td>27</td><td>24</td><td>26</td></tr>
            <tr><td>45 PW</td><td>33</td><td>26</td><td>26</td></tr>
          </tbody>
        </Table>
      </Section>

      <Section>
        <Title>Типы контейнеров (описание)</Title>
        <ul>
          <li><strong>20DC / 40DC</strong> – сухогрузные, стандартные.</li>
          <li><strong>20HC / 40HC</strong> – высокие (High Cube).</li>
          <li><strong>Open Top</strong> – с открытым верхом для негабаритов.</li>
          <li><strong>Flat Rack</strong> – платформа для тяжелых и негабаритных грузов.</li>
          <li><strong>Reefer</strong> – рефрижератор для скоропортящихся грузов.</li>
          <li><strong>Tank Container</strong> – цистерна для жидких грузов.</li>
          <li><strong>Bulk Container</strong> – для сыпучих грузов.</li>
          <li><strong>Ventilated Container</strong> – вентилируемый.</li>
          <li><strong>Pallet Wide</strong> – широкий для удобной укладки паллет.</li>
        </ul>
      </Section>
    </div>
  );
};

export default DirectoryContainers;