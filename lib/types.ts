export type GitHubRepo = {
	name: string;
	language: string | null;
	stars: number;
	forks: number;
	created_at: string;
	updated_at: string;
	pushed_at: string;
	html_url: string;
};

export type GitHubResponse = {
	user: GitHubUser;
	repoCount: number;
	languages: LanguageStat[];
	repos: GitHubRepo[];
};

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

export type LanguageStat = {
	name: string;
	repos: number;
	stars: number;
	forks: number;
	score: number;
};

export interface AISummary {
	status: string;
	row_id: string;
	output: {
		[key: string]: {
			id: string;
			object: string;
			created: number;
			model: string;
			choices: Array<{
				index: number;
				message: {
					role: string;
					content: string;
					reasoning_content: string | null;
					refusal: string | null;
					tool_calls: null;
					function_call: null;
					audio: null;
				};
				delta: null;
				logprobs: null;
				finish_reason: string;
			}>;
			usage: any;
		};
	};
}
