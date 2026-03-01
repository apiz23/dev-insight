export async function getUser(username: string) {
	const res = await fetch(`https://api.github.com/users/${username}`, {
		headers: {
			Accept: "application/vnd.github+json",
			Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
		},
		cache: "no-store", 
	});

	if (!res.ok) {
		throw new Error("GitHub API error");
	}

	return res.json();
}
