---
title: templates
summary: "Manage the global template catalog."
group: setup
order: 1
---

Download, update, or browse the global template catalog.

## Usage

```bash
slopctl templates --update [--from <PATH or URL>] [--dry-run]
slopctl templates --verify [--from <PATH or URL>]
slopctl templates --list
slopctl templates --update --verify --list
```

## Options

- `--update` / `-u` — download or update global templates from source
- `--verify` / `-V` — validate the local template catalog (YAML structure, local file
  integrity, source freshness). Returns a non-zero exit code if any issue is found (useful
  for CI)
- `--list` / `-l` — show available agents, languages, and skills
- `--from` / `-f` — path or URL used by `--update` (download source) and `--verify`
  (freshness check)
- `--dry-run` / `-n` — preview what would be downloaded (requires `--update`)

At least one of `--update`, `--verify`, or `--list` is required. All three can be combined;
execution order is `--update` → `--verify` → `--list`.

## Examples

```bash
# Update global templates from the default repository
slopctl templates --update

# Update from a custom URL
slopctl templates --update --from https://github.com/user/repo/tree/branch/templates

# Update from a local path
slopctl templates --update --from /path/to/templates

# Preview what would be downloaded
slopctl templates --update --dry-run

# Validate local catalog (YAML structure, file integrity, source freshness)
slopctl templates --verify

# Validate against a specific source (for freshness check)
slopctl templates --verify --from https://github.com/user/repo/tree/branch/templates

# Browse available agents, languages, and skills
slopctl templates --list

# Update, validate, and then show what is available
slopctl templates --update --verify --list
```

## Behavior

- Downloads templates from the specified source or the default GitHub repository
- If `--from` is not specified, downloads from
  `https://github.com/heikopanjas/slopctl-templates/tree/develop/templates`
- Downloads `templates.yml` and all template files
- Stores templates in the global cache directory: `$HOME/.cache/slopctl/templates`
  (`$XDG_CACHE_HOME/slopctl/templates` if `XDG_CACHE_HOME` is set) — same on all platforms
- With `--dry-run`, shows the source URL and target directory without downloading
- Overwrites existing global templates with new versions
- Does **not** modify any files in the current project directory

**`--verify` checks three things in sequence:**

- **YAML structure** — parses `templates.yml`, checks version, checks for duplicate targets
- **Local file integrity** — every non-URL `source` referenced in `templates.yml` must exist
  in the local cache
- **Source freshness** — fetches `templates.yml` from the configured source and compares it
  with the local copy; a mismatch recommends `slopctl templates --update`

Run `templates --update` first to download templates before using `init` to set up a project.

## GitHub rate limits

slopctl does not use GitHub authentication tokens. Unauthenticated access is subject to
GitHub limits (~60 REST API requests/hour per IP, plus throttling on
`raw.githubusercontent.com`). During `templates --update`, URL-based skill repositories are
fetched with **one tarball download per repository** instead of recursive Contents API
listing. HTTP 429/503 responses are retried with backoff. If limits are still exceeded, wait
and retry. Use `update` to refresh workspace files from the local cache without additional
network calls.
