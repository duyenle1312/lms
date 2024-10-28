"use client";

import { getEnrolledCourseByUser } from "@/lib/dashboard";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { ExternalLink } from "lucide-react";

const Enrollment = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true)

  const getCoursesData = async () => {
    const user_json = localStorage.getItem("user");
    const user_info = JSON.parse(user_json || "");
    const courses = await getEnrolledCourseByUser(user_info?.user_id);
    setCourses(courses?.data);
    setLoading(false)
  };

  useEffect(() => {
    getCoursesData();
  }, []);

  if (loading === true)
    return (
      <div className="flex justify-center p-12">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="flex justify-center items-center w-full md:p-24 p-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-black px-5">ID</TableHead>
            <TableHead className="font-semibold text-black">
              Course Title
            </TableHead>
            <TableHead className="font-semibold text-black">
              Instructor
            </TableHead>
            <TableHead className="font-semibold text-black"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {courses?.map(
            (item: {
              course_id: string;
              course_title: string;
              instructor: string;
            }) => (
              <TableRow key={item.course_id}>
                <TableCell className="font-medium px-5">
                  {item.course_id}
                </TableCell>
                <TableCell>{item.course_title}</TableCell>
                <TableCell>{item.instructor}</TableCell>
                <TableCell>
                  <a
                    href={`/course/${item.course_id}`}
                    className="flex gap-x-2 justify-center items-center font-bold px-2"
                  >
                    View <ExternalLink size={18} />
                  </a>
                </TableCell>
              </TableRow>
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default Enrollment;
