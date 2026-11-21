# Movie Storm Backend — Consumer Web Review

Verified against `C:\Projects\Azure\Movie-Storm-Backend` (`function/`, `service/`, `model/`, `dto/`, `repository/`, and `docs/CONSUMER_APP_API.md`).

---

## 1. Base URLs & Host Characteristics

- **Azure Production/Dev Base URL:** `https://movie-storm-function-eedbach7daeqd2h4.centralus-01.azurewebsites.net/api`
- **Local Functions Host:** `http://localhost:7071/api`
- **Host Auth Level:** All endpoints use `AuthorizationLevel.ANONYMOUS` at the Azure Functions host level; JWT validation happens inside the Java handlers.
- **Response Envelope:**
  - Success: `{ "success": true, "data": <object | array | string>, "timestamp": "<ISO-8601 UTC>" }`
  - Error: `{ "success": false, "error": "<message>", "timestamp": "<ISO-8601 UTC>" }`
  - `JsonUtil.normalize(...)` converts `java.time` values to ISO-8601 strings and omits `null` properties.
- **Cold Starts:** Azure SQL Serverless auto-pauses after 60 minutes; the first request after pause can take **30–90 seconds**.

---

## 2. Consumer & End-User Endpoint Inventory (33 Consumer Routes)

### 2.1 Authentication (`AuthFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `POST` | `/auth/signup` | None | `201` | Requires `email`, `password` (min 8 chars, upper + lower + digit), `displayName`. Returns `AuthResponse`. |
| `POST` | `/auth/login` | None | `200` | Requires `email`, `password`. Returns `AuthResponse` (`401` if Google-only account). |
| `POST` | `/auth/google` | None | `200` | Accepts `{ googleId, email, displayName, avatarUrl }`. **Does not verify Google ID tokens server-side** — must be called from a verified server/BFF flow or verified Google Identity flow. |
| `POST` | `/auth/refresh` | None | `200` | Accepts `{ refreshToken }`. Returns fresh `accessToken` + `refreshToken`. Consumer refresh is stateless (old refresh token is not revoked). |
| `POST` | `/auth/password/reset/request` | None | `200` | Accepts `{ email }`. Always returns `200` to prevent enumeration; emails 64-char hex code valid for 1 hour. |
| `POST` | `/auth/password/reset` | None | `200` | Accepts `{ email, resetToken, newPassword }`. Existing JWTs remain valid until expiry. |

### 2.2 User Profile (`UserProfileFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `GET` | `/users/me` | User Bearer | `200` | Returns `{ userId, email, displayName, avatarUrl, authProvider, createdAt }`. |
| `PUT` | `/users/me` | User Bearer | `200` | Optional `{ displayName, avatarUrl }`. No consumer file-upload endpoint exists (`avatarUrl` is a string/URL). |

### 2.3 Catalog Browsing & Discovery (`ContentFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `GET` | `/categories` | None | `200` | Array of `Category` ordered by `displayOrder`, `name`. |
| `GET` | `/tags` | None | `200` | Array of `Tag` ordered alphabetically. |
| `GET` | `/playlists` | None | `200` | Array of `{ playlist, content }` (read-only; only `PUBLISHED` content included). |
| `GET` | `/search` | None | `200` | Query params: `q`, `type`, `category`, `tags` (CSV, AND-match), `sort`, `limit` (default 50, max 200), `offset`. Returns `{ content, count, limit, offset }`. |
| `GET` | `/content/{id}` | None | `200` / `404` | Full published detail: `{ content, episodes, torrents, episodeTorrents, tags }`. Draft/deprecated IDs return `404`. |

### 2.4 Catalog Sync (`SyncFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `GET` | `/sync/version` | None | `200` | Returns `{ catalogVersion }` (`0` if empty). |
| `GET` | `/sync/delta` | None | `200` | Query params: `since` (required), `cursor` (opaque `v2:...`), `limit` (default 100, max 500). Returns `content`, `episodes`, `torrents`, `deletedContent`, `deletedEpisodes`, `deletedTorrents`, `hasMore`, `cursor`. |

### 2.5 Comments & Moderation (`CommentFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `GET` | `/content/{contentId}/comments` | None | `200` | Paged (`limit` default 20, max 100; `offset` default 0). Returns `APPROVED` comments newest first. Note: `userEmail` may be present on stored objects — **never render it in UI**. |
| `POST` | `/content/{contentId}/comments` | Optional | `201` | Body: `{ body, rating (1–5), userName, userEmail }`. Anonymous callers must provide `userName` and valid `userEmail`. Invalid Bearer token falls back to anonymous. Banned words auto-hide (`HIDDEN`). |
| `POST` | `/comments/{commentId}/flag` | Optional | `200` | Body: `{ reason }`. Not deduplicated server-side; reaching threshold (`COMMENT_FLAG_THRESHOLD`) flips status to `FLAGGED`. |

