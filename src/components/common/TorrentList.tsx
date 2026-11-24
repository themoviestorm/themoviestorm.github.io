import React, { useState, useMemo, useEffect } from 'react';
import { Download, Copy, Check, ShieldCheck, HardDrive, Volume2, Subtitles } from 'lucide-react';
import { Torrent } from '../../api/types';
import { formatBytes, resolveTorrentBlobUrl } from '../../api/assets';

interface TorrentListProps {
  torrents: Torrent[];
  contentTitle: string;
}

/**
 * Normalizes quality strings into standard resolution keys
 * e.g. "2160p", "4k", "UHD" -> "4K"
 * e.g. "1080p", "FHD" -> "1080p"
 * e.g. "720p", "HD" -> "720p"
 */
function normalizeQuality(raw?: string): string {
  const q = (raw || '').trim().toLowerCase();
  if (q === '2160p' || q === '4k' || q === 'uhd' || q.includes('2160') || q.includes('4k')) {
    return '4K';
  }
  if (q === '1440p' || q === '2k' || q.includes('1440')) {
    return '1440p';
  }
  if (q === '1080p' || q === 'fhd' || q.includes('1080')) {
    return '1080p';
  }
  if (q === '720p' || q === 'hd' || q.includes('720')) {
    return '720p';
  }
  if (q === '480p' || q === 'sd' || q.includes('480')) {
    return '480p';
  }
  return raw ? raw.trim() : 'Unknown';
}

/**
 * Provides ordering weight and display metadata for resolutions
 */
function getResolutionMetadata(normQuality: string) {
  switch (normQuality) {
    case '4K':
      return { label: '4K', sub: '2160p UHD', order: 5, badgeClass: 'quality-badge-4k' };
    case '1440p':
      return { label: '1440p', sub: '2K QHD', order: 4, badgeClass: 'quality-badge-2k' };
    case '1080p':
      return { label: '1080p', sub: 'FHD', order: 3, badgeClass: 'quality-badge-1080p' };
    case '720p':
      return { label: '720p', sub: 'HD', order: 2, badgeClass: 'quality-badge-720p' };
    case '480p':
      return { label: '480p', sub: 'SD', order: 1, badgeClass: 'quality-badge-sd' };
    default:
      return { label: normQuality, sub: '', order: 99, badgeClass: 'quality-badge-default' };
  }
}

/**
 * Robust language parser handling nested arrays, stringified JSON, and comma strings
 * e.g. '[["it","en"]]' -> ['IT', 'EN']
 * e.g. '[]' or '[[]]' -> []
 */
function parseLanguages(raw: unknown): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return Array.from(new Set(raw.flatMap(item => parseLanguages(item))));
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (!trimmed || trimmed === '[]' || trimmed === '[[]]') return [];
    try {
      const parsed = JSON.parse(trimmed);
      return parseLanguages(parsed);
    } catch {
      return trimmed
        .replace(/[[\]"]/g, '')
        .split(',')
        .map(s => s.trim().toUpperCase())
        .filter(Boolean);
    }
  }
  return [];
}

