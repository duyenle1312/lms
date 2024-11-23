"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    path: string
  ) => {
    e.preventDefault();
    const name = firstName + " " + lastName;
    console.log({ email, password, name });
    if (firstName == "") {
      setErrorMessage(`Error: Missing first name`);
      return;
    }
    if (lastName == "") {
      setErrorMessage(`Error: Missing last name`);
      return;
    }
    if (email == "") {
      setErrorMessage(`Error: Missing email`);
      return;
    }
    if (password == "") {
      setErrorMessage(`Error: Missing password`);
      return;
    }
    const response = await fetch(`/api/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name }),
    });
    const result = await response.json();
    if (response.ok) {
      //   console.log("Response: ", result);
      localStorage.setItem("user", JSON.stringify(result.user));
      router.push("/welcome"); // Navigate to the welcome page
    } else {
      setErrorMessage(`Error: ${result.message}`);
    }
  };

  return (
    <div className="flex w-full h-screen border-black justify-center items-center align-center">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="first-name">First name</Label>
                <Input
                  id="first-name"
                  placeholder="Duyen"
                  required
                  onChange={(e) => {
                    setFirstName(e.target.value);
                  }}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="last-name">Last name</Label>
                <Input
                  id="last-name"
                  placeholder="Le"
                  required={true}
                  onChange={(e) => {
                    setLastName(e.target.value);
                  }}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="duyen.le@bard.edu"
                required
                onChange={(e) => {
                  setEmail(e.target.value);
                }}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              onClick={(e) => handleSubmit(e, "signup")}
            >
              Create an account
            </Button>
            {/* <Button variant="outline" className="w-full">
              Sign In with Google
            </Button> */}
          </form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Sign in
            </Link>
          </div>
          <div className="flex justify-center items-center text-base mt-3 text-red-600 text-center">
            {errorMessage}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
