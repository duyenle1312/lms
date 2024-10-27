import { NextResponse, NextRequest } from "next/server";
import pool from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await pool.query("DELETE FROM courses_topics WHERE course_id = $1", [
      params.id,
    ]);

    await pool.query("DELETE FROM courses WHERE course_id = $1", [params.id]);

    return NextResponse.json({ message: "success" }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return NextResponse.json(
        { status: "Error", message: error.message },
        { status: 500 }
      );
    }
  }
}
