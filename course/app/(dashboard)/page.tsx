"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function Home() {
  const [recommendation, setRecommendation] = useState<
    { id: string; title: string }[]
  >([]);
  const [keywords, setKeywords] = useState<string[]>([]);

  // const populateData = async () => {
  //   const response = await fetch(`/api/course`, {
  //     method: "GET",
  //     headers: { "Content-Type": "application/json" },
  //   });
  //   const result = await response.json();
  //   console.log(result);

  //   if (response.ok) {
  //     if (response.status === 200) {
  //     }
  //   } else {
  //   }
  // };

  const getUserTopicsOfInterest = async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const user_json = JSON.parse(user);
      const user_id = user_json.user_id;

      const response = await fetch(`/api/user/keywords?user_id=${user_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (response.ok) {
        if (response.status === 200) {
          const keyword_list: string[] = [];
          result.keywords.forEach((key: { keyword_name: any }) =>
            keyword_list.push(key.keyword_name)
          );
          console.log(result.keywords);
          setKeywords(keyword_list);
        }
      } else {
      }
    }
  };

  const getRecommendationForUser = async () => {
    const user = localStorage.getItem("user");
    if (user) {
      const user_json = JSON.parse(user);
      const user_id = user_json.user_id;

      const response = await fetch(
        `/api/course/recommendation?user_id=${user_id}`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );
      const result = await response.json();

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
    getUserTopicsOfInterest();
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
      <div className="flex flex-col justify-center items-center pt-10 p-6 md:text-lg">
        {recommendation?.length > 0 && (
          <div className="flex w-max-screen flex-col gap-y-1 border-[1.5px] border-black px-3 py-5 rounded-lg">
            <div className="mb-5 pl-4">
              <p className="font-bold mb-1">
                Course recommendation based on your Topics of Interest:{" "}
              </p>
              <p>
                {keywords.map((key, i, row) => {
                  if (i + 1 === row.length) return <span key={key}>{key}</span>;
                  else return <span key={key}>{key}, </span>;
                })}
              </p>
            </div>
            <p className="pl-4 font-bold">Course List</p>
            {recommendation?.map((item, i) => {
              return (
                <a href={`/course/${item?.id}`} key={item?.id} className="flex">
                  <Button variant="ghost" className="md:text-lg">
                    {i + 1}. {item?.title}
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
