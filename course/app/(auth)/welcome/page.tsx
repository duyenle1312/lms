"use client";

import { useState } from "react";
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

// Predefined list of keywords/topics
const allKeywords = [
  "Web Development",
  "Data Science",
  "Machine Learning",
  "Mobile App Development",
  "Artificial Intelligence",
  "Cloud Computing",
  "Cybersecurity",
  "DevOps",
  "Blockchain",
  "Internet of Things",
  "UI/UX Design",
  "Digital Marketing",
  "Business Analytics",
  "Project Management",
  "Graphic Design",
  "Game Development",
  "Network Administration",
  "Database Management",
  "Software Testing",
  "Agile Methodologies",
  "Arts and Humanities",
  "Criminology",
  "History",
  "Religion",
  "Ethics",
  "Law",
];

export default function Welcome() {
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);

  const handleKeywordClick = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      // remove keyword if exists
      setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
    } else if (selectedKeywords.length < 10) {
      // add keyword to list
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };

  const handleRemoveKeyword = (keyword: string) => {
    setSelectedKeywords(selectedKeywords.filter((k) => k !== keyword));
  };

  const handleSubmit = () => {
    console.log("Submitted keywords:", selectedKeywords);
    // Here you would typically send this data to your backend
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
                  {allKeywords.sort().map((keyword) => (
                    <Badge
                      key={keyword}
                      variant={
                        selectedKeywords.includes(keyword)
                          ? "secondary"
                          : "outline"
                      }
                      className={`cursor-pointer text-sm ${
                        selectedKeywords.includes(keyword)
                          ? "font-bold"
                          : "font-normal"
                      }`}
                      onClick={() => handleKeywordClick(keyword)}
                    >
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </ScrollArea>
            </div>
            <div className="col-span-1">
              <h3 className="text-lg font-semibold mb-2">
                Your Top {selectedKeywords.length} Topics
              </h3>
              <ScrollArea className="h-[500px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {selectedKeywords.map((keyword, index) => (
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
                        onClick={() => handleRemoveKeyword(keyword)}
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
            {10 - selectedKeywords.length} more{" "}
            {10 - selectedKeywords.length === 1 ? "topic" : "topics"} to select
          </p>
          <Button
            onClick={handleSubmit}
            disabled={selectedKeywords.length < 10}
          >
            Submit Preferences
          </Button>
        </CardFooter>
      </div>
    </div>
  );
}
