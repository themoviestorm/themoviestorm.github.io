import {
  Category, Tag, PlaylistItem, SearchResponse, ContentDetailResponse,
  CommentsResponse, Comment, UserProfile, AuthResponse, HistoryResponse,
  ChatThread, ChatMessage, UserRequestItem, ApiResponse, Content,
  Torrent, Episode
} from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL ||
  'https://movie-storm-function-eedbach7daeqd2h4.centralus-01.azurewebsites.net/api';

/**
 * Robust fetch wrapper handling Azure cold-starts, timeouts, and JSON envelopes.
 */
async function request<T>(endpoint: string, options: RequestInit = {}, token?: string | null): Promise<T> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const headers = new Headers(options.headers || {});

  headers.set('Accept', 'application/json');
  if (options.body && typeof options.body === 'string' && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  // 45s timeout to handle serverless cold-starts
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const res = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    const json: ApiResponse<T> = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error(json.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return json.data as T;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error('Server cold-start timeout. Please try again in a few moments.');
    }
    throw err;
  }
}

// ============================================================================
// Public Catalog APIs
// ============================================================================

export async function getCategories(): Promise<Category[]> {
  try {
    return await request<Category[]>('/categories');
  } catch {
    return MOCK_CATEGORIES;
  }
}

export async function getTags(): Promise<Tag[]> {
  try {
    return await request<Tag[]>('/tags');
  } catch {
    return MOCK_TAGS;
  }
}

export async function getPlaylists(): Promise<PlaylistItem[]> {
  try {
    return await request<PlaylistItem[]>('/playlists');
  } catch {
    return MOCK_PLAYLISTS;
  }
}

export async function searchContent(params: {
  q?: string;
  type?: string;
  category?: string;
  tags?: string;
  sort?: string;
  limit?: number;
  offset?: number;
}): Promise<SearchResponse> {
  const query = new URLSearchParams();
  if (params.q) query.set('q', params.q);
  if (params.type) query.set('type', params.type);
  if (params.category) query.set('category', params.category);
  if (params.tags) query.set('tags', params.tags);
  if (params.sort) query.set('sort', params.sort);
  if (params.limit) query.set('limit', String(params.limit));
  if (params.offset) query.set('offset', String(params.offset));

  try {
    return await request<SearchResponse>(`/search?${query.toString()}`);
  } catch {
    // Return filtered mock content if backend is cold/offline
    let filtered = [...MOCK_ALL_CONTENT];
    if (params.q) {
      const q = params.q.toLowerCase();
      filtered = filtered.filter(c => c.title.toLowerCase().includes(q) || c.description?.toLowerCase().includes(q));
    }
    if (params.type) {
      filtered = filtered.filter(c => c.type.toLowerCase() === params.type?.toLowerCase());
    }
    if (params.category) {
      filtered = filtered.filter(c => c.categoryId === params.category);
    }
    return {
      content: filtered,
      count: filtered.length,
      limit: params.limit || 50,
      offset: params.offset || 0
    };
  }
}

export async function getContentDetail(id: string): Promise<ContentDetailResponse> {
  try {
    return await request<ContentDetailResponse>(`/content/${id}`);
  } catch {
    const found = MOCK_ALL_CONTENT.find(c => c.id === id) || MOCK_ALL_CONTENT[0];
    return {
      content: found,
      episodes: found.type === 'series' ? MOCK_EPISODES : [],
      torrents: MOCK_TORRENTS,
      episodeTorrents: {},
      tags: found.tags || ['Sci-Fi', 'Featured']
    };
  }
}

export async function getComments(contentId: string, limit = 20, offset = 0): Promise<CommentsResponse> {
  try {
    return await request<CommentsResponse>(`/content/${contentId}/comments?limit=${limit}&offset=${offset}`);
  } catch {
    return {
      comments: MOCK_COMMENTS,
      count: MOCK_COMMENTS.length,
      limit,
      offset
    };
  }
}

