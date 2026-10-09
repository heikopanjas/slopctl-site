export const REPO = 'https://github.com/heikopanjas/slopctl';
export const SITE_REPO = 'https://github.com/heikopanjas/slopctl-site';
export const TEMPLATES_REPO = 'https://github.com/heikopanjas/slopctl-templates';

export const accents = ['teal', 'violet', 'amber', 'green', 'blue', 'rose'] as const;

export const tldr = [
	{ tag: 'One source', title: 'One AGENTS.md', body: 'A single AGENTS.md works across every agent that follows the agents.md standard. Agent-specific files only reference it.' },
	{ tag: 'Skills', title: 'Agent Skills built in', body: 'Define skills per agent, per language, or top-level. Local directories and full GitHub URLs both work, routed to the right folder for each agent.' },
	{ tag: 'Extend', title: 'User-defined agents', body: 'Add your own agent with a small agent.yml overlay, in the workspace or your global config. Languages and agents are YAML entries too, so nothing needs a rebuild or a fork.' },
	{ tag: 'Merge', title: 'AI-assisted merge', body: 'Reconcile customized files with updated templates using OpenAI, Anthropic, Ollama, or Mistral. Never a blind overwrite.' }
];

export const standards = [
	{ tag: 'Log', title: 'Append-only decision log', body: 'UPDATES.md keeps a "Recent Updates & Decisions" history below a changelog marker that init, update, and merge never overwrite.' },
	{ tag: 'Guardrails', title: 'No auto-commits, ever', body: 'Every destructive operation asks for explicit human confirmation. --dry-run previews any command first.' }
];

export const steps = [
	{
		title: 'Install',
		body: 'Download the binary for macOS, Linux or Windows from GitHub Releases. Prefer building it yourself? Use Cargo.',
		code: `# macOS (use slopctl-linux.zip on Linux)
curl -LO https://github.com/heikopanjas/slopctl/releases/latest/download/slopctl-macos.zip
unzip slopctl-macos.zip
chmod +x slopctl
sudo mv slopctl /usr/local/bin/

# Windows (PowerShell), then add the folder to your PATH
Invoke-WebRequest https://github.com/heikopanjas/slopctl/releases/latest/download/slopctl-windows.zip -OutFile slopctl-windows.zip
Expand-Archive slopctl-windows.zip -DestinationPath $env:LOCALAPPDATA\\slopctl

# Or build from source
git clone https://github.com/heikopanjas/slopctl.git
cd slopctl && cargo install --path .`
	},
	{
		title: 'Download the template catalog',
		body: 'Fetches templates.yml and every template into your global cache.',
		code: `slopctl templates --update`
	},
	{
		title: 'Initialize your project',
		body: 'Choose a language, an agent, or both. One init call installs AGENTS.md, UPDATES.md, config files and skills under .agents/skills/.',
		code: `cd your-project
slopctl init --lang rust --agent claude   # Rust conventions + Claude prompts
slopctl init --agent cursor               # agent only, no language files`
	},
	{
		title: 'Keep it fresh',
		body: 'Pull catalog changes into the workspace, or merge customized files with an LLM.',
		code: `slopctl templates --update && slopctl update
slopctl merge --preview`
	}
];

export const coverageCols = ['AGENTS.md', 'Redirect stub', 'Prompt', 'Skill', '.agents/skills'];

// [name, vendor, [AGENTS.md, stub, init-session prompt, init-session skill, reads .agents/skills]]
export const agents: [string, string, boolean[]][] = [
	['Claude Code', 'Anthropic', [true, true, true, false, false]],
	['Cursor', 'AI code editor', [true, true, true, false, true]],
	['GitHub Copilot', 'GitHub', [true, true, true, false, true]],
	['Codex', 'OpenAI', [true, false, false, true, true]],
	['Mistral Vibe', 'Mistral', [true, false, false, true, false]],
	['OpenCode', 'OpenCode', [true, false, true, false, true]],
	['Pi', 'earendil-works', [true, false, true, false, true]],
	['Kiro', 'Amazon Web Services', [true, false, true, false, false]],
	['Goose', 'Agentic AI Foundation', [true, false, false, true, true]],
	['Cline', 'Cline Bot Inc.', [true, false, false, true, false]]
];

