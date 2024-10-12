import { getCourses } from "@/app/(dashboard)/search/page";
import { removeStopwords } from "stopword";
import { promises as fs } from "fs";
import pool from "./db";
import { getKeywords } from "@/app/api/keyword/route";

export type Course = {
  id: number;
  course_title: string;
  rating: string;
  level: string;
  schedule: string;
  what_you_will_learn: string;
  skill_gain: string;
  modules: string;
  instructor: string;
  offered_by: string;
  department: string;
  keywords: string;
  course_url: string;
  duration_to_complete: string;
};

export const getRecommendationForUser = async (user_id: string) => {
  console.log("User ID: ", user_id);

  // get user_interest
  let user_interests = await pool.query(
    "SELECT u.user_id, k.keyword_name, ui.ranking FROM users u inner join user_interests ui \
    on u.user_id = ui.user_id inner join keywords k on k.keyword_id = ui.keyword_id \
    where u.user_id = $1;",
    [user_id]
  );

  const file_name = "course_keyword.csv";
  const file = await fs.readFile(process.cwd() + `/app/${file_name}`, "utf8");

  let data = file.split("\n"); // read every row from csv file

  let course_keyword_matrix: any[] = [];

  data.slice(1).forEach((row) => {
    const current_row = row.split("\t");
    const row_data = current_row.slice(2);
    if (row_data.length > 0) course_keyword_matrix.push(row_data);
  });

  const all_keywords = data[0].split("\t").slice(2);
  const user_matrix: number[] = [];

  all_keywords.forEach((row) => {
    const value = user_interests.rows.find(
      (i: { keyword_name: string }) => i.keyword_name === row
    );
    if (value) {
      user_matrix.push(value.ranking);
    } else {
      user_matrix.push(0);
    }
  });

  const matrix_product = (course_matrix: number[][], user_matrix: number[]) => {
    const result = [];
    if (course_matrix[0].length !== user_matrix.length) {
      return [];
    } else {
      for (let row = 0; row < course_matrix.length; row++) {
        let sum = 0;
        for (let col = 0; col < course_matrix[row].length; col++) {
          sum += course_matrix[row][col] * user_matrix[col];
        }
        result[row] = sum;
      }
      return result;
    }
  };

  const result = matrix_product(course_keyword_matrix, user_matrix);

  const indexes = result
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const recommendation: { id: string, title: string }[] = [];
  indexes.forEach((i) => {
    const course_id = data.slice(1)[i.index].split("\t")[0];
    const course_title = data.slice(1)[i.index].split("\t")[1];
    recommendation.push({ id: course_id, title: course_title });
  });

  return recommendation;
};

export const populateCourseData = async () => {
  const file_name = "course_with_keywords.csv";
  const file = await fs.readFile(process.cwd() + `/app/${file_name}`, "utf8");

  let data = file.split("\t"); // get string data from csv file

  // split data point
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].trim().replace('"', "");
  }
  data = data.filter(function (i) {
    return i != "";
  });

  const titles = data.slice(0, 13);

  // Change header to snake_case
  for (let i = 0; i < titles.length; i++) {
    titles[i] = titles[i].toLowerCase().split(" ").join("_");
    if (titles[i] === "duration_to_complete_(approx.)")
      titles[i] = "duration_to_complete";
  }
  // console.log(titles);

  // Remove title from data
  data.splice(0, 13);
  const new_data: Course[] = [];
  let index = 0;

  for (let i = 0; i < data.length - 1; i += 13) {
    const clean_data: Course = {
      id: index,
      course_title: data[i].split("\n")[1],
      rating: data[i + 1],
      level: data[i + 2],
      schedule: data[i + 3],
      what_you_will_learn: data[i + 4],
      skill_gain: data[i + 5],
      modules: data[i + 6],
      instructor: data[i + 7],
      offered_by: data[i + 8],
      department: data[i + 9],
      course_url: data[i + 10],
      duration_to_complete: data[i + 11],
      keywords: data[i + 12],
    };

    // check if course exits
    let find_course = await pool.query(
      "SELECT * FROM courses WHERE course_title = $1",
      [clean_data.course_title]
    );

    if (find_course.rowCount == 0) {
      // if course does not exists => add course to database
      const add_course = await pool.query(
        "INSERT INTO courses(course_title, instructor, schedule, department, description, skill_gain, \
        offered_by, course_url, duration, modules, level, rating) VALUES ($1, $2, $3, $4, $5, $6, $7, \
        $8, $9, $10, $11, $12);",
        [
          clean_data.course_title,
          clean_data.instructor,
          clean_data.schedule,
          clean_data.department,
          clean_data.what_you_will_learn,
          clean_data.skill_gain,
          clean_data.offered_by,
          clean_data.course_url,
          clean_data.duration_to_complete,
          clean_data.modules,
          clean_data.level,
          clean_data.rating,
        ]
      );
      find_course = await pool.query(
        "SELECT * FROM courses WHERE course_title = $1",
        [clean_data.course_title]
      );

      const course_id = find_course.rows[0].course_id;
      console.log("Course ID: ", course_id);

      // delete existing keywords for the course
      const delete_past_keywords = await pool.query(
        "DELETE FROM courses_keywords WHERE course_id = $1 ;",
        [course_id]
      );

      // add new keywords to the course
      const keywords = clean_data.keywords.split(",");

      keywords.forEach(async (key) => {
        // Find keyword id
        const find_keyword_id = await pool.query(
          "SELECT keyword_id FROM keywords WHERE keyword_name = $1",
          [key]
        );
        const keyword_id = find_keyword_id.rows[0].keyword_id;
        console.log("Keyword: ", key, " id: ", keyword_id);

        const insert_course_keyword = await pool.query(
          "INSERT INTO courses_keywords(course_id, keyword_id) values ($1, $2) on conflict (course_id, keyword_id) do nothing;",
          [course_id, keyword_id]
        );
      });
    } else {
      // if course exists => update course info?
    }

    const course_id = find_course.rows[0].course_id;
    console.log("Course ID: ", course_id);
    clean_data.id = course_id;
    new_data.push(clean_data);

    index++;
  }

  return new_data;
};

