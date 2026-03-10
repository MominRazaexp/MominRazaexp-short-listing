import { dbConnect } from "@/lib/db/mongoose";
import { NextRequest, NextResponse } from "next/server";
import { JobDescription } from "@/lib/models/JobDescription";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  await dbConnect();
  const { id } = await params; 

  try {
    const jd = await JobDescription.findById(id);
    if (!jd) {
      return NextResponse.json({ message: "JD not found" }, { status: 404 });
    }
    return NextResponse.json(jd);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching JD" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  await dbConnect();
  const { id } = await params; 
  const body = await req.json();

  try {
    const updated = await JobDescription.findByIdAndUpdate(id, body, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ message: "JD not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ message: "Error updating JD" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  await dbConnect();
  const { id } = await params; 

  try {
    const deleted = await JobDescription.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ message: "JD not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ message: "Error deleting JD" }, { status: 500 });
  }
}