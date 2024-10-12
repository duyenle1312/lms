import pool from "../../../lib/db";
import { NextResponse } from "next/server";

export type KeywordType = {
  [keyword_name: string]: string;
};

export const getKeywords = async () => {
  const result = await pool.query("SELECT keyword_name FROM keywords");
  const data: string[] = [];
  result.rows.forEach((r: KeywordType) => data.push(r.keyword_name));
  return data;
};

export async function GET() {
  try {
    const data = await getKeywords();
    return NextResponse.json({ keywords: data }, { status: 200 });
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

export async function POST(request: Request) {
  try {
    const { user_id, keywords } = await request.json();
    const keywords_json = JSON.parse(keywords);

    // delete past entries for user interests
    const delete_past_interests = await pool.query(
      "DELETE FROM user_interests WHERE user_id = $1 ;",
      [user_id]
    );

    // add new keywords to user interests
    for (let i = 0; i < keywords_json.length; i++) {
      // Find keyword id
      const find_keyword_id = await pool.query(
        "SELECT keyword_id FROM keywords WHERE keyword_name = $1",
        [keywords_json[i]]
      );
      const keyword_id = find_keyword_id.rows[0].keyword_id;

      // Find existing user keyword ranking
      const find_user_interest = await pool.query(
        "SELECT * FROM user_interests WHERE user_id = $1 and keyword_id = $2",
        [user_id, keyword_id]
      );

      if (find_user_interest.rowCount === 0) {
        // insert if not exists
        const insert_user_interest = await pool.query(
          "INSERT INTO user_interests(user_id, keyword_id, ranking) values ($1, $2, $3) on conflict (user_id, keyword_id) do nothing;",
          [user_id, keyword_id, 10 - i]
        );
      } else {
        // update values
        const update_user_interest = await pool.query(
          "UPDATE user_interests SET ranking = $1 WHERE user_id = $2 and keyword_id = $3;",
          [10 - i, user_id, keyword_id]
        );
      }
    }
    return NextResponse.json(
      { status: "Success", message: "Success" },
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
