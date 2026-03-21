# Bug Fix: Blank Application

## Diagnosis

After thorough analysis of the codebase, build pipeline, and deployment configuration, the root cause of the blank/broken application is a **critical nginx MIME type configuration bug** introduced by the previous fix attempt.

### Root Cause: nginx `types` directive overrides all MIME types

In `nginx.conf` (lines 8–11):

```nginx
include /etc/nginx/mime.types;
types {
    application/javascript js mjs;
}
```

Per [nginx documentation](https://nginx.org/en/docs/http/ngx_http_core_module.html#types), a `types {}` block **completely replaces** all previously defined MIME mappings — it does not merge. This means:

- The `include /etc/nginx/mime.types;` loads all standard types
- The immediately following `types { ... }` block **discards everything** and replaces it with only `application/javascript js mjs;`
- **CSS files are NOT served as `text/css`** — they get `application/octet-stream` (the default)
- Modern browsers refuse to apply stylesheets served with incorrect MIME types (strict MIME type checking / CORB)

### Effect

Without CSS loaded:
- Body has default white background instead of dark `#0a0a0f`
- No flex centering — elements stack at top-left
- Canvas still renders (JS loads correctly since `.js` is mapped) but appears on a white page without styling
- HUD text and buttons visible but unstyled
- The overall appearance is "blank" or severely broken compared to the intended dark-themed game UI

### Secondary Issue: Default nginx already handles MIME types correctly

The original Dockerfile (before the fix attempt) used `nginx:alpine` which inherits `include /etc/nginx/mime.types;` at the `http` block level in the main `nginx.conf`. The default server block serves all standard file types correctly. The custom `types {}` block in the fix actually **broke** what was working.

## Fix Approach

### 1. Fix `nginx.conf` — Remove the `types` override

Remove the `types {}` block entirely. The `include /etc/nginx/mime.types;` is sufficient, and nginx:alpine's default `mime.types` already maps `.js` and `.mjs` to `application/javascript`.

**Before:**
```nginx
include /etc/nginx/mime.types;
types {
    application/javascript js mjs;
}
```

**After:**
```nginx
include /etc/nginx/mime.types;
```

### 2. Verify all existing changes are correct

The other changes from the prior fix are sound:
- `base: './'` in `vite.config.ts` — correct, produces relative asset paths
- `Dockerfile` copies custom nginx config — correct
- `.dockerignore` — correct
- Canvas dimensions in HTML — correct (624x520 matches `12*52` x `10*52`)

## Files to Change

- `nginx.conf` — Remove `types {}` block (lines 9–11)

## Tech Stack

- Vite 6.x (bundler)
- TypeScript 5.6 (language)
- Vanilla Canvas 2D API (rendering)
- nginx:alpine (Docker serving)
- No runtime dependencies

## Verification

1. `npm run build` succeeds
2. Built HTML references assets with relative paths (`./assets/...`)
3. nginx config is valid: `types {}` block removed, `include mime.types` retained
4. CSS file served with correct `text/css` MIME type
5. App renders title screen: dark background, "QUANTUM RUNNER" in cyan, pulsing "Press ENTER" prompt
6. Game is playable: click/Enter starts game, grid with entities appears, Accept/Pass buttons work

## Sources

- nginx `types` directive documentation: https://nginx.org/en/docs/http/ngx_http_core_module.html#types
- Vite `base` config: https://vitejs.dev/config/shared-options.html#base
