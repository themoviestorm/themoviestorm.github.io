# Movie Storm Consumer Website — Deferred & Future TODOs

Items tracked here are intentionally deferred while we design and build the foundational consumer website. Revisit these before public production launch or during the planned C# ASP.NET Core backend migration.

---

## 1. Infrastructure, Hosting & Deployment

- [x] **Configure CORS on Azure Function App** *(completed: added `https://themoviestorm.github.io` with credentials)*
  - Allow the local dev origin (`http://localhost:5173`), the GitHub Pages organization origin (`https://<org>.github.io`), and the eventual custom domain.
  - Ensure `Authorization` and `Content-Type` headers and `GET, POST, PUT, DELETE, OPTIONS` methods are permitted.
  - Also check **Azure Blob Storage CORS** (`sharedstoragepool.blob.core.windows.net`) if `.torrent` files or media metadata are fetched via browser `fetch`/`XHR` instead of direct `<a download>` / `<img>` / `<video>` tags.
- [ ] **GitHub Pages Deployment Pipeline**
  - Set up GitHub Actions workflow to build the static bundle and deploy to GitHub Pages from the organization repository.
  - Configure dynamic `base` path (for `https://<org>.github.io/<repo>/`) and SPA `404.html` fallback (or hash routing) so deep links like `/content/<id>` work on refresh.
- [ ] **Custom Domain Setup (Later)**
  - Add custom domain / DNS (`CNAME`) once purchased, or evaluate migrating static hosting to Cloudflare Pages / Azure Static Web Apps if native SPA rewrites and edge headers are desired.

---

## 2. Planned C# ASP.NET Core Backend Migration (Later)

- [ ] **Eliminate Serverless Cold Starts**
  - Current Azure Functions + Azure SQL Serverless setup has 30–90s cold starts after 60 minutes of inactivity. Keep extended client timeouts and warm-up/skeleton loading states for now; simplify/tune once migrated to C# ASP.NET Core.
- [ ] **Verify Google OAuth ID Tokens Server-Side** *(deferred)*
  - The current Java `POST /auth/google` trusts client-supplied `googleId` and `email`.
  - Do **not** enable unverified Google login for production until Google ID token (`credential` JWT) signature verification is implemented on the backend (e.g., C# ASP.NET Core validating against `GOOGLE_OAUTH_CLIENT_ID`).
- [ ] **API Contract & Security Enhancements to Address in C# Backend**
  - **Search (`GET /search`):** Return `tags` on search items and filter tags in SQL before `OFFSET`/`FETCH` so pagination counts are accurate; align `sort=updated_at` if needed.
  - **Favorites (`GET /favorites`):** Filter out `DEPRECATED` items server-side (client currently filters `status === "PUBLISHED"`).
  - **Comments (`GET /content/{id}/comments`):** Strip `userEmail` from public comment responses so user emails are never transmitted to other visitors.
  - **Comment Flagging:** Deduplicate flags per user/IP or rate-limit `POST /comments/{id}/flag`.
  - **Ownership Checks:** Enforce caller ownership on `GET /chat/threads/{id}/messages` and `GET /requests/{id}`.
  - **Real-Time Support Chat:** Consider SignalR / WebSockets in ASP.NET Core instead of polling `GET /chat/threads/{id}/messages`.
  - **Content Image Gallery:** Expose public `content_images` endpoint if multiple posters/backdrops per title should be displayed on the website.
  - **Download Counts & Uploads:** Add public download analytics / counters and optional consumer avatar or request-attachment upload URLs if needed.
  - **Cookie-Based Auth (Optional with Custom Domain + ASP.NET):** Move from client-held JWTs to `HttpOnly; Secure; SameSite` cookies if hosted under the same parent domain later.

---

## 3. Website Resilience & Edge Cases (Active During Foundation, Revisit Later)

- [ ] **Cold-Start UX Polish:** Add friendly "Waking up catalog server..." progress feedback + automatic retry on initial `/sync/version` or `/categories` timeout.
- [ ] **Blob Asset Fallback:** Handle expired 365-day SAS URLs (`403`) or relative blob paths (`posters/...`, `torrents/...`) gracefully with fallback poster artwork.
- [ ] **Catalog Caching Strategy:** Optionally leverage `GET /sync/version` + IndexedDB/localStorage caching in the SPA so repeat visits feel instant even before the C# backend migration.
