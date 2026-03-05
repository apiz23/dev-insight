"use client";

import { Pie, PieChart } from "recharts";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
	type ChartConfig,
} from "@/components/ui/chart";

type Props = {
	languages: {
		name: string;
		repos: number;
		stars: number;
		forks: number;
		score: number;
	}[];
	totalRepos?: number;
};
const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

export function LanguagePie({ languages, totalRepos }: Props) {
	const entries = languages;
	if (entries.length === 0) {
		return (
			<Card className="border-border/10 shadow-sm bg-card flex flex-col">
				<CardHeader className="items-center pb-2">
					<CardTitle className="text-foreground text-base font-semibold">
						Language Distribution
					</CardTitle>
					<CardDescription className="text-muted-foreground text-xs">
						Top languages by usage
					</CardDescription>
				</CardHeader>
				<CardContent className="flex items-center justify-center h-65 text-muted-foreground text-sm">
					No language data available
				</CardContent>
			</Card>
		);
	}

	// Sort by count descending and take top 6
	const sorted = [...entries].sort((a, b) => b.repos - a.repos).slice(0, 6);
	const totalOccurrences = sorted.reduce((sum, lang) => sum + lang.repos, 0);
	// Calculate percentages and prepare chart data
	const chartData = sorted.map((lang, i) => ({
		browser: lang.name.toLowerCase().replace(/\s+/g, ""),
		language: lang.name,
		visitors: lang.repos,
		fill: CHART_COLORS[i % CHART_COLORS.length],
		percentage: totalRepos ? Math.round((lang.repos / totalRepos) * 100) : 0,
	}));

	// Build chart config dynamically
	const chartConfig = {
		visitors: {
			label: "Repositories",
		},
		...Object.fromEntries(
			chartData.map((item) => [
				item.browser,
				{
					label: item.language,
					color: item.fill,
				},
			]),
		),
	} satisfies ChartConfig;

	return (
		<Card className="border-border/10 shadow-sm bg-card hover:shadow-md transition-all flex flex-col">
			<CardHeader className="items-center pb-0">
				<CardTitle className="text-foreground text-base font-semibold">
					Language Distribution
				</CardTitle>
				<CardDescription className="text-muted-foreground text-xs">
					Top {chartData.length} languages by repository count
				</CardDescription>
			</CardHeader>

			<CardContent className="flex-1 pb-0">
				<ChartContainer
					config={chartConfig}
					className="[&_.recharts-pie-label-text]:fill-foreground mx-auto aspect-square max-h-100 w-full"
				>
					<PieChart>
						<ChartTooltip
							content={
								<ChartTooltipContent
									hideLabel
									formatter={(value: any, name: any) => {
										let numValue = 0;

										if (typeof value === "number") {
											numValue = value;
										} else if (typeof value === "string") {
											numValue = parseFloat(value) || 0;
										} else if (Array.isArray(value)) {
											numValue = Number(value[0]) || 0;
										}

										const item = chartData.find((d) => d.browser === name);
										const percentage = totalRepos
											? Math.round((numValue / totalRepos) * 100)
											: Math.round((numValue / totalOccurrences) * 100);

										return [
											`${numValue} repo${numValue !== 1 ? "s" : ""} (${percentage}%)`,
											item?.language || String(name),
										];
									}}
								/>
							}
						/>
						<Pie
							data={chartData}
							dataKey="visitors"
							nameKey="browser"
							label={({ payload }) => {
								const percentage = totalRepos
									? Math.round((payload.visitors / totalRepos) * 100)
									: Math.round((payload.visitors / totalOccurrences) * 100);
								return `${percentage}%`;
							}}
							labelLine={false}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>

			{/* Footer with clear information */}
			<div className="mt-2 pb-4 px-6 space-y-1 text-center">
				<p className="text-xs text-muted-foreground">
					<span className="font-semibold text-foreground">{totalOccurrences}</span>{" "}
					total language occurrences
					{totalRepos && (
						<>
							{" "}
							across{" "}
							<span className="font-semibold text-foreground">{totalRepos}</span>{" "}
							repositories
						</>
					)}
				</p>
				{totalRepos && (
					<p className="text-xs text-muted-foreground">
						Average {(totalOccurrences / totalRepos).toFixed(1)} languages per
						repository
					</p>
				)}
			</div>
		</Card>
	);
}
