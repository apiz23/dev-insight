"use client";

import React, { useState } from "react";
import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Github, Menu, Rocket, X } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

export default function Navbar() {
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-border bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4">
				<div className="flex h-16 items-center justify-between">
					{/* Logo */}
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
							<Rocket className="h-4 w-4 text-primary" />
						</div>
						<span className="font-bold text-lg hidden sm:inline-block">
							<span className="bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
								DevInsight
							</span>
							<span className="text-muted-foreground ml-1">Pro</span>
						</span>
					</div>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-6">
						<a
							href="#"
							className="text-sm font-medium text-foreground hover:text-primary transition-colors"
						>
							Home
						</a>
						<a
							href="#"
							className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
						>
							Features
						</a>
						<a
							href="#"
							className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
						>
							About
						</a>
						<a
							href="#"
							className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
						>
							Contact
						</a>
					</div>

					{/* Right side - Theme Toggle & Mobile Menu */}
					<div className="flex items-center gap-2">
						<ModeToggle />

						{/* Mobile Menu Button */}
						<Button
							variant="ghost"
							size="icon"
							className="md:hidden text-foreground"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
						>
							{mobileMenuOpen ? (
								<X className="h-5 w-5" />
							) : (
								<Menu className="h-5 w-5" />
							)}
						</Button>

						{/* Desktop Action Button */}
						<Button
							className="hidden md:inline-flex gap-2 ml-2 bg-primary text-primary-foreground hover:bg-primary/90"
							size="sm"
						>
							<Github className="h-4 w-4" />
							GitHub
						</Button>
					</div>
				</div>

				{/* Mobile Menu */}
				{mobileMenuOpen && (
					<motion.div
						initial={{ opacity: 0, height: 0 }}
						animate={{ opacity: 1, height: "auto" }}
						exit={{ opacity: 0, height: 0 }}
						className="md:hidden py-4 border-t border-border"
					>
						<div className="flex flex-col space-y-3">
							<a
								href="#"
								className="text-sm font-medium text-foreground hover:text-primary transition-colors px-2 py-1"
							>
								Home
							</a>
							<a
								href="#"
								className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1"
							>
								Features
							</a>
							<a
								href="#"
								className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1"
							>
								About
							</a>
							<a
								href="#"
								className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors px-2 py-1"
							>
								Contact
							</a>
							<Button
								className="w-full gap-2 mt-2 bg-primary text-primary-foreground"
								size="sm"
								asChild
							>
								<Link
									href="https://github.com/apiz23"
									target="_blank"
									rel="noopener noreferrer"
								>
									<Github className="h-4 w-4" />
									GitHub
								</Link>
							</Button>
						</div>
					</motion.div>
				)}
			</div>
		</nav>
	);
}