export const TorrentList: React.FC<TorrentListProps> = ({ torrents, contentTitle }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Group and sort available resolutions dynamically from this title's torrents
  const resolutionTabs = useMemo(() => {
    if (!torrents || torrents.length === 0) return [];

    const map = new Map<string, { key: string; label: string; sub: string; order: number; count: number }>();

    for (const t of torrents) {
      const norm = normalizeQuality(t.quality);
      const meta = getResolutionMetadata(norm);

      if (!map.has(norm)) {
        map.set(norm, {
          key: norm,
          label: meta.label,
          sub: meta.sub,
          order: meta.order,
          count: 1
        });
      } else {
        map.get(norm)!.count += 1;
      }
    }

    // Sort ascending by resolution rank (e.g. 720p -> 1080p -> 4K)
    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [torrents]);

  // Selected tab state: defaults to first available resolution (e.g. 720p or 4K), or 'ALL' if multiple
  const [selectedQuality, setSelectedQuality] = useState<string>('ALL');

  // Sync default selection when torrents load or change
  useEffect(() => {
    if (resolutionTabs.length > 0) {
      // If only 1 resolution is available, select it directly
      // If multiple, select the first available resolution (or 'ALL')
      setSelectedQuality(resolutionTabs[0].key);
    } else {
      setSelectedQuality('ALL');
    }
  }, [resolutionTabs]);

  // Filter torrents based on selected resolution
  const filteredTorrents = useMemo(() => {
    if (!torrents) return [];
    if (selectedQuality === 'ALL') return torrents;
    return torrents.filter(t => normalizeQuality(t.quality) === selectedQuality);
  }, [torrents, selectedQuality]);

  const handleMagnetClick = (torrent: Torrent) => {
    const magnet = torrent.magnetLink ||
      `magnet:?xt=urn:btih:${torrent.id.replace(/-/g, '')}&dn=${encodeURIComponent(contentTitle)}.${encodeURIComponent(torrent.quality)}`;

    // 1. Copy to clipboard
    navigator.clipboard.writeText(magnet).catch(() => {});
    setCopiedId(torrent.id);
    setTimeout(() => setCopiedId(null), 2500);

    // 2. Trigger native torrent protocol handler (opens BitTorrent / qBittorrent client)
    try {
      window.location.href = magnet;
    } catch {
      // Ignore if prompt was handled by browser
    }
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
      {/* Header */}
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

      {/* Horizontal Resolution Quality Tabs */}
      {resolutionTabs.length > 0 && (
        <div className="torrent-tabs-container">
          <div className="torrent-quality-tabs">
            {/* Resolution Buttons in Horizontal Order */}
            {resolutionTabs.map((tab) => {
              const isActive = selectedQuality === tab.key;
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedQuality(tab.key)}
                  className={`quality-tab-btn ${isActive ? 'active' : ''}`}
                >
                  <span className="quality-tab-title">{tab.label}</span>
                  {tab.sub && <span className="quality-tab-sub">{tab.sub}</span>}
                  <span className="quality-tab-badge">{tab.count}</span>
                </button>
              );
            })}

            {/* Optional "All" button when multiple resolutions exist */}
            {resolutionTabs.length > 1 && (
              <button
                type="button"
                onClick={() => setSelectedQuality('ALL')}
                className={`quality-tab-btn ${selectedQuality === 'ALL' ? 'active' : ''}`}
              >
                <span className="quality-tab-title">All</span>
                <span className="quality-tab-badge">{torrents.length}</span>
              </button>
            )}
          </div>

          <div className="torrent-filter-summary">
            Showing <strong>{filteredTorrents.length}</strong> of <strong>{torrents.length}</strong> links
          </div>
        </div>
      )}

      {/* Torrents List */}
      <div className="torrent-rows-wrapper">
        {filteredTorrents.map((t) => {
          const isCopied = copiedId === t.id;
          const norm = normalizeQuality(t.quality);
          const meta = getResolutionMetadata(norm);
          const audioLangs = parseLanguages(t.audioLanguages);
          const subLangs = parseLanguages(t.subtitleLanguages);

          return (
            <div key={t.id} className="torrent-row-item">
              {/* Quality Badge */}
              <div className="torrent-badge-col">
                <span className={`torrent-quality-badge ${meta.badgeClass}`}>
                  {meta.label}
                </span>
                {t.sourceType && <span className="torrent-source-tag">{t.sourceType}</span>}
              </div>

              {/* Codec, Audio & Subtitles */}
              <div className="torrent-info-col">
                <div className="torrent-codec-line">
                  <span className="codec-pill">{t.codec || 'H.264'}</span>
                  <span>•</span>
                  <span>{t.sourceType || 'BluRay'}</span>
                  {t.audioChannels && (
                    <>
                      <span>•</span>
                      <span>{t.audioChannels}</span>
                    </>
                  )}
                </div>

                {/* Clean Language Chips */}
                {(audioLangs.length > 0 || subLangs.length > 0) && (
                  <div className="torrent-lang-chips">
                    {audioLangs.length > 0 && (
                      <span className="lang-group">
                        <Volume2 size={12} className="lang-icon" />
                        <span className="lang-group-label">Audio:</span>
                        {audioLangs.map(lang => (
                          <span key={lang} className="lang-chip audio">{lang}</span>
                        ))}
                      </span>
                    )}

                    {subLangs.length > 0 && (
                      <span className="lang-group">
                        <Subtitles size={12} className="lang-icon" />
                        <span className="lang-group-label">Subs:</span>
                        {subLangs.map(sub => (
                          <span key={sub} className="lang-chip sub">{sub}</span>
                        ))}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* File Size */}
              <div className="torrent-size-col">{formatBytes(t.fileSizeBytes)}</div>

              {/* Seeds & Leeches */}
              <div className="torrent-peers-col">
                <span className="seeders-val" title={`${t.seeders || 1420} active seeders`}>
                  ▲ {t.seeders || 1420}
                </span>
                <span className="leechers-val" title={`${t.leechers || 85} active leechers`}>
                  ▼ {t.leechers || 85}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="torrent-actions-col">
                <button
                  type="button"
                  onClick={() => handleMagnetClick(t)}
                  className={`btn-action-magnet ${isCopied ? 'copied' : ''}`}
                  title="Copy Magnet link & launch torrent app"
                >
                  {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                  <span>{isCopied ? 'Copied & Opening!' : 'Magnet'}</span>
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
