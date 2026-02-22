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
      // Проверяем версию для цветов (поддерживается с 6.2)
      if (tg.version && parseFloat(tg.version) >= 6.2) {
        tg.setHeaderColor('#0F1A2F');
        tg.setBackgroundColor('#0F1A2F');
      }
      tg.ready();
    }
  }, [tg]);

  const showAlert = (message: string) => {
    if (tg) {
      // showAlert доступен с версии 6.2, если нет – используем showPopup или fallback
      if (tg.showAlert) {
        tg.showAlert(message);
      } else if (tg.showPopup) {
        tg.showPopup({ title: 'Внимание', message });
      } else {
        alert(message);
      }
    } else {
      alert(message);
    }
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