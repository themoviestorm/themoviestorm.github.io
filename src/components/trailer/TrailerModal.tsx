import React from 'react';
import { X } from 'lucide-react';
import { getYouTubeEmbedUrl } from '../../api/assets';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  trailerUrl?: string;
  trailerType?: string;
  title: string;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  isOpen,
  onClose,
  trailerUrl,
  trailerType,
  title
}) => {
  if (!isOpen) return null;

  const isYouTube = trailerType === 'YOUTUBE' || (trailerUrl && trailerUrl.includes('youtu'));
  const embedUrl = isYouTube ? getYouTubeEmbedUrl(trailerUrl) : null;

  return (
    <div className="trailer-modal-backdrop" onClick={onClose}>
      <div className="trailer-modal-container" onClick={e => e.stopPropagation()}>
        <div className="trailer-modal-header">
          <h3 className="trailer-modal-title">{title} — Official Trailer</h3>
          <button className="trailer-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <div className="trailer-player-box">
          {embedUrl ? (
            <iframe
              src={embedUrl}
              title={`${title} Trailer`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="trailer-iframe"
            />
          ) : trailerUrl ? (
            <video
              src={trailerUrl}
              controls
              autoPlay
              className="trailer-video"
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="no-trailer-box">
              <p>No video trailer stream available for this title.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
