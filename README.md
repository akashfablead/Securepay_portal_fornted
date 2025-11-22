# SecurePay Portal - Frontend

A Vite + React (TypeScript-ready) frontend for SecurePay Portal.

## Prerequisites

- Node.js 18+ and npm
- Backend API running (see `Securepay_portal_backend`)

## Setup

```sh
npm install
```

## Environment variables

Create a `.env` file in the project root (kept untracked). Use this template:

```
# API base URL (used if you switch from proxy to direct baseURL)
VITE_BASE_URL=http://localhost:5000

# Cashfree configuration (frontend reads these)
VITE_CASHFREE_ENV=sandbox        # sandbox | production
VITE_CASHFREE_APP_ID=            # do NOT commit real keys
VITE_CASHFREE_SECRET_KEY=        # do NOT commit real keys
```

Notes:

- The app currently uses a Vite proxy via `src/config/api.js` with `baseURL: "/api"`. Configure Vite dev proxy to point to the backend, or switch to `BASE_URL` usage if needed.
- Never commit real secrets. `.env` is ignored by Git.

## Running in development

```sh
npm run dev
```

Then open the printed local URL.

## Build for production

```sh
npm run build
```

Static assets will be output to `dist/`.

## Preview production build

```sh
npm run preview
```

## Cashfree integration

- Config is in `src/config/cashfree.js` (reads `VITE_CASHFREE_*`).
- For production, set `VITE_CASHFREE_ENV=production` and provide valid `appId` and `secretKey` securely.
- Prefer fetching ephemeral tokens from your backend instead of exposing secrets in the frontend.

## Security & secrets

- `.env` is ignored. If a secret is ever committed, rotate it immediately and purge the history.
- Use a secret manager (e.g., GitHub Secrets, 1Password, Doppler) for CI/CD and sharing.

## Troubleshooting

- Push blocked by GitHub Push Protection for secrets:
  - Remove the secret from files and history, rotate the key, then force-push cleaned history.
- CORS/API errors:
  - Ensure backend is up and the dev proxy or `VITE_BASE_URL` is correct.

## Tech stack

- React, Vite, Tailwind, shadcn-ui
