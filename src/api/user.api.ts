import { getData } from "@/utils/api";
import type { User } from "firebase/auth";

export const fetchUser = async (user: User) => {
  const userData = await getData(user, `/user`);
  return userData;
};

export const fetchUserByUsername = async (user: User, username: string) => {
  const userData = await getData(user, `/user/${username}`);
  return userData;
}

interface Cursor {
  id: string;
}

export const fetchUsers = async (user:User, query: string, page: number) => {
  const userData = await getData(user, `/user/search?searchQuery=${query}&page=${page}`);
  return userData;
}

export const fetchUserPosts = async (user: User, username: string, pageParam?: Cursor) => {
  let url = `/user/${username}/posts`;
  if (pageParam) {
    url += `?cursor=${pageParam.id}`;
  }
  const posts = await getData(user, url);
  return posts;
};