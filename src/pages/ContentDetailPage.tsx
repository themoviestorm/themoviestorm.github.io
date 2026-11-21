import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Star, Play, Heart, Download, MessageSquare,
  Share2, Check
} from 'lucide-react';
import { ContentDetailResponse, Comment } from '../api/types';
import {
  getContentDetail, getComments, postComment,
  flagComment, addFavorite, removeFavorite
} from '../api/client';
import { resolveImageUrl, formatRuntime } from '../api/assets';
import { TorrentList } from '../components/common/TorrentList';
import { TrailerModal } from '../components/trailer/TrailerModal';
import { useAuth } from '../context/AuthContext';

export const ContentDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user, token } = useAuth();

  const [detail, setDetail] = useState<ContentDetailResponse | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shareFeedback, setShareFeedback] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // New Comment Form state
  const [commentBody, setCommentBody] = useState('');
  const [commentRating, setCommentRating] = useState(5);
  const [anonName, setAnonName] = useState('');
  const [anonEmail, setAnonEmail] = useState('');
  const [commentMsg, setCommentMsg] = useState<string | null>(null);
  const [isPostingComment, setIsPostingComment] = useState(false);

  useEffect(() => {
    if (!id) return;
    async function fetchDetail() {
      setIsLoading(true);
      try {
        const [detRes, comRes] = await Promise.all([
          getContentDetail(id!),
          getComments(id!)
        ]);
        setDetail(detRes);
        setComments(comRes.comments);
      } catch {
        // Fallback handled
      } finally {
        setIsLoading(false);
      }
    }
    fetchDetail();
    window.scrollTo(0, 0);
  }, [id]);

  const handleToggleFavorite = async () => {
    if (!id) return;
    const next = !isFavorite;
    setIsFavorite(next);

    if (token) {
      try {
        if (next) {
          await addFavorite(id, token);
        } else {
          await removeFavorite(id, token);
        }
      } catch {
        // Ignore
      }
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareFeedback(true);
    setTimeout(() => setShareFeedback(false), 2000);
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !commentBody.trim()) return;

    setIsPostingComment(true);
    setCommentMsg(null);
    try {
      const newComment = await postComment(
        id,
        {
          body: commentBody.trim(),
          rating: commentRating,
          userName: user ? user.displayName : anonName.trim(),
          userEmail: user ? user.email : anonEmail.trim()
        },
        token
      );
      setComments([newComment, ...comments]);
      setCommentBody('');
      setCommentMsg('Comment posted successfully! Auto-approved.');
    } catch (err: unknown) {
      setCommentMsg(err instanceof Error ? err.message : 'Failed to post comment.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleFlag = async (commentId: string) => {
    try {
      await flagComment(commentId, 'Inappropriate review', token);
      alert('Review reported to moderators.');
    } catch {
      alert('Thank you for flagging.');
    }
  };

  if (isLoading || !detail) {
    return (
      <div className="detail-loading-box">
        <div className="detail-spinner" />
        <p>Loading full cinema detail & verified torrent links...</p>
      </div>
    );
  }

  const { content, episodes, torrents } = detail;
  const isSeries = content.type === 'series';

  // Group episodes by season
  const seasonsMap = episodes.reduce<Record<number, typeof episodes>>((acc, ep) => {
    acc[ep.seasonNumber] = acc[ep.seasonNumber] || [];
    acc[ep.seasonNumber].push(ep);
    return acc;
  }, {});
  const seasonsList = Object.keys(seasonsMap).map(Number).sort((a, b) => a - b);

  return (
    <div className="detail-page-container">
      {/* Immersive Backdrop Banner */}
      <div
        className="detail-backdrop-hero"
        style={{ backgroundImage: `url(${resolveImageUrl(content.backdropUrl, 'backdrop')})` }}
      >
        <div className="backdrop-gradient-cover" />
      </div>

      {/* Main Detail Header Grid */}
      <div className="detail-content-wrap">
        <div className="detail-header-grid">
          {/* Left: 3D Poster */}
          <div className="detail-poster-col">
            <div className="detail-poster-frame">
              <img
                src={resolveImageUrl(content.posterUrl, 'poster')}
                alt={content.title}
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?q=80&w=780&auto=format&fit=crop';
                }}
              />
            </div>
          </div>

          {/* Right: Metadata & Actions */}
          <div className="detail-info-col">
            <div className="detail-breadcrumbs">
              <Link to="/">Home</Link>
              <span>/</span>
              <Link to={`/browse?type=${content.type}`}>{content.type === 'series' ? 'TV Series' : 'Movies'}</Link>
              <span>/</span>
              <span className="current-crumb">{content.title}</span>
            </div>

            <h1 className="detail-title">{content.title}</h1>

            <div className="detail-meta-strip">
              {content.rating && (
                <span className="rating-badge">
                  <Star size={14} fill="#eab308" color="#eab308" />
                  {content.rating.toFixed(1)} / 10
                </span>
              )}
              {content.year && <span>{content.year}</span>}
              {content.runtimeMinutes ? (
                <>
                  <span>•</span>
                  <span>{formatRuntime(content.runtimeMinutes)}</span>
                </>
              ) : null}
              {content.contentRating && (
                <span className="quality-pill">{content.contentRating}</span>
              )}
              {content.originalLanguage && (
                <span className="quality-pill" style={{ textTransform: 'uppercase' }}>
                  {content.originalLanguage}
                </span>
              )}
            </div>

            {/* Tags */}
            {content.tags && content.tags.length > 0 && (
              <div className="detail-tags-row">
                {content.tags.map(t => (
                  <Link key={t} to={`/browse?tags=${encodeURIComponent(t)}`} className="genre-tag-pill">
                    {t}
                  </Link>
                ))}
              </div>
            )}

            {/* Synopsis */}
            <p className="detail-synopsis">
              {content.longDescription || content.description}
            </p>

            {/* Action Buttons */}
            <div className="detail-action-bar">
              <a href="#torrents" className="btn-primary">
                <Download size={18} /> View Torrents ({torrents.length})
              </a>

              {content.trailerUrl && (
                <button onClick={() => setIsTrailerOpen(true)} className="btn-secondary">
                  <Play size={18} /> Watch Trailer
                </button>
              )}

              <button
                onClick={handleToggleFavorite}
                className="btn-secondary btn-icon-only"
                title="Save to Favorites"
              >
                <Heart size={18} fill={isFavorite ? 'var(--accent-primary)' : 'none'} color={isFavorite ? 'var(--accent-primary)' : 'currentColor'} />
              </button>

              <button
                onClick={handleShare}
                className="btn-secondary btn-icon-only"
                title="Copy share link"
              >
                {shareFeedback ? <Check size={18} color="#10b981" /> : <Share2 size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Series Episode Selector (if Series) */}
        {isSeries && seasonsList.length > 0 && (
          <section className="episodes-section">
            <h2 className="section-title">Episodes</h2>
            <div className="season-tabs-row">
              {seasonsList.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSeason(s)}
                  className={`season-tab-btn ${selectedSeason === s ? 'active' : ''}`}
                >
                  Season {s}
                </button>
              ))}
            </div>

            <div className="episodes-grid">
              {(seasonsMap[selectedSeason] || []).map(ep => (
                <div key={ep.id} className="episode-card">
                  <div className="episode-num">EP {ep.episodeNumber}</div>
                  <div className="episode-info">
                    <div className="episode-title">{ep.title}</div>
                    {ep.airDate && <div className="episode-date">Aired: {ep.airDate}</div>}
                    {ep.description && <p className="episode-desc">{ep.description}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Torrent Downloads Section */}
        <section id="torrents" className="detail-torrents-section">
          <TorrentList torrents={torrents} contentTitle={content.title} />
        </section>

        {/* Comments & Community Reviews Section */}
        <section className="detail-reviews-section">
          <div className="section-header">
            <div>
              <h2 className="section-title">
                <MessageSquare size={20} className="title-icon" color="var(--accent-primary)" />
                Community Reviews & Ratings ({comments.length})
              </h2>
              <p className="section-subtitle">
                Share your download feedback, video quality, and audio stream verification
              </p>
            </div>
          </div>

          {/* Post New Comment Box */}
          <form onSubmit={handlePostComment} className="comment-form-box">
            <h4 style={{ fontFamily: 'var(--font-display)', marginBottom: '0.75rem', fontSize: '1rem' }}>
              Leave a Review
            </h4>

            {commentMsg && <div className="auth-error-banner" style={{ marginBottom: '1rem' }}>{commentMsg}</div>}

            {/* Rating Star Picker */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rating:</span>
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setCommentRating(star)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.1rem' }}
                >
                  <Star
                    size={18}
                    fill={star <= commentRating ? '#eab308' : 'none'}
                    color={star <= commentRating ? '#eab308' : 'var(--text-muted)'}
                  />
                </button>
              ))}
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 600, marginLeft: '0.25rem' }}>
                {commentRating} / 5
              </span>
            </div>

            <textarea
              required
              rows={3}
              placeholder="Write your review or torrent verification comment..."
              value={commentBody}
              onChange={e => setCommentBody(e.target.value)}
              className="comment-textarea"
            />

            {!user && (
              <div className="anon-user-row">
                <input
                  type="text"
                  required
                  placeholder="Your Name *"
                  value={anonName}
                  onChange={e => setAnonName(e.target.value)}
                  className="filter-search-input"
                  style={{ flex: 1 }}
                />
                <input
                  type="email"
                  required
                  placeholder="Your Email (private, for anti-spam) *"
                  value={anonEmail}
                  onChange={e => setAnonEmail(e.target.value)}
                  className="filter-search-input"
                  style={{ flex: 1 }}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isPostingComment}
              className="btn-primary"
              style={{ marginTop: '0.75rem' }}
            >
              {isPostingComment ? 'Posting...' : 'Submit Review'}
            </button>
          </form>

          {/* Comments List */}
          <div className="comments-list-wrap">
            {comments.length > 0 ? (
              comments.map(c => (
                <div key={c.id} className="comment-card-item">
                  <div className="comment-card-header">
                    <div>
                      <span className="comment-author">{c.userName || 'Cinema Viewer'}</span>
                      <span className="comment-date">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {c.rating && (
                      <div className="comment-rating-stars">
                        {[...Array(c.rating)].map((_, i) => (
                          <Star key={i} size={13} fill="#eab308" color="#eab308" />
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="comment-body-text">{c.body}</p>
                  <div className="comment-card-footer">
                    <button onClick={() => handleFlag(c.id)} className="btn-flag-comment">
                      Report
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontStyle: 'italic' }}>
                No reviews posted yet. Be the first to share torrent feedback!
              </p>
            )}
          </div>
        </section>
      </div>

      {/* Trailer Modal */}
      <TrailerModal
        isOpen={isTrailerOpen}
        onClose={() => setIsTrailerOpen(false)}
        trailerUrl={content.trailerUrl}
        trailerType={content.trailerType}
        title={content.title}
      />
    </div>
  );
};
