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
	languages: Record<string, number>;
};

const CHART_COLORS = [
	"var(--chart-1)",
	"var(--chart-2)",
	"var(--chart-3)",
	"var(--chart-4)",
	"var(--chart-5)",
];

export function LanguagePie({ languages }: Props) {
	const entries = Object.entries(languages);

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
				<CardContent className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
					No language data available
				</CardContent>
			</Card>
		);
	}

	// Sort by count descending and take top 6
	const sorted = entries.sort((a, b) => b[1] - a[1]).slice(0, 6);
	const total = sorted.reduce((sum, [, v]) => sum + v, 0);

	// Calculate percentages and prepare chart data (using visitors as dataKey like the example)
	const chartData = sorted.map(([name, value], i) => ({
		browser: name.toLowerCase().replace(/\s+/g, ""),
		language: name,
		visitors: value,
		fill: CHART_COLORS[i % CHART_COLORS.length],
	}));

	// Build chart config dynamically (matching the example pattern)
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
										const percentage = Math.round((numValue / total) * 100);

										return [
											`${numValue.toLocaleString()} (${percentage}%)`,
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
							label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
							labelLine={false}
						/>
					</PieChart>
				</ChartContainer>
			</CardContent>

			{/* Footer with total count (similar to example footer) */}
			<div className="mt-2 pb-4 px-6 text-center">
				<p className="text-xs text-muted-foreground">
					Total:{" "}
					<span className="font-semibold text-foreground">
						{total.toLocaleString()} repositories
					</span>
				</p>
			</div>
		</Card>
	);
}
