import pool from "../../../lib/db";
import { compareSync } from "bcrypt-ts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  try {
    // Get the user with the provided username
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (result.rows.length > 0) {
      // Load hash from your password DB.
      // true
      const passwordMatches = compareSync(password, result.rows[0].password);

      if (passwordMatches) {
        // Passwords match, return a success message
        return NextResponse.json(
          { status: "Success", message: "Login successful", user: result.rows[0] },
          { status: 200 }
        );
      } else {
        // Passwords don't match, return an error message
        return NextResponse.json(
          { status: "Error", message: "Invalid password" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { status: "Error", message: "User not found" },
        { status: 404 }
      );
    }
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
