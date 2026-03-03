import { NextResponse } from "next/server";

export async function GET() {
	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_AI_API_URL}/health`, {
			cache: "no-store",
		});

		if (!res.ok) {
			return NextResponse.json({ status: "error" }, { status: 500 });
		}

		return NextResponse.json({ status: "ok" });
	} catch (err) {
		return NextResponse.json({ status: "error" }, { status: 500 });
	}
}
