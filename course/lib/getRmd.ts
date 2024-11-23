import { removeStopwords } from "stopword";
import { promises as fs } from "fs";
import pool from "./db";

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
  topics: string;
  course_url: string;
  duration_to_complete: string;
};

export type CourseObject = {
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
  course_url: string;
  duration_to_complete: string;
};

export type TopicType = {
  [topic_name: string]: string;
};

export const getTopics = async () => {
  const result = await pool.query("SELECT topic_name FROM topics");
  const data: string[] = [];
  result.rows.forEach((r: TopicType) => data.push(r.topic_name));
  return data;
};

export const getCourses = async () => {
  const courses = await pool.query("SELECT * FROM courses;");

  // Assign data into data object
  const new_data: CourseObject[] = [];

  for (let i = 0; i < courses.rows.length; i++) {
    const clean_data: CourseObject = {
      id: courses.rows[i].course_id,
      course_title: courses.rows[i].course_title,
      rating: courses.rows[i].rating,
      level: courses.rows[i].level,
      schedule: courses.rows[i].schedule,
      what_you_will_learn: courses.rows[i].description,
      skill_gain: courses.rows[i].skill_gain,
      modules: courses.rows[i].modules,
      instructor: courses.rows[i].instructor,
      offered_by: courses.rows[i].offered_by,
      department: courses.rows[i].department,
      course_url: courses.rows[i].course_url,
      duration_to_complete: courses.rows[i].duration,
    };
    new_data.push(clean_data);
  }

  return new_data;
};

export const findUserInterests = async (user_id: string) => {
  const user_interests = await pool.query(
    "SELECT u.user_id, k.topic_name, ui.ranking FROM users u inner join users_topics ui \
    on u.user_id = ui.user_id inner join topics k on k.topic_id = ui.topic_id \
    where u.user_id = $1 order by ui.ranking desc;",
    [user_id]
  );
  return user_interests.rows;
};

export const getRecommendationForUser = async (user_id: string) => {
  // Create course matrix
  const topic_ids_query = await pool.query(
    "SELECT topic_id FROM topics order by topic_id;"
  );

  const topic_ids: number[] = [];
  topic_ids_query.rows.forEach((i: { topic_id: number }) =>
    topic_ids.push(Number(i?.topic_id))
  );

  const copy_arr = (x: number) => x * 0;
  const topic_values = topic_ids.map(copy_arr);

  const course_ids_query = await pool.query(
    "SELECT course_id, course_title FROM courses order by course_id;"
  );

  const course_titles: string[] = [];
  const course_ids: Record<number, number[]> = {};
  const courses: number[] = [];

  course_ids_query.rows.forEach(
    (i: { course_id: number; course_title: string }) => {
      courses.push(Number(i?.course_id));
      course_titles.push(i?.course_title);

      const course = courses.indexOf(Number(i.course_id));
      course_ids[course] = [...topic_values];
    }
  );

  const course_topic_ids_query = await pool.query(
    "SELECT course_id, topic_id FROM courses_topics order by course_id;"
  );

  course_topic_ids_query.rows.forEach(
    (i: { course_id: number; topic_id: number }) => {
      const course = courses.indexOf(Number(i.course_id));
      const topic = topic_ids.indexOf(Number(i.topic_id));
      course_ids[course][topic] = 1;
    }
  );

  const course_keyword_matrix: number[][] = Object.values(course_ids);

  // User matrix
  const user_topic_ids_query = await pool.query(
    "SELECT topic_id, ranking FROM users_topics where user_id = $1;",
    [user_id]
  );

  const user_matrix = [...topic_values]; // initialize data
  user_topic_ids_query.rows.forEach(
    (i: { topic_id: number; ranking: number }) => {
      const topic = Number(i.topic_id);
      user_matrix[topic_ids.indexOf(topic)] = Number(i.ranking);
    }
  );

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
  
  const course_weights: Record<number, number> = {}
  
  for (let i = 0; i < result.length; i++) {
    course_weights[courses[i]] = result[i]
  }
  // console.log(course_weights)
  

  // Get the indexes of the top 10 courses with the highest value
  const indexes = result
    .map((value, index) => ({ value, index }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 10);

  const recommendation: { id: string; title: string }[] = [];

  indexes.forEach((i) => {
    // result has the same length with courses and course_titles array, hence their index is the same
    const course_id = courses[i.index].toString();
    const course_title = course_titles[i.index];
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
      topics: data[i + 12],
    };

    // check if course exits
    let find_course = await pool.query(
      "SELECT * FROM courses WHERE course_title = $1",
      [clean_data.course_title]
    );

    if (find_course.rowCount == 0) {
      // if course does not exists => add course to database
      await pool.query(
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
    } else {
      // if course exists => update course info
      // const id = find_course.rows[0].course_id;
      // await pool.query(
      //   "UPDATE courses SET course_title=$1, instructor=$2, schedule=$3, department=$4, description=$5, skill_gain=$6, \
      //   offered_by=$7, course_url=$8, duration=$9, modules=$10, level=$11, rating=$12 WHERE course_id=$13;",
      //   [
      //     clean_data.course_title,
      //     clean_data.instructor,
      //     clean_data.schedule,
      //     clean_data.department,
      //     clean_data.what_you_will_learn,
      //     clean_data.skill_gain,
      //     clean_data.offered_by,
      //     clean_data.course_url,
      //     clean_data.duration_to_complete,
      //     clean_data.modules,
      //     clean_data.level,
      //     clean_data.rating,
      //     id
      //   ]
      // );
    }

    find_course = await pool.query(
      "SELECT * FROM courses WHERE course_title = $1",
      [clean_data.course_title]
    );

    const course_id = find_course.rows[0].course_id;
    console.log("Course ID: ", course_id);

    // delete existing keywords for the course
    await pool.query("DELETE FROM courses_topics WHERE course_id = $1 ;", [
      course_id,
    ]);

    // add new topics to the course
    const topics = clean_data.topics.split(",");

    topics.forEach(async (key) => {
      // Find topic id
      const find_topic_id = await pool.query(
        "SELECT topic_id FROM topics WHERE topic_name = $1",
        [key]
      );
      const topic_id = find_topic_id.rows[0]?.topic_id;
      console.log("Topic: ", key, " id: ", topic_id);

      await pool.query(
        "INSERT INTO courses_topics(course_id, topic_id) values ($1, $2) on conflict (course_id, topic_id) do nothing;",
        [course_id, topic_id]
      );
    });

    clean_data.id = course_id;
    new_data.push(clean_data);

    index++;
  }

  return new_data;
};

export const getRecommendationForCourse = async (id: string) => {
  const courses = await getCourses();
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
  const course_weights = []
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
    course_weights.push(similarity)

    if (similarity > 50.0) {
      recommendation.push(potential_courses[i]);
    }
  }

  return recommendation;
};
