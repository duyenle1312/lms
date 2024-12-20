import { findUserInterests } from "@/lib/getRmd";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const user_id = request.nextUrl.searchParams.get("user_id");
  if (user_id) {
    try {
      const data = await findUserInterests(user_id);

      return NextResponse.json({ topics: data }, { status: 200 });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.log(error.message);
        return NextResponse.json(
          { status: "Error", message: error.message },
          { status: 500 }
        );
      }
    }
  } else {
    return NextResponse.json(
      { status: "Error", message: "Missing User ID" },
      { status: 400 }
    );
  }
}
