"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";

export default function Welcome() {
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [allTopics, setAllTopics] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetch("/api/topic")
      .then((res) => res.json())
      .then((data) => {
        setAllTopics(data.keywords);
        setLoading(false);
      });
  }, []);

  if (isLoading)
    return (
      <div className="flex justify-center p-12">
        <p>Loading...</p>
      </div>
    );
  if (!allTopics) return <p>No available topis found</p>;

  const handleTopicClick = (keyword: string) => {
    if (selectedTopics.includes(keyword)) {
      // remove keyword if exists
      setSelectedTopics(selectedTopics.filter((k) => k !== keyword));
    } else if (selectedTopics.length < 10) {
      // add keyword to list
      setSelectedTopics([...selectedTopics, keyword]);
    }
  };

  const handleRemoveTopic = (keyword: string) => {
    setSelectedTopics(selectedTopics.filter((k) => k !== keyword));
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    console.log("Submitted topics:", selectedTopics);
    const user = JSON.parse(localStorage.getItem("user") || "");

    if (user) {
      const response = await fetch(`/api/topic`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user.user_id,
          topics: JSON.stringify(selectedTopics),
        }),
      });
      const result = await response.json();
      console.log(result);

      if (response.status == 201) {
        router.push("/"); // Navigate to the home page
      } else {
        alert(`${result?.message}. Please refresh the page and submit again.`)
      }
    }
  };

  return (
    <div className="flex items-center justify-center mt-8 mx-5">
      <div className="w-full ">
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl text-center">
            Welcome to our Course Platform!
          </CardTitle>
          <CardDescription className="text-center">
            Please select and rank your top 10 topics of interest.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <h3 className="text-lg font-semibold mb-2">Available Topics</h3>
              <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                <div className="grid md:grid-cols-3 gap-2">
                  {allTopics?.sort().map((keyword) => (
                    <Badge
                      key={keyword}
                      variant={
                        selectedTopics.includes(keyword)
                          ? "secondary"
                          : "outline"
                      }
                      className={`cursor-pointer text-sm ${
                        selectedTopics.includes(keyword)
                          ? "font-bold"
                          : "font-normal"
                      }`}
                      onClick={() => handleTopicClick(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-2">
                Your Top {selectedTopics.length} Topics
              </h3>
              <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {selectedTopics.map((keyword, index) => (
                    <div
                      key={keyword}
                      className="flex items-center gap-2 p-2  rounded-md"
                    >
                      <span className="font-semibold text-primary min-w-[20px]">
                        {index + 1}.
                      </span>
                      <span className="flex-grow">{keyword}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveTopic(keyword)}
                        className="h-4 w-4"
                      >
                        <X size={12} />
                        <span className="sr-only">Remove {keyword}</span>
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <p className="text-sm text-muted-foreground">
            {10 - selectedTopics.length} more{" "}
            {10 - selectedTopics.length === 1 ? "topic" : "topics"} to select
          </p>
          <Button
            onClick={handleSubmit}
            disabled={selectedTopics.length < 1}
            className={`font-bold ${
              submitting && "bg-blue-500 hover:bg-blue-500 "
            }`}
          >
            {submitting ? "Submitting..." : "Submit Preferences"}
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
