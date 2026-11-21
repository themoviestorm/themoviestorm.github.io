import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './styles.css';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { MobileNav } from './components/layout/MobileNav';
import { Footer } from './components/layout/Footer';
import { AuthModal } from './components/auth/AuthModal';
import { DesignStudioDrawer } from './components/common/DesignStudioDrawer';

import { HomePage } from './pages/HomePage';
import { BrowsePage } from './pages/BrowsePage';
import { ContentDetailPage } from './pages/ContentDetailPage';
import { FavoritesPage } from './pages/FavoritesPage';
import { SupportPage } from './pages/SupportPage';
import { NotFoundPage } from './pages/NotFoundPage';

function AppContent() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { previewMode } = useTheme();

  return (
    <BrowserRouter>
      {previewMode === 'phone-frame' ? (
        /* Phone Simulation Canvas for Desktop */
        <div className="phone-simulator-wrapper">
          <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-primary)', fontWeight: 700 }}>
              • SMARTPHONE SIMULATION PREVIEW (380x780) •
            </span>
          </div>
          <div className="phone-mockup-frame">
            <div className="phone-mockup-notch" />
            <div className="phone-mockup-scroll">
              <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />
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
              <Footer />
            </div>
            <MobileNav onOpenAuth={() => setIsAuthModalOpen(true)} />
          </div>

          {/* Design Studio Drawer */}
          <DesignStudioDrawer />

          {/* Auth Modal */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      ) : (
        /* Standard Full-Screen Responsive App */
        <div className="app-root">
          {/* Top Primary Navigation & Sub-Navigation */}
          <Navbar onOpenAuth={() => setIsAuthModalOpen(true)} />

          {/* Dynamic Content Views */}
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

          {/* Mobile Bottom Navigation Bar */}
          <MobileNav onOpenAuth={() => setIsAuthModalOpen(true)} />

          {/* Floating Design Studio Customization Drawer */}
          <DesignStudioDrawer />

          {/* Auth Modal */}
          <AuthModal
            isOpen={isAuthModalOpen}
            onClose={() => setIsAuthModalOpen(false)}
          />
        </div>
      )}
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
