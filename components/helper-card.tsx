import { motion } from "framer-motion";

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

export function DetailCard({
	icon: Icon,
	text,
	href,
}: {
	icon: any;
	text: string;
	href?: string;
}) {
	const content = (
		<div className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent transition-colors border border-transparent hover:border-border">
			<Icon className="h-4 w-4 text-muted-foreground shrink-0" />
			<span className="text-sm text-foreground truncate">{text}</span>
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
