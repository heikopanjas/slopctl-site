---
title: status
summary: "Show the current slopctl status of a project."
group: inspect
order: 9
---

Display the current status of slopctl in the project.

## Usage

```bash
slopctl status              # Workspace status
slopctl status -v           # Workspace status with managed files
```

To browse the available template catalog, use `slopctl templates --list`.

## Default output includes

- **Global Templates:** whether templates are installed and their location, template
  version, available agents (from `templates.yml`), available languages (from
  `templates.yml`)
- **Project Status:** `AGENTS.md` existence and customization status, which agents are
  currently installed (detected via workspace marker directories), installed languages
  (from file-tracker metadata), installed skills (grouped by name)
- **Managed Files:** list of all slopctl-managed files in the current directory (with
  `--verbose`)

## Example output

```text
slopctl status

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
    • git-workflow
    • recent-updates
    • rust-build-commands
    • rust-coding-conventions
    • semantic-versioning
```