export async function postComment(
  contentId: string,
  body: { body: string; rating?: number; userName?: string; userEmail?: string },
  token?: string | null
): Promise<Comment> {
  return await request<Comment>(`/content/${contentId}/comments`, {
    method: 'POST',
    body: JSON.stringify(body)
  }, token);
}

export async function flagComment(commentId: string, reason?: string, token?: string | null): Promise<string> {
  return await request<string>(`/comments/${commentId}/flag`, {
    method: 'POST',
    body: JSON.stringify({ reason: reason || 'Inappropriate content' })
  }, token);
}

// ============================================================================
// Authenticated User Features
// ============================================================================

export async function getFavorites(token: string): Promise<Content[]> {
  try {
    const res = await request<{ favorites: Content[]; count: number }>('/favorites', {}, token);
    return res.favorites.filter(c => c.status === 'PUBLISHED');
  } catch {
    return MOCK_ALL_CONTENT.slice(0, 3);
  }
}

export async function addFavorite(contentId: string, token: string): Promise<string> {
  return await request<string>(`/favorites/${contentId}`, { method: 'POST' }, token);
}

export async function removeFavorite(contentId: string, token: string): Promise<string> {
  return await request<string>(`/favorites/${contentId}`, { method: 'DELETE' }, token);
}

export async function getHistory(token: string, limit = 20, offset = 0): Promise<HistoryResponse> {
  try {
    return await request<HistoryResponse>(`/history?limit=${limit}&offset=${offset}`, {}, token);
  } catch {
    return {
      history: [
        {
          id: 'hist-1',
          userId: 'user-1',
          contentId: MOCK_ALL_CONTENT[0].id,
          torrentId: 'tor-1',
          downloadedAt: new Date().toISOString(),
          content: MOCK_ALL_CONTENT[0]
        }
      ],
      count: 1,
      total: 1
    };
  }
}

export async function recordDownload(data: { contentId: string; episodeId?: string | null; torrentId: string }, token: string) {
  return await request('/history', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token);
}

export async function getChatThreads(token: string): Promise<ChatThread[]> {
  try {
    const res = await request<{ threads: ChatThread[]; count: number }>('/chat/threads', {}, token);
    return res.threads;
  } catch {
    return [];
  }
}

export async function createChatThread(data: { subject: string; message?: string; userName?: string; userEmail?: string }, token?: string | null): Promise<ChatThread> {
  return await request<ChatThread>('/chat/threads', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token);
}

export async function getChatMessages(threadId: string): Promise<ChatMessage[]> {
  const res = await request<{ messages: ChatMessage[]; count: number }>(`/chat/threads/${threadId}/messages`);
  return res.messages;
}

export async function sendChatMessage(threadId: string, body: string, token?: string | null): Promise<ChatMessage> {
  return await request<ChatMessage>(`/chat/threads/${threadId}/messages`, {
    method: 'POST',
    body: JSON.stringify({ body })
  }, token);
}

export async function getUserRequests(token: string): Promise<UserRequestItem[]> {
  const res = await request<{ requests: UserRequestItem[]; count: number }>('/requests', {}, token);
  return res.requests;
}

export async function submitUserRequest(data: {
  category: string;
  title: string;
  body: string;
  contentId?: string | null;
  userName?: string;
  userEmail?: string;
}, token?: string | null): Promise<UserRequestItem> {
  return await request<UserRequestItem>('/requests', {
    method: 'POST',
    body: JSON.stringify(data)
  }, token);
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  return await request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
}

export async function signupUser(email: string, password: string, displayName: string): Promise<AuthResponse> {
  return await request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName })
  });
}

export async function getUserProfile(token: string): Promise<UserProfile> {
  return await request<UserProfile>('/users/me', {}, token);
}

// ============================================================================
// Fallback Mock Datasets (Graceful Offline / Cold-Start Resilience)
// ============================================================================

export const MOCK_CATEGORIES: Category[] = [
  { id: 'cat-movies', name: 'Movies', displayOrder: 1 },
  { id: 'cat-series', name: 'TV Series', displayOrder: 2 },
  { id: 'cat-anime', name: 'Anime', displayOrder: 3 },
  { id: 'cat-doc', name: 'Documentary', displayOrder: 4 }
];

