"use client";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import { Github, Rocket } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
	return (
		<nav className="w-full">
			<div className="max-w-5xl mx-auto px-4">
				<div className="flex h-16 items-center justify-center">
					{/* Logo and Title */}
					<div className="flex items-center gap-2">
						<div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
							<Rocket className="h-4 w-4 text-primary" />
						</div>
						<span className="font-bold text-lg">
							<span className="bg-linear-to-r from-primary to-chart-2 bg-clip-text text-transparent">
								DevInsight
							</span>
						</span>
					</div>
				</div>
			</div>
		</nav>
	);
}
