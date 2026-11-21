import React from 'react';
import { Film, Shield, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="site-footer">
      <div className="footer-content">
        <div className="footer-brand-column">
          <div className="footer-brand">
            <Film size={20} color="var(--accent-primary)" />
            <span>Movie Storm</span>
          </div>
          <p className="footer-tagline">
            High-performance, curated cinema and series catalog with 4K UHD Remux, Dolby Atmos audio, and multi-language subtitles.
          </p>
          <div className="footer-badge">
            <Shield size={14} /> Public P2P Index • Cloud API
          </div>
        </div>

        <div className="footer-links-group">
          <div className="footer-col">
            <h4>Catalog</h4>
            <Link to="/browse?type=movie">Movies</Link>
            <Link to="/browse?type=series">TV Series</Link>
            <Link to="/browse?type=anime">Anime</Link>
            <Link to="/browse?sort=rating">Top Rated</Link>
          </div>

          <div className="footer-col">
            <h4>Community</h4>
            <Link to="/favorites">Saved Favorites</Link>
            <Link to="/support">Help & Support</Link>
            <Link to="/support?tab=request">Request Title</Link>
            <Link to="/support?tab=feedback">Send Feedback</Link>
          </div>

          <div className="footer-col">
            <h4>Technology</h4>
            <a href="https://github.com/themoviestorm/themoviestorm.github.io" target="_blank" rel="noreferrer">
              GitHub Repo
            </a>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Vite + React + TS
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cinema Crimson Engine
            </span>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© {new Date().getFullYear()} Movie Storm. All rights reserved.</span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
          Crafted with <Heart size={14} color="var(--accent-primary)" fill="var(--accent-primary)" style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} /> for cinema lovers
        </span>
      </div>
    </footer>
  );
};
