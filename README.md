# slopctl-site

The landing page and documentation site for [slopctl](https://github.com/heikopanjas/slopctl),
built with [Astro](https://astro.build) and [Starlight](https://starlight.astro.build). Served
at [panjas.com/slopctl](https://panjas.com/slopctl).

This repo is **private** because `public/fonts/triplicate_b_code_*.woff2` is a licensed copy
of Matthew Butterick's Triplicate B Code, used here under license and not for redistribution.

## Fonts

- **Cormorant** (headings/hero only) — self-hosted via `@fontsource/cormorant` (OFL-1.1), no
  Google Fonts request at runtime
- **Triplicate B Code** (monospace, code blocks) — licensed copy, vendored at
  `public/fonts/`, `@font-face`-declared in `src/styles/custom.css`
- **System sans stack** — body copy

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

Not yet wired up. `/Users/heiko/_repos/Site/deploy-site.sh` (the panjas.com Jekyll site)
rsyncs with `--delete`, which would erase a `/slopctl/` subdirectory placed under its
document root on the next parent deploy — either exclude `slopctl/` from that script, or
deploy this site to its own directory with a dedicated nginx `location /slopctl { alias ...; }`
block.

## License

MIT — see [LICENSE](LICENSE). Does not cover the vendored Triplicate B Code font, which is
used under its own commercial license.
