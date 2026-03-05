"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toPng } from "html-to-image";
import { useRef } from "react";
import {
	Calendar,
	Code2,
	Github,
	MapPin,
	Users,
	GitFork,
	Star,
	Hash,
	Zap,
	Monitor,
} from "lucide-react";
import Image from "next/image";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { toast } from "sonner";

interface DeveloperPassProps {
	user: any;
	score: any;
	topLanguage?: string;
	repoCount?: number;
	totalStars?: number;
}

export function DeveloperPass({
	user,
	score,
	topLanguage,
	repoCount = 0,
	totalStars = 0,
}: DeveloperPassProps) {
	const [isMobile, setIsMobile] = useState(false);

	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 1040);
		};

		checkMobile();
		window.addEventListener("resize", checkMobile);

		return () => window.removeEventListener("resize", checkMobile);
	}, []);

	const cardRef = useRef<HTMLDivElement>(null);

	const downloadPass = async () => {
		if (!cardRef.current) return;

		await toast.promise(
			(async () => {
				const dataUrl = await toPng(cardRef.current!, {
					cacheBust: true,
					backgroundColor: "transparent",
					style: {
						background: "transparent",
					},
					pixelRatio: 3,
					fontEmbedCSS: "",
				});

				const link = document.createElement("a");
				link.download = `${user?.login}-devpass.png`;
				link.href = dataUrl;
				link.click();
			})(),
			{
				loading: "Generating DevPass...",
				success: "DevPass downloaded successfully 🎉",
				error: "Failed to generate DevPass",
			},
		);
	};

	const formatNumber = (num: number) => {
		if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
		return num.toString();
	};

	if (isMobile) {
		return (
			<div className="flex w-full items-center justify-center p-4">
				<div className="relative w-full max-w-sm text-center space-y-6 bg-linear-to-br from-card/50 to-card/30 p-6 rounded-2xl border border-primary/20 shadow-xl overflow-hidden">
					{/* Decorative background */}
					<div className="absolute inset-0 -z-10">
						<div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
						<div className="absolute bottom-0 left-0 w-40 h-40 bg-chart-2/10 rounded-full blur-3xl" />
					</div>

					{/* Icon */}
					<motion.div
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						transition={{ duration: 0.5 }}
						className="flex justify-center"
					>
						<div className="relative">
							<div className="absolute inset-0 rounded-full bg-primary/30 blur-xl animate-pulse" />
							<div className="relative bg-primary/10 p-4 rounded-full border border-primary/30">
								<Monitor className="h-12 w-12 text-primary" />
							</div>
						</div>
					</motion.div>

					{/* Text */}
					<motion.div
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="space-y-3"
					>
						<h3 className="text-xl sm:text-2xl font-bold tracking-tight bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
							Screen Too Small
						</h3>

						<div className="space-y-3 text-muted-foreground">
							<p className="text-sm leading-relaxed">
								The{" "}
								<span className="font-semibold text-foreground">Developer Pass</span>{" "}
								requires a screen width of at least{" "}
								<span className="font-semibold text-primary">1040px</span> for the best
								viewing experience.
							</p>

							<p className="text-sm leading-relaxed">
								Please open this feature on a larger screen or desktop device to view
								the full Developer Passport layout.
							</p>
						</div>
					</motion.div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex min-h-125 w-full items-center justify-start p-4 overflow-x-auto">
			<div className="w-full">
				<div
					ref={cardRef}
					className="bg-transparent relative flex min-w-225 max-w-4xl flex-row"
				>
					{/* Main Section (Left) */}
					<div className="bg-black relative flex-1 p-8 md:p-10 overflow-hidden border border-primary/20 bg-linear-to-br from-card/40 to-card/10">
						{/* Static Background */}
						<div className="absolute inset-0 pointer-events-none">
							<div className="absolute inset-0 bg-linear-to-br from-primary/5 via-transparent to-accent/5" />
							<div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-primary/10 blur-[100px]" />
							<div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-accent/10 blur-[100px]" />
						</div>

						{/* Content */}
						<div className="relative z-10 flex h-full flex-col justify-between space-y-8">
							{/* Header */}
							<div className="flex justify-between items-start">
								<div className="space-y-2">
									<h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">
										DEV<span className="text-primary">PASS</span>
									</h2>
								</div>
								<div className="text-right">
									<p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
										Issue Date
									</p>
									<p className="font-mono text-xs font-bold bg-primary/5 px-2 py-1 rounded-md">
										{new Date().toLocaleDateString("en-US", {
											year: "numeric",
											month: "short",
											day: "2-digit",
										})}
									</p>
								</div>
							</div>

							{/* Profile Info */}
							<div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
								<div className="relative">
									<Avatar className="h-32 w-32 border-4 border-background shadow-2xl">
										<AvatarImage src={user?.avatar_url} />
										<AvatarFallback className="text-2xl bg-linear-to-br from-primary to-accent text-primary-foreground">
											{user?.login?.slice(0, 2).toUpperCase()}
										</AvatarFallback>
									</Avatar>
									<div className="absolute -bottom-1 right-2 bg-primary rounded-full p-2 border-2 border-background shadow-lg">
										<Github className="h-3.5 w-3.5 text-primary-foreground" />
									</div>
								</div>

								<div className="text-center md:text-left space-y-2">
									<h1 className="text-3xl md:text-4xl font-bold tracking-tight">
										{user?.name || user?.login}
									</h1>
									<p className="text-primary font-mono text-sm bg-primary/5 px-3 py-1 rounded-full inline-block">
										@{user?.login}
									</p>

									{/* Stats Pills */}
									<div className="flex flex-wrap justify-center md:justify-start gap-2 mt-4">
										<div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full text-xs">
											<Users className="h-3 w-3 text-chart-1" />
											<span>{formatNumber(user?.followers || 0)} followers</span>
										</div>
										<div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full text-xs">
											<GitFork className="h-3 w-3 text-chart-3" />
											<span>{repoCount} repos</span>
										</div>
										<div className="flex items-center gap-1 bg-muted/30 px-2 py-1 rounded-full text-xs">
											<Star className="h-3 w-3 text-chart-2" />
											<span>{formatNumber(totalStars)} stars</span>
										</div>
									</div>

									<div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
										<div className="flex items-center text-muted-foreground text-xs">
											<Calendar className="mr-1.5 h-3.5 w-3.5 text-primary" />
											<span>Joined {new Date(user?.created_at).getFullYear()}</span>
										</div>
										<div className="flex items-center text-muted-foreground text-xs">
											<MapPin className="mr-1.5 h-3.5 w-3.5 text-primary" />
											<span>{user?.location || "Earth"}</span>
										</div>
									</div>
								</div>
							</div>

							{/* Tech Stack Row */}
							<div className="flex flex-wrap gap-2 border-t border-primary/10 pt-6">
								{/* Primary Stack display */}
								<div className="flex-1 min-w-30">
									<p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">
										Primary Stack
									</p>
									<div className="flex items-center gap-2 bg-primary/5 px-3 py-2 rounded-lg border border-primary/10">
										<Code2 className="h-4 w-4 text-primary" />
										<span className="text-sm font-bold">{topLanguage || "Multiple"}</span>
									</div>
								</div>
								<div className="flex-1 min-w-30">
									<p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">
										Status
									</p>
									<div className="flex items-center gap-2 bg-green-500/10 px-3 py-2 rounded-lg border border-green-500/20">
										<div className="h-2 w-2 rounded-full bg-green-500" />
										<span className="text-sm font-bold text-green-500">Active</span>
									</div>
								</div>
								<div className="flex-1 min-w-30">
									<p className="text-[10px] text-muted-foreground font-mono uppercase mb-1">
										Expertise
									</p>
									<div className="flex items-center gap-2 bg-accent/10 px-3 py-2 rounded-lg border border-accent/90">
										<Zap className="h-4 w-4 text-accent" />
										<span className="text-sm font-bold">
											{Math.round(score?.breakdown?.experience || 0)}%
										</span>
									</div>
								</div>
							</div>

							{/* Bio */}
							{user?.bio && (
								<p className="text-xs text-muted-foreground italic border-l-2 border-primary/30 pl-3 line-clamp-2">
									"{user.bio}"
								</p>
							)}
						</div>

						{/* Ticket Cutout Effects */}
						<div className="absolute top-0 bottom-0 right-0 border-r-2 border-dashed border-primary/20" />
						<div className="absolute -right-3 -top-3 h-6 w-6 rounded-full bg-background z-20 border border-primary/20 shadow-lg" />
						<div className="absolute -right-3 -bottom-3 h-6 w-6 rounded-full bg-background z-20 border border-primary/20 shadow-lg" />
						<div className="absolute -left-3 top-1/2 h-6 w-6 rounded-full bg-background z-20 border border-primary/20 shadow-lg" />
					</div>

					{/* Stub Section (Right) */}
					<div className="bg-black relative flex w-80 flex-col items-center justify-center p-8 border border-primary/20 border-t-0 md:border-t md:border-l-0 bg-linear-to-br from-primary/10 to-primary/5 overflow-hidden">
						{/* Static Background */}
						<div className="absolute top-0 right-0 p-4">
							<Github className="h-14 w-14 text-primary/20" />
						</div>

						<div className="relative z-10 space-y-1 text-center">
							<div
								className="relative mx-auto"
								style={{ width: "176px", height: "116px" }}
							>
								<svg className="absolute inset-0 w-full h-full -rotate-90">
									<circle
										cx="88"
										cy="88"
										r="80"
										fill="none"
										stroke="hsl(var(--muted))"
										strokeWidth="6"
										className="opacity-20"
									/>
									<circle
										cx="88"
										cy="88"
										r="80"
										fill="none"
										stroke={`hsl(var(--${
											score?.level === "Elite Developer"
												? "chart-2"
												: score?.level === "Senior Developer"
													? "chart-1"
													: score?.level === "Intermediate Developer"
														? "chart-3"
														: score?.level === "Junior Developer"
															? "chart-4"
															: "primary"
										}))`}
										strokeWidth="6"
										strokeDasharray={`${2 * Math.PI * 80}`}
										strokeDashoffset={`${2 * Math.PI * 80 * (1 - (score?.total || 0) / 100)}`}
										strokeLinecap="round"
									/>
								</svg>

								{/* Inner Content - Perfectly centered */}
								<div className="absolute inset-0 flex flex-col items-center justify-center">
									<span className="text-5xl font-black text-primary">
										{score?.total}
									</span>
									<span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
										Dev Score
									</span>
								</div>
							</div>

							{/* QR Code */}
							<div className="bg-white p-3 rounded-xl shadow-2xl mx-auto w-fit border-4 border-background">
								<div className="space-y-2">
									<div className="p-3 rounded-xl shadow-2xl mx-auto w-fit border-4 border-background">
										<QRCodeSVG
											value={`https://github.com/${user?.login}`}
											size={112}
											level="H"
											className="text-white"
										/>
									</div>
								</div>
							</div>

							{/* Developer ID */}
							<div className="space-y-1">
								<p className="font-mono text-[8px] text-muted-foreground uppercase tracking-widest">
									Developer ID
								</p>
								<p className="font-mono text-sm font-bold bg-background/50 px-3 py-1 rounded-full border border-primary/20">
									<Hash className="inline h-3 w-3 mr-1 text-primary" />
									{user?.id?.toString().slice(0, 8).toUpperCase() || "XXXXXX"}
								</p>
							</div>

							{/* Verification Badge */}
							<div className="flex items-center justify-center gap-1.5 text-[14px] text-muted-foreground border-t border-primary/10 pt-4">
								<div className="h-2 w-2 rounded-full bg-green-500" />
								<span>DevInsight</span>
								<div className="w-7 h-7 relative">
									<Image
										src="/icons/favicon-32x32.png"
										alt="DevInsight Logo"
										fill
										className="object-contain"
										priority
									/>
								</div>
							</div>
						</div>
					</div>
				</div>
				<div className="flex justify-end mt-4">
					<Button onClick={downloadPass}>Download DevPass</Button>
				</div>
			</div>
		</div>
	);
}
