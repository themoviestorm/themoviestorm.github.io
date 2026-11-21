export type ContentType = 'movie' | 'series' | 'anime' | 'drama' | string;
export type ContentStatus = 'DRAFT' | 'PUBLISHED' | 'DEPRECATED';
export type TrailerType = 'BLOB' | 'YOUTUBE' | 'STREAM';

export interface Content {
  id: string;
  type: ContentType;
  title: string;
  year?: number;
  description?: string;
  longDescription?: string;
  rating?: number;
  runtimeMinutes?: number;
  status: ContentStatus;
  categoryId?: string;
  posterUrl?: string;
  backdropUrl?: string;
  trailerUrl?: string;
  trailerType?: TrailerType;
  originalLanguage?: string;
  country?: string;
  contentRating?: string;
  catalogVersion?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  tags?: string[];
}

export interface Category {
  id: string;
  name: string;
  displayOrder: number;
  createdAt?: string;
}

export interface Tag {
  id: string;
  name: string;
  createdAt?: string;
}

export interface Episode {
  id: string;
  contentId: string;
  seasonNumber: number;
  episodeNumber: number;
  title: string;
  description?: string;
  airDate?: string;
  catalogVersion?: number;
}

export interface Torrent {
  id: string;
  contentId: string;
  episodeId?: string | null;
  quality: string;
  fileSizeBytes: number;
  torrentBlobUrl: string;
  magnetLink?: string | null;
  seeders?: number;
  leechers?: number;
  codec?: string;
  sourceType?: string;
  audioChannels?: string;
  audioLanguages?: string[] | string;
  subtitleLanguages?: string[] | string;
  catalogVersion?: number;
}

export interface ContentDetailResponse {
  content: Content;
  episodes: Episode[];
  torrents: Torrent[];
  episodeTorrents: Record<string, Torrent[]>;
  tags: string[];
}

export interface PlaylistItem {
  playlist: {
    id: string;
    name: string;
    type: 'MANUAL' | 'AUTOMATED' | 'HYBRID';
    displayOrder: number;
    createdAt?: string;
    updatedAt?: string;
  };
  content: Content[];
}

export interface SearchResponse {
  content: Content[];
  count: number;
  limit: number;
  offset: number;
}

export interface Comment {
  id: string;
  contentId: string;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
  body: string;
  rating?: number;
  status: 'APPROVED' | 'FLAGGED' | 'HIDDEN';
  flagCount?: number;
  createdAt: string;
}

export interface CommentsResponse {
  comments: Comment[];
  count: number;
  limit: number;
  offset: number;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  authProvider: 'LOCAL' | 'GOOGLE';
  createdAt?: string;
}

export interface AuthResponse {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  accessToken: string;
  refreshToken: string;
}

export interface WatchHistoryItem {
  id: string;
  userId: string;
  contentId: string;
  episodeId?: string | null;
  torrentId: string;
  downloadedAt: string;
  content?: Content;
}

export interface HistoryResponse {
  history: WatchHistoryItem[];
  count: number;
  total: number;
}

export interface ChatThread {
  id: string;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
  subject: string;
  status: 'OPEN' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id: string;
  threadId: string;
  senderType: 'USER' | 'ADMIN';
  senderId: string;
  body: string;
  createdAt: string;
}

export type RequestCategory = 'ISSUE' | 'REQUEST' | 'FEEDBACK' | 'SUGGESTION';
export type RequestStatus = 'NEW' | 'READ' | 'RESOLVED' | 'REJECTED';

export interface UserRequestItem {
  id: string;
  userId?: string | null;
  userName?: string;
  userEmail?: string;
  category: RequestCategory;
  contentId?: string | null;
  title: string;
  body: string;
  attachmentUrl?: string | null;
  status: RequestStatus;
  createdAt: string;
  resolvedAt?: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp?: string;
}
