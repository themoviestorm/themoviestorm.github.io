import React, { useEffect, useState } from 'react';
import { Heart, Film, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Content } from '../api/types';
import { getFavorites } from '../api/client';
import { MovieCard } from '../components/common/MovieCard';
import { useAuth } from '../context/AuthContext';

export const FavoritesPage: React.FC = () => {
  const { token, user } = useAuth();
  const [favorites, setFavorites] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadFavs() {
      setIsLoading(true);
      try {
        if (token) {
          const list = await getFavorites(token);
          setFavorites(list);
        } else {
          // If not logged in, show sample or empty state
          setFavorites([]);
        }
      } catch {
        setFavorites([]);
      } finally {
        setIsLoading(false);
      }
    }
    loadFavs();
  }, [token]);

  return (
    <div className="favorites-page-container">
      <div className="section-header">
        <div>
          <h1 className="browse-main-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Heart size={28} color="var(--accent-primary)" fill="var(--accent-primary)" />
            Saved Favorites
          </h1>
          <p className="browse-main-sub">
            {user
              ? `Personal collection saved for ${user.displayName}`
              : 'Sign in to sync your favorite torrent titles across all your devices'}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="catalog-loading-grid">
          {[1, 2, 3].map(n => (
            <div key={n} className="skeleton-card" />
          ))}
        </div>
      ) : favorites.length > 0 ? (
        <div className="cards-grid">
          {favorites.map(item => (
            <MovieCard key={item.id} content={item} />
          ))}
        </div>
      ) : (
        <div className="empty-favorites-box">
          <Film size={48} color="var(--text-muted)" />
          <h3>Your favorites list is empty</h3>
          <p>
            Browse published 4K UHD movies and series, and click the heart icon on any title to save it here.
          </p>
          <Link to="/browse" className="btn-primary" style={{ marginTop: '1.25rem' }}>
            Explore Catalog <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  );
};
