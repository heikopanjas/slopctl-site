# slopctl-site

The landing page and documentation site for [slopctl](https://github.com/heikopanjas/slopctl),
built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). Served
at [panjas.com/slopctl](https://panjas.com/slopctl).

This repo is **private** because `public/fonts/triplicate_b_code_*.woff2` is a licensed copy
of Matthew Butterick's Triplicate B Code, used here under license and not for redistribution.

## Fonts

- **IBM Plex Sans** (headings and body) — self-hosted via `@fontsource/ibm-plex-sans`
  (OFL-1.1), no Google Fonts request at runtime; headings differ from body only by weight
  (semibold), not typeface
- **Triplicate B Code** (monospace, code blocks) — licensed copy, vendored at
  `public/fonts/`, `@font-face`-declared in `src/styles/custom.css`

No CDN calls of any kind (no Google Fonts, no Font Awesome — Starlight bundles its own icons).

## Development

```bash
npm install
npm run dev       # http://localhost:4321/slopctl
```

Note the `/slopctl` path in dev URLs too — `astro.config.mjs` sets `base: '/slopctl'` to
match the production subpath, so every internal link must be written relative to that base
(Starlight's own nav and generated links handle this automatically; hand-written links in
MDX must start with `/slopctl/...`).

## Build

```bash
npm run build      # outputs to dist/
npm run preview    # serve the built output locally, also under /slopctl
```

## Content

Docs live in `src/content/docs/` as Markdown/MDX, mirroring the structure of the main
[slopctl README](https://github.com/heikopanjas/slopctl/blob/develop/README.md). When the
CLI gains a new command or the template catalog gains a new agent or language, update both:
this site is not generated from the README, so the two can drift if only one is edited.

## Theming

`src/styles/custom.css` overrides Starlight's CSS custom properties (`--sl-font`,
`--sl-font-mono`, `--sl-color-*`) rather than forking any Starlight components. The palette
is seeded from [panjas.com](https://panjas.com)'s `#f9f9f9` / `#303030` / `#bf616a`, extended
with a dark-mode variant.

## Deployment

Deploys the same way the parent [panjas.com](https://panjas.com) Jekyll site does: build,
then `rsync` the static output over SSH. No nginx or Certbot changes are needed — the server
serves `/var/www/panjas.com/` as a plain static root (`try_files $uri $uri/ $uri.html
=404;`), so anything placed at `/var/www/panjas.com/slopctl/` is automatically live at
`panjas.com/slopctl/`.

```bash
./serve-site.sh    # local dev server with hot reload, http://localhost:4321/slopctl
./build-site.sh    # production build only, outputs to dist/
./deploy-site.sh   # build, then rsync dist/ to heiko@panjas.com:/var/www/panjas.com/slopctl/
```

`deploy-site.sh` creates the remote `slopctl/` directory on first run and uses `--delete` to
prune files removed locally — scoped to that subdirectory only, so it never touches the rest
of `/var/www/panjas.com/`.

The parent Jekyll site's own `deploy-site.sh` (`/Users/heiko/_repos/Site/deploy-site.sh`)
excludes `slopctl/` from its `rsync --delete`, so a blog deploy never erases this site.

Search only works against a real build — `astro dev` (what `serve-site.sh` runs) never
builds the Pagefind index, so Cmd+K shows "Search is only available in production builds"
during local dev. Use `npm run build && npm run preview` to test search locally.

## License

MIT — see [LICENSE](LICENSE). Does not cover the vendored Triplicate B Code font, which is
used under its own commercial license.
