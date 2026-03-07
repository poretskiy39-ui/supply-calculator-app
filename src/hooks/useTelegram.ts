import { useEffect } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: any;
    };
  }
}

const isVersionAtLeast = (tg: any, version: string): boolean => {
  if (!tg) return false;

  if (typeof tg.isVersionAtLeast === 'function') {
    try {
      return tg.isVersionAtLeast(version);
    } catch {
      return false;
    }
  }

  if (typeof tg.version === 'string') {
    const current = parseFloat(tg.version);
    const required = parseFloat(version);
    return Number.isFinite(current) && Number.isFinite(required) && current >= required;
  }

  return false;
};

const useTelegram = () => {
  const tg = window.Telegram?.WebApp;

  useEffect(() => {
    if (!tg) return;

    tg.expand();
    if (isVersionAtLeast(tg, '6.2')) {
      tg.setHeaderColor('#0F1A2F');
      tg.setBackgroundColor('#0F1A2F');
    }
    tg.ready();
  }, [tg]);

  const showAlert = (message: string) => {
    if (!tg) {
      alert(message);
      return;
    }

    try {
      if (typeof tg.showAlert === 'function' && isVersionAtLeast(tg, '6.2')) {
        tg.showAlert(message);
        return;
      }
      if (typeof tg.showPopup === 'function' && isVersionAtLeast(tg, '6.2')) {
        tg.showPopup({ title: 'Внимание', message });
        return;
      }
      alert(message);
    } catch {
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