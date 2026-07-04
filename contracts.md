# Birthdayflix — Backend Contracts

## Goal
Persist Simran's photos & videos (and profiles) in MongoDB so uploads survive across devices/reloads.

## Data Model
### Collection: `media_items`
```
{ id, title, description, category_id, type ('photo'|'video'), image (base64 or URL), year, duration, tag, created_at }
```
### Collection: `profiles`
```
{ id, name, avatar, color }
```
Categories are static (defined in code): c1 Birthday Highlights, c2 Memories with Simran, c3 Family & Friends, c4 Trending Now.

## Seeding
On startup, if `media_items` is empty, seed with the items currently in `frontend/src/mock.js`. If `profiles` is empty, seed 4 profiles (Simran, Family, Friends, Kids).

## API (all prefixed with `/api`)
| Method | Path | Body | Response |
|---|---|---|---|
| GET | `/categories` | — | `[{ id, title, items: [...] }]` |
| GET | `/profiles` | — | `[{ id, name, avatar, color }]` |
| GET | `/hero` | — | `{ title, subtitle, description, backdrop, year, duration, rating, match }` |
| POST | `/media` | `{ title, description, category_id, type, image, year?, duration? }` | new item |
| DELETE | `/media/{id}` | — | `{ ok: true }` |
| POST | `/reset` | — | `{ ok: true }` (re-seeds defaults) |

`image` may be a base64 data URL (for uploaded files) or an external URL.

## Frontend Integration
Replace `MediaContext` local/localStorage logic with axios calls:
- On mount: `GET /api/categories`, `GET /api/profiles`, `GET /api/hero`
- Add media: `POST /api/media` then refetch categories
- Remove media: `DELETE /api/media/{id}` then refetch
- Reset: `POST /api/reset` then refetch

Active profile still saved in localStorage (client-side only concept).

## Mocks Being Replaced
- `mock.js` still used server-side as SEED source; on frontend it's used only as an interim fallback if API fails.

## Environment
- Backend `MONGO_URL` from `.env` (already set)
- Frontend `REACT_APP_BACKEND_URL` from `.env`, all calls use `${REACT_APP_BACKEND_URL}/api/...`
