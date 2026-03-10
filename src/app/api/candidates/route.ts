import { dbConnect } from "@/lib/db/mongoose";
import { CandidateResult } from "@/lib/models/CandidateResult";
import type { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const shortlisted = searchParams.get("shortlisted");
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "12", 10);

  try {
    const query: any = {};
    if (shortlisted === "true") query.shortlisted = true;
    if (shortlisted === "false") query.shortlisted = false;

    const candidates = await CandidateResult.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await CandidateResult.countDocuments(query);

    return new Response(
      JSON.stringify({
        candidates,
        total,
        page,
        pages: Math.ceil(total / limit),
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Failed to fetch candidates" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}