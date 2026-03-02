export async function generateAISummary(summary: string) {
	const res = await fetch("/api/ai", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			developer_profile_summary: summary,
		}),
	});

	if (!res.ok) {
		const text = await res.text();
		throw new Error(text || "AI request failed");
	}

	return res.json();
}
