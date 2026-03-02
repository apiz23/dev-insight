"use client";

import { useState } from "react";
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
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { DeveloperRadar } from "@/components/charts/developer-radar";
import { ActivityTimeline } from "@/components/charts/activity-timeline";
import { LanguagePie } from "@/components/charts/language-pie";
import { generateAISummary } from "@/lib/ai";

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
	const fetchUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username.trim()) return;

		setLoading(true);
		setError(null);
		setRateLimit(false);

		try {
			const res = await fetch(`/api/github?username=${username}`);
			const data = await res.json();

			if (res.status === 403) {
				setRateLimit(true);
				setUser(null);
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

			// ✅ CALL AI HERE WITH FRESH DATA
			await fetchAI(parsed, computedScore);
		} catch (err: any) {
			setError(err.message || "Failed to fetch user");
			setUser(null);
		}
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
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground">
			{/* Hero Section */}
			<section className="relative overflow-hidden py-16 md:py-24">
				<div className="absolute inset-0 -z-10">
					<div className="absolute left-1/2 top-1/4 h-96 w-96 -translate-x-1/2 rounded-full bg-primary/5 blur-[100px]" />
					<div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-chart-2/5 blur-[100px]" />
				</div>

				<div className="container mx-auto px-4">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						className="text-center space-y-6 max-w-3xl mx-auto"
					>
						<div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
							<Rocket className="h-4 w-4 text-primary" />
							<span className="text-sm font-medium text-primary">DevInsight</span>
						</div>
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
						<div className="flex flex-wrap gap-2 justify-center pt-4">
							<Badge
								variant="secondary"
								className="gap-1 bg-muted text-muted-foreground"
							>
								<Code2 className="h-3 w-3 text-chart-2" /> Language Analysis
							</Badge>
							<Badge
								variant="secondary"
								className="gap-1 bg-muted text-muted-foreground"
							>
								<Activity className="h-3 w-3 text-chart-1" /> Activity Score
							</Badge>
							<Badge
								variant="secondary"
								className="gap-1 bg-muted text-muted-foreground"
							>
								<Trophy className="h-3 w-3 text-chart-3" /> Experience Level
							</Badge>
							<Badge
								variant="secondary"
								className="gap-1 bg-muted text-muted-foreground"
							>
								<TrendingUp className="h-3 w-3 text-chart-4" /> Growth Metrics
							</Badge>
						</div>
					</motion.div>
				</div>
			</section>

			{/* Main Content */}
			<div className="container mx-auto px-4 pb-16">
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
									<div className="flex-1">
										<Input
											value={username}
											onChange={(e) => setUsername(e.target.value)}
											placeholder="Enter GitHub username (e.g., torvalds)"
											className="h-14 text-lg px-5 border-input focus:border-ring transition-all"
											disabled={loading}
										/>
									</div>
									<Button
										type="submit"
										size="lg"
										className="h-14 px-8 gap-2 text-base font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all"
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
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.4 }}
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
									GitHub API rate limit exceeded. Please wait a few minutes before trying
									again. Unauthenticated requests are limited to 60 per hour.
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

					{/* Results Section */}
					{user && score && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="space-y-6"
						>
							{/* Profile Card */}
							<Card className="shadow-xl overflow-hidden border-border py-0">
								<div className="h-40 bg-linear-to-r from-primary/30 via-primary/20 to-chart-2/20 relative overflow-hidden">
									<div className="absolute inset-0 opacity-20 bg-[radial-linear(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_40%)]" />{" "}
								</div>

								<CardContent className="p-6 relative ">
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
													<p className="text-muted-foreground mt-2 max-w-2xl">{user.bio}</p>
												)}
											</div>

											<Button
												asChild
												variant="outline"
												className="gap-2 border-border hover:border-primary hover:bg-accent"
											>
												<a href={user.html_url} target="_blank" rel="noopener noreferrer">
													<Github className="h-4 w-4" />
													View GitHub Profile
												</a>
											</Button>
										</div>

										{/* User Details Grid */}
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
											{user.location && <DetailCard icon={MapPin} text={user.location} />}
											{user.blog && (
												<DetailCard icon={Link2} text={user.blog} href={user.blog} />
											)}
											{user.twitter_username && (
												<DetailCard
													icon={Twitter}
													text={`@${user.twitter_username}`}
													href={`https://twitter.com/${user.twitter_username}`}
												/>
											)}
											{user.company && <DetailCard icon={Building} text={user.company} />}
											<DetailCard
												icon={Calendar}
												text={`Joined ${formatDate(user.created_at)}`}
											/>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Stats & Score Grid */}
							<div className="space-y-6">
								{/* Stats Cards - 2x2 Grid */}
								<div className="grid grid-cols-2 gap-3">
									<StatCard
										icon={Users}
										label="Followers"
										value={user.followers}
										color="bg-chart-1/10 border-chart-1/20"
										iconColor="text-chart-1"
									/>
									<StatCard
										icon={Users}
										label="Following"
										value={user.following}
										color="bg-chart-2/10 border-chart-2/20"
										iconColor="text-chart-2"
									/>
									<StatCard
										icon={GitFork}
										label="Repositories"
										value={repoCount ?? 0}
										color="bg-chart-3/10 border-chart-3/20"
										iconColor="text-chart-3"
									/>
									<StatCard
										icon={Star}
										label="Languages"
										value={languages ? Object.keys(languages).length : 0}
										color="bg-chart-4/10 border-chart-4/20"
										iconColor="text-chart-4"
									/>
								</div>

								{/* Score Card */}
								<Card className="border-border">
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
											<div className="text-5xl font-bold text-primary">{score.total}</div>
											<Badge variant="outline" className="px-3 py-1 text-xs">
												{score.level}
											</Badge>
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
							</div>

							{/* Tabs for Detailed Analysis */}
							<Tabs defaultValue="breakdown" className="space-y-4">
								<TabsList className="grid w-full grid-cols-2 lg:w-100 bg-muted pb-10">
									<TabsTrigger
										value="breakdown"
										className="data-[state=active]:bg-background data-[state=active]:text-foreground"
									>
										Score Breakdown
									</TabsTrigger>
									<TabsTrigger
										value="languages"
										className="data-[state=active]:bg-background data-[state=active]:text-foreground"
									>
										Languages
									</TabsTrigger>
								</TabsList>

								<TabsContent value="breakdown">
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
												<MetricBar
													label="Activity"
													value={score.breakdown.activity}
													icon={Activity}
													description="Based on repository count and contributions"
												/>
												<MetricBar
													label="Diversity"
													value={score.breakdown.diversity}
													icon={PieChart}
													description="Range of programming languages used"
												/>
												<MetricBar
													label="Experience"
													value={score.breakdown.experience}
													icon={Clock}
													description="Account age and longevity"
												/>
												<MetricBar
													label="Consistency"
													value={score.breakdown.consistency}
													icon={TrendingUp}
													description="Balanced activity across metrics"
												/>
											</div>

											{/* Account Age Info */}
											{user && (
												<div className="mt-6 p-4 bg-accent rounded-lg border border-border">
													<div className="flex items-center gap-2 text-sm">
														<Calendar className="h-4 w-4 text-primary" />
														<span className="font-medium text-foreground">Account Age:</span>
														<span className="text-muted-foreground">
															{getAccountAge(user.created_at).years} years,{" "}
															{getAccountAge(user.created_at).months} months
														</span>
													</div>
												</div>
											)}
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="languages">
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
														.map(([lang, count]) => (
															<LanguageBar key={lang} language={lang} count={count} />
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
								</TabsContent>
							</Tabs>

							{/* Achievement Badges */}
							<Card>
								<CardHeader>
									<CardTitle className="flex items-center gap-2 text-foreground">
										<Medal className="h-5 w-5 text-primary" />
										Achievements & Insights
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
										<AchievementBadge
											icon={Rocket}
											label="Active Developer"
											achieved={(repoCount ?? 0) > 10}
											value={`${repoCount} repos`}
										/>
										<AchievementBadge
											icon={Users}
											label="Influencer"
											achieved={user.followers > 50}
											value={`${user.followers} followers`}
										/>
										<AchievementBadge
											icon={Code2}
											label="Polyglot"
											achieved={(languages ? Object.keys(languages).length : 0) > 5}
											value={`${languages ? Object.keys(languages).length : 0} languages`}
										/>
										<AchievementBadge
											icon={Clock}
											label="Veteran"
											achieved={getAccountAge(user.created_at).years > 5}
											value={`${getAccountAge(user.created_at).years}+ years`}
										/>
									</div>
								</CardContent>
							</Card>

							{/* Charts Section */}
							{(languages || score || repos.length > 0) && (
								<div className="space-y-6 mt-6">
									{/* Language Pie Chart */}
									{languages && Object.keys(languages).length > 0 && (
										<LanguagePie languages={languages} />
									)}

									{/* Radar Chart */}
									{score && <DeveloperRadar score={score} />}

									{/* Activity Timeline */}
									{repos.length > 0 && <ActivityTimeline repos={repos} />}
								</div>
							)}
							{aiLoading && (
								<div className="flex flex-col items-center justify-center p-8 border border-border rounded-lg bg-muted/20">
									<div className="flex items-center gap-3 mb-3">
										<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
										<p className="text-sm font-medium">Generating AI insights...</p>
									</div>

									{/* Cold start warning for free tier */}
									<div className="flex items-start gap-2 max-w-md text-center">
										<Clock className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
										<p className="text-xs text-muted-foreground">
											<span className="font-medium text-amber-600 dark:text-amber-400">
												Note:
											</span>{" "}
											Running on free tier — first request may take 30-50 seconds to wake
											up the server. Thanks for your patience! ☕
										</p>
									</div>
								</div>
							)}

							{aiSummary && (
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

												// Extract confidence if available (you can adjust this logic)
												if (v && typeof v === "object" && "confidence" in v) {
													confidence = (v as any).confidence;
												}

												// Only render if there's content
												if (!text || text === "No data") return null;

												return (
													<div
														key={k}
														className="group p-3 rounded-lg border border-border/50 bg-card hover:border-primary/20 hover:bg-muted/20 transition-all duration-200"
													>
														<div className="flex items-start justify-between gap-2 mb-1.5">
															<div className="flex items-center gap-2">
																<div className="w-1 h-4 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
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
							)}
						</motion.div>
					)}

					{/* Empty State */}
					{!user && !loading && !error && !rateLimit && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.6 }}
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
										<span className="px-3 py-1 rounded-full bg-accent border border-border">
											Try: torvalds
										</span>
										<span className="px-3 py-1 rounded-full bg-accent border border-border">
											Try: gaearon
										</span>
										<span className="px-3 py-1 rounded-full bg-accent border border-border">
											Try: apiz23
										</span>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					)}
				</div>
			</div>
		</div>
	);
}