### 2.6 Favorites, Download History & Recommendations (`UserFeatureFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `POST` | `/favorites/{contentId}` | User Bearer | `200` | Idempotent add (`400` if content ID does not exist). |
| `DELETE` | `/favorites/{contentId}` | User Bearer | `200` | Idempotent remove. |
| `GET` | `/favorites` | User Bearer | `200` | Returns `{ favorites, count }`. **Client must filter `status === "PUBLISHED"`** because deprecated favorites are still returned. |
| `POST` | `/history` | User Bearer | `201` | Body: `{ contentId, episodeId (optional), torrentId }`. Records download/watch event. |
| `GET` | `/history` | User Bearer | `200` | Paged (`limit` default 20, max 100; `offset`). Returns `{ history, count, total }`. |
| `GET` | `/recommendations` | User Bearer | `200` | Query: `limit` (default 10, max 50). Returns `{ recommendations, count }` based on favorites' categories/tags or top-rated fallback. |

### 2.7 Support Chat (`ChatFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `POST` | `/chat/threads` | Optional | `201` | Body: `{ subject, message (optional), userName, userEmail }`. Anonymous requires `userName` + `userEmail`. No WebSocket; poll for replies. |
| `GET` | `/chat/threads` | User Bearer | `200` | Lists caller's non-deleted threads: `{ threads, count }`. |
| `GET` | `/chat/threads/{id}` | User Bearer | `200` / `404` | Returns single `ChatThread`; `ChatService.getUserThread` enforces ownership and hides user-deleted threads. |
| `DELETE` | `/chat/threads/{id}` | Optional (enforced if owned) | `200` | Soft-deletes from user view (`scheduled_delete_at` +30 days). Returns `"Thread deleted from view"`. |
| `POST` | `/chat/threads/{threadId}/messages` | Optional | `201` | Body: `{ body }`. Rejects `CLOSED` threads (`400`). |
| `GET` | `/chat/threads/{threadId}/messages` | None in handler | `200` | Returns `{ messages, count }` oldest first (`senderType`: `USER` \| `ADMIN`). |

> Note: `ChatFunctions.java` also hosts `PUT /chat/threads/{threadId}/status`, which requires an **admin** token and is not a consumer endpoint.

### 2.8 Feedback & Request Forms (`UserRequestFunctions.java`)
| Method | Route | Auth | Status | Notes |
|---|---|---|---|---|
| `POST` | `/requests` | Optional | `201` | Body: `{ category (ISSUE\|REQUEST\|FEEDBACK\|SUGGESTION), title, body, contentId (optional), userName, userEmail, attachmentUrl (optional) }`. Anonymous requires `userName` + valid `userEmail`. |
| `GET` | `/requests` | User Bearer | `200` | Own submissions newest first: `{ requests, count }`. |
| `GET` | `/requests/{id}` | User Bearer | `200` / `404` | Returns single `UserRequest`. Checks authentication only (no ownership check in handler). |

---

## 3. Verified Code-vs-Doc Discrepancies & Web Gotchas

1. **`GET /search` `sort` values (`ContentRepository.sanitizeSort`):**
   - Docs list `created_at | updated_at | rating | title`.
   - Actual Java switch supports `rating` (`rating DESC`), `year` (`year DESC`), `title` (`title ASC`), `year_asc` (`year ASC`), and defaults everything else (including `updated_at`) to `created_at DESC`.
2. **`GET /search` missing `tags` & post-filtering:**
   - `Content` items returned by `/search` do **not** include `tags` (only `/content/{id}` and `/sync/delta` include tag names).
   - Tag filtering happens in Java *after* SQL `OFFSET`/`FETCH NEXT`, so a page can return fewer than `limit` items even when more matches exist. Fetching `limit=200` or maintaining a client/server search index via `/sync/delta` avoids sparse pages.
3. **`POST /chat/threads` initial `message` field:**
   - `ChatFunctions.createThread` accepts an optional `message` string to create the opening `ChatMessage` atomically, even though `CONSUMER_APP_API.md` omitted it in the request snippet.
4. **`DELETE /chat/threads/{id}` response string:**
   - Actual response body is `"Thread deleted from view"` (docs say `"Thread deleted successfully"`).
5. **`SyncDeltaResponse` tombstone field names:**
   - Actual JSON keys are top-level `deletedContent`, `deletedEpisodes`, and `deletedTorrents` (an integration note in `INTEGRATION_FIXES_2026-11-05.md` referred to `data.tombstones.*`, which is inaccurate).
6. **No in-code CORS headers:**
   - None of the Azure Functions handlers emit `Access-Control-Allow-Origin`. Direct browser requests will be blocked unless Azure Function App CORS is configured or a web server/BFF (e.g., Next.js Route Handlers) proxies API requests.
7. **Asset URL resolution:**
   - `posterUrl`, `backdropUrl`, `trailerUrl`, and `torrentBlobUrl` may be relative blob paths (`posters/...`, `torrents/...`), full Blob URLs (with or without 365-day SAS), or external URLs (e.g., YouTube when `trailerType === "YOUTUBE"`).
   - Reference blob container base observed in `BACKEND_CONTRACT.md`: `https://sharedstoragepool.blob.core.windows.net/movie-storm/`.
8. **No public gallery / upload / download-count endpoints:**
   - `content_images` gallery is admin-only (`AdminImageFunctions`); consumer endpoints expose only primary `posterUrl` and `backdropUrl`.
   - Consumers cannot upload files (`avatarUrl`, `attachmentUrl` are string URLs only).
   - No public download-count metric exists on `Content`.
