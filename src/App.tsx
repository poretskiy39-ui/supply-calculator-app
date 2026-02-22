import React, { useState, useCallback } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { theme } from './styles/theme';
import useCalculator from './hooks/useCalculator';
import useTelegram from './hooks/useTelegram';
import type { GeneralSettings } from './types';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import ProgressBar from './components/Layout/ProgressBar';
import Step0Welcome from './components/Steps/Step0Welcome';
import Step1General from './components/Steps/Step1General';
import Step2Products from './components/Steps/Step2Products';
import Step3Logistics from './components/Steps/Step3Logistics';
import Step4Result from './components/Steps/Step4Result';
import Step5Contact from './components/Steps/Step5Contact';
import StepLogisticsCargo from './components/StepLogisticsCargo';
import StepLogisticsResult from './components/StepLogisticsResult';
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
    serviceType,
    setServiceType,
    step,
    setStep,
    settings,
    setSettings,
    products,
    addProduct,
    removeProduct,
    updateProduct,
    contact,
    updateContact,
    logisticsData,
    updateLogisticsData,
    logisticsResult,
    calculateFull,
    calculateLogisticsCost,
  } = useCalculator();
  const { tg, showAlert, close } = useTelegram();

  const [showSuccess, setShowSuccess] = useState(false);

  // Массивы шагов для разных режимов
  const fullSteps = ['Общие', 'Товары', 'Логистика', 'Итог', 'Контакты'];
  const logisticsSteps = ['Груз', 'Расчёт', 'Контакты'];

  const handleUpdateGeneral = useCallback(
    (newSettings: Partial<GeneralSettings>) => setSettings(prev => ({ ...prev, ...newSettings })),
    [setSettings]
  );

  const handleUpdateLogistics = useCallback(
    (newSettings: Partial<GeneralSettings>) => setSettings(prev => ({ ...prev, ...newSettings })),
    [setSettings]
  );

  const handleSelectService = (service: 'full' | 'logistics') => {
    setServiceType(service);
    setStep(1);
  };

  // Возврат в главное меню
  const handleMenuClick = () => {
    setStep(0);
    // При желании можно сбросить данные, но оставим как есть
  };

  const handleNext = () => {
    if (serviceType === 'full') {
      if (step === 1 && settings.exchangeRate <= 0) {
        showAlert('Укажите корректный курс валюты');
        return;
      }
      if (step === 2 && !products.some(p => p.price > 0 && p.quantity > 0)) {
        showAlert('Добавьте хотя бы один товар с ценой и количеством');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => setStep(step - 1);

  const handleCalculateLogistics = () => {
    const result = calculateLogisticsCost();
    if (!result) {
      showAlert('Заполните все обязательные поля');
      return;
    }
    setStep(step + 1);
  };

  const handleSubmitContact = async (type: 'full' | 'logistics') => {
    if (type === 'full') {
      const result = calculateFull();
      if (!result) {
        showAlert('Ошибка расчёта. Проверьте данные.');
        return;
      }
      try {
        const response = await fetch('https://your-backend.up.railway.app/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceType: 'full',
            settings,
            products,
            result,
            contact,
            telegramUser: tg?.initDataUnsafe?.user,
          }),
        });
        if (response.ok) {
          setShowSuccess(true);
          setTimeout(() => close(), 3000);
        } else {
          showAlert('Ошибка при отправке. Попробуйте позже.');
        }
      } catch {
        showAlert('Ошибка сети. Проверьте подключение.');
      }
    } else {
      const result = logisticsResult;
      if (!result) {
        showAlert('Сначала выполните расчёт');
        return;
      }
      try {
        const response = await fetch('https://supply-calculator-app-production.up.railway.app/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            serviceType: 'logistics',
            logisticsData,
            result,
            contact,
            telegramUser: tg?.initDataUnsafe?.user,
          }),
        });
        if (response.ok) {
          setShowSuccess(true);
          setTimeout(() => close(), 3000);
        } else {
          showAlert('Ошибка при отправке. Попробуйте позже.');
        }
      } catch {
        showAlert('Ошибка сети. Проверьте подключение.');
      }
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return <Step0Welcome onSelectService={handleSelectService} />;
    }

    if (serviceType === 'full') {
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
          const result = calculateFull();
          return result ? (
            <Step4Result
              result={result}
              products={products}
              settings={settings}
              onBack={handleBack}
              onContinue={() => setStep(5)}
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
              onSubmit={() => handleSubmitContact('full')}
            />
          );
        default:
          return null;
      }
    } else {
      switch (step) {
        case 1:
          return (
            <StepLogisticsCargo
              data={logisticsData}
              onUpdate={updateLogisticsData}
              onNext={handleCalculateLogistics}
              onBack={() => setStep(0)}
            />
          );
        case 2: {
          const result = logisticsResult;
          return result ? (
            <StepLogisticsResult
              result={result}
              onBack={() => setStep(1)}
              onContinue={() => setStep(3)}
            />
          ) : (
            <div>Ошибка расчёта</div>
          );
        }
        case 3:
          return (
            <Step5Contact
              contact={contact}
              onUpdate={updateContact}
              onBack={() => setStep(2)}
              onSubmit={() => handleSubmitContact('logistics')}
            />
          );
        default:
          return null;
      }
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <AppContainer>
        <Header onMenuClick={handleMenuClick} />
        {step > 0 && (
          <ProgressBar 
            step={step} 
            steps={serviceType === 'full' ? fullSteps : logisticsSteps} 
          />
        )}
        <Content>{renderStep()}</Content>
        {step > 0 && step < 4 && serviceType === 'full' && (
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
        {showSuccess && <SuccessMessage onClose={() => setShowSuccess(false)} />}
        <Footer />
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;

