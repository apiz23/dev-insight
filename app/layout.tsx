import type { Metadata } from "next";
import { Sora, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import Footer from "@/components/footer";
import DarkVeil from "@/components/DarkVeil";
import Beams from "@/components/Beams";

const sora = Sora({
	subsets: ["latin"],
	variable: "--font-heading",
	weight: ["500", "600", "700"],
});
const inter = Inter({
	subsets: ["latin"],
	variable: "--font-body",
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
			<body className={`${sora.className} ${inter.className} antialiased`}>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<TooltipProvider>
						<div className="relative min-h-screen flex flex-col">
							<div className="fixed inset-0 -z-10">
								<div className="absolute inset-0" style={{ filter: "blur(2px)" }}>
									<DarkVeil
										hueShift={0}
										noiseIntensity={0}
										scanlineIntensity={0}
										speed={1.5}
										scanlineFrequency={0}
										warpAmount={2}
									/>
								</div>
							</div>
							{/* <div className="fixed inset-0 -z-10">
								<div className="absolute inset-0" style={{ filter: "blur(5px)" }}>
									<Beams
										beamWidth={3}
										beamHeight={30}
										beamNumber={20}
										lightColor="#b63cff"
										speed={6}
										noiseIntensity={1.75}
										scale={0.2}
										rotation={300}
									/>
								</div>
							</div> */}

							{/* Content */}
							{/* <Navbar /> */}
							<main className="flex-1 relative z-0 ">
								<Toaster richColors position="top-center" />
								{children}
							</main>
							<Footer />
						</div>
					</TooltipProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