export const languages = [
	{ name: 'C', skills: ['c-coding-conventions', 'cmake-build-commands'], files: ['.clang-format', '.editorconfig'] },
	{ name: 'C++', skills: ['cpp-coding-conventions', 'cmake-build-commands'], files: ['.clang-format', '.editorconfig'] },
	{ name: 'Rust', skills: ['rust-coding-conventions', 'rust-build-commands'], files: ['.rustfmt.toml', '.editorconfig'] },
	{ name: 'Shell', skills: ['shell-coding-conventions', 'shell-build-commands'], files: [] as string[] },
	{ name: 'Swift', skills: ['swift-coding-conventions', 'swift-build-commands', 'swift-concurrency-pro', 'swift-testing-pro'], files: ['.swift-format', '.editorconfig'] },
	{ name: 'SwiftUI', skills: ['all Swift skills', 'swiftui-pro'], files: ['all Swift files'] }
];

export const templatesCode = `# templates.yml (excerpt)
languages:
  rust:
    skills:
      - source: https://github.com/you/skills/tree/main/rust-style
      - source: skills/rust-build-commands   # local path`;

export const faq: { q: string; a: string }[] = [
	{ q: 'Where are templates stored?', a: 'Global templates live in <code>$HOME/.cache/slopctl/templates/</code> on every platform. <code>$XDG_CACHE_HOME</code> is honored if set.' },
	{ q: 'What happens if I modify AGENTS.md?', a: 'slopctl detects customization through the removed template marker and skips <code>AGENTS.md</code> when updating. Use <code>--force</code> to override, or <code>slopctl merge</code> to combine.' },
	{ q: 'Can I use my own template repository?', a: 'Yes. Pass <code>--from</code> to <code>templates --update</code> with a local path or GitHub URL. The source needs a <code>templates.yml</code>.' },
	{ q: 'How do I preview changes?', a: 'Add <code>--dry-run</code> to any command, for example <code>slopctl init --lang rust --dry-run</code>.' },
	{ q: 'How do I customize the mission statement?', a: 'Use <code>--mission "text"</code> with <code>init</code>, or <code>--mission @mission.md</code> to read it from a file.' },
	{ q: 'How do I switch agents without changing the language?', a: 'Run <code>slopctl init --agent &lt;new-agent&gt;</code>. The language is read from the file tracker, so switching from Cursor to Claude keeps your Rust setup.' },
	{ q: 'What if I don\'t pass --lang?', a: 'You still get <code>AGENTS.md</code>, <code>UPDATES.md</code> and the top-level skills, just no language conventions or config files. That suits docs repos and polyglot projects.' },
	{ q: 'How do I remove things?', a: '<code>slopctl remove --agent claude</code>, <code>--lang rust</code>, <code>--all</code> (keeps AGENTS.md) or <code>--purge</code> (everything).' },
	{ q: 'How do I fix stale or broken managed files?', a: 'Run <code>slopctl doctor</code> to list issues and <code>slopctl doctor --fix</code> to repair them. <code>--smart</code> adds LLM linting of AGENTS.md.' },
	{ q: 'Where are skills installed?', a: 'Cross-client agents (cursor, codex, copilot, opencode, pi, goose) share <code>.agents/skills/</code>. Native-only agents (claude, vibe, kiro, cline) get a copy in their own folder, such as <code>.claude/skills/</code>.' },
	{ q: 'Can I define my own agent?', a: 'Yes. Create <code>agents/&lt;name&gt;/agent.yml</code> under <code>.slopctl/</code> in your workspace (commit it to share with the team) or under <code>~/.config/slopctl/</code> for every project. Then use <code>slopctl init --agent &lt;name&gt;</code> like any built-in agent. See <a href="commands/agents/">the agents command</a>.' },
	{ q: 'Which platforms are supported?', a: 'macOS, Linux and Windows. Prebuilt binaries are attached to every <a href="https://github.com/heikopanjas/slopctl/releases">GitHub release</a> as <code>slopctl-macos.zip</code>, <code>slopctl-linux.zip</code> and <code>slopctl-windows.zip</code>.' },
	{ q: 'Can I use this commercially?', a: 'Yes. MIT license.' }
];
