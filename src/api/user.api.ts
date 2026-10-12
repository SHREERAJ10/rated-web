import { getData } from "@/utils/api";
import type { User } from "firebase/auth";

export const fetchUser = async (user: User) => {
  const userData = await getData(user, `/user`);
  return userData;
};


export const fetchUsers = async (user:User, query: string, page: number) => {
  const userData = await getData(user, `/user/search?searchQuery=${query}&page=${page}`);
  return userData;
}