import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import React, { lazy, Suspense, useState, useEffect, memo } from 'react';
import { PageSkeleton } from './components/ui';
import { useDocumentTitle } from './hooks/useDocumentTitle';
import { OfflineBanner } from './components/OfflineBanner';

// Critical-path pages — loaded eagerly
import LangSelect      from './pages/LangSelect';
import Home            from './pages/Home';
import Login           from './pages/Login';
import ServiceDetails  from './pages/ServiceDetails';
import Confirm         from './pages/Confirm';
import Success         from './pages/Success';
import Contracts       from './pages/Contracts';
import Profile         from './pages/Profile';
import AdminGuard      from './components/AdminGuard';
import AuthGuard       from './components/AuthGuard';

// Lazy-loaded pages (BookingMap uses Leaflet — code-split on /booking)
const Booking           = lazy(() => import('./pages/Booking'));
const RegisterArtisan   = lazy(() => import('./pages/RegisterArtisan'));
const ArtisanPortfolio  = lazy(() => import('./pages/ArtisanPortfolio'));
const StaticContent     = lazy(() => import('./pages/StaticContent'));
const AdminConsole      = lazy(() => import('./pages/AdminConsole'));

const AnimatedRoutes = memo(function AnimatedRoutes() {
  const location = useLocation();
  useDocumentTitle();

  return (
    <div key={location.pathname} className="page-enter min-h-full">
      <Suspense fallback={<PageSkeleton />}>
        <Routes location={location}>
          <Route path="/"               element={<LangSelect />}     />
          <Route path="/home"           element={<Home />}           />
          <Route path="/login"          element={<Login />}          />
          <Route path="/profile"        element={<AuthGuard><Profile /></AuthGuard>} />
          <Route path="/service/:id"    element={<AuthGuard><ServiceDetails /></AuthGuard>} />
          <Route path="/booking"        element={<AuthGuard><Booking /></AuthGuard>} />
          <Route path="/confirm"        element={<AuthGuard><Confirm /></AuthGuard>} />
          <Route path="/success"        element={<AuthGuard><Success /></AuthGuard>} />
          <Route path="/contracts"      element={<Contracts />}      />
          <Route path="/register-artisan" element={<AuthGuard><RegisterArtisan /></AuthGuard>} />
          <Route path="/artisan/:id"    element={<ArtisanPortfolio />} />
          <Route path="/how"            element={<StaticContent />}  />
          <Route path="/terms"          element={<StaticContent />}  />
          <Route path="/privacy"        element={<StaticContent />}  />
          <Route path="/admin" element={<AdminGuard><AdminConsole /></AdminGuard>} />
        </Routes>
      </Suspense>
    </div>
  );
});

export default function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline  = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online',  handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online',  handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <BrowserRouter>
      <div className="app-shell app-scroll-root bg-bg-primary text-text-primary mx-auto max-w-md shadow-2xl relative premium-depth">
        {!isOnline && <OfflineBanner />}
        <AnimatedRoutes />
      </div>
    </BrowserRouter>
  );
}
