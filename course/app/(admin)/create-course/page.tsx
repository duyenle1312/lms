"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import useAuth from "@/lib/useAuth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { MultiSelect } from "@/components/ui/multi-select";
import { createCourse } from "@/lib/dashboard";

const FormSchema = z.object({
  title: z.string().min(3, {
    message: "Title must be at least 3 characters.",
  }),
  description: z.string().min(3, {
    message: "Description must be at least 3 characters.",
  }),
  instructor: z.string().min(2, {
    message: "Time must be at least 2 characters.",
  }),
  time: z.string().min(2, {
    message: "Time must be at least 2 characters.",
  }),
  credit: z.string(),
  offered_by: z.string(),
  department: z.string(),
  skill_gain: z.string(),
  level: z.string(),
  duration: z.number(),
});


export default function CourseInfo() {
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [allTopics, setAllTopics] = useState<
    { value: string; label: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const courseDetails = {
    title: "Introduction to Programming",
    instructor: "Prof. Duyen Le",
    description: "This is the most amazing course!",
    credit: "3",
    time: "Flexible Schedule",
    offered_by: "University of Vermont",
    department: "Computer Science",
    skill_gain: "",
    duration: 90,
    level: "Beginner level",
  };

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: courseDetails,
  });

  async function onSubmit(info: z.infer<typeof FormSchema>) {
    const data = {
      id: 0,
      course_title: info.title,
      instructor: info.instructor,
      what_you_will_learn: info.description,
      credit: info.credit,
      schedule: info.time,
      offered_by: info.offered_by,
      department: info.department,
      skill_gain: info.skill_gain,
      duration_to_complete: info.duration.toString(),
      level: info.level,
      course_url: "",
      modules: "",
      rating: "",
    };

    const result = await createCourse(data, selectedTopics, user?.user_id);

    if (result?.result !== false) {
      router.push(`/course/${result?.course_id}`);
    } else {
      toast({
        title: "Error creating course",
        description: result?.message,
      });
    }
  }

  useEffect(() => {
    // Only admin and teacher can view the dashboard
    if (user.user_id !== "" && user.role === "Student") router.push(`/`);
    fetch("/api/topic")
      .then((res) => res.json())
      .then((data) => {
        const topicsList: { value: string; label: string }[] = [];
        data.topics.map((top: string) =>
          topicsList.push({ value: top, label: top })
        );
        setAllTopics(topicsList);
        setLoading(false);
      });
  }, [user, router]);

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <p>Loading...</p>
      </div>
    );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Card className="w-full">
          <CardHeader>
            <CardDescription>
              Only Admin and Teachers can make changes on this page
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-6">
            <div className="grid md:grid-cols-6 gap-4">
              <div className="grid md:col-span-5 gap-2">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="The Rise of The Roman Empire"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:col-span-1 ">
                <FormField
                  control={form.control}
                  name="instructor"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel className="">Instructor</FormLabel>
                      <FormControl className="w-full">
                        <Input placeholder="Prof. Angela Jodie" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Course summary, expecting results, grading schemes, course loads, and pre-requisites, etc."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-2">
              <FormField
                control={form.control}
                name="skill_gain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skill Gain</FormLabel>
                    <FormControl>
                      <Input placeholder="AI, Blockchain, etc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-2">
              <FormItem>
                <FormLabel>Topics</FormLabel>
                <MultiSelect
                  options={allTopics}
                  onValueChange={setSelectedTopics}
                  defaultValue={selectedTopics}
                  placeholder="Select Topics"
                  variant="inverted"
                  animation={0}
                  maxCount={3}
                />
                <FormMessage />
              </FormItem>
            </div>

            <div className="grid grid-cols-4 md:space-x-5 gap-4">
              <div className="grid md:col-span-2 col-span-4 gap-2">
                <FormField
                  control={form.control}
                  name="offered_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Offered By</FormLabel>
                      <FormControl>
                        <Input placeholder="University of Vermont" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:col-span-2 col-span-4 gap-2">
                <FormField
                  control={form.control}
                  name="department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="Computer Science" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-4 md:space-x-5 gap-4">
              <div className="grid md:col-span-1 col-span-4">
                <FormField
                  control={form.control}
                  name="time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Schedule</FormLabel>
                      <FormControl>
                        <Input placeholder="TTh 11:50-1:10pm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:col-span-1 col-span-4">
                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duration</FormLabel>
                      <FormControl>
                        <Input type="number" placeholder="80" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:col-span-1 col-span-4">
                <FormField
                  control={form.control}
                  name="level"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Level</FormLabel>
                      <FormControl>
                        <Input placeholder="Beginner Level" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid md:col-span-1 col-span-4">
                <FormField
                  control={form.control}
                  name="credit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Credits</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={courseDetails?.credit}
                        >
                          <SelectTrigger id="credit" className="">
                            <SelectValue placeholder="Select Credits" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1</SelectItem>
                            <SelectItem value="2">2</SelectItem>
                            <SelectItem value="3">3</SelectItem>
                            <SelectItem value="4">4</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-between space-x-2">
            <Button type="submit" className="px-6">
              Submit
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}
