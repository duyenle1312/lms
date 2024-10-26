"use server";
import pool from "./db";

export const getUsers = async () => {
  const result = await pool.query("SELECT * FROM users;");
  const users = result.rows;
  return users;
};

export const changeUserRole = async (user_id: string, role: string) => {
  const result = await pool.query(
    "UPDATE users SET role=$1 where user_id = $2;",
    [role, user_id]
  );
  console.log(result);
};

export const changeUserName = async (user_id: string, name: string) => {
  await pool.query(
    "UPDATE users SET name=$1 where user_id = $2;",
    [name, user_id]
  );
  const user = await pool.query(
    "SELECT * FROM users where user_id = $1;",
    [user_id]
  );
  return user.rows[0]
};
