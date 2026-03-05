"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
	Trophy,
	TrendingUp,
	Clock,
	Sparkles,
	Download,
	Hash,
	Target,
	Zap,
	ChevronRight,
	Terminal,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { motion, AnimatePresence } from "framer-motion";
import { DeveloperRadar } from "@/components/charts/developer-radar";
import { ActivityTimeline } from "@/components/charts/activity-timeline";
import { LanguagePie } from "@/components/charts/language-pie";
import { generateAISummary } from "@/lib/ai";
import {
	DetailCard,
	LanguageBar,
	MetricBar,
	StatCard,
} from "@/components/helper-card";
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
import Image from "next/image";
import { DeveloperPass } from "@/components/dev-card";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	AISummary,
	GitHubResponse,
	GitHubUser,
	LanguageStat,
} from "@/lib/types";
import { useIsMobile } from "@/hooks/use-mobile";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function Home() {
	const [username, setUsername] = useState("");
	const [user, setUser] = useState<GitHubUser | null>(null);
	const [languages, setLanguages] = useState<LanguageStat[] | null>(null);
	const [repoCount, setRepoCount] = useState<number | null>(null);
	const [score, setScore] = useState<any>(null);

	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [rateLimit, setRateLimit] = useState(false);
	const [repos, setRepos] = useState<any[]>([]);
	const [aiSummary, setAiSummary] = useState<AISummary | null>(null);
	const [aiLoading, setAiLoading] = useState(false);
	const [openDevPass, setOpenDevPass] = useState(false);
	const isMobile = useIsMobile();
	const [tab, setTab] = useState("breakdown");

	const fetchUser = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!username.trim()) return;

		setLoading(true);
		setError(null);
		setRateLimit(false);
		setAiSummary(null);

		toast.promise(
			(async () => {
				try {
					const res = await fetch(`/api/github?username=${username}`);
					const data = await res.json();

					if (res.status === 403) {
						setRateLimit(true);
						setUser(null);
						throw new Error("GitHub API rate limit exceeded");
					}

					if (!res.ok) {
						throw new Error(data.error || "Failed to fetch user");
					}

					const parsed: GitHubResponse = data;

					const languageMap: Record<string, number> = {};
					parsed.languages.forEach((lang) => {
						languageMap[lang.name] = lang.repos;
					});

					const computedScore = calculateDeveloperScore({
						repoCount: parsed.repoCount,
						languages: languageMap,
						createdAt: parsed.user.created_at,
					});

					setUser(parsed.user);
					setLanguages(parsed.languages);
					setRepoCount(parsed.repoCount);
					setScore(computedScore);
					setRepos(parsed.repos || []);

					await fetchAI(parsed, computedScore);
				} finally {
					setLoading(false);
				}
			})(),
			{
				loading: "Analyzing GitHub profile...",
				success: `Dev ${username} analyzed successfully 🚀`,
				error: (err) => err.message || "Failed to analyze developer",
			},
		);
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
Top Languages: ${parsed.languages
			.slice(0, 5)
			.map((l) => l.name)
			.join(", ")}
