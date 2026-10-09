---
title: agents
summary: "Manage the global agent defaults catalog."
group: setup
order: 2
---

Download, update, verify, or browse the global agent defaults catalog. This catalog defines
agent filesystem conventions such as prompt directories, skill directories, workspace
detection markers, and whether an agent reads `.agents/skills/`.

## Usage

```bash
slopctl agents --update [--from <PATH or URL>] [--dry-run]
slopctl agents --verify [--from <PATH or URL>]
slopctl agents --list
slopctl agents --update --verify --list
```

## Options

- `--update` / `-u` — download or update global agent defaults from source
- `--verify` / `-V` — validate local `agent-defaults.yml` and compare it with the configured
  source
- `--list` / `-l` — show known agents and their default prompt, skill, and marker paths
- `--from` / `-f` — path or URL used by `--update` and `--verify`
- `--dry-run` / `-n` — preview what would be downloaded (requires `--update`)

At least one of `--update`, `--verify`, or `--list` is required. All three can be combined;
execution order is `--update` → `--verify` → `--list`.

`templates --update` bootstraps `agent-defaults.yml` only when it is missing. After that, use
`agents --update` to update agent defaults independently from templates.

## User-defined agents

Add an agent the default catalog does not ship with a small `agent.yml` overlay. No fork and
no catalog edit needed. Each agent lives in `agents/<name>/agent.yml` in one of two places:

- **Global**: `$XDG_CONFIG_HOME/slopctl/agents/<name>/` (or `~/.config/slopctl/agents/<name>/`),
  available in every workspace
- **Workspace**: `<workspace>/.slopctl/agents/<name>/`, which can be committed to share the
  agent with your team. A workspace overlay wins over a global overlay of the same name

```yaml
# .slopctl/agents/acme/agent.yml
markers: [.acme]                          # directories that signal the agent is in use
prompt_dir: $workspace/.acme/commands
skill_dir: $workspace/.acme/skills
reads_cross_client_skills: false          # true if the agent also scans .agents/skills/
instructions:
  - source: instructions.md               # relative to this directory
    target: $workspace/.acme/instructions.md
skills:
  - source: skills/team-conventions       # a directory containing SKILL.md
```

Then use it like any built-in agent:

```bash
slopctl agents --list            # shows "acme (overlay: workspace)"
slopctl init --agent acme
slopctl update
slopctl templates --verify       # checks the overlay for missing sources and colliding targets
slopctl remove --agent acme
```

`init`, `update`, `merge`, `remove --agent`, `status` and `agents --list` all see overlay
agents.

### Rules

- Overlays are add-only: a name that matches a shipped agent is an error
- `name` is optional and must equal the directory name when given; unknown keys are rejected
- `source` paths are relative to the agent directory. Absolute paths, `..` and URLs are rejected
- Workspace overlays may only use `$workspace` targets and directories; global overlays may
  also use `$userprofile`
- The default templates must still be installed (`slopctl templates --update`). A broken
  overlay makes slopctl commands fail with an error naming the file
