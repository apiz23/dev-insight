"use client";

import { Line, LineChart, XAxis, CartesianGrid, YAxis } from "recharts";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

type Props = {
	repos: any[];
};

// Use the standard variable-based color
const TIMELINE_COLOR = "var(--chart-2)";

export function ActivityTimeline({ repos }: Props) {
	const map: Record<string, number> = {};

	repos.forEach((repo) => {
		const year = new Date(repo.created_at).getFullYear().toString();
		map[year] = (map[year] || 0) + 1;
	});

	const chartData = Object.entries(map)
		.map(([year, count]) => ({
			year,
			repos: count,
		}))
		.sort((a, b) => parseInt(a.year) - parseInt(b.year));

	const chartConfig = {
		repos: {
			label: "Repositories Created",
			color: TIMELINE_COLOR,
		},
	} satisfies ChartConfig;

	if (chartData.length === 0) {
		return (
			<Card className="border-border/20 shadow-sm">
				<CardHeader className="pb-2">
					<CardTitle className="text-foreground text-lg">
						Activity Timeline
					</CardTitle>
					<CardDescription className="text-muted-foreground text-xs">
						Repository growth by year
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-100 text-muted-foreground">
					No timeline data available
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-border/20 shadow-sm hover:shadow-md transition-shadow">
			<CardHeader className="pb-2">
				<CardTitle className="text-foreground text-lg">Activity Timeline</CardTitle>
				<CardDescription className="text-muted-foreground text-xs">
					Repository growth by year
				</CardDescription>
			</CardHeader>
			<CardContent className="pb-4">
				<ChartContainer config={chartConfig} className="h-100 w-full">
					<LineChart
						data={chartData}
						margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
					>
						<CartesianGrid
							vertical={false}
							stroke="var(--border)"
							strokeDasharray="3 3"
							className="stroke-muted/30"
						/>
						<XAxis
							dataKey="year"
							tick={{
								fill: "var(--muted-foreground)",
								fontSize: 11,
							}}
							tickLine={{ stroke: "var(--border)" }}
							axisLine={{ stroke: "var(--border)" }}
						/>
						<YAxis
							tick={{
								fill: "var(--muted-foreground)",
								fontSize: 11,
							}}
							tickLine={{ stroke: "var(--border)" }}
							axisLine={{ stroke: "var(--border)" }}
							allowDecimals={false}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(value: any) => {
										const numValue =
											typeof value === "number" ? value : parseFloat(value) || 0;
										return [`${numValue} repo${numValue === 1 ? "" : "s"}`, "Created"];
									}}
								/>
							}
						/>
						<Line
							dataKey="repos"
							stroke={TIMELINE_COLOR}
							strokeWidth={2}
							dot={{
								fill: TIMELINE_COLOR,
								stroke: "var(--background)",
								strokeWidth: 2,
								r: 4,
							}}
							activeDot={{
								fill: TIMELINE_COLOR,
								stroke: "var(--background)",
								strokeWidth: 2,
								r: 6,
							}}
						/>
					</LineChart>
				</ChartContainer>

				<div className="mt-4 grid grid-cols-2 gap-2">
					<div className="p-2 rounded-lg bg-muted/5 border border-border/20">
						<p className="text-xs text-muted-foreground font-medium">Total Repos</p>
						<p className="text-lg font-bold text-foreground">
							{chartData.reduce((sum, item) => sum + item.repos, 0)}
						</p>
					</div>
					<div className="p-2 rounded-lg bg-muted/5 border border-border/20">
						<p className="text-xs text-muted-foreground font-medium">Time Span</p>
						<p className="text-lg font-bold text-foreground">
							{chartData.length} {chartData.length === 1 ? "year" : "years"}
						</p>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
