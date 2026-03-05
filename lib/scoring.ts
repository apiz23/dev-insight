export function calculateDeveloperScore({
	repoCount,
	languages,
	createdAt,
}: {
	repoCount: number;
	languages: Record<string, number>;
	createdAt: string;
}) {
	const years =
		(Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24 * 365);

	const uniqueLangs = Object.keys(languages).length;
	const langValues = Object.values(languages);

	const totalLangUsage = langValues.reduce((a, b) => a + b, 0);

	const topLangUsage =
		(langValues.length ? Math.max(...langValues) : 0) /
		Math.max(totalLangUsage, 1);

	const activity = Math.min(Math.round(Math.log10(repoCount + 1) * 12), 25);

	const reposPerYear = repoCount / Math.max(years, 1);
	const consistency = Math.min(
		Math.round(Math.log10(reposPerYear + 1) * 12),
		20,
	);

	const experience = Math.min(Math.round(Math.log2(years + 1) * 5), 15);

	const diversity = Math.min(Math.round(Math.log2(uniqueLangs + 1) * 5), 15);

	const focus = topLangUsage > 0.6 ? 10 : topLangUsage > 0.4 ? 7 : 4;

	const momentum =
		reposPerYear > 20 ? 15 : reposPerYear > 10 ? 10 : reposPerYear > 5 ? 6 : 2;

	const total =
		activity + consistency + experience + diversity + focus + momentum;

	let level = "Beginner Developer";
	if (total > 85) level = "Elite Developer";
	else if (total > 70) level = "Senior Developer";
	else if (total > 55) level = "Intermediate Developer";
	else if (total > 40) level = "Junior Developer";

	return {
		total,
		level,
		breakdown: {
			activity,
			consistency,
			experience,
			diversity,
			focus,
			momentum,
		},
	};
}
