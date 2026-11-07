import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { startAnalytics } from './services/analytics';
import { getConsent } from './services/consent';
import { initErrorReporting } from './services/errorReporting';
import './assets/css/fonts.css';
import './styles.css';

void initErrorReporting();
// Analytics only for visitors who already accepted; new ones are asked by ConsentBanner.
if (getConsent() === 'granted') startAnalytics();

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
