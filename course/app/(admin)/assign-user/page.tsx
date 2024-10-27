"use client";

import { changeUserRole, getUsers } from "@/lib/dashboard";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEffect, useState } from "react";
import { User } from "@/components/nav";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import useAuth from "@/lib/useAuth";

const AssignUserRole = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);

  const getUserData = async () => {
    const users = await getUsers();
    setUsers(users);
  };

  useEffect(() => {
    getUserData();
  }, []);

  return (
    <div className="flex justify-center items-center w-full">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-semibold text-black">ID</TableHead>
            <TableHead className="font-semibold text-black">Name</TableHead>
            <TableHead className="font-semibold text-black">Email</TableHead>
            <TableHead className="font-semibold text-black">Role</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users?.map((user_item: User) => (
            <TableRow key={user_item.user_id}>
              <TableCell className="font-medium">{user_item.user_id}</TableCell>
              <TableCell>{user_item.name}</TableCell>
              <TableCell>{user_item.email}</TableCell>
              <TableCell>
                <Select
                  onValueChange={(value) => {
                    changeUserRole(user_item.user_id, value);
                    if (user_item.user_id == user?.user_id) {
                      // if current user's role is modified, force to login again to update role
                      localStorage.removeItem("user")
                      router.push("/login");
                    }
                  }}
                  defaultValue={user?.role}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="Admin">Admin</SelectItem>
                      <SelectItem value="Student">Student</SelectItem>
                      <SelectItem value="Teacher">Teacher</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default AssignUserRole;
