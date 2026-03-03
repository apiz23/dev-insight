"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateDeveloperScore } from "@/lib/scoring";
import {
	AlertCircle,
	Github,
	Users,
	MapPin,
	Link2,
	Twitter,
	Building,
	Loader2,
	AlertTriangle,
	Calendar,
	Code2,
	GitFork,
	Star,
	Activity,
	BarChart3,
	PieChart,
	Rocket,
	Medal,
	Trophy,
	TrendingUp,
	Clock,
	CheckCircle2,
	XCircle,
	Info,
	Sparkles,
	RefreshCw,
	Share2,
	Download,
	Hash,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { DeveloperRadar } from "@/components/charts/developer-radar";
import { ActivityTimeline } from "@/components/charts/activity-timeline";
import { LanguagePie } from "@/components/charts/language-pie";
import { generateAISummary } from "@/lib/ai";
import { DetailCard, StatCard } from "@/components/helper-card";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import {
	HoverCard,
	HoverCardContent,
	HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Skeleton } from "@/components/ui/skeleton";

type GitHubUser = {
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

type GitHubResponse = {
	user: GitHubUser;
	repoCount: number;
	languages: Record<string, number>;
	repos: any[];
};

export default function Home() {
	const [username, setUsername] = useState("");
	const [user, setUser] = useState<GitHubUser | null>(null);
	const [languages, setLanguages] = useState<Record<string, number> | null>(
		null,
	);
	const [repoCount, setRepoCount] = useState<number | null>(null);
	const [score, setScore] = useState<any>(null);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rateLimit, setRateLimit] = useState(false);
	const [repos, setRepos] = useState<any[]>([]);
	const [aiSummary, setAiSummary] = useState<any>(null);
	const [aiLoading, setAiLoading] = useState(false);
	const [selectedTab, setSelectedTab] = useState("breakdown");
	const [isRefreshing, setIsRefreshing] = useState(false);

	const fetchUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username.trim()) return;

		setLoading(true);
		setError(null);
		setRateLimit(false);
		setAiSummary(null);

		try {
			const res = await fetch(`/api/github?username=${username}`);
			const data = await res.json();

			if (res.status === 403) {
				setRateLimit(true);
				setUser(null);
				setLoading(false);
				return;
			}

			if (!res.ok) {
				throw new Error(data.error || "Failed to fetch user");
			}

			const parsed: GitHubResponse = data;

			const computedScore = calculateDeveloperScore({
				repoCount: parsed.repoCount,
				languages: parsed.languages,
				createdAt: parsed.user.created_at,
			});

			setUser(parsed.user);
			setLanguages(parsed.languages);
			setRepoCount(parsed.repoCount);
			setScore(computedScore);
			setRepos(parsed.repos || []);

			await fetchAI(parsed, computedScore);
		} catch (err: any) {
			setError(err.message || "Failed to fetch user");
			setUser(null);
			setLoading(false);
		}
	};

	const handleRefresh = async () => {
		if (!username) return;
		setIsRefreshing(true);
		await fetchUser(new Event("submit") as any);
		setIsRefreshing(false);
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: `${user?.name || user?.login} - GitHub Developer Score`,
				text: `Check out ${user?.name || user?.login}'s developer score: ${score?.total} (${score?.level})`,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
		}
	};

	const handleExport = () => {
		const data = {
			user,
			score,
			languages,
			repoCount,
			repos: repos.length,
			timestamp: new Date().toISOString(),
		};
		const blob = new Blob([JSON.stringify(data, null, 2)], {
			type: "application/json",
		});
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `${user?.login}-github-insight.json`;
		a.click();
		URL.revokeObjectURL(url);
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const getAccountAge = (dateString: string) => {
		const created = new Date(dateString);
		const now = new Date();
		const years = now.getFullYear() - created.getFullYear();
		const months = now.getMonth() - created.getMonth();
		const totalMonths = years * 12 + months;
		return { years, months: totalMonths % 12, totalMonths };
	};

	const getLevelBadge = (level: string) => {
		switch (level) {
			case "Elite Developer":
				return "bg-chart-2/20 text-chart-2 border-chart-2/30";
			case "Senior Developer":
				return "bg-chart-1/20 text-chart-1 border-chart-1/30";
			case "Intermediate Developer":
				return "bg-chart-3/20 text-chart-3 border-chart-3/30";
			case "Junior Developer":
				return "bg-chart-4/20 text-chart-4 border-chart-4/30";
			case "Beginner Developer":
				return "bg-chart-5/20 text-chart-5 border-chart-5/30";
			default:
				return "bg-muted/20 text-muted-foreground border-border/30";
		}
	};

	const fetchAI = async (parsed: GitHubResponse, computedScore: any) => {
		const summary = `
GitHub Username: ${parsed.user.login}
Repositories: ${parsed.repoCount}
Followers: ${parsed.user.followers}
Languages: ${Object.keys(parsed.languages).join(", ")}
Score: ${computedScore.total}
Level: ${computedScore.level}
`.trim();

		try {
			setAiLoading(true);
			const res = await generateAISummary(summary);
			setAiSummary(res.output);
		} catch (err) {
			console.error(err);
		} finally {
			setAiLoading(false);
			setLoading(false);
		}
	};

	return (
		<TooltipProvider>
			<div className="min-h-screen text-foreground">
				{/* Hero Section */}
				<section className="relative overflow-hidden py-16 md:py-24">
					<div className="absolute inset-0 -z-10">
						<div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
						<div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-chart-2/5 blur-[100px]" />
					</div>

					<div className="max-w-5xl bg-none mx-auto px-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center space-y-6 max-w-3xl mx-auto"
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.2 }}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 cursor-pointer"
							>
								<Rocket className="h-4 w-4 text-primary" />
								<span className="text-sm font-medium text-primary">DevInsight</span>
							</motion.div>
							<h1 className="text-5xl md:text-6xl font-bold tracking-tight">
								<span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
									GitHub Developer
								</span>
								<br />
								<span className="text-foreground">Analyzer & Score</span>
							</h1>
							<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
								Get deep insights into developer activity, technology stack, and
								experience level with our comprehensive scoring system
							</p>

							{/* Features Tags */}
							<motion.div
								className="flex flex-wrap gap-2 justify-center pt-4"
								variants={{
									hidden: { opacity: 0 },
									show: {
										opacity: 1,
										transition: {
											staggerChildren: 0.1,
										},
									},
								}}
								initial="hidden"
								animate="show"
							>
								{[
									{ icon: Code2, text: "Language Analysis", color: "text-chart-2" },
									{ icon: Activity, text: "Activity Score", color: "text-chart-1" },
									{ icon: Trophy, text: "Experience Level", color: "text-chart-3" },
									{ icon: TrendingUp, text: "Growth Metrics", color: "text-chart-4" },
								].map((item, index) => (
									<motion.div
										key={index}
										variants={{
											hidden: { opacity: 0, y: 10 },
											show: { opacity: 1, y: 0 },
										}}
									>
										<Badge
											variant="secondary"
											className="gap-1 bg-muted text-muted-foreground transition-colors hover:bg-primary/10 hover:text-primary"
										>
											<item.icon className={`h-3 w-3 ${item.color}`} /> {item.text}
										</Badge>
									</motion.div>
								))}
							</motion.div>
						</motion.div>
					</div>
				</section>

				{/* Main Content */}
				<div className="mx-auto px-4 pb-16">
					<div className="max-w-5xl mx-auto space-y-8">
						{/* Search Form */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Card className="border-border shadow-lg bg-card/50 backdrop-blur-sm">
								<CardContent className="p-6">
									<form onSubmit={fetchUser} className="flex flex-col sm:flex-row gap-3">
										<div className="flex-1 relative">
											<Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input
												value={username}
												onChange={(e) => setUsername(e.target.value)}
												placeholder="Enter GitHub username (e.g., torvalds)"
												className="h-14 text-lg pl-8 border-input focus:border-ring transition-all"
												disabled={loading}
											/>
										</div>
										<Button
											type="submit"
											size="lg"
											className="h-14 px-8 gap-2 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all relative overflow-hidden"
											disabled={loading || !username.trim()}
										>
											{loading ? (
												<>
													<Loader2 className="h-5 w-5 animate-spin" />
													Analyzing Profile...
												</>
											) : (
												<>
													<Github className="h-5 w-5" />
													Analyze Developer
												</>
											)}
										</Button>
									</form>
									<p className="text-xs text-muted-foreground mt-3 text-center">
										🔍 Analysis includes repositories, languages, activity metrics, and
										experience scoring
									</p>
								</CardContent>
							</Card>
						</motion.div>

						{/* Alerts */}
						<AnimatePresence>
							{(rateLimit || error) && (
								<motion.div
									initial={{ opacity: 0, y: -10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.3 }}
								>
									{rateLimit && (
										<Alert
											variant="destructive"
											className="border-destructive/20 bg-destructive/5"
										>
											<AlertTriangle className="h-4 w-4 text-destructive" />
											<AlertTitle className="text-destructive">
												Rate Limit Exceeded
											</AlertTitle>
											<AlertDescription className="text-destructive/80">
												GitHub API rate limit exceeded. Please wait a few minutes before
												trying again. Unauthenticated requests are limited to 60 per hour.
											</AlertDescription>
										</Alert>
									)}

									{error && (
										<Alert
											variant="destructive"
											className="border-destructive/20 bg-destructive/5"
										>
											<AlertCircle className="h-4 w-4 text-destructive" />
											<AlertTitle className="text-destructive">Error</AlertTitle>
											<AlertDescription className="text-destructive/80">
												{error}
											</AlertDescription>
										</Alert>
									)}
								</motion.div>
							)}
						</AnimatePresence>

						{/* Results Section */}
						<AnimatePresence mode="wait">
							{user && score && (
								<motion.div
									key="results"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ duration: 0.4 }}
									className="space-y-6"
								>
									{/* Action Bar */}
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										className="flex justify-end gap-2"
									>
										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={handleRefresh}
													disabled={isRefreshing}
													className="gap-2"
												>
													<RefreshCw
														className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
													/>
													Refresh
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Refresh data</p>
											</TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={handleShare}
													className="gap-2"
												>
													<Share2 className="h-4 w-4" />
													Share
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Share results</p>
											</TooltipContent>
										</Tooltip>

										<Tooltip>
											<TooltipTrigger asChild>
												<Button
													variant="outline"
													size="sm"
													onClick={handleExport}
													className="gap-2"
												>
													<Download className="h-4 w-4" />
													Export
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Export as JSON</p>
											</TooltipContent>
										</Tooltip>
									</motion.div>

									{/* Profile Card */}
									<Card className="shadow-xl overflow-hidden border-border py-0 transition-shadow hover:shadow-2xl">
										<div className="h-40 bg-linear-to-r from-primary/30 via-primary/20 to-chart-2/20 relative overflow-hidden">
											<div className="absolute inset-0 opacity-20 bg-[radial-linear(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_40%)]" />
										</div>

										<CardContent className="p-6 relative">
											<div className="absolute -top-16 left-6">
												<Avatar className="h-28 w-28 border-4 border-background shadow-xl">
													<AvatarImage src={user.avatar_url} alt={user.login} />
													<AvatarFallback className="text-3xl bg-linear-to-br from-primary to-chart-2 text-primary-foreground">
														{user.login.slice(0, 2).toUpperCase()}
													</AvatarFallback>
												</Avatar>
											</div>

											<div className="mt-12 space-y-6">
												<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
													<div>
														<h2 className="text-3xl md:text-4xl font-bold tracking-tight flex items-center gap-3">
															{user.name || user.login}
															{user.name && (
																<span className="text-lg text-muted-foreground font-normal">
																	@{user.login}
																</span>
															)}
														</h2>
														{user.bio && (
															<p className="text-muted-foreground mt-2 max-w-2xl">
																{user.bio}
															</p>
														)}
													</div>

													<Button
														asChild
														variant="outline"
														className="gap-2 border-border hover:border-primary hover:bg-accent transition-colors"
													>
														<a href={user.html_url} target="_blank" rel="noopener noreferrer">
															<Github className="h-4 w-4" />
															View GitHub Profile
														</a>
													</Button>
												</div>

												{/* User Details Grid */}
												<motion.div
													className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3"
													variants={{
														hidden: { opacity: 0 },
														show: {
															opacity: 1,
															transition: {
																staggerChildren: 0.05,
															},
														},
													}}
													initial="hidden"
													animate="show"
												>
													{user.location && (
														<motion.div
															variants={{
																hidden: { opacity: 0 },
																show: { opacity: 1 },
															}}
														>
															<DetailCard icon={MapPin} text={user.location} />
														</motion.div>
													)}
													{user.blog && (
														<motion.div
															variants={{
																hidden: { opacity: 0 },
																show: { opacity: 1 },
															}}
														>
															<DetailCard icon={Link2} text={user.blog} href={user.blog} />
														</motion.div>
													)}
													{user.twitter_username && (
														<motion.div
															variants={{
																hidden: { opacity: 0 },
																show: { opacity: 1 },
															}}
														>
															<DetailCard
																icon={Twitter}
																text={`@${user.twitter_username}`}
																href={`https://twitter.com/${user.twitter_username}`}
															/>
														</motion.div>
													)}
													{user.company && (
														<motion.div
															variants={{
																hidden: { opacity: 0 },
																show: { opacity: 1 },
															}}
														>
															<DetailCard icon={Building} text={user.company} />
														</motion.div>
													)}
													<motion.div
														variants={{
															hidden: { opacity: 0 },
															show: { opacity: 1 },
														}}
													>
														<DetailCard
															icon={Calendar}
															text={`Joined ${formatDate(user.created_at)}`}
														/>
													</motion.div>
												</motion.div>
											</div>
										</CardContent>
									</Card>

									{/* Stats & Score Grid */}
									<div className="space-y-6">
										{/* Stats Cards - 2x2 Grid */}
										<motion.div
											className="grid grid-cols-2 gap-3"
											variants={{
												hidden: { opacity: 0 },
												show: {
													opacity: 1,
													transition: {
														staggerChildren: 0.05,
													},
												},
											}}
											initial="hidden"
											animate="show"
										>
											{[
												{
													icon: Users,
													label: "Followers",
													value: user.followers,
													color: "bg-chart-1/10 border-chart-1/20",
													iconColor: "text-chart-1",
												},
												{
													icon: Users,
													label: "Following",
													value: user.following,
													color: "bg-chart-2/10 border-chart-2/20",
													iconColor: "text-chart-2",
												},
												{
													icon: GitFork,
													label: "Repositories",
													value: repoCount ?? 0,
													color: "bg-chart-3/10 border-chart-3/20",
													iconColor: "text-chart-3",
												},
												{
													icon: Star,
													label: "Languages",
													value: languages ? Object.keys(languages).length : 0,
													color: "bg-chart-4/10 border-chart-4/20",
													iconColor: "text-chart-4",
												},
											].map((item, index) => (
												<motion.div
													key={index}
													variants={{
														hidden: { opacity: 0 },
														show: { opacity: 1 },
													}}
												>
													<StatCard {...item} />
												</motion.div>
											))}
										</motion.div>

										{/* Score Card */}
										<motion.div
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.2 }}
										>
											<Card className="border-border transition-colors hover:border-primary/30">
												<CardContent className="p-5">
													<div className="flex items-center gap-3 mb-4">
														<div className="p-2 rounded-lg bg-primary/10">
															<Trophy className="h-5 w-5 text-primary" />
														</div>
														<div>
															<p className="text-sm text-muted-foreground">Developer Score</p>
															<p className="font-semibold">Overall Rating</p>
														</div>
													</div>

													<div className="flex items-center justify-between gap-4">
														<div className="text-5xl font-bold text-primary">
															{score.total}
														</div>
														<HoverCard>
															<HoverCardTrigger asChild>
																<Badge
																	variant="outline"
																	className={`px-3 py-1 text-xs cursor-help ${getLevelBadge(score.level)}`}
																>
																	{score.level}
																</Badge>
															</HoverCardTrigger>
															<HoverCardContent className="w-80">
																<div className="space-y-2">
																	<h4 className="font-semibold">
																		Developer Level: {score.level}
																	</h4>
																	<p className="text-sm text-muted-foreground">
																		{score.level === "Elite Developer" &&
																			"Top-tier developer with exceptional metrics across all categories."}
																		{score.level === "Senior Developer" &&
																			"Experienced developer with strong activity and diversity."}
																		{score.level === "Intermediate Developer" &&
																			"Growing developer with good potential."}
																		{score.level === "Junior Developer" &&
																			"Early career developer showing promise."}
																		{score.level === "Beginner Developer" &&
																			"Just starting out on GitHub."}
																	</p>
																</div>
															</HoverCardContent>
														</HoverCard>
													</div>

													{/* Progress Bar */}
													<div className="mt-4 space-y-1">
														<Progress
															value={score.total}
															className="h-1.5 bg-muted [&>div]:bg-primary"
														/>
														<div className="flex justify-between text-xs text-muted-foreground">
															<span>0</span>
															<span>100</span>
														</div>
													</div>
												</CardContent>
											</Card>
										</motion.div>
									</div>

									{/* Tabs for Detailed Analysis */}
									<Tabs
										defaultValue="breakdown"
										className="space-y-4"
										onValueChange={setSelectedTab}
									>
										<TabsList className="grid w-full grid-cols-2 lg:w-100 bg-transparent pb-10 border">
											<TabsTrigger
												value="breakdown"
												className="data-[state=active]:bg-background data-[state=active]:text-foreground transition-colors"
											>
												Score Breakdown
											</TabsTrigger>
											<TabsTrigger
												value="languages"
												className="data-[state=active]:bg-background data-[state=active]:text-foreground transition-colors"
											>
												Languages
											</TabsTrigger>
										</TabsList>

										<AnimatePresence mode="wait">
											<TabsContent value="breakdown" key="breakdown">
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{ duration: 0.2 }}
												>
													<Card>
														<CardHeader>
															<CardTitle className="flex items-center gap-2 text-foreground">
																<BarChart3 className="h-5 w-5 text-primary" />
																Score Components
															</CardTitle>
															<CardDescription className="text-muted-foreground">
																Detailed breakdown of how the developer score is calculated
															</CardDescription>
														</CardHeader>
														<CardContent>
															<div className="grid gap-4">
																{[
																	{
																		label: "Activity",
																		value: score.breakdown.activity,
																		icon: Activity,
																		desc: "Based on repository count and contributions",
																	},
																	{
																		label: "Diversity",
																		value: score.breakdown.diversity,
																		icon: PieChart,
																		desc: "Range of programming languages used",
																	},
																	{
																		label: "Experience",
																		value: score.breakdown.experience,
																		icon: Clock,
																		desc: "Account age and longevity",
																	},
																	{
																		label: "Consistency",
																		value: score.breakdown.consistency,
																		icon: TrendingUp,
																		desc: "Balanced activity across metrics",
																	},
																].map((item, index) => (
																	<motion.div
																		key={index}
																		initial={{ opacity: 0 }}
																		animate={{ opacity: 1 }}
																		transition={{ delay: index * 0.05 }}
																	>
																		<MetricBar
																			label={item.label}
																			value={item.value}
																			icon={item.icon}
																			description={item.desc}
																		/>
																	</motion.div>
																))}
															</div>

															{/* Account Age Info */}
															{user && (
																<motion.div
																	className="mt-6 p-4 bg-accent rounded-lg border border-border"
																	initial={{ opacity: 0 }}
																	animate={{ opacity: 1 }}
																	transition={{ delay: 0.2 }}
																>
																	<div className="flex items-center gap-2 text-sm">
																		<Calendar className="h-4 w-4 text-primary" />
																		<span className="font-medium text-foreground">
																			Account Age:
																		</span>
																		<span className="text-muted-foreground">
																			{getAccountAge(user.created_at).years} years,{" "}
																			{getAccountAge(user.created_at).months} months
																		</span>
																	</div>
																</motion.div>
															)}
														</CardContent>
													</Card>
												</motion.div>
											</TabsContent>

											<TabsContent value="languages" key="languages">
												<motion.div
													initial={{ opacity: 0 }}
													animate={{ opacity: 1 }}
													exit={{ opacity: 0 }}
													transition={{ duration: 0.2 }}
												>
													<Card>
														<CardHeader>
															<CardTitle className="flex items-center gap-2 text-foreground">
																<Code2 className="h-5 w-5 text-primary" />
																Language Distribution
															</CardTitle>
															<CardDescription className="text-muted-foreground">
																Programming languages used across repositories
															</CardDescription>
														</CardHeader>
														<CardContent>
															{languages && Object.keys(languages).length > 0 ? (
																<div className="space-y-3">
																	{Object.entries(languages)
																		.sort(([, a], [, b]) => b - a)
																		.slice(0, 8)
																		.map(([lang, count], index) => (
																			<motion.div
																				key={lang}
																				initial={{ opacity: 0 }}
																				animate={{ opacity: 1 }}
																				transition={{ delay: index * 0.05 }}
																			>
																				<LanguageBar language={lang} count={count} />
																			</motion.div>
																		))}
																	{Object.keys(languages).length > 8 && (
																		<p className="text-sm text-muted-foreground text-center pt-2">
																			+ {Object.keys(languages).length - 8} more languages
																		</p>
																	)}
																</div>
															) : (
																<div className="text-center py-8 text-muted-foreground">
																	<Code2 className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
																	<p>No language data available</p>
																</div>
															)}
														</CardContent>
													</Card>
												</motion.div>
											</TabsContent>
										</AnimatePresence>
									</Tabs>

									{/* Achievement Badges */}
									<motion.div
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.3 }}
									>
										<Card>
											<CardHeader>
												<CardTitle className="flex items-center gap-2 text-foreground">
													<Medal className="h-5 w-5 text-primary" />
													Achievements & Insights
												</CardTitle>
											</CardHeader>
											<CardContent>
												<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
													{[
														{
															icon: Rocket,
															label: "Active Developer",
															achieved: (repoCount ?? 0) > 10,
															value: `${repoCount} repos`,
														},
														{
															icon: Users,
															label: "Influencer",
															achieved: user.followers > 50,
															value: `${user.followers} followers`,
														},
														{
															icon: Code2,
															label: "Polyglot",
															achieved: (languages ? Object.keys(languages).length : 0) > 5,
															value: `${languages ? Object.keys(languages).length : 0} languages`,
														},
														{
															icon: Clock,
															label: "Veteran",
															achieved: getAccountAge(user.created_at).years > 5,
															value: `${getAccountAge(user.created_at).years}+ years`,
														},
													].map((item, index) => (
														<motion.div
															key={index}
															initial={{ opacity: 0 }}
															animate={{ opacity: 1 }}
															transition={{ delay: 0.35 + index * 0.05 }}
														>
															<AchievementBadge {...item} />
														</motion.div>
													))}
												</div>
											</CardContent>
										</Card>
									</motion.div>

									{/* Charts Section */}
									{(languages || score || repos.length > 0) && (
										<motion.div
											className="space-y-6 mt-6"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.4 }}
										>
											{/* Language Pie Chart */}
											{languages && Object.keys(languages).length > 0 && (
												<LanguagePie languages={languages} />
											)}

											{/* Radar Chart */}
											{score && <DeveloperRadar score={score} />}

											{/* Activity Timeline */}
											{repos.length > 0 && <ActivityTimeline repos={repos} />}
										</motion.div>
									)}

									{/* AI Loading State */}
									<AnimatePresence>
										{aiLoading && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												className="flex flex-col items-center justify-center p-8 border border-border rounded-lg bg-muted/20"
											>
												<div className="flex items-center gap-3 mb-3">
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
													<p className="text-sm font-medium">Generating AI insights...</p>
												</div>

												<div className="flex items-start gap-2 max-w-md text-center">
													<Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
													<p className="text-xs text-muted-foreground">
														<span className="font-medium text-amber-600 dark:text-amber-400">
															Note:
														</span>{" "}
														Running on free tier — first request may take 30-50 seconds to
														wake up the server. Thanks for your patience! ☕
													</p>
												</div>
											</motion.div>
										)}
									</AnimatePresence>

									{/* AI Summary */}
									<AnimatePresence>
										{aiSummary && !aiLoading && (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{ delay: 0.1 }}
											>
												<Card className="overflow-hidden border-primary/10 shadow-sm py-0">
													<CardHeader className="bg-linear-to-r from-primary/5 via-transparent to-transparent py-4">
														<div className="flex items-center gap-2">
															<div className="p-2 rounded-lg bg-primary/10">
																<Sparkles className="h-4 w-4 text-primary" />
															</div>
															<div>
																<CardTitle className="text-lg">AI Developer Insights</CardTitle>
																<p className="text-xs text-muted-foreground mt-0.5">
																	Powered by advanced analytics
																</p>
															</div>
														</div>
													</CardHeader>
													<CardContent className="pt-4">
														<div className="space-y-4">
															{Object.entries(aiSummary).map(([k, v], index) => {
																let text = "";
																let confidence = null;

																if (typeof v === "string") {
																	text = v;
																} else if (
																	v &&
																	typeof v === "object" &&
																	"choices" in v &&
																	Array.isArray((v as any).choices)
																) {
																	text = (v as any).choices?.[0]?.message?.content ?? "";
																}

																if (v && typeof v === "object" && "confidence" in v) {
																	confidence = (v as any).confidence;
																}

																if (!text || text === "No data") return null;

																return (
																	<div
																		key={k}
																		className="p-3 rounded-lg border border-border/50 bg-card transition-colors hover:border-primary/20 hover:bg-muted/20"
																	>
																		<div className="flex items-start justify-between gap-2 mb-1.5">
																			<div className="flex items-center gap-2">
																				<div className="w-1 h-4 rounded-full bg-primary/40" />
																				<p className="font-medium text-sm capitalize">
																					{k.replace(/_/g, " ")}
																				</p>
																			</div>
																			{confidence && (
																				<span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
																					{Math.round(confidence * 100)}% confidence
																				</span>
																			)}
																		</div>
																		<p className="text-sm text-muted-foreground pl-4 leading-relaxed">
																			{text}
																		</p>
																	</div>
																);
															})}
														</div>
													</CardContent>
													<CardFooter className="border-t border-border/50 bg-muted/10 px-6 py-3">
														<p className="text-xs text-muted-foreground flex items-center gap-1.5">
															<Info className="h-3 w-3" />
															Analysis based on repository data and contribution patterns
														</p>
													</CardFooter>
												</Card>
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							)}

							{/* Loading Skeleton */}
							{loading && !user && (
								<motion.div
									key="loading"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									className="space-y-6"
								>
									<Skeleton className="h-[400px] w-full rounded-xl" />
									<div className="grid grid-cols-2 gap-3">
										{[1, 2, 3, 4].map((i) => (
											<Skeleton key={i} className="h-24 w-full rounded-xl" />
										))}
									</div>
									<Skeleton className="h-32 w-full rounded-xl" />
								</motion.div>
							)}
						</AnimatePresence>

						{/* Empty State */}
						<AnimatePresence mode="wait">
							{!user && !loading && !error && !rateLimit && (
								<motion.div
									key="empty"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									exit={{ opacity: 0 }}
									transition={{ duration: 0.4 }}
								>
									<Card className="border-border bg-muted/20">
										<CardContent className="p-16 text-center">
											<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
												<Github className="h-10 w-10 text-primary/50" />
											</div>
											<h3 className="text-xl font-medium text-foreground mb-2">
												No Developer Selected
											</h3>
											<p className="text-muted-foreground max-w-md mx-auto">
												Enter a GitHub username above to analyze their profile and get a
												comprehensive developer score
											</p>
											<div className="mt-6 flex gap-2 justify-center text-xs text-muted-foreground">
												{["torvalds", "gaearon", "apiz23"].map((name, index) => (
													<span
														key={index}
														className="px-3 py-1 rounded-full bg-accent border border-border cursor-pointer transition-colors hover:bg-primary/10 hover:text-primary"
														onClick={() => setUsername(name)}
													>
														Try: {name}
													</span>
												))}
											</div>
										</CardContent>
									</Card>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}

function MetricBar({
	label,
	value,
	icon: Icon,
	description,
}: {
	label: string;
	value: number;
	icon: any;
	description: string;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon className="h-4 w-4 text-primary" />
					<span className="font-medium text-foreground">{label}</span>
				</div>
				<span className="text-sm font-bold text-primary">{value}/100</span>
			</div>
			<Progress value={value} className="h-2 bg-muted [&>div]:bg-primary" />
			<p className="text-xs text-muted-foreground">{description}</p>
		</div>
	);
}

function LanguageBar({ language, count }: { language: string; count: number }) {
	return (
		<div className="flex items-center gap-3">
			<span className="text-sm font-medium text-foreground w-24 truncate">
				{language}
			</span>
			<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${Math.min(count * 10, 100)}%` }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="h-full bg-linear-to-r from-primary to-chart-2 rounded-full"
				/>
			</div>
			<span className="text-xs text-muted-foreground">{count} repos</span>
		</div>
	);
}

function AchievementBadge({
	icon: Icon,
	label,
	achieved,
	value,
}: {
	icon: any;
	label: string;
	achieved: boolean;
	value: string;
}) {
	return (
		<div
			className={`p-3 rounded-lg border ${achieved ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-50"} text-center transition-colors hover:border-primary/50 hover:bg-primary/10`}
		>
			<Icon
				className={`h-5 w-5 mx-auto mb-2 ${achieved ? "text-primary" : "text-muted-foreground"}`}
			/>
			<p className="text-xs font-medium text-foreground">{label}</p>
			<p className="text-[10px] text-muted-foreground mt-1">{value}</p>
			{achieved ? (
				<CheckCircle2 className="h-3 w-3 mx-auto mt-1 text-chart-2" />
			) : (
				<XCircle className="h-3 w-3 mx-auto mt-1 text-muted-foreground" />
			)}
		</div>
	);
}
