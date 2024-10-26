"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "./nav";
import { useRouter } from "next/navigation";
import { ChevronsUpDown } from "lucide-react";

const AvatarBadge = () => {
  const router = useRouter();
  const [user, setUser] = useState<User>();

  useEffect(() => {
    const user_json = localStorage.getItem("user");
    if (user_json != null) {
      setUser(JSON.parse(user_json));
    } else {
      router.push("/login"); // Navigate to login page
    }
  }, [setUser, router]);

  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className="flex p-1 gap-x-2 align-middle">
            <Avatar className="h-8 w-8 rounded-full">
              <AvatarImage
                src="https://img.freepik.com/free-photo/androgynous-avatar-non-binary-queer-person_23-2151100217.jpg?semt=ais_hybrid"
                alt=""
              />
              <AvatarFallback>User</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user?.name}</span>
              <span className="truncate text-xs">{user?.email}</span>
            </div>
            <div className="flex justify-center items-center">
              <ChevronsUpDown className="ml-auto size-4" />
            </div>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-[--radix-dropdown-menu-trigger-width] rounded-lg"
          side="bottom"
          align="end"
          sideOffset={4}
        >
          <DropdownMenuLabel className="p-0 font-normal">
            <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
              <Avatar className="h-8 w-8 rounded-full">
                <AvatarImage
                  src="https://img.freepik.com/free-photo/androgynous-avatar-non-binary-queer-person_23-2151100217.jpg?semt=ais_hybrid"
                  alt=""
                />
                <AvatarFallback>User</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs">{user?.email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <a href="/profile">
              <DropdownMenuItem>View Account</DropdownMenuItem>
            </a>
          </DropdownMenuGroup>
          <a href="/login">
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </a>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default AvatarBadge;
