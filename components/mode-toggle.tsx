"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export function ModeToggle() {
	const [mounted, setMounted] = React.useState(false);
	const { theme, setTheme, systemTheme } = useTheme();

	React.useEffect(() => {
		setMounted(true);
	}, []);

	if (!mounted) {
		return (
			<Button
				variant="outline"
				size="icon"
				className="h-10 w-10 rounded-full"
				aria-label="Toggle theme"
				disabled
			>
				<div className="h-[1.2rem] w-[1.2rem] bg-muted rounded-full animate-pulse" />
			</Button>
		);
	}

	const currentTheme = theme === "system" ? systemTheme : theme;
	const isDark = currentTheme === "dark";
	const isSystem = theme === "system";

	const toggleTheme = () => {
		if (isDark) {
			setTheme("light");
		} else if (isSystem) {
			setTheme("dark");
		} else {
			setTheme("system");
		}
	};

	const getIcon = () => {
		if (isDark) return <Moon className="h-[1.2rem] w-[1.2rem]" />;
		if (isSystem) return <Monitor className="h-[1.2rem] w-[1.2rem]" />;
		return <Sun className="h-[1.2rem] w-[1.2rem]" />;
	};

	const getTooltipText = () => {
		if (isDark) return "Switch to light theme";
		if (isSystem) return "Switch to dark theme";
		return "Switch to system theme";
	};

	return (
		<TooltipProvider>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant="outline"
						size="icon"
						onClick={toggleTheme}
						aria-label={getTooltipText()}
						className="h-10 w-10 rounded-full border-border/50 bg-background/50 backdrop-blur-sm hover:border-primary/50 hover:bg-accent/10"
					>
						{getIcon()}
					</Button>
				</TooltipTrigger>
				<TooltipContent side="bottom" className="text-xs">
					{getTooltipText()}
				</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	);
}
