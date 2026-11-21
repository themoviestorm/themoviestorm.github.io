import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles.css';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';

import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SupportPage } from './pages/SupportPage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <div className="app-root">
            {/* Top Navigation */}
            <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

            {/* Dynamic Pages */}
            <main className="main-content">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/browse" element={<BrowsePage />} />
                <Route path="/content/:id" element={<ContentDetailPage />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/support" element={<SupportPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />

            {/* Mobile Thumb Navigation */}
            <MobileNav onOpenAuth={() => setIsAuthModalOpen(true)} />

            {/* Auth Modal */}
            <AuthModal
              isOpen={isAuthModalOpen}
              onClose={() => setIsAuthModalOpen(false)}
            />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
