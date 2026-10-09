---
title: merge
summary: "AI-assisted merge of customized files with updated templates."
group: maintain
order: 6
---

Merge customized workspace files with updated templates using AI assistance. `merge` runs
the same workflow as `init` but resolves conflicts via an LLM instead of prompting the user.
By default, merged content replaces the original file directly. Use `--preview` to write
`.merged` sidecar files for manual review instead.

The provider is resolved from the `merge.provider` config key, or auto-detected from
environment variables (`ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MISTRAL_API_KEY`, checked in
that order). The model is resolved from `merge.model`, or the provider's default. There are
no `--provider`/`--model` CLI flags. Configure via `slopctl config --set merge.provider <name>`
or env vars.

## Usage

```bash
slopctl merge                                    # Merge using config/env provider
slopctl merge --lang rust                        # Override detected language
slopctl merge --agent cursor                     # Override detected agent
slopctl merge --mission "My new mission"         # Use a custom mission for the fresh template
slopctl merge --preview                          # Write .merged sidecars instead of replacing
slopctl merge --dry-run                          # Show candidates without calling the LLM
slopctl merge --verbose                          # Show token usage summary after merging
slopctl merge --list-models                      # List available models from the resolved provider
```

## Options

- `--lang` / `-l`: programming language override; falls back to the installed language
  detected by the file tracker
- `--agent` / `-a`: AI coding agent override; falls back to agents detected in the workspace
- `--mission` / `-m`: custom mission statement for the fresh template (`@filename` to read
  from a file)
- `--preview`: write `.merged` sidecar files instead of replacing originals
- `--dry-run` / `-n`: show merge candidates without calling the LLM
- `--list-models` / `-L`: list available models from the resolved provider
- `--verbose` / `-v`: show a token usage summary after merging (input/output tokens, stop
  reason); warns if any file was truncated due to max token limits

**Provider priority:** config `merge.provider` → environment auto-detect → error.

**Changelog preservation:** for files carrying the `<!-- {changelog} -->` marker
(`AGENTS.md`-style templates, `UPDATES.md`), only the content above the marker is compared
and merged; the user-owned log below the marker is never sent to the LLM and is re-attached
verbatim.

**Merge candidates:** files that are both user-modified (SHA changed since install) *and*
have an updated template source: tracked files, skill files, and untracked files that exist
on disk with a matching template source. Without `--agent`, all agents detected in the
workspace are included.
