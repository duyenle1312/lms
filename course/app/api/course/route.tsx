import { NextResponse } from "next/server";
import { populateCourseData } from "@/lib/getRmd";

export async function GET() {
  try {
    const data = await populateCourseData();

    return NextResponse.json({ courses: data }, { status: 200 });
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
