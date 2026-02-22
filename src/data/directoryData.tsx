import React from 'react';
import DirectoryDocuments from '../components/DirectorySections/DirectoryDocuments';
import DirectoryIncoterms from '../components/DirectorySections/DirectoryIncoterms';
import DirectoryDangerousGoods from '../components/DirectorySections/DirectoryDangerousGoods';
import DirectoryContainers from '../components/DirectorySections/DirectoryContainers';
import DirectoryTrucks from '../components/DirectorySections/DirectoryTrucks';
import DirectoryWagons from '../components/DirectorySections/DirectoryWagons';
import DirectoryTermsEng from '../components/DirectorySections/DirectoryTermsEng';
import DirectoryTermsRus from '../components/DirectorySections/DirectoryTermsRus';

export const directorySections = [
  {
    id: 'incoterms',
    title: 'Условия поставок (Инкотермс)',
    component: <DirectoryIncoterms />,
  },
  {
    id: 'dangerous',
    title: 'Опасные грузы (ДОПОГ)',
    component: <DirectoryDangerousGoods />,
  },
  {
    id: 'containers',
    title: 'Контейнеры',
    component: <DirectoryContainers />,
  },
  {
    id: 'trucks',
    title: 'Автомобильные перевозки',
    component: <DirectoryTrucks />,
  },
  {
    id: 'wagons',
    title: 'Железнодорожные вагоны',
    component: <DirectoryWagons />,
  },
  {
    id: 'termsEng',
    title: 'Термины ENG',
    component: <DirectoryTermsEng />,
  },
  {
    id: 'termsRus',
    title: 'Термины РУС',
    component: <DirectoryTermsRus />,
  },
  {
    id: 'documents',
    title: 'Документы и нетарифка',
    component: <DirectoryDocuments />,
  },
];