import { getData } from "@/utils/api";

export const fetchUser = async (user: User) => {
  const userData = await getData(user, `/user`);
  return userData;
};
