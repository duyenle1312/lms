import SearchTable from "@/components/search";
import React from "react";
import { promises as fs } from "fs";

interface CourseObject {
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
  keyword: string;
  course_url: string;
  duration_to_complete: string;
}

export const getCourses = async () => {
  const file = await fs.readFile(
    process.cwd() + "/app/course_data.csv",
    "utf8"
  );

  let data = file.split("\t"); // get string data from csv file

  // split data point
  for (let i = 0; i < data.length; i++) {
    data[i] = data[i].trim().replace('"', "");
  }
  data = data.filter(function (i) {
    return i != "";
  });

  const titles = data.slice(0, 12);
  // Change header to snake_case
  for (let i = 0; i < titles.length; i++) {
    titles[i] = titles[i].toLowerCase().split(" ").join("_");
    if (titles[i] === "duration_to_complete_(approx.)")
      titles[i] = "duration_to_complete";
  }
  // console.log(titles);

  // Remove title from data
  data.splice(0, 12);

  // Assign data into data object
  const new_data: CourseObject[] = [];
  let index = 0;

  for (let i = 0; i < data.length - 1; i += 12) {
    const clean_data: CourseObject = {
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
      keyword: data[i + 9],
      course_url: data[i + 10],
      duration_to_complete: data[i + 11],
    };
    new_data.push(clean_data);
    index++;
  }

  //   console.log(new_data.length)
  return new_data;
};

const Search = async () => {
  const data = await getCourses();

  return (
    <div className="w-full md:px-16 px-6 py-2">
      <SearchTable data={data} title="All Courses" pageSize={10} />
    </div>
  );
};

export default Search;
