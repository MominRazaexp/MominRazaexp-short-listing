import { dbConnect } from "@/lib/db/mongoose";
import { NextRequest } from "next/server";
import { JobDescription } from "@/lib/models/JobDescription";

export async function GET() {
  await dbConnect();

  const jds = await JobDescription.find().sort({ createdAt: -1 });

  return Response.json(jds);
}

export async function POST(req: NextRequest) {
  await dbConnect();

  const body = await req.json();

  const jd = await JobDescription.create(body);

  return Response.json(jd);
}