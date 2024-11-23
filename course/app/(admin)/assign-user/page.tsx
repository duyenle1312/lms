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
import { useToast } from "@/hooks/use-toast";

const AssignUserRole = () => {
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserData = async () => {
    const users = await getUsers();
    setUsers(users);
    setLoading(false);
  };

  useEffect(() => {
    getUserData();
  }, []);

  if (loading === true)
    return (
      <div className="flex justify-center p-12">
        <p>Loading...</p>
      </div>
    );

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
                  onValueChange={async (value) => {
                    const response = await changeUserRole(
                      user_item.user_id,
                      value
                    );
                    if (response?.status === true) {
                      toast({
                        title: `Successfully change ${user_item.name}'s role!`,
                      });
                      if (user_item.user_id == user?.user_id) {
                        // if current user's role is modified, force to login again to update role
                        localStorage.removeItem("user");
                        router.push("/login");
                      }
                    } else {
                      toast({
                        title: "Error creating course",
                        description: response?.message,
                      });
                    }
                  }}
                  defaultValue={user_item.role}
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
