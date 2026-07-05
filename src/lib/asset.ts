/**
 * Base-aware asset helper — resolves a public asset against Vite's BASE_URL
 * so paths work both at the dev root and under the GitHub Pages subpath
 * (`/tori-saas/`). Always pass a path relative to `public/`.
 *
 *   asset("og.jpg")  →  "/tori-saas/og.jpg"  (in production)
 */
export const asset = (path: string): string =>
  `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
