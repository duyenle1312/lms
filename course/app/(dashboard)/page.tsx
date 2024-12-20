"use client";

import { useEffect, useState } from "react";

export const dynamic = 'force-dynamic';

export default function Home() {
  const [recommendation, setRecommendation] = useState<
    { id: string; title: string }[]
  >([]);
  const [topics, setTopics] = useState<string[]>([]);

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

      const response = await fetch(`/api/user/topics?user_id=${user_id}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json();

      if (response.ok) {
        if (response.status === 200) {
          const topic_list: string[] = [];
          result.topics.forEach((key: { topic_name: string }) =>
            topic_list.push(key.topic_name)
          );
          setTopics(topic_list);
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
      {/* <div className="flex md:flex-row flex-col justify-center items-center pt-12 gap-5 w-full">
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
                {topics.map((key, i, row) => {
                  if (i + 1 === row.length) return <span key={key}>{key}</span>;
                  else return <span key={key}>{key}, </span>;
                })}
              </p>
            </div>
            <p className="pl-4 font-bold">Course Suggestion List</p>
            {recommendation?.map((item, i) => {
              return (
                <a href={`/course/${item?.id}`} key={item?.id} className="flex">
                  <div className="md:text-lg hover:text-blue-700 hover:font-bold mt-3 mx-4">
                    {i + 1}. {item?.title}
                  </div>
                </a>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
