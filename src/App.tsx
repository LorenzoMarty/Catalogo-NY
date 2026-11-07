import { BrowserRouter } from 'react-router-dom';
import { domMax, LazyMotion } from 'framer-motion';
import { ConsentBanner } from './components/layout/ConsentBanner';
import { useLenisSmoothScroll } from './hooks/useLenisSmoothScroll';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  useLenisSmoothScroll();

  return (
    <LazyMotion features={domMax}>
      <BrowserRouter>
        <AppRoutes />
        <ConsentBanner />
      </BrowserRouter>
    </LazyMotion>
  );
}
