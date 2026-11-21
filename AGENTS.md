# AGENTS.md — AI Coding Agent Instructions

This file defines rules and workspace context for AI coding agents working on the **Movie Storm Consumer Website** in `C:\Projects\Web\Movie-Storm`.

---

## Workspace & Repository Boundaries

- **Active workspace (editable):** `C:\Projects\Web\Movie-Storm` — the end-user web application for exploring published Movie Storm catalog content, downloading torrents/magnets, commenting, rating, favoriting, tracking history, chatting with support, and submitting feedback/requests.
- **Secondary reference repositories (READ-ONLY):**
  - `C:\Projects\Azure\Movie-Storm-Backend` (Java Azure Functions + Azure SQL + Azure Blob Storage)
  - `C:\Projects\WinUI\Movie-Storm-Admin` (WinUI 3 desktop admin client)
- **Strict authorization rule:** NEVER edit, modify, or run destructive commands inside `C:\Projects\Azure\Movie-Storm-Backend` or `C:\Projects\WinUI\Movie-Storm-Admin` without explicit user permission. If a backend change (such as CORS configuration, a new endpoint, or a bug fix) is needed, document it clearly and ask the user for explicit permission first.

---

## Backend Contract Rules

- **Source of truth:** Treat the actual Java handlers, services, DTOs, models, and SQL migrations in `C:\Projects\Azure\Movie-Storm-Backend` as the authoritative contract. `docs/CONSUMER_APP_API.md` is helpful, but actual code wins wherever docs drift. See `docs/BACKEND_API_REVIEW.md` in this repo for the verified contract notes.
- **Consumer-only surface:** Only use public and consumer-authenticated endpoints (`/auth/*`, `/users/me`, `/sync/*`, `/categories`, `/tags`, `/playlists`, `/search`, `/content/*`, `/comments/*`, `/favorites/*`, `/history`, `/recommendations`, `/chat/*` consumer routes, `/requests/*`). Never embed admin credentials or call `/manage/*` routes.
- **Envelope & null handling:** Responses follow `{ success, data, error, timestamp }` where `null` properties are omitted. Treat all optional fields as potentially absent (`undefined`), and parse timestamps as ISO-8601 UTC strings.
- **Cold starts:** Azure SQL Serverless auto-pauses after 60 minutes; initial requests can take 30–90 seconds. Always configure generous timeouts and graceful loading/retry states.
- **Google OAuth boundary:** The backend's `POST /auth/google` endpoint trusts the caller-supplied `googleId`/`email`. Never call it directly with raw user-editable fields from browser JS — verify Google ID tokens on a trusted server/BFF layer first.

---

## Git Workflow

- Commit incrementally as milestones and design/implementation steps are approved and verified.
- Keep commits clean, focused, and imperative/conventional (`docs: ...`, `feat: ...`, `fix: ...`, `chore: ...`).
- Never commit `.env*` secrets, `node_modules/`, or build artifacts.
- Remote origin will be configured later when provided by the user.

---

## Design & UX Standards (Pending Finalization)

- Support both **Light** and **Dark** themes with clean, accessible contrast and smooth theme switching.
- Feature intentional **3D animations** that enhance depth and interactivity without sacrificing performance, readability, or reduced-motion accessibility (`prefers-reduced-motion`).
- Use **modern, stylish typography** and a cohesive **color scheme** finalized with the user before UI scaffolding begins.
