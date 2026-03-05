"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home, Search, FileQuestion } from "lucide-react";

export default function NotFound() {
	return (
		<div className="min-h-screen flex items-center justify-center px-4">
			<div className="max-w-md w-full text-center">
				{/* Simple 404 */}
				<div className="mb-6">
					<div className="text-7xl font-mono font-bold text-primary">404</div>
					<div className="w-16 h-0.5 bg-primary/30 mx-auto mt-2" />
				</div>

				{/* Message */}
				<div className="flex justify-center mb-4">
					<FileQuestion className="h-12 w-12 text-primary/40" />
				</div>
				<h1 className="text-lg font-mono mb-2">Page Not Found</h1>
				<p className="text-sm text-muted-foreground mb-8 font-mono">
					The page you're looking for doesn't exist or has been moved.
				</p>

				{/* Simple button */}
				<div className="flex justify-center">
					<Button asChild className="gap-2">
						<Link href="/">
							<Home className="h-4 w-4" />
							Back to Main Page
						</Link>
					</Button>
				</div>
			</div>
		</div>
	);
}
