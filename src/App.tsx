import { BrowserRouter } from 'react-router-dom';
import { domMax, LazyMotion } from 'framer-motion';
import { I18nProvider } from './i18n/I18nProvider';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { useLenisSmoothScroll } from './hooks/useLenisSmoothScroll';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  useLenisSmoothScroll();

  return (
    <LazyMotion features={domMax}>
      <I18nProvider>
        <BrowserRouter>
          <AppRoutes />
          <ConsentBanner />
        </BrowserRouter>
      </I18nProvider>
    </LazyMotion>
  );
}