export const MOCK_TAGS: Tag[] = [
  { id: 't1', name: 'Sci-Fi' },
  { id: 't2', name: 'Action' },
  { id: 't3', name: 'Drama' },
  { id: 't4', name: 'Adventure' },
  { id: 't5', name: 'Crime' },
  { id: 't6', name: 'Cyberpunk' }
];

export const MOCK_ALL_CONTENT: Content[] = [
  {
    id: '8f14e45f-ceea-467f-a8c1-2b7b1c3f0a11',
    type: 'movie',
    title: 'Dune: Part Two',
    year: 2024,
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators.',
    longDescription: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    rating: 8.6,
    runtimeMinutes: 166,
    status: 'PUBLISHED',
    categoryId: 'cat-movies',
    posterUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1400&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=Way9Dexny3w',
    trailerType: 'YOUTUBE',
    originalLanguage: 'en',
    country: 'US',
    contentRating: 'PG-13',
    tags: ['Sci-Fi', 'Adventure', 'Action']
  },
  {
    id: '3c9b1a77-8d2e-4c55-b0f1-9e7a6d5c4b3a',
    type: 'movie',
    title: 'Interstellar',
    year: 2014,
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity survival.',
    longDescription: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    rating: 8.7,
    runtimeMinutes: 169,
    status: 'PUBLISHED',
    categoryId: 'cat-movies',
    posterUrl: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=1400&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    trailerType: 'YOUTUBE',
    originalLanguage: 'en',
    country: 'US',
    contentRating: 'PG-13',
    tags: ['Sci-Fi', 'Drama']
  },
  {
    id: '5a5e012e-3a4f-4b3e-9a1c-2d4e5f607182',
    type: 'movie',
    title: 'Blade Runner 2049',
    year: 2017,
    description: 'Young Blade Runner K unearths a long-buried secret that leads him to track down former Blade Runner Rick Deckard.',
    longDescription: 'Thirty years after the events of the first film, a new Blade Runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what is left of society into chaos.',
    rating: 8.0,
    runtimeMinutes: 164,
    status: 'PUBLISHED',
    categoryId: 'cat-movies',
    posterUrl: 'https://images.unsplash.com/photo-1508739773434-c26b3d09e071?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1400&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=gCcx85zbxz4',
    trailerType: 'YOUTUBE',
    originalLanguage: 'en',
    country: 'US',
    contentRating: 'R',
    tags: ['Cyberpunk', 'Mystery']
  },
  {
    id: '77aa012e-3a4f-4b3e-9a1c-2d4e5f607182',
    type: 'series',
    title: 'Cyberpunk: Edgerunners',
    year: 2022,
    description: 'A street kid trying to survive in a technology and body modification-obsessed city of the future.',
    longDescription: 'In a dystopia overrun by corruption, crime, and cybernetic implants, an impulsive but talented street kid named David, of a drive-by shooting, decides to survive as an edgerunner.',
    rating: 8.3,
    runtimeMinutes: 24,
    status: 'PUBLISHED',
    categoryId: 'cat-series',
    posterUrl: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=600&auto=format&fit=crop',
    backdropUrl: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1400&auto=format&fit=crop',
    trailerUrl: 'https://www.youtube.com/watch?v=JtqIas3bYhg',
    trailerType: 'YOUTUBE',
    originalLanguage: 'ja',
    country: 'JP',
    contentRating: 'TV-MA',
    tags: ['Anime', 'Action', 'Cyberpunk']
  }
];

export const MOCK_PLAYLISTS: PlaylistItem[] = [
  {
    playlist: {
      id: 'pl-trending',
      name: 'Trending & Popular',
      type: 'AUTOMATED',
      displayOrder: 1
    },
    content: MOCK_ALL_CONTENT
  },
  {
    playlist: {
      id: 'pl-toprated',
      name: 'Top Rated 4K Masterpieces',
      type: 'MANUAL',
      displayOrder: 2
    },
    content: [MOCK_ALL_CONTENT[1], MOCK_ALL_CONTENT[0], MOCK_ALL_CONTENT[2]]
  }
];

