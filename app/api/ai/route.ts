import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();

		if (!body.developer_profile_summary) {
			return NextResponse.json(
				{ error: "developer_profile_summary required" },
				{ status: 400 },
			);
		}

		const res = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL}/analyze`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				developer_profile_summary: body.developer_profile_summary,
			}),
			cache: "no-store",
		});

		if (!res.ok) {
			const text = await res.text();
			return NextResponse.json(
				{ error: text || "AI backend error" },
				{ status: 500 },
			);
		}

		const data = await res.json();

		return NextResponse.json(data);
	} catch (err: any) {
		return NextResponse.json(
			{ error: err.message || "AI route error" },
			{ status: 500 },
		);
	}
}
