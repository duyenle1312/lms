"use client";

import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import AvatarBadge from "./avatar-badge";

export type User = {
  user_id: string;
  name: string;
  create_at: string;
  email: string;
  password: string;
  role: string;
};

const Navigation = () => {
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user || ""));
    }
  }, []);

  return (
    <div className="flex md:flex-row flex-col justify-between bg-gray-100 md:px-16 px-6">
      <div className="py-5 space-x-5">
        <a href="/" className="font-bold text-blue-800">
          Home
        </a>
        <a href="/search" className="font-bold text-blue-800">
          Search
        </a>
        <a href="/welcome" className="font-bold text-blue-800">
          Topics
        </a>
        <a href="/dashboard" className="font-bold text-blue-800">
          Dashboard
        </a>
      </div>

      <div className="flex justify-center align-middle items-center gap-x-3">
        <AvatarBadge/>
        {/* <Avatar>
          <AvatarImage src="https://github.com/shadcn.png" alt="" />
          <AvatarFallback>DL</AvatarFallback>
        </Avatar>
        {user && <p className="font-semibold">Hi, {user?.name}!</p>}

        <a href="/login" className="font-bold text-blue-600">
          <Button
            onClick={() => {
              localStorage.removeItem("user");
            }}
            className="font-bold text-sm bg-blue-800"
          >
            {user ? "Logout" : "Login"}
          </Button>
        </a> */}
      </div>
    </div>
  );
};

export default Navigation;
