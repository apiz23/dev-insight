import { motion } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { LucideIcon } from "lucide-react";
import { Progress } from "./ui/progress";

export function StatCard({
	icon: Icon,
	label,
	value,
	color,
	iconColor,
}: {
	icon: any;
	label: string;
	value: number | string;
	color: string;
	iconColor: string;
}) {
	return (
		<motion.div
			whileHover={{ y: -2, scale: 1.02 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
			className={`relative overflow-hidden p-4 rounded-xl border bg-linear-to-br ${color} backdrop-blur-sm transition-all hover:shadow-md`}
		>
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-grid-white/5 mask-[radial-linear(ellipse_at_center,transparent_60%,black)]" />

			{/* Content */}
			<div className="relative z-10">
				<div className="flex items-center justify-between mb-2">
					<div className={`p-2 rounded-lg bg-background/50 ${iconColor}`}>
						<Icon className="h-4 w-4" />
					</div>
					<span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
						{label}
					</span>
				</div>
				<div className={`text-2xl font-bold ${iconColor}`}>
					{typeof value === "number" ? value.toLocaleString() : value}
				</div>
			</div>
		</motion.div>
	);
}

interface DetailCardProps {
	icon: LucideIcon;
	text: string;
	href?: string;
	className?: string;
}

export function DetailCard({
	icon: Icon,
	text,
	href,
	className = "",
}: DetailCardProps) {
	const content = (
		<div
			className={`group/card flex items-center gap-3 p-3 rounded-xl border border-border/50 bg-card/30 backdrop-blur-sm hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 ${className}`}
		>
			{/* Icon with theme colors */}
			<div className="p-2 rounded-lg bg-primary/10 text-primary group-hover/card:bg-primary/20 group-hover/card:scale-110 transition-all duration-300">
				<Icon className="h-3.5 w-3.5" />
			</div>

			{/* Text with proper typography */}
			<span className="text-sm font-mono text-muted-foreground group-hover/card:text-foreground transition-colors truncate flex-1">
				{text}
			</span>

			{/* Optional external link indicator */}
			{href && (
				<ChevronRight className="h-3 w-3 text-muted-foreground/50 group-hover/card:text-primary/50 group-hover/card:translate-x-0.5 transition-all duration-300" />
			)}
		</div>
	);

	if (href) {
		return (
			<a href={href} target="_blank" rel="noopener noreferrer" className="block">
				{content}
			</a>
		);
	}

	return content;
}

export function MetricBar({
	label,
	value,
	icon: Icon,
	description,
}: {
	label: string;
	value: number;
	icon: any;
	description: string;
}) {
	return (
		<div className="space-y-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Icon className="h-4 w-4 text-primary" />
					<span className="font-medium">{label}</span>
				</div>
				<span className="text-sm font-bold text-primary">{value}/100</span>
			</div>
			<Progress value={(value / 25) * 100} className="h-2 [&>div]:bg-primary" />
			<p className="text-xs text-muted-foreground">{description}</p>
		</div>
	);
}

export function LanguageBar({
	language,
	count,
	max,
}: {
	language: string;
	count: number;
	max: number;
}) {
	const percentage = (count / max) * 100;

	return (
		<div className="flex items-center gap-3">
			<span className="text-sm font-medium w-24 truncate">{language}</span>

			<div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
				<motion.div
					initial={{ width: 0 }}
					animate={{ width: `${percentage}%` }}
					transition={{ duration: 0.8, delay: 0.2 }}
					className="h-full bg-linear-to-r from-primary to-chart-2 rounded-full"
				/>
			</div>

			<span className="text-xs text-muted-foreground">{count} repos</span>
		</div>
	);
}
