"use client";

import DarkVeil from "@/components/DarkVeil";

export default function SiteBackground() {
	return (
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
	);
}
