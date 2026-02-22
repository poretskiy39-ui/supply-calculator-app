import { useState, useEffect } from 'react';
import { ExchangeRates } from '../types';

const useExchangeRates = () => {
  const [rates, setRates] = useState<ExchangeRates | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRates = async () => {
      try {
        const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
        if (!response.ok) throw new Error('Ошибка загрузки');
        const data = await response.json();
        setRates({
          usd: data.Valute.USD.Value,
          eur: data.Valute.EUR.Value,
          cny: data.Valute.CNY.Value,
          date: data.Date,
        });
      } catch {
        setError('Не удалось загрузить курсы валют');
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, []);

  return { rates, loading, error };
};

export default useExchangeRates;