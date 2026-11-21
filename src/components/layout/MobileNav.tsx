import React from 'react';
import { NavLink } from 'react-router-dom';
import { Compass, Search, Heart, MessageSquare, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface MobileNavProps {
  onOpenAuth?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenAuth }) => {
  const { user } = useAuth();

  return (
    <nav className="mobile-bottom-nav">
      <NavLink
        to="/"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Compass size={20} />
        <span>Explore</span>
      </NavLink>

      <NavLink
        to="/browse"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Search size={20} />
        <span>Browse</span>
      </NavLink>

      <NavLink
        to="/favorites"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <Heart size={20} />
        <span>Saved</span>
      </NavLink>

      <NavLink
        to="/support"
        className={({ isActive }) => `mobile-nav-link ${isActive ? 'active' : ''}`}
      >
        <MessageSquare size={20} />
        <span>Support</span>
      </NavLink>

      <button
        onClick={onOpenAuth}
        className="mobile-nav-link"
        style={{ background: 'none', border: 'none', cursor: 'pointer' }}
      >
        <User size={20} />
        <span>{user ? user.displayName.slice(0, 6) : 'Account'}</span>
      </button>
    </nav>
  );
};
