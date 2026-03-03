export type GitHubUser = {
	login: string;
	name: string;
	avatar_url: string;
	bio: string;
	public_repos: number;
	followers: number;
	following: number;
	location: string;
	blog: string;
	twitter_username: string;
	company: string;
	html_url: string;
	created_at: string;
};

export type GitHubResponse = {
	user: GitHubUser;
	repoCount: number;
	languages: Record<string, number>;
	repos: any[];
};
