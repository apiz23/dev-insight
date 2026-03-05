import { NextRequest, NextResponse } from "next/server";

const headers = {
	Accept: "application/vnd.github+json",
	Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
};

export async function GET(req: NextRequest) {
	try {
		const username = req.nextUrl.searchParams.get("username");

		if (!username) {
			return NextResponse.json({ error: "Username required" }, { status: 400 });
		}

		// 1️⃣ Fetch user
		const userRes = await fetch(`https://api.github.com/users/${username}`, {
			headers,
			cache: "no-store",
		});

		if (!userRes.ok) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const user = await userRes.json();

		let allRepos: any[] = [];
		let page = 1;
		let hasMore = true;

		while (hasMore) {
			const reposRes = await fetch(
				`https://api.github.com/users/${username}/repos?per_page=100&page=${page}&sort=updated`,
				{ headers, cache: "no-store" },
			);

			if (!reposRes.ok) {
				if (reposRes.status === 403) {
					return NextResponse.json(
						{ error: "GitHub rate limit exceeded" },
						{ status: 403 },
					);
				}
				break;
			}

			const repos = await reposRes.json();

			if (repos.length === 0) {
				hasMore = false;
			} else {
				allRepos = [...allRepos, ...repos];
				page++;

				if (repos.length < 100) {
					hasMore = false;
				}
			}
		}

		const languageStats: Record<
			string,
			{ count: number; stars: number; forks: number }
		> = {};

		allRepos.forEach((repo: any) => {
			const lang = repo.language;

			if (!lang) return;

			if (!languageStats[lang]) {
				languageStats[lang] = {
					count: 0,
					stars: 0,
					forks: 0,
				};
			}

			languageStats[lang].count += 1;
			languageStats[lang].stars += repo.stargazers_count;
			languageStats[lang].forks += repo.forks_count;
		});

		// 4️⃣ Convert language stats into weighted score
		const languages = Object.entries(languageStats).map(([name, data]) => ({
			name,
			repos: data.count,
			stars: data.stars,
			forks: data.forks,
			score: data.count * 2 + data.stars + data.forks, // weighted impact
		}));

		// Sort strongest languages first
		languages.sort((a, b) => b.score - a.score);

		return NextResponse.json({
			user,
			repoCount: allRepos.length,
			languages,
			repos: allRepos.map((r: any) => ({
				name: r.name,
				language: r.language,
				stars: r.stargazers_count,
				forks: r.forks_count,
				created_at: r.created_at,
				updated_at: r.updated_at,
				pushed_at: r.pushed_at,
				html_url: r.html_url,
			})),
		});
	} catch (err) {
		console.error("Server error:", err);
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
