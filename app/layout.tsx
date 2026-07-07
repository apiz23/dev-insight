import type { Metadata } from "next";
import { Geist_Mono, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import SiteBackground from "@/components/site-background";
import { Analytics } from "@vercel/analytics/next";
import Navbar from "@/components/navbar";

const geistMono = Geist_Mono({
	subsets: ["latin"],
	variable: "--font-sans",
});
const jetbrainsMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
	metadataBase: new URL(
		process.env.VERCEL_URL
			? `https://${process.env.VERCEL_URL}`
			: "http://localhost:3000",
	),
	title: "DevInsight — GitHub Developer Analytics",
	description:
		"Analyze GitHub developer activity, consistency, and language usage with an interactive analytics dashboard built using Next.js.",
	keywords: [
		"GitHub analytics",
		"developer dashboard",
		"Next.js project",
		"data visualization",
		"portfolio project",
	],
	icons: {
		icon: "/icons/favicon-32x32.png",
		shortcut: "/favicon.ico",
		apple: "/icons/favicon-32x32.png",
	},
	openGraph: {
		title: "DevInsight — GitHub Developer Analytics",
		description:
			"Analyze GitHub developer activity, consistency, and language usage with an interactive analytics dashboard built using Next.js.",
		images: ["/icons/favicon-32x32.png"],
	},
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="dark">
			<body
				className={`${geistMono.variable} ${jetbrainsMono.variable} antialiased`}
			>
				<TooltipProvider>
					<div className="relative min-h-screen flex flex-col">
						<SiteBackground />

						{/* Content */}
						<Navbar />
						<main className="flex-1 relative z-0 ">
							<Toaster richColors position="top-center" />
							<Analytics />
							{children}
						</main>
						<Footer />
					</div>
				</TooltipProvider>
			</body>
		</html>
	);
}
