---
title: models
summary: "Manage the global model defaults catalog."
group: setup
order: 3
---

Download, update, verify, or browse the global model defaults catalog
(`model-defaults.yml`). It defines LLM provider configurations used by `merge` and
`doctor --smart`: API endpoints, API key environment variables, and default model
identifiers.

## Usage

```bash
slopctl models --update [--from <PATH or URL>] [--dry-run]
slopctl models --verify [--from <PATH or URL>]
slopctl models --list
```

## Options

- `--update` / `-u` — download or update global model defaults from source
- `--verify` / `-V` — validate local `model-defaults.yml` and compare it with the configured
  source
- `--list` / `-l` — show known providers, their default models, and endpoints (from the
  catalog, no live API calls)
- `--from` / `-f` — path or URL used by `--update` and `--verify`
- `--dry-run` / `-n` — preview what would be downloaded (requires `--update`)

`templates --update` bootstraps `model-defaults.yml` only when it is missing. Use
`merge --list-models` to query the live model list from the resolved provider.
