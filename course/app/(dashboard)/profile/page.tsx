"use client";

import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User } from "@/components/nav";
import { changeUserName } from "@/lib/dashboard";

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<User>();
  const [name, setName] = useState("");

  useEffect(() => {
    const user_json = localStorage.getItem("user");
    if (user_json != null) {
      const user_value = JSON.parse(user_json);
      setUser(user_value);
      setName(user_value.name);
    } else {
      router.push("/login"); // Navigate to login page
    }
  }, [setUser, router]);

  const form = useForm({});

  const onSubmit = async () => {
    const user_response = await changeUserName(user?.user_id || "", name);
    localStorage.setItem("user", JSON.stringify(user_response))
    console.log(user_response)
    location.reload();
  }

  return (
    <div className="md:p-20 p-6 md:w-1/2 w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormItem>
            <FormLabel className="font-bold">Name</FormLabel>
            <FormControl>
              <Input
                defaultValue={user?.name}
                placeholder=""
                value={name}
                onChange={(value) => {
                  setName(value.target.value);
                }}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel className="font-bold">Email</FormLabel>
            <FormControl>
              <Input
                className="bg-gray-50 cursor-not-allowed text-gray-600"
                readOnly
                placeholder=""
                defaultValue={user?.email}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem>
            <FormLabel className="font-bold">Role</FormLabel>
            <FormControl>
              <Input
                className="bg-gray-50 cursor-not-allowed text-gray-600"
                readOnly
                placeholder=""
                defaultValue={user?.role}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <Button type="submit" className="font-bold">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
