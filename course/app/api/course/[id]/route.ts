import pool from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const course_id = params.id;
    const result = await pool.query(
      "SELECT * FROM courses WHERE course_id = $1",
      [course_id]
    );
    const data = result.rows[0];
    return NextResponse.json({ course: data }, { status: 200 });
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
