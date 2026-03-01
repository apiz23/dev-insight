"use client";

import { Bar, BarChart, XAxis, YAxis } from "recharts";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import type { ChartConfig } from "@/components/ui/chart";

type Props = {
	languages: Record<string, number>;
};

const chartConfig = {
	value: {
		label: "Bytes of Code",
		color: "hsl(var(--primary))",
	},
} satisfies ChartConfig;

export function LanguageChart({ languages }: Props) {
	const data = Object.entries(languages)
		.map(([name, value]) => ({ name, value }))
		.sort((a, b) => b.value - a.value)
		.slice(0, 6);

	return (
		<ChartContainer config={chartConfig} className="h-75 w-full">
			<BarChart data={data}>
				<XAxis dataKey="name" />
				<YAxis />
				<ChartTooltip content={<ChartTooltipContent />} />
				<Bar dataKey="value" radius={6} />
			</BarChart>
		</ChartContainer>
	);
}
