import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Play, Download, Star, Flame, Film, Sparkles, Heart } from 'lucide-react';
import { Content, PlaylistItem } from '../api/types';
import { getPlaylists, searchContent, addFavorite } from '../api/client';
import { resolveImageUrl, formatRuntime } from '../api/assets';
import { MovieCard } from '../components/common/MovieCard';
import { TrailerModal } from '../components/trailer/TrailerModal';
import { useAuth } from '../context/AuthContext';

export const HomePage: React.FC = () => {
  const { token } = useAuth();
  const [heroContent, setHeroContent] = useState<Content | null>(null);
  const [playlists, setPlaylists] = useState<PlaylistItem[]>([]);
  const [trendingList, setTrendingList] = useState<Content[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [favFeedback, setFavFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadCatalog() {
      setIsLoading(true);
      try {
        const [plRes, searchRes] = await Promise.all([
          getPlaylists(),
          searchContent({ sort: 'rating', limit: 8 })
        ]);

        setPlaylists(plRes);
        setTrendingList(searchRes.content);

        // Pick top published item for hero
        if (searchRes.content.length > 0) {
          setHeroContent(searchRes.content[0]);
        }
      } catch {
        // Fallback handled in client
      } finally {
        setIsLoading(false);
      }
    }
    loadCatalog();
  }, []);

  const handleFavoriteHero = async () => {
    if (!heroContent) return;
    if (token) {
      try {
        await addFavorite(heroContent.id, token);
      } catch {
        // Ignore
      }
    }
    setFavFeedback(true);
    setTimeout(() => setFavFeedback(false), 2000);
  };

  const filteredTrending = activeCategory === 'all'
    ? trendingList
    : trendingList.filter(c => c.type === activeCategory);

  return (
    <div className="home-page-container">
      {/* 3D Cinematic Spotlight Hero */}
      {heroContent && (
        <section className="hero-stage">
          <div
            className="hero-backdrop-img"
            style={{ backgroundImage: `url(${resolveImageUrl(heroContent.backdropUrl, 'backdrop')})` }}
          />
          <div className="hero-backdrop-glow" />
          <div className="hero-particle-grid" />

          <div className="hero-info-side">
            <div className="hero-eyebrow">
              <Flame size={14} color="var(--accent-primary)" />
              <span>Spotlight Feature • High-Bitrate P2P</span>
            </div>

            <h1 className="hero-title">{heroContent.title}</h1>

            <div className="hero-meta">
              {heroContent.rating && (
                <span className="rating-badge">
                  <Star size={13} fill="#eab308" color="#eab308" />
                  {heroContent.rating.toFixed(1)}
                </span>
              )}
              {heroContent.year && <span>{heroContent.year}</span>}
              {heroContent.runtimeMinutes && (
                <>
                  <span>•</span>
                  <span>{formatRuntime(heroContent.runtimeMinutes)}</span>
                </>
              )}
              <span className="quality-pill">
                {heroContent.type === 'series' ? 'TV Series' : '4K UHD'}
              </span>
              {heroContent.contentRating && (
                <span className="quality-pill">{heroContent.contentRating}</span>
              )}
            </div>

            <p className="hero-description">
              {heroContent.description || heroContent.longDescription}
            </p>

            <div className="hero-actions">
              <Link to={`/content/${heroContent.id}`} className="btn-primary">
                <Download size={18} /> Download Torrents
              </Link>

              {heroContent.trailerUrl && (
                <button onClick={() => setIsTrailerOpen(true)} className="btn-secondary">
                  <Play size={18} /> Watch Trailer
                </button>
              )}

              <button
                onClick={handleFavoriteHero}
                className="btn-secondary btn-icon-only"
                title="Save to Favorites"
              >
                <Heart size={18} fill={favFeedback ? 'var(--accent-primary)' : 'none'} color={favFeedback ? 'var(--accent-primary)' : 'currentColor'} />
              </button>
            </div>
          </div>

          {/* 3D Poster Canvas */}
          <div className="hero-visual-side">
            <Link to={`/content/${heroContent.id}`} className="hero-3d-poster-stage">
              <div className="hero-3d-card">
                <img
                  src={resolveImageUrl(heroContent.posterUrl, 'poster')}
                  alt={heroContent.title}
                />
                <div className="hero-3d-reflection" />
              </div>
              <div className="floating-spec-badge">
                <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>Dolby Atmos</span>
                <span>Multi-Subs • 4K HEVC</span>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* Category Filter Pills */}
      <section className="category-pills-row">
        {[
          { key: 'all', label: 'All Catalog' },
          { key: 'movie', label: 'Movies' },
          { key: 'series', label: 'TV Series' },
          { key: 'anime', label: 'Anime' }
        ].map(cat => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`category-pill-btn ${activeCategory === cat.key ? 'active' : ''}`}
          >
            {cat.label}
          </button>
        ))}
      </section>

      {/* Featured Trending Shelf */}
      <section className="catalog-shelf-section">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <Sparkles size={22} className="title-icon" color="var(--accent-primary)" />
              Trending & Masterpieces
            </h2>
            <p className="section-subtitle">
              Top seeded torrents with verified audio tracks and multi-language subs
            </p>
          </div>
          <Link to="/browse" className="shelf-view-all">
            Explore All Catalog →
          </Link>
        </div>

        {isLoading ? (
          <div className="catalog-loading-grid">
            {[1, 2, 3, 4].map(n => (
              <div key={n} className="skeleton-card" />
            ))}
          </div>
        ) : (
          <div className="cards-grid">
            {filteredTrending.map(item => (
              <MovieCard key={item.id} content={item} />
            ))}
          </div>
        )}
      </section>

      {/* Curated Playlists Shelves */}
      {playlists.map(pl => (
        <section key={pl.playlist.id} className="catalog-shelf-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <Film size={20} className="title-icon" color="var(--accent-primary)" />
                {pl.playlist.name}
              </h2>
              <p className="section-subtitle">
                Curated selection of verified high-definition releases
              </p>
            </div>
          </div>

          <div className="cards-grid">
            {pl.content.map(item => (
              <MovieCard key={item.id} content={item} />
            ))}
          </div>
        </section>
      ))}

      {/* Trailer Modal */}
      {heroContent && (
        <TrailerModal
          isOpen={isTrailerOpen}
          onClose={() => setIsTrailerOpen(false)}
          trailerUrl={heroContent.trailerUrl}
          trailerType={heroContent.trailerType}
          title={heroContent.title}
        />
      )}
    </div>
  );
};
