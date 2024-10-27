import { getRecommendationForCourse } from "@/lib/getRmd";
import { NextResponse, NextRequest } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const data = await getRecommendationForCourse(params.id);
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
