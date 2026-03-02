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

		// 2️⃣ Fetch repos (only public, first 100)
		const reposRes = await fetch(
			`https://api.github.com/users/${username}/repos?per_page=100&type=owner&sort=updated`,
			{ headers, cache: "no-store" },
		);

		const repos = await reposRes.json();

		// 3️⃣ Aggregate languages (count repos per language, NOT bytes)
		const languageCount: Record<string, number> = {};

		await Promise.all(
			repos.map(async (repo: any) => {
				if (!repo.languages_url) return;

				const langRes = await fetch(repo.languages_url, { headers });

				if (!langRes.ok) return;

				const langs = await langRes.json();

				// ✅ each repo contributes ONE count per language it uses
				for (const lang of Object.keys(langs)) {
					languageCount[lang] = (languageCount[lang] || 0) + 1;
				}
			}),
		);

		return NextResponse.json({
			user,
			repoCount: repos.length,
			languages: languageCount,
			repos: repos.map((r: any) => ({
				name: r.name,
				created_at: r.created_at,
				updated_at: r.updated_at,
				pushed_at: r.pushed_at,
			})),
		});
	} catch (err) {
		return NextResponse.json({ error: "Server error" }, { status: 500 });
	}
}
