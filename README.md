# Hallcraft

An event-space planning and floor-plan studio. Design a room in metres, place stages, tables, bars and service areas, check seating and circulation, and share a read-only plan. Built with Next.js, React, TypeScript and Tailwind CSS.

Everything runs in the browser. Account sessions, designs, templates and shared plans are stored in `localStorage`, so there is no backend, database or AI API to configure. The layout generator is a local rules engine.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

```bash
npm run typecheck   # tsc --noEmit
npm run build       # production build
npm run start       # serve the production build
```

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login`, `/signup` | Local account access |
| `/dashboard` | Studio overview, stats and room checks |
| `/dashboard/designs` | Saved designs with search, sort and status |
| `/dashboard/templates` | Starting layouts built by the floor-plan engine |
| `/dashboard/library` | Furniture and equipment definitions |
| `/dashboard/team` | Collaborators and invitations |
| `/dashboard/settings` | Studio and profile settings |
| `/studio/[id]` | 2D floor-plan editor |
| `/p/[id]` | Public read-only plan |

## Deploying to Vercel

1. Import `izzychils/hallcraft` in Vercel.
2. Keep the detected framework preset as **Next.js**.
3. Build command: `npm run build`. Output directory: leave the default (`.next`).
4. No environment variables are required.

No `vercel.json` is needed. This project uses the Next.js App Router, so Vercel maps every route to its own page or serverless function, including direct visits to `/studio/[id]` and `/p/[id]`.

Shopperly (`shopperly-fe`) is a Vite single-page app and needs the catch-all rewrite in its `vercel.json`. Do not copy that rewrite here: sending every path to `index.html` would break Hallcraft's routes.

## Notes

- Designs are scoped to the browser. Clearing site data resets the workspace to the seeded demo plans.
- The public share link points at the same browser-local design, so it is a front-end preview rather than a server-hosted document.
- The "AI" brief parser and layout generator are deterministic and run offline.
