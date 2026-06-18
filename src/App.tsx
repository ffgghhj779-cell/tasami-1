import { BrowserRouter, Routes, Route } from 'react-router-dom';
import React, { lazy, Suspense, useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';

// Critical-path pages — loaded eagerly
import LangSelect      from './pages/LangSelect';
import Home            from './pages/Home';
import Login           from './pages/Login';
import ServiceDetails  from './pages/ServiceDetails';
import Confirm         from './pages/Confirm';
import Success         from './pages/Success';
import Contracts       from './pages/Contracts';
import AdminGuard      from './components/AdminGuard';

// Lazy-loaded pages (BookingMap uses Leaflet — code-split on /booking)
const Booking           = lazy(() => import('./pages/Booking'));
const RegisterArtisan   = lazy(() => import('./pages/RegisterArtisan'));
const ArtisanPortfolio  = lazy(() => import('./pages/ArtisanPortfolio'));
const StaticContent     = lazy(() => import('./pages/StaticContent'));
const AdminConsole      = lazy(() => import('./pages/AdminConsole'));

function PageLoader() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-4 border-border border-t-accent animate-spin" />
    </div>
  );
}

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
      <div className="min-h-screen bg-bg-primary text-text-primary mx-auto max-w-md shadow-2xl relative">
        {!isOnline && (
          <div className="bg-danger text-white text-xs font-bold p-2 text-center flex items-center justify-center gap-2 sticky z-50 top-0">
            <WifiOff className="w-4 h-4" />
            وضع عدم الاتصال — يتم الحفظ محلياً
          </div>
        )}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/"               element={<LangSelect />}     />
            <Route path="/home"           element={<Home />}           />
            <Route path="/login"          element={<Login />}          />
            <Route path="/service/:id"    element={<ServiceDetails />} />
            <Route path="/booking"        element={<Booking />}        />
            <Route path="/confirm"        element={<Confirm />}        />
            <Route path="/success"        element={<Success />}        />
            <Route path="/contracts"      element={<Contracts />}      />
            <Route path="/register-artisan" element={<RegisterArtisan />} />
            <Route path="/artisan/:id"    element={<ArtisanPortfolio />} />
            <Route path="/how"            element={<StaticContent />}  />
            <Route path="/terms"          element={<StaticContent />}  />
            <Route path="/privacy"        element={<StaticContent />}  />
            <Route path="/admin" element={<AdminGuard><AdminConsole /></AdminGuard>} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}
