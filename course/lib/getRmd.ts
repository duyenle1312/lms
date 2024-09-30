import { getCourses } from "@/app/search/page";
import { removeStopwords } from "stopword";

export const getRecommendation = async (id: string) => {
  //   console.log(id);

  const courses = await getCourses();

  // Finding courses in the same department
  const course = courses.find((i) => i.id.toString() === id);
  //   const course_department = course?.keyword;
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
  //   console.log("Rec: ", recommendation.length);
  return recommendation;
};
