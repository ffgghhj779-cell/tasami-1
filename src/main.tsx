import { bootstrapAuth } from './core/authBootstrap';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './core/i18n';
import './index.css';

/** Consume Google redirect before React mounts — critical on mobile Safari. */
void bootstrapAuth();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
