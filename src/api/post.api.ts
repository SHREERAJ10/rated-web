import { createRecord, getData } from "@/utils/api";
import type { User } from "firebase/auth";

export const getComments = async (user: User, postId: string) => {
  const comments = await getData(user, `/post/${postId}/comment`);
  return comments;
};

export const postComment = async (user: User, postId: string, comment:object) => {
  const response = await createRecord(user, `/post/${postId}/comment`, comment);
  return response;
};