export const getRecommendation = async (id: string) => {
  const courses = await getCourses("course_data.csv");
  const course = courses.find((i) => i.id.toString() === id);
  const potential_courses = courses.filter(
    (i) => i.id.toString() !== id // i.keyword === course_department &&
  );

  const tokenize = (text: string) => {
    let tokens = text
      .replace(/[^a-zA-Z ]/g, "")
      .toLowerCase()
      .split(" ");
    tokens = removeStopwords(tokens).filter(function (i: string) {
      return i != ""; // remove empty token
    });
    return tokens;
  };

  const countWordFrequency = (text: string) => {
    const frequency: { [key: string]: number } = {};
    const tokens = tokenize(text);
    //console.log(tokens);
    tokens.forEach((i) => (frequency[i] = (frequency[i] || 0) + 1));
    //console.log(frequency);
    return frequency;
  };

  const bagOfWords = (
    tokens: string[],
    wordFreq: { [key: string]: number }
  ) => {
    const result: number[] = [];
    tokens.forEach((t) => result.push(wordFreq[t] || 0));
    return result;
  };

  // cosine similarity = (a · b) / (||a|| * ||b||)
  const cosine_similarity = (x: number[], y: number[]) => {
    if (x.length !== y.length) {
      console.log("Two vectors are not in the same length!");
      return null;
    }

    let product = 0;
    let sum_x = 0;
    let sum_y = 0;
    for (let i = 0; i < x.length; i++) {
      product += x[i] * y[i];
      sum_x += x[i] ** 2;
      sum_y += y[i] ** 2;
    }
    const result = product / (Math.sqrt(sum_x) * Math.sqrt(sum_y));
    return result * 100;
  };

  const recommendation = [];
  // find course similarity
  for (let i = 0; i < potential_courses.length; i++) {
    // Tokenization
    const course_info =
      course?.course_title +
      " " +
      course?.what_you_will_learn +
      " " +
      course?.skill_gain;
    const courseWordCount = countWordFrequency(course_info || "");
    // console.log(courseWordCount);

    const target_info =
      potential_courses[i].course_title +
      " " +
      potential_courses[i].what_you_will_learn +
      " " +
      potential_courses[i].skill_gain;
    const targetWordCount = countWordFrequency(target_info || "");
    // console.log(targetWordCount);

    const mergedText = course_info + " " + target_info;
    // console.log(mergedText);

    let tokens: string[] = tokenize(mergedText);
    tokens = tokens.filter((i, index) => tokens.indexOf(i) === index); // remove duplicates
    // console.log(tokens);

    const courseVec = bagOfWords(tokens, courseWordCount);
    // console.log(courseVec);
    const targetVec = bagOfWords(tokens, targetWordCount);
    // console.log(targetVec);

    const similarity: number = cosine_similarity(courseVec, targetVec) || 0;

    if (similarity > 50.0) {
      recommendation.push(potential_courses[i]);
    }
  }
  return recommendation;
};
