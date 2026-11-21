import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Film } from 'lucide-react';
import { Content } from '../../api/types';
import { resolveImageUrl, formatRuntime } from '../../api/assets';

interface MovieCardProps {
  content: Content;
}

export const MovieCard: React.FC<MovieCardProps> = ({ content }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Subtle 3D tilt angles
    const rotX = -((y - centerY) / centerY) * 10;
    const rotY = ((x - centerX) / centerX) * 10;

    setRotateX(rotX);
    setRotateY(rotY);
  };

  const handleMouseEnter = () => setIsHovered(true);

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotateX(0);
    setRotateY(0);
  };

  const posterSrc = resolveImageUrl(content.posterUrl, 'poster');

  return (
    <div className="card-3d-wrapper" ref={cardRef}>
      <Link
        to={`/content/${content.id}`}
        className="card-3d-inner"
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: isHovered
            ? `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-6px) scale(1.02)`
            : 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)'
        }}
      >
        <div className="card-poster-frame">
          <img
            src={posterSrc}
            alt={content.title}
            loading="lazy"
            onError={(e) => {
              // Fallback to placeholder if image link fails
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop';
            }}
          />
          <div className="card-poster-overlay">
            <div className="card-badges-row">
              <span className="card-badge-pill type-pill">
                {content.type === 'series' ? 'Series' : 'Movie'}
              </span>
              {content.rating && (
                <span className="card-badge-pill rating-pill">
                  <Star size={11} fill="#eab308" color="#eab308" />
                  {content.rating.toFixed(1)}
                </span>
              )}
            </div>
            {content.contentRating && (
              <div style={{ alignSelf: 'flex-start' }}>
                <span className="content-rating-badge">{content.contentRating}</span>
              </div>
            )}
          </div>
        </div>

        <div className="card-details">
          <h3 className="card-title" title={content.title}>
            {content.title}
          </h3>
          <div className="card-sub">
            <span>{content.year || '2024'}</span>
            {content.runtimeMinutes ? (
              <span>• {formatRuntime(content.runtimeMinutes)}</span>
            ) : null}
            {content.tags && content.tags.length > 0 && (
              <span className="card-genre-tag">{content.tags[0]}</span>
            )}
          </div>

          <div className="card-tech-strip">
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <Film size={12} color="var(--accent-primary)" />
              <span>{content.originalLanguage?.toUpperCase() || 'EN'}</span>
            </span>
            <span className="card-cta-hint">View Torrents →</span>
          </div>
        </div>
      </Link>
    </div>
  );
};
