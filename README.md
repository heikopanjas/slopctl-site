# slopctl-site

The landing page and command reference for [slopctl](https://github.com/heikopanjas/slopctl),
built with [Astro](https://astro.build) and published to GitHub Pages at
**[slopctl.me](https://slopctl.me/)**.

The visual design (dark studio-console look, Instrument Serif / Inter Tight / JetBrains Mono)
follows [agent-capabilities](https://heikopanjas.github.io/agent-capabilities/);
`public/assets/style.css` is copied from that project and `public/assets/site.css` holds
slopctl-specific additions.

## Structure

- `src/pages/index.astro` is the one-page landing site
- `src/pages/commands/[slug].astro` renders one page per CLI command
- `src/content/commands/*.md` holds the command docs (frontmatter: `title`, `summary`, `group`, `order`)
- `src/data/site.ts` holds landing-page data: agents, languages, install steps, FAQ
- `src/layouts/Layout.astro` and `src/components/` hold the shared shell

The site is not generated from the slopctl README. When the CLI gains a command or the
catalog gains an agent or language, update the matching file here too.

## Development

```bash
npm install
npm run dev       # http://localhost:4321/
npm run build     # outputs to dist/
npm run preview
```

`./serve-site.sh` and `./build-site.sh` wrap the same commands. Node 22+ is required.

## Deployment

Pushes to `main` run `.github/workflows/pages.yml`, which builds the site and deploys it
with GitHub Pages (Settings → Pages → Source: GitHub Actions). The custom domain `slopctl.me` is set in
Pages settings and in `public/CNAME`; DNS is at Hover (four `A` records to GitHub, `www` CNAME to
`heikopanjas.github.io`).

The build reads the latest slopctl release from the GitHub API and shows it in the hero. A
rebuild is triggered by a `slopctl-release` repository dispatch, by a daily schedule as a
fallback, or manually. To send the dispatch, add this job to the slopctl release workflow
(`SITE_DISPATCH_TOKEN` is a fine-grained PAT with Contents: read/write on this repo):

```yaml
on:
  release:
    types: [published]
jobs:
  notify-site:
    runs-on: ubuntu-latest
    steps:
      - run: >
          gh api repos/heikopanjas/slopctl-site/dispatches
          -f event_type=slopctl-release
        env:
          GH_TOKEN: ${{ secrets.SITE_DISPATCH_TOKEN }}
```

## License

MIT, see [LICENSE](LICENSE).
