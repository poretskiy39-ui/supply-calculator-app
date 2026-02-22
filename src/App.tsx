import React, { useState, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import useCalculator from './hooks/useCalculator';
import useTelegram from './hooks/useTelegram';
import type { GeneralSettings } from './types';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProgressBar from './components/Layout/ProgressBar';
import Step1General from './components/Steps/Step1General';
import Step2Products from './components/Steps/Step2Products';
import Step3Logistics from './components/Steps/Step3Logistics';
import Step4Result from './components/Steps/Step4Result';
import Step5Contact from './components/Steps/Step5Contact';
import SuccessMessage from './components/SuccessMessage';
import { PrimaryButton, SecondaryButton } from './components/UI';

const AppContainer = styled.div`
  max-width: 560px;
  width: 100%;
  margin: 0 auto;
  background: ${theme.colors.bg};
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  color: ${theme.colors.text};
`;

const Content = styled.main`
  flex: 1;
  padding-bottom: ${theme.spacing.lg};
`;

const NavWrap = styled.div`
  padding: ${theme.spacing.lg};
  padding-bottom: calc(${theme.spacing.lg} + env(safe-area-inset-bottom, 0));
  display: flex;
  gap: ${theme.spacing.md};
  background: ${theme.colors.bg};
  border-top: 1px solid ${theme.colors.border};
`;

const NavButton = styled(PrimaryButton)`
  flex: 1;
`;
const NavButtonSecondary = styled(SecondaryButton)`
  flex: 1;
`;

function App() {
  const {
    step,
    setStep,
    settings,
    setSettings,
    products,
    addProduct,
    removeProduct,
    updateProduct,
    calculate,
    contact,
    updateContact,
  } = useCalculator();
  const { tg, showAlert, close } = useTelegram();

  const [showSuccess, setShowSuccess] = useState(false); // для сообщения об успехе

  const handleUpdateGeneral = useCallback(
    (newSettings: Partial<GeneralSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  const handleUpdateLogistics = useCallback(
    (newSettings: Partial<GeneralSettings>) => {
      setSettings((prev) => ({ ...prev, ...newSettings }));
    },
    [setSettings]
  );

  const handleNext = () => {
    if (step === 1) {
      if (settings.exchangeRate <= 0) {
        showAlert('Укажите корректный курс валюты');
        return;
      }
    }
    if (step === 2) {
      const hasValidProduct = products.some((p) => p.price > 0 && p.quantity > 0);
      if (!hasValidProduct) {
        showAlert('Добавьте хотя бы один товар с ценой и количеством');
        return;
      }
    }
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleRequestContact = () => {
    setStep(5);
  };

  const handleSubmitContact = async () => {
    const result = calculate();
    if (!result) {
      showAlert('Ошибка расчёта. Проверьте данные.');
      return;
    }
    try {
      // ЗАМЕНИТЕ URL НА АДРЕС ВАШЕГО БЭКЕНДА
      const response = await fetch('https://supply-calculator-app-production.up.railway.app/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings,
          products,
          result,
          contact,
          telegramUser: tg?.initDataUnsafe?.user,
        }),
      });
      if (response.ok) {
        setShowSuccess(true);
        setTimeout(() => {
          close(); // закрываем приложение через 3 секунды после показа сообщения
        }, 3000);
      } else {
        showAlert('Ошибка при отправке. Попробуйте позже.');
      }
    } catch (error) {
      showAlert('Ошибка сети. Проверьте подключение.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return <Step1General settings={settings} onUpdate={handleUpdateGeneral} />;
      case 2:
        return (
          <Step2Products
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onRemove={removeProduct}
          />
        );
      case 3:
        return <Step3Logistics settings={settings} onUpdate={handleUpdateLogistics} />;
      case 4: {
        const result = calculate();
        return result ? (
          <Step4Result
            result={result}
            products={products}
            settings={settings}
            onBack={handleBack}
            onContinue={handleRequestContact}
          />
        ) : (
          <div>Ошибка расчёта</div>
        );
      }
      case 5:
        return (
          <Step5Contact
            contact={contact}
            onUpdate={updateContact}
            onBack={() => setStep(4)}
            onSubmit={handleSubmitContact}
          />
        );
      default:
        return null;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Header />
        <ProgressBar step={step} />
        <Content>{renderStep()}</Content>
        {step < 4 && (
          <NavWrap>
            {step > 1 && (
              <NavButtonSecondary type="button" onClick={handleBack}>
                Назад
              </NavButtonSecondary>
            )}
            <NavButton type="button" onClick={handleNext}>
              {step === 3 ? 'Рассчитать' : 'Далее'}
            </NavButton>
          </NavWrap>
        )}
        <Footer />
        {showSuccess && <SuccessMessage onClose={() => setShowSuccess(false)} />}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;