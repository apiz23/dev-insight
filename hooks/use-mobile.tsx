import { useEffect, useState } from "react";

export function useIsMobile(breakpoint: number = 768) {
	const [isMobile, setIsMobile] = useState<boolean | null>(null);

	useEffect(() => {
		const media = window.matchMedia(`(max-width: ${breakpoint}px)`);

		const handleChange = () => {
			setIsMobile(media.matches);
		};

		handleChange(); // initial check

		media.addEventListener("change", handleChange);

		return () => {
			media.removeEventListener("change", handleChange);
		};
	}, [breakpoint]);

	return isMobile;
}
