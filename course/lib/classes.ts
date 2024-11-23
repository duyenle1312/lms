import { removeStopwords } from "stopword";
import { getCourses } from "./getRmd";
import pool from "./db";

type method_type = "matrix" | "cosine" | undefined;
abstract class RecommendationSystem {
  method: method_type = undefined;

  constructor(method: method_type) {
    this.method = method;
  }

  abstract calculate(): void;
}

export class RecommendationForUser extends RecommendationSystem {
  user_id: number;

  constructor(user_id: number) {
    super("matrix");
    this.user_id = user_id;
  }

  async calculate() {
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

    const course_ids: Record<number, number[]> = {};
    const course_titles: string[] = [];
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
      [this.user_id]
    );

    const user_matrix = [...topic_values]; // initialize data
    user_topic_ids_query.rows.forEach(
      (i: { topic_id: number; ranking: number }) => {
        const topic = Number(i.topic_id);
        user_matrix[topic_ids.indexOf(topic)] = Number(i.ranking);
      }
    );

    const matrix_product = (
      course_matrix: number[][],
      user_matrix: number[]
    ) => {
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
  }
}

export class RecommendationForCourse extends RecommendationSystem {
  course_id: number;

  constructor(course_id: number) {
    super("cosine");
    this.course_id = course_id;
  }

  tokenizer(text: string): string[] {
    let tokens = text
      .replace(/[^a-zA-Z ]/g, "")
      .toLowerCase()
      .split(" ");
    tokens = removeStopwords(tokens).filter(function (i: string) {
      return i != ""; // remove empty token
    });
    return tokens;
  }

  countWordFrequency(text: string): { [key: string]: number } {
    const frequency: { [key: string]: number } = {};
    const tokens = this.tokenizer(text);
    tokens.forEach((i: string) => (frequency[i] = (frequency[i] || 0) + 1));
    return frequency;
  }

  bagOfWords(tokens: string[], wordFreq: { [key: string]: number }): number[] {
    const result: number[] = [];
    tokens.forEach((t) => result.push(wordFreq[t] || 0));
    return result;
  }

  // cosine similarity = (a · b) / (||a|| * ||b||)
  cosineSimilarity(x: number[], y: number[]): number {
    if (x.length !== y.length) {
      console.log("Two vectors are not in the same length!");
      return 0;
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
  }

  async calculate() {
    console.log("RecommendationForCourse");

    const courses = await getCourses();
    const course = courses.find((i) => i.id == this.course_id);
    const potential_courses = courses.filter(
      (i) => i.id != this.course_id
    );

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
      const courseWordCount = this.countWordFrequency(course_info || "");

      const target_info =
        potential_courses[i].course_title +
        " " +
        potential_courses[i].what_you_will_learn +
        " " +
        potential_courses[i].skill_gain;

      const targetWordCount = this.countWordFrequency(target_info || "");

      const mergedText = course_info + " " + target_info;

      let tokens: string[] = this.tokenizer(mergedText);
      tokens = tokens.filter((i, index) => tokens.indexOf(i) === index); // remove duplicates

      const courseVec = this.bagOfWords(tokens, courseWordCount);
      const targetVec = this.bagOfWords(tokens, targetWordCount);

      const similarity: number =
        this.cosineSimilarity(courseVec, targetVec) || 0;

      if (similarity > 50.0) {
        recommendation.push(potential_courses[i]);
      }
    }

    return recommendation;
  }
}
