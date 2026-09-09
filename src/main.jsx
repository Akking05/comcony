import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';
import { LanguageProvider } from './lib/i18n.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Снаружи App: ошибка в любой странице должна упереться в экран
        с объяснением, а не превратить сайт в пустой белый лист. */}
    <ErrorBoundary>
      {/* Провайдер внутри границы ошибок, а не снаружи: если он сам упадёт,
          экран с объяснением должен остаться. Свой язык он берёт напрямую
          из localStorage — контекст туда уже не дотянется. */}
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </ErrorBoundary>
  </StrictMode>,
);
