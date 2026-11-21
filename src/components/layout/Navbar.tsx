import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Film, Sun, Moon, Search, User, LogOut, Menu, X,
  Compass, Heart, MessageSquare, SlidersHorizontal, Flame, Sparkles
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { theme, toggleTheme, setIsStudioOpen } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/' && !location.search;
    return location.pathname + location.search === path || location.pathname === path;
  };

  return (
    <header className="navbar-container">
      {/* Primary Top Navbar */}
      <div className="navbar-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Hamburger toggle for mobile/tablet */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="navbar-hamburger-btn"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

          {/* Brand Logo */}
          <Link to="/" className="navbar-brand">
            <div className="brand-icon-box">
              <Film size={20} className="brand-film-icon" />
            </div>
            <div className="brand-text-block">
              <span className="brand-name">Movie Storm</span>
              <span className="brand-tagline">4K TORRENT CATALOG</span>
            </div>
          </Link>
        </div>

        {/* Desktop Primary Navigation Links */}
        <nav className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            <Compass size={15} />
            <span>Explore</span>
          </Link>
          <Link to="/browse?type=movie" className={`nav-link ${location.search.includes('type=movie') ? 'active' : ''}`}>
            <span>Movies</span>
          </Link>
          <Link to="/browse?type=series" className={`nav-link ${location.search.includes('type=series') ? 'active' : ''}`}>
            <span>Series</span>
          </Link>
          <Link to="/browse?sort=rating" className={`nav-link ${location.search.includes('sort=rating') ? 'active' : ''}`}>
            <Flame size={15} />
            <span>Top Rated</span>
          </Link>
          <Link to="/favorites" className={`nav-link ${location.pathname === '/favorites' ? 'active' : ''}`}>
            <Heart size={15} />
            <span>Favorites</span>
          </Link>
          <Link to="/support" className={`nav-link ${location.pathname === '/support' ? 'active' : ''}`}>
            <MessageSquare size={15} />
            <span>Support</span>
          </Link>
        </nav>

        {/* Right Actions: Search + Studio + Theme + Auth */}
        <div className="navbar-actions">
          {/* Search Bar */}
          <form onSubmit={handleSearchSubmit} className="nav-search-form">
            <Search size={15} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search 4K..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </form>

          {/* Design Studio Quick Trigger */}
          <button
            onClick={() => setIsStudioOpen(true)}
            className="navbar-studio-btn"
            title="Open Design & Styling Studio"
          >
            <SlidersHorizontal size={16} />
            <span className="studio-btn-label">Styling</span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          {/* User Profile / Sign In */}
          {user ? (
            <div className="user-profile-menu">
              <span className="user-display-name">
                <User size={14} /> {user.displayName}
              </span>
              <button onClick={logout} className="logout-btn" title="Sign out">
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-signin" title="Sign In">
              <User size={15} className="signin-user-icon" />
              <span className="signin-text">Sign In</span>
            </button>
          )}
        </div>
      </div>

      {/* Secondary Category Sub-Nav Bar (Ensures Continuous Flow & Discovery) */}
      <div className="subnav-container">
        <div className="subnav-content">
          <Link to="/" className={`subnav-pill ${isActive('/') ? 'active' : ''}`}>
            <Sparkles size={13} /> All Featured
          </Link>
          <Link to="/browse?type=movie" className={`subnav-pill ${location.search.includes('type=movie') ? 'active' : ''}`}>
            4K UHD Movies
          </Link>
          <Link to="/browse?type=series" className={`subnav-pill ${location.search.includes('type=series') ? 'active' : ''}`}>
            Complete Series
          </Link>
          <Link to="/browse?tags=Sci-Fi" className={`subnav-pill ${location.search.includes('Sci-Fi') ? 'active' : ''}`}>
            Sci-Fi & Cyberpunk
          </Link>
          <Link to="/browse?tags=Action" className={`subnav-pill ${location.search.includes('Action') ? 'active' : ''}`}>
            Action Blockbusters
          </Link>
          <Link to="/browse?type=anime" className={`subnav-pill ${location.search.includes('type=anime') ? 'active' : ''}`}>
            Anime
          </Link>
          <Link to="/browse?sort=year" className={`subnav-pill ${location.search.includes('sort=year') ? 'active' : ''}`}>
            Latest 2024
          </Link>
          <Link to="/support?tab=request" className="subnav-pill request-pill">
            + Request Title
          </Link>
        </div>
      </div>

      {/* Mobile Dropdown Menu when hamburger is clicked */}
      {isMobileMenuOpen && (
        <div className="mobile-drawer-menu">
          <form onSubmit={handleSearchSubmit} className="mobile-search-form">
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search catalog..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="filter-search-input"
            />
          </form>

          <div className="mobile-menu-links">
            <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-item">
              <Compass size={18} /> Explore Catalog
            </Link>
            <Link to="/browse?type=movie" onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-item">
              <Film size={18} /> Movies (4K UHD & BluRay)
            </Link>
            <Link to="/browse?type=series" onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-item">
              <Film size={18} /> TV Series & Anime
            </Link>
            <Link to="/browse?sort=rating" onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-item">
              <Flame size={18} /> Top Rated Masterpieces
            </Link>
            <Link to="/favorites" onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-item">
              <Heart size={18} /> Saved Favorites
            </Link>
            <Link to="/support" onClick={() => setIsMobileMenuOpen(false)} className="mobile-menu-item">
              <MessageSquare size={18} /> Help, Requests & Support
            </Link>

            <button
              onClick={() => {
                setIsStudioOpen(true);
                setIsMobileMenuOpen(false);
              }}
              className="mobile-menu-item"
              style={{ color: 'var(--accent-primary)', borderTop: '1px solid var(--border-color)', marginTop: '0.5rem', paddingTop: '0.85rem' }}
            >
              <SlidersHorizontal size={18} /> Open Design & Styling Studio
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
