"use client";

import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
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
	score: {
		breakdown: {
			activity: number;
			diversity: number;
			experience: number;
			consistency: number;
		};
	};
};

// Variable-based color constants
const CHART_COLORS = {
	elite: "var(--chart-2)", // Lime
	senior: "var(--chart-1)", // Purple
	intermediate: "var(--chart-3)", // Light Green
	low: "var(--chart-4)", // Gray
};

export function DeveloperRadar({ score }: Props) {
	const chartData = [
		{ metric: "Activity", value: score.breakdown.activity },
		{ metric: "Diversity", value: score.breakdown.diversity },
		{ metric: "Experience", value: score.breakdown.experience },
		{ metric: "Consistency", value: score.breakdown.consistency },
	];

	const average = Math.round(
		chartData.reduce((sum, item) => sum + item.value, 0) / chartData.length,
	);

	const chartConfig = {
		value: {
			label: "Score",
			color: CHART_COLORS.elite,
		},
	} satisfies ChartConfig;

	// Helper for Tailwind classes (Text and Background)
	const getMetricColorClass = (value: number) => {
		if (value >= 80) return "text-[var(--chart-2)]";
		if (value >= 60) return "text-[var(--chart-1)]";
		if (value >= 40) return "text-[var(--chart-3)]";
		return "text-[var(--chart-4)]";
	};

	return (
		<Card className="border-border/20 shadow-sm hover:shadow-md transition-shadow">
			<CardHeader className="pb-2 space-y-1">
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="text-foreground text-lg">
							Developer Skill Radar
						</CardTitle>
						<CardDescription className="text-muted-foreground text-xs">
							Overall capability distribution
						</CardDescription>
					</div>
					<div className="flex flex-col items-end">
						<span className="text-xs text-muted-foreground">Average</span>
						<span className={`text-xl font-bold ${getMetricColorClass(average)}`}>
							{average}
						</span>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pb-4">
				<ChartContainer
					config={chartConfig}
					className="mx-auto aspect-square max-h-100 w-full"
				>
					<RadarChart data={chartData}>
						<ChartTooltip
							cursor={false}
							content={<ChartTooltipContent hideLabel />}
						/>
						<PolarGrid className="stroke-muted/30" />
						<PolarAngleAxis
							dataKey="metric"
							tick={{
								fill: "var(--muted-foreground)",
								fontSize: 11,
								fontWeight: 500,
							}}
						/>
						<Radar
							dataKey="value"
							stroke={CHART_COLORS.elite}
							fill={CHART_COLORS.elite}
							fillOpacity={0.4}
							strokeWidth={2}
						/>
					</RadarChart>
				</ChartContainer>

				{/* Metrics Breakdown */}
				<div className="mt-4 grid grid-cols-2 gap-2">
					{chartData.map((item) => (
						<div
							key={item.metric}
							className="flex items-center justify-between p-2 rounded-lg bg-muted/5 border border-border/50"
						>
							<span className="text-xs text-muted-foreground">{item.metric}</span>
							<span
								className={`text-sm font-semibold ${getMetricColorClass(item.value)}`}
							>
								{item.value}
							</span>
						</div>
					))}
				</div>

				{/* Legend with var colors */}
				<div className="mt-4 pt-3 border-t border-border/50">
					<div className="flex flex-wrap items-center justify-between gap-y-2">
						<div className="flex items-center gap-1.5">
							<div
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: CHART_COLORS.elite }}
							/>
							<span className="text-[10px] text-muted-foreground">80+: Elite</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: CHART_COLORS.senior }}
							/>
							<span className="text-[10px] text-muted-foreground">60-79: Senior</span>
						</div>
						<div className="flex items-center gap-1.5">
							<div
								className="w-2 h-2 rounded-full"
								style={{ backgroundColor: CHART_COLORS.intermediate }}
							/>
							<span className="text-[10px] text-muted-foreground">40-59: Int.</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}
