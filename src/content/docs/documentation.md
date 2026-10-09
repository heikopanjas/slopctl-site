---
title: Documentation
summary: "How slopctl works, what every command does, and how to extend it with your own templates, skills and agents."
---

## What slopctl does

Every coding agent looks for instructions in a different place. Claude Code reads `CLAUDE.md`, Copilot reads `.github/copilot-instructions.md`, Cursor reads `.cursorrules`, and most of the others read `AGENTS.md`, the file defined by the [agents.md](https://agents.md) standard. Keeping all of those in sync by hand works for about a week.

slopctl gives each workspace one `AGENTS.md` and files everything else around it. Agents that read `AGENTS.md` natively need nothing more. Claude Code, Copilot and Cursor load their own file first, so they get a short stub that points back to `AGENTS.md`. Skills, prompts and config files go into the folders each agent expects.

Three things make that work:

- **The template catalog** is a set of files cached on your machine. It holds the `AGENTS.md` fragments, language conventions, agent prompts and skills, and a `templates.yml` that says where each one goes.
- **The workspace** is your project. `init` assembles `AGENTS.md` from catalog fragments and copies the other files in.
- **The tracker** is a small file in `.slopctl/` that records what slopctl installed and a hash of each file. Later commands use it to tell your edits from untouched files.

slopctl never commits anything. The templates it installs also tell agents to wait for an explicit request before committing, and every destructive command asks before it acts. `--dry-run` previews any of them.

## Installation

slopctl runs on macOS, Linux and Windows. Download the archive for your platform from the [latest GitHub release](https://github.com/heikopanjas/slopctl/releases/latest). The assets are `slopctl-macos.zip`, `slopctl-linux.zip` and `slopctl-windows.zip`, and each contains the binary and the license.

```bash
# macOS (use slopctl-linux.zip on Linux)
curl -LO https://github.com/heikopanjas/slopctl/releases/latest/download/slopctl-macos.zip
unzip slopctl-macos.zip
chmod +x slopctl
sudo mv slopctl /usr/local/bin/
```

```powershell
# Windows (PowerShell). Add the folder to your PATH afterwards.
Invoke-WebRequest https://github.com/heikopanjas/slopctl/releases/latest/download/slopctl-windows.zip -OutFile slopctl-windows.zip
Expand-Archive slopctl-windows.zip -DestinationPath $env:LOCALAPPDATA\slopctl
```

To build from source instead, you need a Rust toolchain:

```bash
git clone https://github.com/heikopanjas/slopctl.git
cd slopctl
cargo build --release
sudo cp target/release/slopctl /usr/local/bin/
# or: cargo install --path .
```

## Your first project

Download the catalog once. It lands in a global cache, so every project on the machine shares it.

```bash
slopctl templates --update
```

Then go to a project and run `init`. You must give it a language, an agent, or both.

```bash
cd your-project
slopctl init --lang rust --agent claude   # Rust conventions plus Claude prompts
slopctl init --agent cursor               # agent only, no language files
```

If you skip the first step, `init` downloads the catalog for you.

### What init installs

For `slopctl init --lang rust`, the workspace ends up like this:

```text
my-rust-project/
├── AGENTS.md                      # the one instruction file
├── UPDATES.md                     # append-only log of updates and decisions
├── .rustfmt.toml                  # Rust formatting config
├── .editorconfig
└── .agents/skills/
    ├── rust-coding-conventions/
    ├── rust-build-commands/
    ├── git-workflow/
    ├── semantic-versioning/
    └── recent-updates/
```

`AGENTS.md` is built from several fragments. The mission and technology stack go in first, then the core principles, a short hint telling agents which coding skills exist, and summaries of the git workflow, versioning and update-log conventions. The Rust conventions themselves live in skills, not in `AGENTS.md`, which keeps the file short.

`UPDATES.md` is the log agents append to when they make a decision. Everything below its changelog marker belongs to you, and `init`, `update` and `merge` leave it alone.

Add `--agent` and you also get that agent's files. The agent's marker directory (`.cursor`, `.claude`, `.opencode` and so on) is created too, which is how later commands notice the agent is installed.

### Checking that an agent reads it

Open the project in your agent and ask it to confirm it has read `AGENTS.md`. A correct answer mentions the no-auto-commit rule, the available coding skills, the git workflow and the build requirements. After that, work as usual. The agent follows the conventions in the file, including conventional commits and waiting for your go-ahead before it commits.

### Picking up template changes

When the catalog changes upstream, refresh the cache first and then the workspace:

```bash
slopctl templates --update   # download the new catalog
slopctl update               # copy changes into this workspace
```

`update` restores missing files and refreshes the ones you have not touched. It skips files you edited and tells you which ones. It never rewrites `AGENTS.md`, because that file is yours. `slopctl merge` is how template changes reach it.

`init` is for adding something new. If everything you ask for is already installed, it stops and points you at `update`, `merge` or `--force`.

## Concepts

### The template catalog

The cache lives at `$HOME/.cache/slopctl/templates/` on every platform, or under `$XDG_CACHE_HOME` if that is set. Three YAML files describe what is in it:

- `templates.yml` maps source files to workspace paths. It defines the main `AGENTS.md`, each agent's files, languages, shared groups, principles, mission text and skills.
- `agent-defaults.yml` records each agent's conventions. That means its prompt and skill directories, the marker directories that show it is installed, and whether it also reads `.agents/skills/`.
- `model-defaults.yml` lists LLM providers with their endpoints, API key variables and default models. `merge` and `doctor --smart` use it.

The default catalog lives in [slopctl-templates](https://github.com/heikopanjas/slopctl-templates). It is a starter set, not a fixed list. Languages and agents are entries in YAML, so you can point slopctl at your own catalog or add entries without touching the CLI. [Template format](#template-format) covers the syntax.

### AGENTS.md is yours

The first `init` assembles `AGENTS.md` from fragments, and from then on slopctl treats the file as customized. `update` never changes it. `init` skips it unless you pass `--force`. `merge` combines your version with the latest templates, using an LLM to resolve conflicts.

Files that carry a changelog marker, like `UPDATES.md`, are split in two. The part above the marker comes from the template, and the log below it is yours. `merge` only ever looks at the part above, and re-attaches the log unchanged.

### Placeholders

Paths in `templates.yml` can use placeholders that resolve at install time. `$workspace` is the current directory and `$userprofile` is your home directory. A target of `$instructions` means the file is a fragment to merge into `AGENTS.md`, not a file to copy.

### Agent Skills

[Agent Skills](https://agentskills.io) are directories with a `SKILL.md` that agents load on demand. slopctl installs them from the catalog with the language, agent or top-level set you chose, and puts them where the installed agents will look. [Skills](#skills) explains the routing rules.

## Everyday tasks

### Add or switch an agent

```bash
slopctl init --agent claude
```

With no `--lang`, `init` reads the language from the tracker and keeps it. A Rust project that used Cursor stays a Rust project when you add Claude. The agent's prompts and skills are added, and for agents that only read their own skill folder, the language skills are copied there too.

### Switch languages

```bash
slopctl remove --lang rust    # deletes .rustfmt.toml, .editorconfig and the language skills
slopctl init --lang c++
```

`remove --lang` deletes the language's files from disk. Text that was already merged into `AGENTS.md` stays, because that file is yours to edit.

### Start without a language

```bash
slopctl init --agent cursor
```

You get `AGENTS.md` with the mission, principles and integration notes, plus the agent's prompts and the top-level skills. There are no coding conventions or config files. That suits documentation repos and projects that mix several languages.

### Combine your edits with new templates

```bash
slopctl merge --preview   # writes .merged files for you to review
slopctl merge             # replaces the originals
```

`merge` needs an LLM provider. See [merge](#merge) for how it picks one. If you would rather throw your edits away, `slopctl init --lang rust --force` reinstalls from the templates.

### Check the workspace

```bash
slopctl doctor --verbose   # list every managed file and its state
slopctl doctor --fix       # repair what can be repaired
```

### Use your own templates

```bash
slopctl templates --update --from https://github.com/yourteam/templates/tree/main/templates
slopctl init --lang rust
```

To make that the default for every command, set `templates.uri` with [config](#config). The source needs a `templates.yml` at its root.

### Remove slopctl files

```bash
slopctl remove --agent claude   # one agent's files
slopctl remove --all            # every agent's files, keeps AGENTS.md
slopctl remove --purge          # everything, including AGENTS.md
```

`--purge` keeps a customized `AGENTS.md` and your `UPDATES.md` log unless you add `--force`.

### Habits that help

- Run `init` early, before the project has history to untangle.
- Commit `AGENTS.md`, the agent files and `.slopctl/`, so the whole team shares one setup and one tracker.
- Give the team one template source, either through `templates.uri` in the workspace config or by committing the config.
- Use `--dry-run` before anything that writes, and `--force` only when you know which files it overwrites.
- Let git be your safety net. slopctl asks before it deletes, but a commit is the better undo.

## Command reference

Every command also has its own page with the complete option list. The sections here explain what each command does and when you would reach for it. `--dry-run` works on anything that writes, and `slopctl <command> --help` always shows the options of your installed version.

### `init`

Installs instructions, config files and skills into the current directory. [Command page](/commands/init/).

```bash
slopctl init --lang <language> [--agent <agent>] [--mission <text|@file>] [--force] [--dry-run]
slopctl init --agent <agent> [--mission <text|@file>] [--force] [--dry-run]
```

- `--lang` picks a language or framework, such as `rust`, `c++`, `swift` or `shell`.
- `--agent` picks an agent, such as `claude`, `copilot`, `codex` or `cursor`.
- `--mission` replaces the default mission statement. Pass text inline, or `@mission.md` to read it from a file.
- `--force` overwrites local files without asking and skips the already-initialized check.
- `--dry-run` lists what would be created or changed.

You need at least one of `--lang` and `--agent`. With only `--agent`, `init` keeps the language the tracker already knows, or installs no language files in a fresh project. If the catalog is not cached yet, `init` downloads it first.

What happens next depends on the options:

- `AGENTS.md` is assembled from the mission, principles, language hint and integration fragments. If you already customized it, `init` leaves it alone unless you pass `--force`.
- `--lang` adds the language's config files and its skills, including skills inherited through `includes`.
- `--agent` adds that agent's instruction stub, prompts and skills, and creates any directories the agent declares, such as `.cursor/plans`.
- Tracked files you modified are skipped, so your local version stays. `merge` is how those get updated, and `--force` overwrites them.

If every language and agent you name is already installed, `init` stops with a pointer to `update`, `merge` or `--force`. Adding anything new goes ahead as normal.

```bash
slopctl init --lang rust --mission "A command-line tool for managing agent instructions"
slopctl init --lang rust --mission @mission.md
slopctl init --lang swift --force
```

### `update`

Refreshes installed files from the local template cache. It never touches the network. [Command page](/commands/update/).

```bash
slopctl update                                   # whole workspace
slopctl update --skill rust-coding-conventions   # one skill
slopctl update --file .rustfmt.toml              # one file
slopctl update --force                           # also overwrite customized files
```

- `--file <path>` refreshes one workspace file. It can be repeated.
- `--skill <name>` (`-s`) refreshes one skill as a whole. It can be repeated.
- `--lang` (`-l`) and `--agent` (`-a`) override the scope, which otherwise comes from the tracker and the agents detected in the workspace.
- `--force` (`-f`) overwrites files you customized or that the tracker does not know.
- `--dry-run` (`-n`) previews.

With no selectors, `update` goes through every installed language and detected agent. It restores tracked files that went missing, refreshes files that are still pristine, and reports the files it skipped. With selectors, it handles only those targets, and a customized target is an error unless you add `--force`.

A few rules are worth knowing:

- `AGENTS.md` and changelog-marker files like `UPDATES.md` are never refreshed, under any flag. `--file UPDATES.md` is an error. Use `merge`.
- A `--file` path inside a skill directory is rejected. Refresh the skill with `--skill`, so files removed upstream get deleted too. Files you added to a skill directory yourself are kept.
- Agent instruction and prompt files are only recreated for agents that slopctl installed. An agent that was merely detected through its marker directory gets skills but no agent files. `update` reports this with a `slopctl init --agent <name>` hint, and `--force` does not change it.

### `merge`

Combines customized files with the latest templates, using an LLM to settle conflicts. It runs the same workflow as `init`, but where `init` would ask you, `merge` asks the model. [Command page](/commands/merge/).

```bash
slopctl merge                       # merge using the configured provider
slopctl merge --preview             # write .merged files and leave originals alone
slopctl merge --dry-run             # list candidates without calling the LLM
slopctl merge --lang rust --agent cursor
slopctl merge --list-models         # models offered by the resolved provider
slopctl merge --verbose             # token usage after the merge
```

- `--lang` (`-l`) and `--agent` (`-a`) override what slopctl detects.
- `--mission` (`-m`) supplies a mission statement for the fresh template.
- `--preview` writes `.merged` sidecar files for review.
- `--dry-run` (`-n`) shows the candidates only.
- `--list-models` (`-L`) lists the provider's models.
- `--verbose` (`-v`) prints input and output tokens and the stop reason, and warns if a file was cut off by the token limit.

A file is a merge candidate when you changed it and the template it came from has also changed. That covers tracked files, skill files, and untracked files on disk that have a matching template source. Without `--agent`, every agent detected in the workspace takes part.

The provider comes from the `merge.provider` config key, or failing that from whichever API key variable is set, checked in this order: `ANTHROPIC_API_KEY`, `OPENAI_API_KEY`, `MISTRAL_API_KEY`. The model comes from `merge.model` or the provider's default. There are no `--provider` or `--model` flags. Set them once:

```bash
slopctl config --set merge.provider anthropic
slopctl config --global --set merge.model claude-sonnet-5
```

For files with a changelog marker, only the part above the marker is sent to the model. Your log below it is attached again unchanged.

### `remove`

Deletes agent, language or all slopctl files from the current directory. [Command page](/commands/remove/).

```bash
slopctl remove --agent claude
slopctl remove --lang rust
slopctl remove --lang rust --agent cursor
slopctl remove --all
slopctl remove --purge
```

- `--agent` removes the agent's instruction, prompt and skill files.
- `--lang` removes the language's config files and skills. Fragments already merged into `AGENTS.md` stay.
- `--all` removes every agent's files and skills and keeps `AGENTS.md`.
- `--purge` does what `--all` does and removes `AGENTS.md` as well.
- `--force` skips the confirmation. With `--purge` it also overrides the protection for a customized `AGENTS.md`.
- `--dry-run` shows what would go.

`--all` and `--purge` cannot be combined with each other or with `--agent` and `--lang`. You must give at least one of the four.

`remove` shows the list of files and asks before deleting, then cleans up empty parent directories. It builds that list from the catalog, from tracked files that only the removed agent owns, and from the agent's own directories. It also releases the agent's or language's ownership on shared files, so files shared with another agent stay in place. `UPDATES.md` survives `remove` and `--purge`, and only `--purge --force` deletes it. The global cache is never touched.

### `doctor`

Looks for stale or broken managed files. [Command page](/commands/doctor/).

```bash
slopctl doctor              # report problems
slopctl doctor --verbose    # also list every file checked
slopctl doctor --fix        # repair what can be repaired
slopctl doctor --fix --dry-run
slopctl doctor --smart      # LLM review of AGENTS.md
```

It reports three kinds of problem:

| Problem | Meaning | What `--fix` does |
| --- | --- | --- |
| Missing (`✗`) | The tracker lists a file that no longer exists. | Removes the tracker entry. Run `slopctl update` to bring the file back. |
| Unmerged (`✗`) | `AGENTS.md` still contains the template marker. | Strips the marker so the file counts as customized. Run `slopctl merge` for a full re-merge. |
| Modified (`!`) | A file changed since install. | Nothing. This is informational. Use `merge`, or `update --force` to overwrite. |

`AGENTS.md` and changelog-marker files never show up as Modified, since you are expected to edit them.

With `--smart`, `doctor` runs the normal checks and then asks an LLM to read `AGENTS.md` for contradictions, stale references and unclear instructions. The provider is resolved the same way as for `merge`.

```text
Checking workspace files:

  ✓ OK:       .cursor/commands/init-session.md
  ✗ Missing:  .editorconfig
  ✗ Unmerged: AGENTS.md
  ! Modified: .rustfmt.toml

  ✗ 1 stale tracker entry
  ✗ 1 file with unmerged template marker
  ! 1 modified file (no automatic fix available)

→ Run 'slopctl doctor --fix' to automatically fix issues
```

### `status`

Shows what is installed, globally and in this workspace. [Command page](/commands/status/).

```bash
slopctl status      # summary
slopctl status -v   # plus every managed file
```

The output has two parts. The global part says whether the catalog is installed and where, which template version it uses, and which agents and languages it offers. The project part says whether `AGENTS.md` exists and is customized, which agents are installed (found through their marker directories), which languages are installed (from the tracker) and which skills.

```text
Global Templates:
  ✓ Installed at: /Users/.../slopctl/templates
  → Template version: 5
  → Available agents: claude, cline, codex, copilot, cursor, goose, kiro, opencode, pi, vibe
  → Available languages: c, c++, rust, shell, swift, swiftui

Project Status:
  ✓ AGENTS.md: exists (customized)
  ✓ Installed agents: claude, cursor
  ✓ Installed languages: rust
  ✓ Installed skills: 5
```

To browse the catalog on its own, use `slopctl templates --list`.

### `templates`

Manages the global template catalog. [Command page](/commands/templates/).

```bash
slopctl templates --update [--from <path or url>] [--dry-run]
slopctl templates --verify [--from <path or url>]
slopctl templates --list
slopctl templates --update --verify --list
```

- `--update` (`-u`) downloads the catalog and replaces the cached copy.
- `--verify` (`-V`) checks the cached catalog and exits non-zero on any problem, so it works in CI.
- `--list` (`-l`) shows the available agents, languages and skills.
- `--from` (`-f`) sets the source for `--update`, or the source to compare against for `--verify`. It takes a local path or a GitHub URL.
- `--dry-run` (`-n`) shows the source and target without downloading.

Give it at least one of `--update`, `--verify` and `--list`. When combined they always run in that order.

Without `--from`, the source is `templates.uri` from the config, or the default `slopctl-templates` repository. If the primary source fails and `templates.fallbackUri` is set, that one is tried next. Nothing in your project directory changes.

`--verify` runs three checks in sequence. It parses `templates.yml`, checking the version and looking for duplicate targets. It confirms that every local `source` file exists in the cache. Then it fetches `templates.yml` from the configured source and compares it with your copy, recommending `templates --update` if they differ. It also cross-checks that every agent in `templates.yml` appears in `agent-defaults.yml`, and it validates [user-defined agents](#adding-a-user-defined-agent).

slopctl does not use GitHub tokens, so unauthenticated limits apply: about 60 API requests an hour per IP, and throttling on `raw.githubusercontent.com`. To stay within them, skill repositories given as URLs are fetched with one tarball download per repository, and HTTP 429 and 503 responses are retried with backoff. If you still hit the limit, wait and run `templates --update` again. `update` needs no network, so refreshing a workspace from the cache is always possible.

### `agents`

Manages the global agent defaults, `agent-defaults.yml`. [Command page](/commands/agents/).

```bash
slopctl agents --update [--from <path or url>] [--dry-run]
slopctl agents --verify [--from <path or url>]
slopctl agents --list
```

The options match `templates`. `--list` prints each known agent with its prompt directory, skill directory and marker paths. [User-defined agents](#adding-a-user-defined-agent) appear in the list with their origin.

`templates --update` only creates `agent-defaults.yml` if it is missing. After that, `agents --update` is how you update it, and you can do so without updating the templates.

### `models`

Manages the model defaults, `model-defaults.yml`. [Command page](/commands/models/).

```bash
slopctl models --update [--from <path or url>] [--dry-run]
slopctl models --verify [--from <path or url>]
slopctl models --list
```

The file describes each LLM provider that `merge` and `doctor --smart` can use, with its API endpoint, the environment variable for its key, and a default model. `--list` reads this file and makes no API calls. To see which models a provider offers right now, use `slopctl merge --list-models`.

### `config`

Reads and writes persistent settings. [Command page](/commands/config/).

```bash
slopctl config --set <key> <value>      # write to the workspace config
slopctl config --global --set <k> <v>   # write to the global config
slopctl config <key>                    # effective value
slopctl config --list                   # all effective values, with origin
slopctl config --delete <key>           # remove from the workspace config
```

Keys look like `<command>.<parameter>`. There are two scopes. The workspace config is `.slopctl/config.yml` in the project. The global config is `~/.config/slopctl/config.yml`, or under `$XDG_CONFIG_HOME` if set. Writes go to the workspace unless you pass `--global`. Reads return the effective value, where the workspace wins and the global file is the fallback. `--list` tags each key with `[workspace]` or `[global]`.

| Key | What it sets |
| --- | --- |
| `templates.uri` | Default source for `templates --update`, and for `init` when it has to download the catalog. A URL or a local path. |
| `templates.fallbackUri` | Source to try when the primary one fails. |
| `agents.uri` | Default source for `agents --update`, and for bootstrapping `agent-defaults.yml`. |
| `agents.fallbackUri` | Fallback for agent defaults. |
| `models.uri` | Default source for `models --update`. |
| `models.fallbackUri` | Fallback for model defaults. |
| `merge.provider` | LLM provider for `merge`: `openai`, `anthropic`, `ollama` or `mistral`. |
| `merge.model` | Model for `merge`. |

When `agent-defaults.yml` or `model-defaults.yml` is missing during `templates --update`, slopctl fetches it from `agents.uri` (or `models.uri`), then from that key's fallback, then from the default repository. An empty config file is valid and means all defaults.

```bash
# a template source for this project only
slopctl config --set templates.uri /Users/me/work/my-templates

# a team-wide source, with a fallback
slopctl config --global --set templates.uri https://github.com/myteam/templates/tree/main/templates
slopctl config --global --set templates.fallbackUri https://github.com/heikopanjas/slopctl-templates/tree/develop/templates

# drop the workspace override and fall back to the global value
slopctl config --delete templates.uri
```

### `completions`

Prints a completion script for your shell. [Command page](/commands/completions/).

```bash
slopctl completions zsh > ~/.zsh/completions/_slopctl
slopctl completions bash > ~/.bash_completion.d/slopctl
slopctl completions fish > ~/.config/fish/completions/slopctl.fish
slopctl completions powershell > slopctl.ps1
```

## Supported agents and languages

### Agents

One `AGENTS.md` serves every agent in the default catalog:

| Agent | Vendor | Session prompt | Skill folder | Reads `.agents/skills/` |
| --- | --- | --- | --- | --- |
| Claude Code | Anthropic | `.claude/commands/` | `.claude/skills/` | no |
| Cursor | Anysphere | `.cursor/commands/` | `.cursor/skills/` | yes |
| GitHub Copilot | GitHub | native prompt folder | `.github/skills/` | yes |
| Codex | OpenAI | skill | `.codex/skills/` | yes |
| Mistral Vibe | Mistral | skill | `.vibe/skills/` | yes |
| OpenCode | OpenCode | `.opencode/commands/` | `.opencode/skills/` | yes |
| Pi | earendil-works | native prompt folder | `.pi/skills/` | yes |
| Kiro | Amazon Web Services | native prompt folder | `.kiro/skills/` | no |
| Goose | Agentic AI Foundation | skill | `.goose/skills/` | yes |
| Cline | Cline Bot Inc. | skill | `.cline/skills/` | no |

The "session prompt" column is how the `init-session` helper reaches each agent. Claude, Cursor, Copilot, OpenCode, Pi and Kiro have a native place for reusable prompts, so slopctl puts it there. Codex, Vibe, Goose and Cline lack an equivalent, so they get an `init-session` skill instead.

Claude Code, Copilot and Cursor each load a file of their own before they would find `AGENTS.md`. For those three, slopctl installs a short redirect stub (`CLAUDE.md`, `.github/copilot-instructions.md` and `.cursorrules`), all generated from one shared template.

The list is data, not code. It comes from `agent-defaults.yml` and `templates.yml`, so it can change without a new slopctl release, and you can add agents of your own. See [Adding a user-defined agent](#adding-a-user-defined-agent).

### Languages

The default catalog covers these:

| Language | Skills | Config files |
| --- | --- | --- |
| C | `c-coding-conventions`, `cmake-build-commands` | `.clang-format`, `.editorconfig` |
| C++ | `cpp-coding-conventions`, `cmake-build-commands` | `.clang-format`, `.editorconfig` |
| Rust | `rust-coding-conventions`, `rust-build-commands` | `.rustfmt.toml`, `.editorconfig` |
| Shell | `shell-coding-conventions`, `shell-build-commands` | none |
| Swift | `swift-coding-conventions`, `swift-build-commands`, `swift-concurrency-pro`, `swift-testing-pro` | `.swift-format`, `.editorconfig` |
| SwiftUI | everything from Swift, plus `swiftui-pro` | everything from Swift |

Conventions and build commands ship as skills rather than as text inside `AGENTS.md`. Only a short hint is merged in, telling agents that the skills exist. Any other language is one more entry under `languages:` in `templates.yml`, together with the files it references. [Template format](#template-format) shows an example for Elixir.

## Skills

A skill is a directory with a `SKILL.md` file. The file starts with YAML frontmatter holding a name and a description, followed by Markdown instructions. A skill can also include `scripts/`, `references/` and `assets/` folders. The format is the open [Agent Skills](https://agentskills.io) standard, and agents load a skill when its description matches the task.

### Where skills come from

Skills are declared in `templates.yml` with a single `source` field, which is a path in the catalog or a full GitHub URL. The skill's name is the name of its source directory. There are four places to declare one:

- Under `agents.<name>.skills`, for a skill that belongs to one agent.
- Under `languages.<name>.skills`, for a skill that comes with a language.
- Under `shared.<name>.skills`, for a skill that several languages reuse through `includes`.
- In the top-level `skills` section, for skills that apply to every project.

A skill from an included language is inherited too, depth first. SwiftUI includes Swift, so it gets Swift's skills. slopctl detects include cycles and stops with an error.

URL-based skills are downloaded as one tarball per repository, during `templates --update` or at `init` time if they are not cached yet. They are stored under `skills/<name>/` in the cache and tracked like any other file, so slopctl notices local edits.

### Where skills are installed

Agents disagree about where to look. Some read the shared `.agents/skills/` folder, and some read only their own. slopctl sorts this out per installation.

| Agent | Workspace folder | Home folder | Reads `.agents/skills/` |
| --- | --- | --- | --- |
| Cursor | `.cursor/skills/` | none | yes |
| Claude Code | `.claude/skills/` | `~/.claude/skills/` | no |
| Codex | `.codex/skills/` ¹ | `~/.codex/skills/` | yes |
| Copilot | `.github/skills/` | `~/.copilot/skills/` | yes |
| Mistral Vibe | `.vibe/skills/` ¹ | `~/.vibe/skills/` | yes |
| OpenCode | `.opencode/skills/` | `~/.config/opencode/skills/` | yes |
| Pi | `.pi/skills/` | `~/.pi/agent/skills/` | yes |
| Kiro | `.kiro/skills/` | `~/.kiro/skills/` | no |
| Goose | `.goose/skills/` | `~/.agents/skills/` | yes |
| Cline | `.cline/skills/` | `~/.cline/skills/` | no |

¹ Codex and Vibe scan both their own folder and `.agents/skills/`. Their agent-specific skills go to the native folder, while language and top-level skills go to `.agents/skills/` to avoid duplicates next to other agents.

The rules for language, shared and top-level skills:

- With no agent installed, they go to `.agents/skills/`.
- With only agents that read `.agents/skills/`, they go there, once.
- With only agents that read their own folder, each of those agents gets a copy in its folder.
- With a mix, you get the shared copy and one copy per agent that needs it.
- If you add such an agent later with `init --agent`, the language skills already installed are copied into its folder.
- A top-level skill with `target: '$userprofile'` installs into the agent's home folder instead, for a policy that should apply to every project.

Skills declared under `agents.<name>.skills` always go to that agent's own workspace folder, whatever else is installed. `remove --agent` takes them out again.

`templates --list` shows the skills in the catalog, and `status` shows what is installed.

### Adding a skill

Add it under the right `skills:` section of your `templates.yml`, run `slopctl templates --update`, then run `slopctl init` for the language or agent it belongs to. Top-level skills come with every `init`.

```yaml
agents:
  cursor:
    skills:
      - source: 'https://github.com/user/cursor-skills/tree/main/create-rule'

languages:
  rust:
    skills:
      - source: 'https://github.com/user/rust-skills/tree/main/rust-analyzer'

skills:
  - source: 'skills/my-local-skill'
    target: '$userprofile'    # optional: install into the agent's home folder
```

## Template format

`templates.yml` is the file that drives everything `init` does. The current format is version 5, and a missing `version` means 5. `status` shows the version of your cache.

The [catalog that ships with slopctl](https://github.com/heikopanjas/slopctl-templates/blob/develop/templates/templates.yml) is a good model. You can replace it or extend it without changing slopctl, as long as every referenced source exists in your cache or is a full GitHub URL.

### Sections

| Section | Contents |
| --- | --- |
| `main` | The main `AGENTS.md` file. |
| `preamble` | Fragments inserted at the top of `AGENTS.md`, such as a session-start guard. |
| `agents` | Per agent: `instructions`, `prompts`, `skills`, and `directories` to create during `init`. |
| `shared` | Reusable groups of `files` and `skills` that languages pull in with `includes`. |
| `languages` | Per language: `files`, `skills` and `includes`. |
| `integration` | Tool and workflow groups. These can be fragments for `AGENTS.md`, such as the git workflow summary, or real files, such as `UPDATES.md`. They install on every `init`. |
| `principles` | Core principles, merged into `AGENTS.md`. |
| `mission` | Mission statement and project overview, merged into `AGENTS.md`. |
| `skills` | Top-level skills, routed as described above. |

A file entry has a `source` and a `target`. The source is a path inside the catalog or a full GitHub URL. The `user/repo` shorthand is not supported, and that is deliberate. A typo in a local path should fail loudly instead of being read as a repository name and fetched from somewhere else.

### Fragments

A target of `$instructions` means the file is merged into `AGENTS.md` at a marker in the main template. Each section merges at its own marker:

| Marker | Receives |
| --- | --- |
| `<!-- {preamble} -->` | preamble fragments |
| `<!-- {mission} -->` | mission and overview |
| `<!-- {principles} -->` | principles |
| `<!-- {languages} -->` | language fragments and the skill hint |
| `<!-- {integration} -->` | integration summaries |

### An example catalog

```yaml
version: 5

main:
  source: AGENTS.md
  target: '$workspace/AGENTS.md'

agents:
  claude:
    prompts:
      - source: claude/commands/init-session.md
        target: '$workspace/.claude/commands/init-session.md'
  copilot:
    instructions:
      - source: copilot/copilot-instructions.md
        target: '$workspace/.github/copilot-instructions.md'
  cursor:
    prompts:
      - source: cursor/commands/init-session.md
        target: '$workspace/.cursor/commands/init-session.md'
    directories:
      - target: '$workspace/.cursor/plans'
  codex:
    skills:
      - source: 'skills/init-session'

shared:
  cmake:
    files:
      - source: cmake-build-commands.md
        target: '$instructions'

languages:
  c:
    includes: [cmake]
    files:
      - source: c-coding-conventions.md
        target: '$instructions'
  rust:
    files:
      - source: rust-coding-conventions.md
        target: '$instructions'
      - source: rust-format-instructions.toml
        target: '$workspace/.rustfmt.toml'

principles:
  - source: core-principles.md
    target: '$instructions'

mission:
  - source: mission-statement.md
    target: '$instructions'
```

### Agent directories

Some agents expect a folder that git does not track, like Cursor's `.cursor/plans`. List it under `directories` and `init --agent cursor` creates it next to the other files. If it already exists, nothing happens. `--dry-run` shows these steps too.

### Adding a language

A language is only data. For Elixir, add an entry, put the referenced files in your template source, and run `slopctl init --lang elixir`.

```yaml
languages:
  elixir:
    files:
      - source: elixir-skills-hint.md
        target: '$instructions'
      - source: elixir-format.exs
        target: '$workspace/.formatter.exs'
    skills:
      - source: 'skills/elixir-coding-conventions'
      - source: 'skills/mix-build-commands'
```

### Reusing files with includes

A language can list other definitions under `includes` to inherit their files and skills. There are two kinds of target.

A shared group has no meaning of its own. It exists to be reused, like a mixin. In the catalog above, `c` includes `cmake`. If `c++` also includes it, both get the CMake build notes and the CMake skills without repeating them.

A language can also include another language, which suits a superset. SwiftUI is Swift plus its own conventions:

```yaml
languages:
  swift:
    files:
      - source: swift-coding-conventions.md
        target: '$instructions'
    skills:
      - source: 'https://github.com/user/swift-skills/tree/main/swift-analyzer'
  swiftui:
    includes: [swift]
    files:
      - source: swiftui-coding-conventions.md
        target: '$instructions'
    skills:
      - source: 'https://github.com/user/swift-skills/tree/main/swiftui-components'
```

`slopctl init --lang swiftui` installs Swift's conventions and its `swift-analyzer` skill first, then the SwiftUI conventions and the `swiftui-components` skill.

Included items always come before the language's own. With several includes, they resolve left to right and depth first, so if `top` includes `mid` and `mid` includes `base`, you get `base`, then `mid`, then `top`. A language can mix both kinds, as in `includes: [cmake, swift]`. Two entries that write to the same `$workspace` path are an error, though `$instructions` fragments are exempt.

## Extending slopctl

### Your own templates

Point `--from` at a local folder or a GitHub URL. The source needs a `templates.yml`.

```bash
slopctl templates --update --from /path/to/your/templates
slopctl templates --update --from https://github.com/yourname/your-templates/tree/main/templates
```

To use it everywhere, set `templates.uri` with `config`. You can also edit the cached files directly in `$HOME/.cache/slopctl/templates/` and run `slopctl update` in your projects, but the next `templates --update` will replace your edits.

### Contributing to the default catalog

The default templates live in [slopctl-templates](https://github.com/heikopanjas/slopctl-templates). To add a language or an agent there:

1. Fork the repository and add your files under `templates/`.
2. For a language, write the conventions and build-command files. For an agent, add an `agent-name/` folder with its instructions and prompts.
3. Add the entries to `templates/templates.yml`.
4. For an agent, also add an entry to `defaults/agent-defaults.yml`. An agent that exists only in `templates.yml` is rejected by `init` and flagged by `templates --verify`.
5. Open a pull request.

If the agent is only for you or your team, skip the fork and use an overlay.

### Adding a user-defined agent

An overlay adds an agent without forking anything. Create `agents/<name>/agent.yml` in one of two places:

- `<workspace>/.slopctl/agents/<name>/` belongs to one project. You can commit it so the team shares the agent, and it wins over a global overlay with the same name.
- `$XDG_CONFIG_HOME/slopctl/agents/<name>/`, or `~/.config/slopctl/agents/<name>/`, is available in every workspace.

The file combines the fields of `agent-defaults.yml` with an agent section of `templates.yml`:

```yaml
# .slopctl/agents/myagent/agent.yml
markers: [.myagent]                       # directories that show the agent is in use
prompt_dir: $workspace/.myagent/commands
skill_dir: $workspace/.myagent/skills
reads_cross_client_skills: false          # true if the agent also scans .agents/skills/
instructions:
  - source: instructions.md               # relative to this directory
    target: $workspace/.myagent/instructions.md
prompts: []
skills:
  - source: skills/helper                 # a directory containing SKILL.md
```

After that the agent behaves like a built-in one. `init --agent myagent`, `update`, `merge`, `remove --agent myagent`, `status` and `agents --list` all know about it.

The rules:

- Overlays only add. A name that matches a shipped agent is an error.
- `name` is optional, and must match the directory name if present. Unknown keys are rejected.
- `source` paths are relative to the agent's directory. Absolute paths, `..` and URLs are rejected.
- Workspace overlays can only use `$workspace` targets. Global overlays can also use `$userprofile`.
- The default catalog must still be installed. A broken overlay makes every slopctl command fail with an error that names the file.

#### Example: an in-house agent called acme

Say your team uses an agent called `acme` that reads `.acme/instructions.md` and loads skills from `.acme/skills/`. Put the overlay in the workspace and commit it:

```text
my-project/
└── .slopctl/
    └── agents/
        └── acme/
            ├── agent.yml
            ├── instructions.md
            └── skills/
                └── team-conventions/
                    └── SKILL.md
```

```yaml
# .slopctl/agents/acme/agent.yml
markers: [.acme]
prompt_dir: $workspace/.acme/commands
skill_dir: $workspace/.acme/skills
reads_cross_client_skills: false
instructions:
  - source: instructions.md
    target: $workspace/.acme/instructions.md
skills:
  - source: skills/team-conventions
```

```bash
slopctl agents --list         # shows "acme (overlay: workspace)" with its origin path
slopctl init --agent acme     # AGENTS.md, .acme/instructions.md, .acme/skills/team-conventions
slopctl update                # after editing the overlay files
slopctl templates --verify    # catches missing sources and colliding targets
slopctl remove --agent acme   # removes only acme's files
```

To make `acme` available in every project, move the `acme/` directory to `~/.config/slopctl/agents/`.

## Building from source

slopctl is written in Rust (edition 2024) with clap for the command line, reqwest for HTTP, and serde for YAML and JSON. Skill tarballs are unpacked with pure-Rust `flate2` and `tar`.

```bash
git clone https://github.com/heikopanjas/slopctl.git
cd slopctl
cargo build             # debug build
cargo test
cargo run -- init --lang rust
cargo build --release   # optimized, also generates man pages
cargo fmt
cargo clippy
```
