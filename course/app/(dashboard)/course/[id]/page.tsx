import SearchTable from "@/components/search";
import { Button } from "@/components/ui/button";
import { getCourses, getRecommendationForCourse } from "@/lib/getRmd";

export default async function Course({ params }: { params: { id: string } }) {
  const data = await getCourses();
  const course = data.find((i) => i.id.toString() === params.id);

  const rmdCourses = await getRecommendationForCourse(params.id);

  return (
    <div className="w-full flex md:flex-row flex-col">
      <div className="md:w-1/2 pl-16 pr-12 pt-12">
        <div className=" space-y-2">
          <p className="font-bold text-2xl mb-5">{course?.course_title}</p>
          <p>
            <span className="font-bold">Course ID:</span> {course?.id}
          </p>
          <p>
            <span className="font-bold">What you will learn:</span>{" "}
            {course?.what_you_will_learn}
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
            {course?.duration_to_complete} hours
          </p>
        </div>
        <div className="flex flex-row space-x-2">
          <Button className="bg-green-600 text-white font-bold mt-5">
            Enroll Course
          </Button>
          {/* <Button
            className="bg-orange-500 text-white font-bold mt-5"
            onClick={getRecommendationForCourse}
          >
            Show Recommendation
          </Button> */}
        </div>
      </div>
      <div className="md:w-1/2 py-3 md:pr-20 px-12">
        {rmdCourses.length > 0 ? (
          <SearchTable
            data={rmdCourses}
            title="Recommendation"
            pageSize={rmdCourses.length < 3 ? rmdCourses.length : 3}
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
