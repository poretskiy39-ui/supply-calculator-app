import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (tg) {
      tg.expand();
      tg.setHeaderColor('#0F1A2F');
      tg.setBackgroundColor('#0F1A2F');
      tg.ready();
    }
  }, [tg]);

  const showAlert = (message: string) => {
    if (tg) tg.showAlert(message);
  };

  const sendData = (data: any) => {
    if (tg) tg.sendData(JSON.stringify(data));
  };

  const close = () => {
    if (tg) tg.close();
  };

  return { tg, showAlert, sendData, close };
};

export default useTelegram;