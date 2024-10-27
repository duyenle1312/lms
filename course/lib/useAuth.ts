"use client";

import { useState, useEffect } from "react";

export default function useAuth() {
  const default_data = {
    user_id: "",
    name: "",
    password: "",
    email: "",
    created_at: "",
    role: "",
  };
  const [user, setUser] = useState(default_data);

  useEffect(() => {
    const user_string = localStorage.getItem("user");
    if (user_string) {
      const user = JSON.parse(user_string || "{}");
      return setUser(user);
    } else  setUser(default_data);
  }, []);

  return {
    setUser,
    user,
  };
}