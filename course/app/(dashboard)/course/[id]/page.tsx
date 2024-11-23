"use client";

import { CourseORM } from "@/app/(admin)/edit-course/[id]/page";
import SearchTable from "@/components/dataTable";
import { Button } from "@/components/ui/button";
import { CourseObject } from "@/lib/getRmd";
import useAuth from "@/lib/useAuth";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { dropCourse, enrollStudent } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

export default function Course({ params }: { params: { id: string } }) {
  const { toast } = useToast();
  const [course, setCourse] = useState<CourseORM>();
  const [rmdCourses, setRmdCourses] = useState<CourseObject[]>();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isEnrolled, setIsEnrolled] = useState(null);
  const router = useRouter();

  const studentEnroll = async () => {
    let result;
    if (!isEnrolled) {
      result = await enrollStudent(user?.user_id, course?.course_id || "");
    } else {
      result = await dropCourse(user?.user_id, course?.course_id || "");
    }
    if (result?.status == true) {
      toast({
        title: `${result?.message}`,
      });
    } else {
      toast({
        title: `Error: ${result?.message}`,
      });
    }
    router.push("/enrollment");
  };

  const deleteCourse = async () => {
    if (user?.role !== "Admin") {
      // Check if user is the teacher who created the course
      if (user?.role === "Teacher" && course?.created_by != user?.user_id) {
        toast({
          title: "Error: You cannot delete other instructors' courses!",
        });
      } else {
        toast({
          title: "Error: You are not authorized!",
        });
      }
    } else {
      const response = await fetch(`/api/course/delete/${params.id}`);
      const result = await response.json();

      if (response.status == 200) {
        toast({
          title: "Successfully delete course!",
        });
        router.push("/"); // Navigate to the home page
      } else {
        toast({
          title: `${result?.message}`,
          description: `Please refresh the page and submit again.`,
        });
      }
    }
  };

  useEffect(() => {
    const user_storage = localStorage.getItem("user");
    const user_info = JSON.parse(user_storage || "");

    fetch(`/api/course/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setCourse(data.course);
        if (user_info?.user_id && data.course?.course_id) {
          fetch(
            `/api/course/isEnrolled?user_id=${user_info?.user_id}&course_id=${data.course?.course_id}`
          )
            .then((res) => res.json())
            .then((data) => {
              setIsEnrolled(data?.result.status);
            });
        }
      });

    fetch(`/api/course/similar/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setRmdCourses(data.courses);
      });

    setLoading(false);
  }, [params.id]);

  if (loading || course === undefined || isEnrolled === null)
    return (
      <div className="flex justify-center p-12">
        <p>Loading...</p>
      </div>
    );

  return (
    <div className="w-full flex md:flex-row flex-col">
      <div className="md:w-1/2 pl-16 pr-12 pt-12">
        <div className=" space-y-2">
          <p className="font-bold text-2xl mb-5">{course?.course_title}</p>
          <p>
            <span className="font-bold">Course ID:</span> {course?.course_id}
          </p>
          <p>
            <span className="font-bold">What you will learn:</span>{" "}
            {course?.description}
          </p>
          <p>
            <span className="font-bold">Instructor:</span> {course?.instructor}
          </p>
          <p>
            <span className="font-bold">Department:</span> {course?.department}
          </p>
          <p>
            <span className="font-bold">Level:</span> {course?.level}
          </p>
          <p>
            <span className="font-bold">Skill gain:</span> {course?.skill_gain}
          </p>
          <p>
            <span className="font-bold">Offered By:</span> {course?.offered_by}
          </p>
          <p>
            <span className="font-bold">Rating:</span> {course?.rating}/5
          </p>
          <p>
            <span className="font-bold">Duration to complete:</span>{" "}
            {course?.duration} hours
          </p>
        </div>
        <div className="flex flex-row space-x-2">
          {user?.role !== "Student" && (
            <>
              {" "}
              <a href={`/edit-course/${params.id}`}>
                <Button className="bg-blue-600 text-white font-bold mt-5">
                  Edit Course
                </Button>
              </a>
              <AlertDialog>
                <AlertDialogTrigger className="bg-red-600 text-white font-bold mt-5 px-3 py-1 text-sm rounded-md">
                  Delete Course
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete
                      the course and remove course data from all of our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={deleteCourse}
                      className="bg-red-600 hover:bg-black text-white font-bold px-3 py-1 text-sm rounded-md"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
          <Button
            onClick={studentEnroll}
            className="bg-green-600 text-white font-bold mt-5"
          >
            {isEnrolled ? "Drop Course" : "Enroll Course"}
          </Button>
        </div>
      </div>
      <div className="md:w-1/2 py-3 md:pr-20 px-12">
        {rmdCourses && rmdCourses?.length > 0 ? (
          <SearchTable
            data={rmdCourses}
            title="Recommendation"
            pageSize={rmdCourses?.length < 3 ? rmdCourses?.length : 3}
          />
        ) : (
          <div className="pt-10 text-center">
            <p>No recommendation found</p>
          </div>
        )}
      </div>
    </div>
  );
}
