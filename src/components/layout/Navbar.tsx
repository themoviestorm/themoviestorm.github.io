import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Sun, Moon, Search, User, LogOut } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="navbar-container">
      <div className="navbar-content">
        {/* Brand Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-icon-box">
            <Film size={22} className="brand-film-icon" />
          </div>
          <span className="brand-name">Movie Storm</span>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="navbar-links">
          <Link to="/" className={`nav-link ${isActive('/') ? 'active' : ''}`}>
            Explore
          </Link>
          <Link to="/browse?type=movie" className={`nav-link ${location.search.includes('type=movie') ? 'active' : ''}`}>
            Movies
          </Link>
          <Link to="/browse?type=series" className={`nav-link ${location.search.includes('type=series') ? 'active' : ''}`}>
            Series
          </Link>
          <Link to="/favorites" className={`nav-link ${isActive('/favorites') ? 'active' : ''}`}>
            Favorites
          </Link>
          <Link to="/support" className={`nav-link ${isActive('/support') ? 'active' : ''}`}>
            Support
          </Link>
        </nav>

        {/* Search Bar & Utility Controls */}
        <div className="navbar-actions">
          <form onSubmit={handleSearchSubmit} className="nav-search-form">
            <Search size={16} className="nav-search-icon" />
            <input
              type="text"
              placeholder="Search 4K movies, anime, series..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="nav-search-input"
            />
          </form>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="theme-toggle-btn"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User Profile / Sign in */}
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
            <button
              onClick={onOpenAuth}
              className="btn-signin"
            >
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
