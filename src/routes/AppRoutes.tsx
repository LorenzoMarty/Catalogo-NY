import { Navigate, Route, Routes } from 'react-router-dom';
import { ProductPage } from '../pages/ProductPage';
import { HomePage } from '../pages/HomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<HomePage />} path="/" />
      <Route element={<ProductPage />} path="/produto/:slug" />
      <Route element={<Navigate replace to="/" />} path="*" />
    </Routes>
  );
}
