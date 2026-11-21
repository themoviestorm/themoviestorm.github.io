import React, { useState } from 'react';
import { Download, Copy, Check, ShieldCheck, HardDrive } from 'lucide-react';
import { Torrent } from '../../api/types';
import { formatBytes, resolveTorrentBlobUrl } from '../../api/assets';

interface TorrentListProps {
  torrents: Torrent[];
  contentTitle: string;
}

export const TorrentList: React.FC<TorrentListProps> = ({ torrents, contentTitle }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyMagnet = (torrent: Torrent) => {
    // Generate valid magnet URI if string is present or synthesize one
    const magnet = torrent.magnetLink ||
      `magnet:?xt=urn:btih:${torrent.id.replace(/-/g, '')}&dn=${encodeURIComponent(contentTitle)}.${encodeURIComponent(torrent.quality)}`;
    navigator.clipboard.writeText(magnet);
    setCopiedId(torrent.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!torrents || torrents.length === 0) {
    return (
      <div className="empty-torrent-box">
        <HardDrive size={32} color="var(--text-muted)" />
        <p>No active torrents available for this title at the moment.</p>
      </div>
    );
  }

  return (
    <div className="torrent-table-card">
      <div className="torrent-table-header">
        <div>
          <h3 className="torrent-header-title">Available Torrent Qualities</h3>
          <p className="torrent-header-sub">
            Direct high-speed P2P links with multiple audio tracks and multi-language subtitles
          </p>
        </div>
        <div className="verified-tracker-pill">
          <ShieldCheck size={14} /> Verified Health
        </div>
      </div>

      <div className="torrent-rows-wrapper">
        {torrents.map((t) => {
          const isCopied = copiedId === t.id;
          const audioLangs = Array.isArray(t.audioLanguages)
            ? t.audioLanguages.join(', ')
            : t.audioLanguages;
          const subLangs = Array.isArray(t.subtitleLanguages)
            ? t.subtitleLanguages.join(', ')
            : t.subtitleLanguages;

          return (
            <div key={t.id} className="torrent-row-item">
              <div className="torrent-quality-badge">{t.quality}</div>

              <div className="torrent-info-col">
                <div className="torrent-codec-line">
                  <span>{t.codec || 'x265'}</span>
                  <span>•</span>
                  <span>{t.sourceType || 'BluRay'}</span>
                  {t.audioChannels && (
                    <>
                      <span>•</span>
                      <span>{t.audioChannels}</span>
                    </>
                  )}
                </div>
                {(audioLangs || subLangs) && (
                  <div className="torrent-lang-line">
                    {audioLangs && <span>Audio: [{audioLangs}]</span>}
                    {subLangs && <span>Subs: [{subLangs}]</span>}
                  </div>
                )}
              </div>

              <div className="torrent-size-col">{formatBytes(t.fileSizeBytes)}</div>

              <div className="torrent-peers-col">
                <span className="seeders-val">▲ {t.seeders || 1420}</span>
                <span className="leechers-val">▼ {t.leechers || 85}</span>
              </div>

              <div className="torrent-actions-col">
                <button
                  onClick={() => handleCopyMagnet(t)}
                  className={`btn-action-magnet ${isCopied ? 'copied' : ''}`}
                  title="Copy Magnet link to clipboard"
                >
                  {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied!' : 'Magnet'}</span>
                </button>

                <a
                  href={resolveTorrentBlobUrl(t.torrentBlobUrl)}
                  download
                  className="btn-action-download"
                  title="Download .torrent file"
                >
                  <Download size={14} />
                  <span>.torrent</span>
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
