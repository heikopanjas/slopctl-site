---
title: completions
summary: "Generate shell completion scripts."
group: inspect
order: 11
---

Generate shell completion scripts for various shells.

## Usage

```bash
slopctl completions <shell>
```

## Arguments

- `<shell>`: shell to generate completions for: `bash`, `zsh`, `fish`, `powershell`

## Examples

```bash
# Generate zsh completions
slopctl completions zsh > ~/.zsh/completions/_slopctl

# Generate bash completions
slopctl completions bash > ~/.bash_completion.d/slopctl

# Generate fish completions
slopctl completions fish > ~/.config/fish/completions/slopctl.fish

# Generate PowerShell completions
slopctl completions powershell > slopctl.ps1
```
