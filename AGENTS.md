# AGENTS.md

Guidance for coding agents working in this Vite React app.

## App Context

- This is a Vite frontend using React 19, React Router 7, Tailwind CSS 4, and Axios.
- Entry point: `src/main.jsx`.
- Route shell: `src/App.jsx`.
- Layout and page views live in `src/views/`.
- Reusable UI components live in `src/components/`.
- Static public assets live in `public/`; imported source assets live in `src/assets/`.

## Commands

- Install dependencies: `npm install`
- Start dev server: `npm run dev`
- Build production assets: `npm run build`
- Run linting: `npm run lint`
- Preview production build: `npm run preview`

## Coding Conventions

- Use functional React components and JSX files for components and views.
- Keep route definitions in `src/main.jsx` unless the routing structure becomes large enough to justify extracting them.
- Prefer React Router primitives for navigation and nested layout routing.
- Keep API calls isolated enough that endpoint changes are easy to update.
- Use Tailwind utility classes consistently with the existing styling approach.
- Avoid adding state management libraries unless local React state and route-level data flow are insufficient.

## Environment

- Vite environment variables must use the `VITE_` prefix.
- The compose setup may provide `VITE_API_URL`; keep frontend API configuration compatible with local backend defaults.
- Do not commit secrets or local-only environment files.

## Verification

After frontend changes, run the most relevant available checks:

- `npm run lint`
- `npm run build`
- Manual browser check through `npm run dev` for UI or routing changes.

