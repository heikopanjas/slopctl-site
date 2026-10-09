// Latest slopctl release, resolved at build time. A failed lookup must not break the build.
export interface Release { tag: string; url: string; date: string }

export async function latestRelease(): Promise<Release | null> {
	try {
		const token = process.env.GITHUB_TOKEN;
		const res = await fetch('https://api.github.com/repos/heikopanjas/slopctl/releases/latest', {
			headers: { Accept: 'application/vnd.github+json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
		});
		if (!res.ok) return null;
		const r = await res.json();
		return { tag: r.tag_name, url: r.html_url, date: String(r.published_at).slice(0, 10) };
	} catch {
		return null;
	}
}
