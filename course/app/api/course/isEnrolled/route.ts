import { isEnrolled } from "@/lib/dashboard";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user_id = request.nextUrl.searchParams.get("user_id");
  const course_id = request.nextUrl.searchParams.get("course_id");

  if (user_id && course_id) {
    try {
      const response = await isEnrolled(user_id, course_id);

      return NextResponse.json({ result: response }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
        return NextResponse.json(
          { status: false, message: error.message },
          { status: 500 }
        );
      }
    }
  } else {
    return NextResponse.json(
      { status: false, message: "Missing User ID or Course ID" },
      { status: 500 }
    );
  }
}