Score: ${computedScore.total}
Level: ${computedScore.level}
`.trim();

		setAiLoading(true);

		await toast.promise(
			(async () => {
				const res: AISummary = await generateAISummary(summary);
				setAiSummary(res);
			})(),
			{
				loading: "Generating AI insights...",
				success: "AI insights generated 🧠",
				error: "Failed to generate AI insights",
			},
		);

		setAiLoading(false);
	};

	const topLanguage = languages?.[0]?.name;
	const totalStars = languages?.reduce((sum, lang) => sum + lang.stars, 0) || 0;
	const totalForks = languages?.reduce((sum, lang) => sum + lang.forks, 0) || 0;

	return (
		<TooltipProvider>
			<div className="min-h-screen text-foreground">
				{/* Hero Section */}
				<section className="relative overflow-hidden py-16">
					<div className="max-w-4xl mx-auto px-4">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
							className="text-center space-y-6 max-w-3xl mx-auto"
						>
							<motion.div
								whileHover={{ scale: 1.02 }}
								transition={{ duration: 0.2 }}
								className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 cursor-pointer bg-black"
							>
								<div className="relative w-8 h-8">
									<Image
										src="/icons/favicon-32x32.png"
										alt="DevInsight Logo"
										fill
										className="object-contain"
										priority
									/>
								</div>
								<span className="text-sm font-medium text-primary">DevInsight</span>
							</motion.div>
							<h1 className="text-5xl md:text-6xl font-bold tracking-tight">
								<span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
									GitHub Developer
								</span>
								<br />
								<span className="text-foreground">Analyzer & Score</span>
							</h1>
							<p className="text-lg text-foreground max-w-2xl mx-auto">
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
									{ icon: Target, text: "Focus Score", color: "text-chart-4" },
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
					<div className="max-w-4xl mx-auto space-y-8">
						{/* Search Form */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<Card className="border-border shadow-lg bg-card/50 backdrop-blur-sm">
								<CardContent className="p-4">
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
										🔍 Analysis includes public repositories, languages, stars, forks, and
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
												trying again.
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
													variant="default"
													size="sm"
													onClick={() => setOpenDevPass(true)}
													className="gap-2"
												>
													<Download className="h-4 w-4" />
													Export DevPass
												</Button>
											</TooltipTrigger>
											<TooltipContent>
												<p>Export as Image</p>
											</TooltipContent>
										</Tooltip>
									</motion.div>

									<Dialog open={openDevPass} onOpenChange={setOpenDevPass}>
										<DialogContent className="w-full h-fit md:max-h-[70vh] md:max-w-3xl lg:max-w-fit overflow-hidden">
											<DialogHeader>
												<DialogTitle>Developer Passport</DialogTitle>
											</DialogHeader>
											<div className="space-y-6">
												<div className="w-full overflow-x-auto">
													<DeveloperPass
														user={user}
														score={score}
														topLanguage={languages?.[0]?.name}
														repoCount={repoCount || 0}
														totalStars={totalStars}
													/>
												</div>
											</div>
										</DialogContent>
									</Dialog>

									{/* Profile Card */}
									<Card className="group relative overflow-hidden border-border/50 bg-linear-to-br from-card to-card/95 shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-primary/20 pt-0">
										{/* Animated Background Pattern */}
										<div className="absolute inset-0 opacity-[0.02] pointer-events-none">
											<div
												className="absolute inset-0"
												style={{
													backgroundImage: `radial-linear(circle at 2px 2px, ${getComputedStyle(document.documentElement).getPropertyValue("--primary")} 1px, transparent 0)`,
													backgroundSize: "24px 24px",
												}}
											/>
										</div>

										<div className="relative h-40 overflow-hidden">
											<div className="absolute inset-0 bg-linear-to-r from-primary/20 via-primary/10 to-chart-2/20" />

											<div className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity duration-700">
												<div className="absolute inset-0 bg-[radial-linear(circle_at_20%_20%,hsl(var(--primary)/0.15),transparent_50%)]" />
												<div className="absolute inset-0 bg-[radial-linear(circle_at_80%_80%,hsl(var(--chart-2)/0.1),transparent_50%)]" />
											</div>
											<div
												className="absolute inset-0 opacity-[0.02]"
												style={{
													backgroundImage: `repeating-linear-linear(45deg, var(--primary) 0px, var(--primary) 1px, transparent 1px, transparent 12px)`,
												}}
											/>
											<div className="absolute -top-20 -right-20 h-40 w-40 rounded-full bg-primary/5 blur-3xl group-hover:bg-primary/10 transition-all duration-700" />
											<div className="absolute -bottom-20 -left-20 h-40 w-40 rounded-full bg-chart-2/5 blur-3xl group-hover:bg-chart-2/10 transition-all duration-700" />
										</div>

										<CardContent className="relative p-6">
											<div className="absolute -top-16 left-6 transform-gpu transition-all duration-500 group-hover:-translate-y-1 group-hover:scale-105">
												<div className="relative">
													<div className="absolute -inset-1 rounded-full bg-linear-to-r from-primary via-chart-2 to-primary opacity-0 group-hover:opacity-100 blur-md transition-all duration-700 animate-pulse" />

													<Avatar className="relative h-28 w-28 border-4 border-background shadow-xl ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-500">
														<AvatarImage
															src={user.avatar_url}
															alt={user.login}
															className="object-cover"
														/>
														<AvatarFallback className="text-3xl font-mono bg-linear-to-br from-primary to-chart-2 text-primary-foreground">
															{user.login.slice(0, 2).toUpperCase()}
														</AvatarFallback>
													</Avatar>
													<div className="absolute bottom-1 right-2 h-6 w-6 rounded-full bg-chart-2 border-4 border-background animate-pulse" />
												</div>
											</div>

											<div className="mt-12 space-y-6">
												<div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
													<div className="space-y-2">
														<div className="flex items-baseline gap-3 flex-wrap">
															<h2 className="text-3xl md:text-4xl font-mono font-bold tracking-tight bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent">
																{user.name || user.login}
															</h2>
															{user.name && (
																<span className="font-mono text-sm text-muted-foreground bg-muted/50 px-3 py-1 rounded-full border border-border/50">
																	@{user.login}
																</span>
															)}
														</div>
														{user.bio && (
															<p className="text-muted-foreground max-w-2xl font-mono text-sm leading-relaxed">
																{user.bio}
															</p>
														)}
													</div>

													<Button
														asChild
														variant="outline"
														className="group/btn gap-2 border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 font-mono text-sm"
													>
														<a href={user.html_url} target="_blank" rel="noopener noreferrer">
															<Github className="h-4 w-4 transition-transform group-hover/btn:rotate-12" />
															<span>View GitHub Profile</span>
															<ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover/btn:translate-x-1" />
														</a>
													</Button>
												</div>

												{/* User Details Grid with Animation */}
												<motion.div
													className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
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
																hidden: { opacity: 0, y: 20 },
																show: { opacity: 1, y: 0 },
															}}
														>
															<DetailCard
																icon={MapPin}
																text={user.location}
																className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group/card"
															/>
														</motion.div>
													)}

													{user.blog && (
														<motion.div
															variants={{
																hidden: { opacity: 0, y: 20 },
																show: { opacity: 1, y: 0 },
															}}
														>
															<DetailCard
																icon={Link2}
																text={user.blog}
																href={user.blog}
																className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group/card"
															/>
														</motion.div>
													)}

													{user.twitter_username && (
														<motion.div
															variants={{
																hidden: { opacity: 0, y: 20 },
																show: { opacity: 1, y: 0 },
															}}
														>
															<DetailCard
																icon={Twitter}
																text={`@${user.twitter_username}`}
																href={`https://twitter.com/${user.twitter_username}`}
																className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group/card"
															/>
														</motion.div>
													)}

													{user.company && (
														<motion.div
															variants={{
																hidden: { opacity: 0, y: 20 },
																show: { opacity: 1, y: 0 },
															}}
														>
															<DetailCard
																icon={Building}
																text={user.company}
																className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group/card"
															/>
														</motion.div>
													)}

													<motion.div
														variants={{
															hidden: { opacity: 0, y: 20 },
															show: { opacity: 1, y: 0 },
														}}
													>
														<DetailCard
															icon={Calendar}
															text={`Joined ${formatDate(user.created_at)}`}
															className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group/card"
														/>
													</motion.div>

													<motion.div
														variants={{
															hidden: { opacity: 0, y: 20 },
															show: { opacity: 1, y: 0 },
														}}
													>
														<DetailCard
															icon={Terminal}
															text={`Primary Stack: ${topLanguage}`}
															className="border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group/card"
														/>
													</motion.div>
												</motion.div>

												{/* Stats Section */}
												<div className="pt-4 border-t border-border/50">
													<div className="grid grid-cols-3 gap-4">
														<div className="text-center group/stat">
															<div className="text-2xl font-mono font-bold text-primary group-hover/stat:text-chart-2 transition-colors">
																{user.public_repos}
															</div>
															<div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
																Repositories
															</div>
														</div>
														<div className="text-center group/stat">
															<div className="text-2xl font-mono font-bold text-primary group-hover/stat:text-chart-2 transition-colors">
																{user.followers}
															</div>
															<div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
																Followers
															</div>
														</div>
														<div className="text-center group/stat">
															<div className="text-2xl font-mono font-bold text-primary group-hover/stat:text-chart-2 transition-colors">
																{user.following}
															</div>
															<div className="text-xs font-mono text-muted-foreground uppercase tracking-wider">
																Following
															</div>
														</div>
													</div>
												</div>
											</div>
										</CardContent>
									</Card>

									{/* Stats Grid */}
									<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
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
											label="Total Stars"
											value={totalStars}
											color="bg-chart-4/10 border-chart-4/20"
											iconColor="text-chart-4"
										/>
									</div>

									{/* Score Card */}
									<Card className="border-border transition-colors hover:border-primary/30">
										<CardContent className="p-6">
											<div className="flex items-center justify-between mb-4">
												<div className="flex items-center gap-3">
													<div className="p-2 rounded-lg bg-primary/10">
														<Trophy className="h-5 w-5 text-primary" />
													</div>
													<div>
														<p className="text-sm text-muted-foreground">Developer Score</p>
														<p className="font-semibold">Overall Rating</p>
													</div>
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
															<h4 className="font-semibold">Developer Level: {score.level}</h4>
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

											<div className="text-5xl font-bold text-primary mb-4">
												{score.total}
											</div>

											<Progress
												value={score.total}
												className="h-2 bg-muted [&>div]:bg-primary"
											/>
										</CardContent>
									</Card>

									{/* Section Selector */}
									<div className="space-y-4">
										<Select value={tab} onValueChange={setTab}>
											<SelectTrigger className="min-w-50 bg-white border border-border ">
												<SelectValue placeholder="Select section" />
											</SelectTrigger>
											<SelectContent className="bg-black">
												<SelectItem value="breakdown">Score Breakdown</SelectItem>
												<SelectItem value="languages">Languages</SelectItem>
												<SelectItem value="repos">Repositories</SelectItem>
											</SelectContent>
										</Select>

										<AnimatePresence mode="wait">
											{tab === "breakdown" && (
												<motion.div
													key="breakdown"
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													transition={{ duration: 0.2 }}
												>
													<Card>
														<CardHeader>
															<CardTitle className="flex items-center gap-2">
																<BarChart3 className="h-5 w-5 text-primary" />
																Score Components
															</CardTitle>
															<CardDescription>
																Detailed breakdown of how the developer score is calculated
															</CardDescription>
														</CardHeader>
														<CardContent className="space-y-4">
															<MetricBar
																label="Activity"
																value={score.breakdown.activity}
																icon={Activity}
																description="Based on repository count"
															/>
															<MetricBar
																label="Consistency"
																value={score.breakdown.consistency}
																icon={TrendingUp}
																description="Repositories per year"
															/>
															<MetricBar
																label="Experience"
																value={score.breakdown.experience}
																icon={Clock}
																description="Account age and longevity"
															/>
															<MetricBar
																label="Diversity"
																value={score.breakdown.diversity}
																icon={PieChart}
																description="Range of programming languages"
															/>
															<MetricBar
																label="Focus"
																value={score.breakdown.focus}
																icon={Target}
																description="Primary language dominance"
															/>
															<MetricBar
																label="Momentum"
																value={score.breakdown.momentum}
																icon={Zap}
																description="Recent activity pace"
															/>

															{user && (
																<div className="mt-4 p-3 bg-accent rounded-lg">
																	<p className="text-sm">
																		<span className="font-medium">Account Age:</span>{" "}
																		{getAccountAge(user.created_at).years} years,{" "}
																		{getAccountAge(user.created_at).months} months
																	</p>
																</div>
															)}
														</CardContent>
													</Card>
												</motion.div>
											)}

											{tab === "languages" && (
												<motion.div
													key="languages"
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													transition={{ duration: 0.2 }}
												>
													<Card>
														<CardHeader>
															<CardTitle className="flex items-center gap-2">
																<Code2 className="h-5 w-5 text-primary" />
																Language Distribution
															</CardTitle>
															<CardDescription>
																Languages used across {repoCount} repositories
															</CardDescription>
														</CardHeader>
														<CardContent>
															{languages && languages.length > 0 ? (
																<div className="space-y-4">
																	{languages
																		.sort((a, b) => b.repos - a.repos)
																		.slice(0, 8)
																		.map((lang, index) => (
																			<motion.div
																				key={lang.name}
																				initial={{ opacity: 0, y: 10 }}
																				animate={{ opacity: 1, y: 0 }}
																				transition={{ delay: index * 0.05 }}
																			>
																				<LanguageBar
																					language={lang.name}
																					count={lang.repos}
																					max={Math.max(...languages.map((l) => l.repos))}
																				/>
																			</motion.div>
																		))}
																	{languages.length > 8 && (
																		<p className="text-sm text-muted-foreground text-center pt-2">
																			+ {languages.length - 8} more languages
																		</p>
																	)}

																	<div className="mt-4 pt-4 border-t">
																		<p className="text-sm text-center text-muted-foreground">
																			Total: {languages.length} languages • {totalStars} stars •{" "}
																			{totalForks} forks
																		</p>
																	</div>
																</div>
															) : (
																<div className="text-center py-8 text-muted-foreground">
																	<Code2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
																	<p>No language data available</p>
																</div>
															)}
														</CardContent>
													</Card>
												</motion.div>
											)}

											{tab === "repos" && (
												<motion.div
													key="repos"
													initial={{ opacity: 0, y: 10 }}
													animate={{ opacity: 1, y: 0 }}
													exit={{ opacity: 0, y: -10 }}
													transition={{ duration: 0.2 }}
												>
													<Card>
														<CardHeader>
															<CardTitle className="flex items-center gap-2">
																<GitFork className="h-5 w-5 text-primary" />
																Recent Repositories
															</CardTitle>
															<CardDescription>
																Most recently updated repositories
															</CardDescription>
														</CardHeader>
														<CardContent>
															{repos.length > 0 ? (
																<div className="space-y-3">
																	{repos.slice(0, 5).map((repo, index) => (
																		<motion.div
																			key={repo.name}
																			initial={{ opacity: 0, y: 10 }}
																			animate={{ opacity: 1, y: 0 }}
																			transition={{ delay: index * 0.05 }}
																			className="p-3 border rounded-lg hover:bg-accent transition-colors"
																		>
																			<div className="flex items-center justify-between">
																				<a
																					href={repo.html_url}
																					target="_blank"
																					rel="noopener noreferrer"
																					className="font-medium hover:text-primary transition-colors"
																				>
																					{repo.name}
																				</a>
																				<div className="flex items-center gap-3 text-sm text-muted-foreground">
																					<span className="flex items-center gap-1">
																						<Star className="h-3 w-3" /> {repo.stars}
																					</span>
																					<span className="flex items-center gap-1">
																						<GitFork className="h-3 w-3" /> {repo.forks}
																					</span>
																				</div>
																			</div>
																			{repo.language && (
																				<Badge variant="secondary" className="mt-2 text-xs">
																					{repo.language}
																				</Badge>
																			)}
																		</motion.div>
																	))}
																</div>
															) : (
																<div className="text-center py-8 text-muted-foreground">
																	<p>No repository data available</p>
																</div>
															)}
														</CardContent>
													</Card>
												</motion.div>
											)}
										</AnimatePresence>
									</div>

									{/* Charts Section */}
									{(languages || score) && (
										<motion.div
											className="space-y-6"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{ delay: 0.3 }}
										>
											{languages && languages.length > 0 && (
												<LanguagePie languages={languages} totalRepos={repoCount || 0} />
											)}
											{score && <DeveloperRadar score={score} />}
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
												className="flex flex-col items-center justify-center p-8 border rounded-lg bg-muted/20"
											>
												<div className="flex items-center gap-3 mb-3">
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
													<p className="text-sm font-medium">Generating AI insights...</p>
												</div>
												<p className="text-xs text-muted-foreground">
													Analyzing developer data with advanced AI models
												</p>
											</motion.div>
										)}
									</AnimatePresence>

									{/* AI Summary */}
									{/* AI Summary */}
									<AnimatePresence>
										{aiSummary && !aiLoading && (
											<motion.div
												initial={{ opacity: 0, y: 10 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: -10 }}
												transition={{ duration: 0.2 }}
											>
												<Card className="overflow-hidden border-0 bg-linear-to-br from-card via-card to-card/95 shadow-xl pt-0">
													<CardHeader className="pb-2 pt-5">
														<div className="flex items-center gap-3">
															{/* Animated icon */}
															<div className="relative">
																<motion.div
																	className="absolute inset-0 rounded-xl bg-primary blur-md"
																	animate={{
																		scale: [1, 1.2, 1],
																		opacity: [0.3, 0.5, 0.3],
																	}}
																	transition={{
																		duration: 2,
																		repeat: Infinity,
																		ease: "easeInOut",
																	}}
																/>
																<div className="relative p-2.5 rounded-xl bg-linear-to-br from-primary to-chart-2 text-primary-foreground shadow-lg">
																	<Sparkles className="h-5 w-5" />
																</div>
															</div>

															<div>
																<CardTitle className="text-lg font-mono tracking-tight flex items-center gap-2">
																	AI Developer Insights
																	<Badge
																		variant="outline"
																		className="text-[10px] px-1.5 py-0 h-4 font-mono border-primary/30 bg-primary/5"
																	>
																		LIVE
																	</Badge>
																</CardTitle>
																<p className="text-xs font-mono text-muted-foreground/60 flex items-center gap-1">
																	<span className="relative flex h-1.5 w-1.5">
																		<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-chart-2 opacity-75"></span>
																		<span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-chart-2"></span>
																	</span>
																	real-time analysis
																</p>
															</div>
														</div>
													</CardHeader>

													<CardContent className="p-5 pt-2">
														<div className="space-y-2.5">
															{Object.entries(aiSummary.output).map(
																([key, value], index, array) => {
																	const content = value?.choices?.[0]?.message?.content;

																	if (!content || content === "No data") return null;

																	const displayKey = key
																		.replace(/_/g, " ")
																		.replace(/\b\w/g, (l) => l.toUpperCase());

																	// Get icon based on key
																	const getIcon = () => {
																		if (key.includes("archetype")) return "👤";
																		if (key.includes("experience")) return "📈";
																		if (key.includes("technical")) return "💻";
																		if (key.includes("strength")) return "⭐";
																		if (key.includes("risk")) return "🛡️";
																		if (key.includes("recommendation")) return "✅";
																		if (key.includes("role")) return "🎯";
																		if (key.includes("growth")) return "🌱";
																		if (key.includes("activity")) return "⚡";
																		return "💡";
																	};

																	const getBorderColor = (content: string) => {
																		if (
																			content.toLowerCase().includes("highly") ||
																			content.toLowerCase().includes("strong")
																		)
																			return "border-emerald-500/30 bg-emerald-500/5";
																		if (
																			content.toLowerCase().includes("limited") ||
																			content.toLowerCase().includes("could expand")
																		)
																			return "border-amber-500/30 bg-amber-500/5";
																		return "border-primary/20 bg-primary/5";
																	};

																	return (
																		<motion.div
																			key={key}
																			initial={{ opacity: 0, x: -10 }}
																			animate={{ opacity: 1, x: 0 }}
																			transition={{ delay: index * 0.03 }}
																			className="group relative"
																		>
																			{/* Hover effect background */}
																			<div className="absolute inset-0 rounded-xl bg-linear-to-r from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

																			<div
																				className={`relative p-4 rounded-xl border ${getBorderColor(content)} hover:shadow-md transition-all duration-300`}
																			>
																				{/* Header with icon and label */}
																				<div className="flex items-center gap-2 mb-2.5">
																					<span className="text-sm">{getIcon()}</span>
																					<span className="text-xs font-mono font-medium text-muted-foreground/70 uppercase tracking-wider">
																						{displayKey}
																					</span>

																					{/* Small index indicator */}
																					<span className="ml-auto text-[10px] font-mono text-muted-foreground/30">
																						{(index + 1).toString().padStart(2, "0")}
																					</span>
																				</div>

																				{/* Content with subtle animation */}
																				<motion.p
																					className="text-sm text-foreground/90 leading-relaxed px-3 text-justify"
																					initial={{ opacity: 0.8 }}
																					whileHover={{ opacity: 1, x: 2 }}
																					transition={{ duration: 0.2 }}
																				>
																					{content}
																				</motion.p>
																			</div>
																		</motion.div>
																	);
																},
															)}
														</div>
													</CardContent>
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
									<Skeleton className="h-100 w-full rounded-xl" />
									<div className="grid grid-cols-4 gap-3">
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
								>
									<Card>
										<CardContent className="p-12 text-center">
											<div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
												<Github className="h-10 w-10 text-primary/50" />
											</div>
											<h3 className="text-xl font-medium mb-2">No Developer Selected</h3>
											<p className="text-muted-foreground max-w-md mx-auto">
												Enter a GitHub username above to analyze their profile and get a
												comprehensive developer score
											</p>
											<div className="mt-6 flex gap-2 justify-center text-xs">
												{["torvalds", "gaearon", "apiz23"].map((name) => (
													<span
														key={name}
														className="px-3 py-1 rounded-full bg-accent border cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors"
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
