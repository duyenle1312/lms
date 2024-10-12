import SearchTable from "@/components/search";
import React from "react";
import pool from "@/lib/db";

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

const Search = async () => {
  const data = await getCourses();

  return (
    <div className="w-full md:px-16 px-6 py-2">
      <SearchTable data={data} title="All Courses" pageSize={10} />
    </div>
  );
};

export default Search;
