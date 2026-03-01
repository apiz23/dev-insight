import type { Metadata } from "next";
import { Inter, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

const fontSans = Inter({
	subsets: ["latin"],
	variable: "--font-sans",
});

const fontSerif = Source_Serif_4({
	subsets: ["latin"],
	variable: "--font-serif",
});

const fontMono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const metadata: Metadata = {
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
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${fontSans.className} ${fontSerif.className} ${fontMono.className} antialiased`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="system"
					enableSystem
					disableTransitionOnChange
				>
					<TooltipProvider>
						<Navbar />
						{children}
						<Footer />
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
