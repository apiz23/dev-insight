"use client";

import { ModeToggle } from "./mode-toggle";
import { Button } from "./ui/button";
import Link from "next/link";
import Image from "next/image";

export default function Navbar() {
	return (
		<nav className="w-full">
			<div className="max-w-5xl mx-auto px-4">
				<div className="flex h-16 items-center justify-center">
					{/* Logo and Title */}
					<div className="flex items-center gap-2">
						<div className="w-9 h-9 relative">
							<Image
								src="/icons/favicon-32x32.png"
								alt="DevInsight Logo"
								fill
								className="object-contain"
								priority
							/>
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
