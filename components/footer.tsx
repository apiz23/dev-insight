"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
	Github,
	Heart,
	Sparkles,
	ArrowUp,
	Mail,
	Shield,
	FileText,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const footerLinks = [
		{ href: "/privacy", label: "Privacy", icon: Shield },
		{ href: "/terms", label: "Terms", icon: FileText },
		{ href: "/contact", label: "Contact", icon: Mail },
	];

	const [apiStatus, setApiStatus] = useState<"loading" | "ok" | "error">(
		"loading",
	);
	useEffect(() => {
		const checkApi = async () => {
			try {
				const res = await fetch("/api/health");
				if (!res.ok) throw new Error();
				setApiStatus("ok");
			} catch {
				setApiStatus("error");
			}
		};

		checkApi();
	}, []);

	return (
		<footer className="relative border-t border-border/40 backdrop-blur-sm">
			{/* Decorative linear line */}
			<div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-primary/20 to-transparent" />

			{/* Background decoration */}
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-primary/5 blur-3xl" />
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-chart-2/5 blur-3xl" />
			</div>

			<div className="container mx-auto px-4 py-8 relative">
				{/* Main footer content */}
				<div className="flex flex-col lg:flex-row items-center justify-between gap-6">
					{/* Brand section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex flex-col items-center lg:items-start gap-2"
					>
						<div className="flex items-center gap-2">
							<div className="relative">
								<div className="absolute inset-0 rounded-full bg-primary/20 blur-md" />
								<Sparkles className="h-5 w-5 text-primary relative" />
							</div>
							<span className="text-lg font-semibold bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
								DevInsight Pro
							</span>
						</div>
						<p className="text-sm text-muted-foreground max-w-md text-center lg:text-left">
							Empowering developers with comprehensive GitHub analytics and insights to
							track and improve their coding journey.
						</p>

						{/* Made with love badge */}
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 mt-1">
							<span>Made with</span>
							<Heart className="h-3 w-3 fill-red-500 text-red-500 animate-pulse" />
							<span>by developers for developers</span>
						</div>
					</motion.div>

					{/* Links section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="flex flex-col items-center lg:items-end gap-4"
					>
						{/* Navigation links */}
						<div className="flex items-center gap-4 flex-wrap justify-center">
							{footerLinks.map((link) => {
								const Icon = link.icon;
								return (
									<Link
										key={link.href}
										href={link.href}
										className="group flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-all duration-300 hover:scale-105"
									>
										<Icon className="h-3.5 w-3.5 transition-transform group-hover:rotate-3" />
										<span>{link.label}</span>
									</Link>
								);
							})}
						</div>

						{/* GitHub repo button */}
						<div className="flex items-center gap-3">
							<Button
								variant="outline"
								size="sm"
								className="gap-2 border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300 group"
								asChild
							>
								<Link
									href="https://github.com/apiz23/dev-insight"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Github className="h-4 w-4 transition-transform group-hover:rotate-3" />
									<span>Star on GitHub</span>
									<span className="text-xs bg-primary/10 px-1.5 py-0.5 rounded-full ml-1">
										★
									</span>
								</Link>
							</Button>

							{/* Scroll to top button */}
							<Button
								variant="ghost"
								size="icon"
								className="h-8 w-8 rounded-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
								onClick={scrollToTop}
								title="Scroll to top"
							>
								<ArrowUp className="h-4 w-4" />
							</Button>
						</div>
					</motion.div>
				</div>

				{/* Bottom bar */}
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mt-8 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-4"
				>
					{/* Copyright */}
					<p className="text-xs text-muted-foreground/70 text-center sm:text-left">
						© {currentYear} DevInsight Pro. All rights reserved.
						<span className="hidden sm:inline mx-2">•</span>
						<br className="sm:hidden" />
						Version 2.0.1
					</p>

					{/* Status badge */}
					<div className="flex items-center gap-3">
						<div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
							<div className="relative">
								<div className="absolute inset-0 rounded-full bg-emerald-500 animate-ping opacity-20" />
								<div className="h-1.5 w-1.5 rounded-full bg-emerald-500 relative" />
							</div>
							<span className="text-[10px] font-medium text-emerald-500">
								All systems operational
							</span>
						</div>

						{/* API Status */}
						<div className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
							<span className="hidden sm:inline">API:</span>
							<span
								className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
									apiStatus === "ok"
										? "bg-emerald-500/10 text-emerald-500"
										: apiStatus === "error"
											? "bg-red-500/10 text-red-500"
											: "bg-yellow-500/10 text-yellow-500"
								}`}
							>
								{apiStatus === "loading"
									? "Checking..."
									: apiStatus === "ok"
										? "200 OK"
										: "Offline"}
							</span>
						</div>
					</div>
				</motion.div>
			</div>
		</footer>
	);
}
