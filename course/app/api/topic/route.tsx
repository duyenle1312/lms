import { getTopics } from "@/lib/getRmd";
import pool from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await getTopics();
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
}

export async function POST(request: Request) {
  try {
    const { user_id, topics } = await request.json();
    const topics_json = JSON.parse(topics);

    // delete past entries for user interests
    await pool.query(
      "DELETE FROM users_topics WHERE user_id = $1 ;",
      [user_id]
    );

    // add new topics to user interests
    for (let i = 0; i < topics_json.length; i++) {
      // Find topic id
      const find_topic_id = await pool.query(
        "SELECT topic_id FROM topics WHERE topic_name = $1",
        [topics_json[i]]
      );
      const topic_id = find_topic_id.rows[0].topic_id;

      // Find existing user topic ranking
      const find_user_interest = await pool.query(
        "SELECT * FROM users_topics WHERE user_id = $1 and topic_id = $2",
        [user_id, topic_id]
      );

      if (find_user_interest.rowCount === 0) {
        // insert if not exists
        await pool.query(
          "INSERT INTO users_topics(user_id, topic_id, ranking) values ($1, $2, $3) on conflict (user_id, topic_id) do nothing;",
          [user_id, topic_id, 10 - i]
        );
      } else {
        // update values
        await pool.query(
          "UPDATE users_topics SET ranking = $1 WHERE user_id = $2 and topic_id = $3;",
          [10 - i, user_id, topic_id]
        );
      }
    }
    return NextResponse.json(
      { status: "Success", message: `Successfully added new topics of interest for user_id ${user_id}` },
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
