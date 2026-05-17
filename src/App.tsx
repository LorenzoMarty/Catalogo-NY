import { BrowserRouter } from 'react-router-dom';
import { domAnimation, LazyMotion } from 'framer-motion';
import { useLenisSmoothScroll } from './hooks/useLenisSmoothScroll';
import { AppRoutes } from './routes/AppRoutes';

export function App() {
  useLenisSmoothScroll();

  return (
    <LazyMotion features={domAnimation}>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </LazyMotion>
  );
}
