# Bug Fix: Blank Application

## Diagnosis

After thorough review of the codebase, build configuration, and Dockerfile, the root cause of the blank application is a combination of issues:

### Primary Issue: Missing nginx Configuration

The Dockerfile uses `nginx:alpine` with no custom `nginx.conf`. The default nginx configuration may not correctly serve JavaScript modules with proper MIME types (`application/javascript`) in all versions, and lacks optimal caching headers for a SPA. More critically, the default config doesn't include `try_files` handling appropriate for this app.

### Secondary Issue: Absolute Asset Paths

Vite's default `base: '/'` produces absolute paths in the built HTML (`/assets/index-XXX.js`). While this works when served at the domain root, it's fragile — any reverse proxy subpath or configuration mismatch causes 404s on static assets, resulting in a blank page (JS/CSS never load).

### Contributing Factor: No .dockerignore

Without a `.dockerignore`, the Docker build context includes `node_modules/`, `dist/`, and other unnecessary files, which can cause build issues and slow builds.

### Observable Behavior

When JS fails to load (due to any of the above), the user sees:
- Dark background (`#0a0a0f`) filling the entire viewport
- A tiny 300x150 canvas (HTML default) with a nearly-invisible dark border (`#1a3a2a`)
- HUD elements and buttons that blend into the dark background
- This appears as a "blank" application

## Fix Approach

1. **Add a custom `nginx.conf`** that:
   - Properly serves static assets with correct MIME types
   - Includes appropriate `Content-Type` headers for JS modules
   - Sets `try_files` to fall back to `index.html`
   - Enables gzip for text assets

2. **Update `vite.config.ts`** to use `base: './'` for relative asset paths (more resilient deployment)

3. **Update `Dockerfile`** to copy the custom nginx config

4. **Add `.dockerignore`** to exclude `node_modules`, `dist`, `.git`

5. **Add explicit canvas dimensions in HTML** as a fallback so the canvas area is visible even before JS initializes

## Tech Stack

- Vite 6.x (bundler)
- TypeScript 5.6 (language)
- Vanilla Canvas API (rendering)
- nginx:alpine (Docker serving)
- No runtime dependencies — pure vanilla TS

## Files to Change

- `nginx.conf` — new file, custom nginx configuration
- `Dockerfile` — update to copy nginx.conf
- `vite.config.ts` — add `base: './'`
- `.dockerignore` — new file
- `index.html` — add explicit canvas dimensions

## Verification

- `npm run build` succeeds
- Docker build succeeds (if available)
- `vite preview` serves the app correctly
- App renders title screen on load
- Canvas has correct dimensions (624x520)
- All static assets load with proper MIME types

## Sources

- nginx Docker image documentation
- Vite `base` configuration: https://vitejs.dev/config/shared-options.html#base
- HTML Canvas default dimensions: https://html.spec.whatwg.org/multipage/canvas.html
