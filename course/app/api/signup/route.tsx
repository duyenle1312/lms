import pool from "../../../lib/db";
import { genSaltSync, hashSync } from "bcrypt-ts";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email, password, name } = await request.json();

  try {
    const userExists = await pool.query(
      "SELECT email FROM users WHERE email = $1",
      [email]
    );

    if (userExists.rows.length > 0) {
      return NextResponse.json(
        {
          status: "Error",
          message: "There is an account with this email. Please, login instead.",
        },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = genSaltSync(10);
    const hashedPassword = hashSync(password, salt);

    // Store the email and hashed password in the database
    const result = await pool.query(
      "INSERT INTO users (email, password, name) VALUES($1, $2, $3) RETURNING *",
      [email, hashedPassword, name]
    );

    // If user is created successfully, return a success message
    return NextResponse.json(
      { message: "User Created", user: result.rows[0] },
      { status: 201 }
    );
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
