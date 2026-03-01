export function calculateDeveloperScore(params: {
	repoCount: number;
	languages: Record<string, number>;
	createdAt: string;
}) {
	const { repoCount, languages, createdAt } = params;

	// Experience score (account age)
	const years =
		(Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);
	const experience = Math.min(Math.round(years * 2), 10);

	// Diversity score (languages)
	const uniqueLangs = Object.keys(languages).length;
	const diversity = Math.min(uniqueLangs * 3, 20);

	// Activity score (repos)
	const activity = Math.min(repoCount * 2, 40);

	// Consistency proxy (repos per year)
	const reposPerYear = repoCount / Math.max(years, 1);
	const consistency = Math.min(Math.round(reposPerYear * 3), 30);

	const total = activity + diversity + experience + consistency;

	let level = "Beginner";
	if (total > 80) level = "Highly Consistent Developer";
	else if (total > 60) level = "Active Developer";
	else if (total > 30) level = "Growing Developer";

	return {
		total,
		level,
		breakdown: {
			activity,
			diversity,
			experience,
			consistency,
		},
	};
}