// Helper Components
function StatCard({
	icon: Icon,
	label,
	value,
	color,
	iconColor,
}: {
	icon: any;
	label: string;
	value: number | string;
	color: string;
	iconColor: string;
}) {
	return (
		<motion.div
			whileHover={{ y: -2, scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			className={`relative overflow-hidden p-4 rounded-xl border bg-linear-to-br ${color} backdrop-blur-sm transition-all hover:shadow-md`}
		>
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-grid-white/5 [mask-image:radial-linear(ellipse_at_center,transparent_60%,black)]" />

			{/* Content */}
			<div className="relative z-10">
				<div className="flex items-center justify-between mb-2">
					<div className={`p-2 rounded-lg bg-background/50 ${iconColor}`}>
						<Icon className="h-4 w-4" />
					</div>
					<span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
						{label}
					</span>
				</div>
				<div className={`text-2xl font-bold ${iconColor}`}>
					{typeof value === "number" ? value.toLocaleString() : value}
				</div>
			</div>
		</motion.div>
	);
}

function DetailCard({
	icon: Icon,
	text,
	href,
}: {
	icon: any;
	text: string;
	href?: string;
}) {
	const content = (
		<div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-border">
			<Icon className="h-4 w-4 text-muted-foreground shrink-0" />
			<span className="text-sm text-foreground truncate">{text}</span>
		</div>
	);

	if (href) {
		return (
			<a href={href} target="_blank" rel="noopener noreferrer" className="block">
				{content}
			</a>
		);
	}

	return content;
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
			className={`p-3 rounded-lg border ${achieved ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-50"} text-center transition-all`}
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
