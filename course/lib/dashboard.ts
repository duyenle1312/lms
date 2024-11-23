"use server";
import pool from "./db";
import { Course as CourseObject } from "./getRmd";

export const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users;");
  const users = result.rows;
  return users;
};

export const changeUserRole = async (user_id: string, role: string) => {
  try {
    await pool.query("UPDATE users SET role=$1 where user_id = $2;", [
      role,
      user_id,
    ]);
    return { status: true, message: "success" }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return { status: false, message: error.message };
    }
  }
};

export const changeUserName = async (user_id: string, name: string) => {
  await pool.query("UPDATE users SET name=$1 where user_id = $2;", [
    name,
    user_id,
  ]);
  const user = await pool.query("SELECT * FROM users where user_id = $1;", [
    user_id,
  ]);
  return user.rows[0];
};

export const getTopicsByCourse = async (course_id: string) => {
  const topics_result = await pool.query(
    "SELECT string_agg(t.topic_name, ',') AS \"topics\" FROM courses c JOIN courses_topics ct ON \
    ct.course_id = c.course_id JOIN topics t ON t.topic_id = ct.topic_id  \
    WHERE c.course_id = $1 GROUP BY c.course_id ;",
    [course_id]
  );
  return topics_result.rows[0];
};

export const isEnrolled = async (user_id: string, course_id: string) => {
  try {
    const find_enrollment = await pool.query(
      "SELECT * FROM course_enrollments WHERE user_id=$1 AND course_id=$2;",
      [user_id, course_id]
    );
    if (find_enrollment.rowCount === 0) {
      return { status: false, message: "Does not enroll in course." };
    } else {
      return { status: true, message: "Enrolled in course." };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return { status: false, message: error.message };
    }
  }
};

export const enrollStudent = async (user_id: string, course_id: string) => {
  try {
    if (user_id && course_id) {
      await pool.query(
        "INSERT INTO course_enrollments (course_id, user_id) values ($1, $2) on conflict (course_id, user_id) do nothing;",
        [course_id, user_id]
      );
      return { status: true, message: "Successfully enroll in course!" };
    } else {
      return { status: false, message: "Missing user ID or course ID!" };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return { status: false, message: error.message };
    }
  }
};

export const dropCourse = async (user_id: string, course_id: string) => {
  try {
    if (user_id && course_id) {
      await pool.query(
        "DELETE FROM course_enrollments WHERE user_id=$1 AND course_id=$2;",
        [user_id, course_id]
      );
      return { status: true, message: "Successfully drop the course!" };
    } else {
      return { status: false, message: "Missing user ID or course ID!" };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return { status: false, message: error.message };
    }
  }
};

export const getEnrolledCourseByUser = async (user_id: string) => {
  try {
    if (user_id) {
      const response = await pool.query(
        "SELECT c.course_id , c.course_title , c.instructor FROM course_enrollments ce JOIN courses c ON ce.course_id = c.course_id JOIN users u ON u.user_id = ce.user_id WHERE u.user_id=$1;",
        [user_id]
      );
      return { data: response.rows, message: "Success" };
    } else {
      return { data: [], message: "Missing user ID!" };
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return { data: [], message: error.message };
    }
  }
};
export const editCourse = async (
  data: CourseObject,
  topics: string[],
  user_id: string
) => {
  console.log("User editing course: ", user_id);

  try {
    const find_course = await pool.query(
      "SELECT * FROM courses where course_id = $1;",
      [data.id]
    );
    if (find_course.rowCount === 0)
      return { result: false, message: "Course does not exist!" };

    const course_id = find_course.rows[0].course_id;

    await pool.query(
      "UPDATE courses SET course_title=$1, instructor=$2, schedule=$3, department=$4, description=$5, skill_gain=$6, \
        offered_by=$7, course_url=$8, duration=$9, modules=$10, level=$11, rating=$12 WHERE course_id=$13;",
      [
        data.course_title,
        data.instructor,
        data.schedule,
        data.department,
        data.what_you_will_learn,
        data.skill_gain,
        data.offered_by,
        data.course_url,
        parseFloat(data.duration_to_complete),
        data.modules,
        data.level,
        parseFloat(data.rating),
        course_id,
      ]
    );

    // delete past entries for courses_topics if exists
    await pool.query("DELETE FROM courses_topics WHERE course_id = $1 ;", [
      course_id,
    ]);

    // add new topics to courses_topics
    for (let i = 0; i < topics.length; i++) {
      // Find topic id
      const find_topic_id = await pool.query(
        "SELECT topic_id FROM topics WHERE topic_name = $1",
        [topics[i]]
      );
      const topic_id = find_topic_id.rows[0].topic_id;

      // add topics to course
      await pool.query(
        "INSERT INTO courses_topics (course_id, topic_id) values ($1, $2) on conflict (course_id, topic_id) do nothing;",
        [course_id, topic_id]
      );
    }

    return { result: true, course_id: course_id };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return { result: false, message: error.message };
    }
  }
};

export const createCourse = async (
  data: CourseObject,
  topics: string[],
  user_id: string
) => {
  try {
    const course_exists = await pool.query(
      "SELECT * FROM courses where course_title = $1;",
      [data.course_title]
    );
    if (course_exists.rowCount !== 0)
      return { result: false, message: "Course exists!" };

    await pool.query(
      "INSERT INTO courses(course_title, instructor, schedule, department, description, skill_gain, \
    offered_by, course_url, duration, modules, level, rating, created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, \
    $8, $9, $10, $11, $12, $13) ON CONFLICT(course_title) DO NOTHING;",
      [
        data.course_title,
        data.instructor,
        data.schedule,
        data.department,
        data.what_you_will_learn,
        data.skill_gain,
        data.offered_by,
        data.course_url,
        parseFloat(data.duration_to_complete),
        data.modules,
        data.level,
        parseFloat(data.rating),
        parseInt(user_id),
      ]
    );

    const course_result = await pool.query(
      "SELECT * FROM courses where course_title = $1;",
      [data.course_title]
    );
    const course_id = course_result.rows[0].course_id;

    // delete past entries for courses_topics if exists
    await pool.query("DELETE FROM courses_topics WHERE course_id = $1 ;", [
      course_id,
    ]);

    // add new topics to courses_topics
    for (let i = 0; i < topics.length; i++) {
      // Find topic id
      const find_topic_id = await pool.query(
        "SELECT topic_id FROM topics WHERE topic_name = $1",
        [topics[i]]
      );
      const topic_id = find_topic_id.rows[0].topic_id;

      // add topics to course
      await pool.query(
        "INSERT INTO courses_topics (course_id, topic_id) values ($1, $2) on conflict (course_id, topic_id) do nothing;",
        [course_id, topic_id]
      );
    }

    return { result: true, course_id: course_id };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.log(error.message);
      return { result: false, message: error.message };
    }
  }
};
