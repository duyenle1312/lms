"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const [recommendation, setRecommendation] = useState<
    { id: string; title: string }[]
  >([]);

  const populateData = async () => {
    const response = await fetch(`/api/course`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
    const result = await response.json();
    console.log(result);

    if (response.ok) {
      if (response.status === 200) {
      }
    } else {
    }
  };

  const getRecommendationForUser = async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const user_json = JSON.parse(user);
      const user_id = user_json.user_id;
      console.log("User ID: ", user_id);

      const response = await fetch(
        `/api/course/recommendation?user_id=${user_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();
      console.log(result);

      if (response.ok) {
        if (response.status === 200) {
          console.log(result.courses);
          setRecommendation(result.courses);
        }
      } else {
      }
    }
  };

  useEffect(() => {
    getRecommendationForUser();
  }, []);

  return (
    <div className="">
      {/* <div className="flex md:flex-row flex-col justify-center items-center pt-12 p-6 gap-5 w-full">
        <Button onClick={getRecommendationForUser} className="font-semibold">
          Get Recommendation
        </Button>
        <Button onClick={populateData} className="font-semibold">
          Populate Data
        </Button>
      </div> */}
      <div className="flex flex-col justify-center items-center pt-12 p-6 md:text-lg">
        {recommendation?.length > 0 && (
          <div className="flex w-max-screen flex-col gap-y-3 border-[1.5px] border-black p-4 rounded-lg">
            <p className="font-bold mb-3 pl-4">
              Course recommendation based on your topics of interest:{" "}
            </p>
            {recommendation?.map((item) => {
              return (
                <a href={`/course/${item?.id}`} key={item?.id} className="flex">
                  <Button variant="ghost" className="md:text-lg">
                    {item?.title} (ID: {item?.id})
                  </Button>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
