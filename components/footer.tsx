import React from "react";

export default function Footer() {
	return (
		<footer className="border-t border-border bg-background/80 backdrop-blur-sm">
			<div className="container mx-auto px-4 py-6">
				<div className="flex flex-col md:flex-row items-center justify-between gap-4">
					<p className="text-sm text-muted-foreground">
						© 2026 DevInsight Pro. All rights reserved.
					</p>
					<div className="flex items-center gap-4">
						<a
							href="#"
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							Privacy
						</a>
						<a
							href="#"
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							Terms
						</a>
						<a
							href="#"
							className="text-sm text-muted-foreground hover:text-primary transition-colors"
						>
							Contact
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
