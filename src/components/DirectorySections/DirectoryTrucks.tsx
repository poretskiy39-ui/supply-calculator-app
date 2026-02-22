import React from 'react';
import styled from 'styled-components';
import { theme } from '../../styles/theme';

const Section = styled.div`
  margin-bottom: ${theme.spacing.xl};
`;

const Title = styled.h3`
  color: ${theme.colors.accent};
  margin: ${theme.spacing.lg} 0 ${theme.spacing.md};
`;

const Card = styled.div`
  background: ${theme.colors.surfaceLight};
  padding: ${theme.spacing.md};
  border-radius: ${theme.borderRadius.md};
  margin-bottom: ${theme.spacing.md};
  border: 1px solid ${theme.colors.border};
`;

const DirectoryTrucks: React.FC = () => {
  return (
    <div>
      <h2>Автомобильные перевозки</h2>
      
      <Section>
        <Title>Классификация еврофур</Title>
        
        <Card>
          <h4>Тентовые фуры</h4>
          <p>Самые распространённые. Тент из ПВХ или брезента натянут на каркас. Объём 82-96 м³, грузоподъёмность до 20 т.</p>
        </Card>

        <Card>
          <h4>Шторные фуры</h4>
          <p>Имеют сдвижную боковую стенку (штору) и задние ворота. Удобны для боковой загрузки.</p>
        </Card>

        <Card>
          <h4>Бортовые фуры</h4>
          <p>Платформа с откидными бортами. Подходят для стройматериалов и сыпучих грузов.</p>
        </Card>

        <Card>
          <h4>Рефрижераторы</h4>
          <p>Оборудованы холодильной установкой для перевозки продуктов и температурных грузов. Температура от -25°C до +25°C.</p>
        </Card>

        <Card>
          <h4>Изотермические фуры</h4>
          <p>Термоизолированный кузов без активного охлаждения, сохраняет заданную температуру ограниченное время.</p>
        </Card>

        <Card>
          <h4>Самосвалы</h4>
          <p>Для сыпучих грузов (песок, щебень).</p>
        </Card>

        <Card>
          <h4>Тралы</h4>
          <p>Низкорамные платформы для перевозки негабаритной и тяжелой техники (экскаваторы, бульдозеры). Грузоподъёмность до 100 т.</p>
        </Card>

        <Card>
          <h4>Контейнеровозы</h4>
          <p>Для перевозки морских контейнеров. Имеют раздвижную раму.</p>
        </Card>

        <Card>
          <h4>Автоцистерны</h4>
          <p>Для перевозки жидкостей (нефтепродукты, химия, пищевые жидкости).</p>
        </Card>

        <Card>
          <h4>Лесовозы</h4>
          <p>Специализированные фуры с ложементами для перевозки брёвен.</p>
        </Card>

        <Card>
          <h4>Автовозы</h4>
          <p>Двух- или трёхуровневые платформы для легковых автомобилей.</p>
        </Card>
      </Section>

      <Section>
        <Title>Тентовая фура 120 м³ (автопоезд)</Title>
        <ul>
          <li><strong>Объём:</strong> 120 м³</li>
          <li><strong>Грузоподъёмность:</strong> до 20 т</li>
          <li><strong>Паллет:</strong> 40 шт</li>
          <li><strong>Длина:</strong> 8 м × 2</li>
          <li><strong>Ширина:</strong> 2,5 м</li>
          <li><strong>Высота:</strong> 3-3,2 м</li>
          <li><strong>Погрузка:</strong> задняя</li>
        </ul>
      </Section>
    </div>
  );
};

export default DirectoryTrucks;