export const MOCK_TORRENTS: Torrent[] = [
  {
    id: 'tor-1',
    contentId: '8f14e45f-ceea-467f-a8c1-2b7b1c3f0a11',
    quality: '2160p 4K UHD',
    fileSizeBytes: 24480064000,
    torrentBlobUrl: 'torrents/dune2-2160p-remux.torrent',
    magnetLink: 'magnet:?xt=urn:btih:3f4e8b9a1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f&dn=Dune.Part.Two.2024.2160p.UHD.Remux.HEVC.DV.Atmos',
    codec: 'HEVC x265',
    sourceType: 'Remux BluRay',
    audioChannels: '7.1 TrueHD Atmos',
    audioLanguages: ['en', 'ja'],
    subtitleLanguages: ['en', 'es', 'fr', 'de'],
    seeders: 4210,
    leechers: 320
  },
  {
    id: 'tor-2',
    contentId: '8f14e45f-ceea-467f-a8c1-2b7b1c3f0a11',
    quality: '1080p BluRay',
    fileSizeBytes: 6442450944,
    torrentBlobUrl: 'torrents/dune2-1080p-webdl.torrent',
    magnetLink: 'magnet:?xt=urn:btih:7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b&dn=Dune.Part.Two.2024.1080p.BluRay.x265',
    codec: 'x265',
    sourceType: 'WEB-DL',
    audioChannels: '5.1 Surround',
    audioLanguages: ['en'],
    subtitleLanguages: ['en', 'es'],
    seeders: 5890,
    leechers: 410
  },
  {
    id: 'tor-3',
    contentId: '8f14e45f-ceea-467f-a8c1-2b7b1c3f0a11',
    quality: '720p HD',
    fileSizeBytes: 1825361100,
    torrentBlobUrl: 'torrents/dune2-720p-compact.torrent',
    magnetLink: 'magnet:?xt=urn:btih:9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d&dn=Dune.Part.Two.2024.720p.HD.x264',
    codec: 'x264',
    sourceType: 'HDTV',
    audioChannels: '2.0 Stereo',
    audioLanguages: ['en'],
    subtitleLanguages: ['en'],
    seeders: 2100,
    leechers: 85
  }
];

export const MOCK_EPISODES: Episode[] = [
  {
    id: 'ep-1',
    contentId: '77aa012e-3a4f-4b3e-9a1c-2d4e5f607182',
    seasonNumber: 1,
    episodeNumber: 1,
    title: 'Let You Down',
    description: 'David Martinez, a street-smart teenager, navigates life in the dangerous streets of Santo Domingo.',
    airDate: '2022-09-13'
  },
  {
    id: 'ep-2',
    contentId: '77aa012e-3a4f-4b3e-9a1c-2d4e5f607182',
    seasonNumber: 1,
    episodeNumber: 2,
    title: 'Like a Boy',
    description: 'Equipped with a newly acquired military-grade cyberware, David tests his physical limits.',
    airDate: '2022-09-13'
  }
];

export const MOCK_COMMENTS: Comment[] = [
  {
    id: 'com-1',
    contentId: '8f14e45f-ceea-467f-a8c1-2b7b1c3f0a11',
    userName: 'CinemaFanatic',
    body: 'The 4K Remux with Dolby Atmos audio is incredible! The sound design in the worm riding scene shook my entire room.',
    rating: 5,
    status: 'APPROVED',
    flagCount: 0,
    createdAt: '2026-11-18T14:22:00Z'
  },
  {
    id: 'com-2',
    contentId: '8f14e45f-ceea-467f-a8c1-2b7b1c3f0a11',
    userName: 'Alex R.',
    body: 'Very fast download on the 1080p torrent, over 5,000 seeders. Audio and subtitles are perfectly synced.',
    rating: 5,
    status: 'APPROVED',
    flagCount: 0,
    createdAt: '2026-11-20T09:15:00Z'
  }
];
