import React from 'react';
import { Film, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="notfound-page-container">
      <div className="notfound-box">
        <div className="notfound-badge">404</div>
        <Film size={48} color="var(--accent-primary)" style={{ margin: '1rem auto' }} />
        <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Title Not Found
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '420px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
          The movie, series, or page you were looking for doesn't exist or has been deprecated.
        </p>
        <Link to="/" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
          <ArrowLeft size={16} /> Return to Explore
        </Link>
      </div>
    </div>
  );
};
