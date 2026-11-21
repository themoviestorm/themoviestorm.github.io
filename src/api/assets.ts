const BLOB_STORAGE_BASE = 'https://sharedstoragepool.blob.core.windows.net/movie-storm';

/**
 * Resolves poster or backdrop paths to an absolute URL with placeholder fallback.
 */
export function resolveImageUrl(urlOrPath?: string | null, type: 'poster' | 'backdrop' = 'poster'): string {
  if (!urlOrPath || urlOrPath.trim() === '') {
    return type === 'poster'
      ? 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=600&auto=format&fit=crop'
      : 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop';
  }

  const trimmed = urlOrPath.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }

  // Join relative blob path with container base
  const cleanPath = trimmed.startsWith('/') ? trimmed.slice(1) : trimmed;
  return `${BLOB_STORAGE_BASE}/${cleanPath}`;
}

/**
 * Resolves a .torrent download URL.
 */
export function resolveTorrentBlobUrl(urlOrPath?: string | null): string {
  if (!urlOrPath) return '#';
  if (urlOrPath.startsWith('http://') || urlOrPath.startsWith('https://')) {
    return urlOrPath;
  }
  const cleanPath = urlOrPath.startsWith('/') ? urlOrPath.slice(1) : urlOrPath;
  return `${BLOB_STORAGE_BASE}/${cleanPath}`;
}

/**
 * Parses a YouTube video ID from various YouTube URL formats.
 */
export function getYouTubeEmbedUrl(url?: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  if (match && match[2].length === 11) {
    return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
  }
  return null;
}

/**
 * Formats bytes into human-readable size (e.g. 14.8 GB).
 */
export function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return 'Unknown size';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  return `${size.toFixed(size >= 10 ? 1 : 2)} ${units[unitIndex]}`;
}

/**
 * Formats runtime minutes to hours + mins (e.g. 2h 26m).
 */
export function formatRuntime(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return '';
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs}h`;
  return `${mins}m`;
}
