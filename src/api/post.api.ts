import { createRecord, deleteRecord, getData } from "@/utils/api";
import type { User } from "firebase/auth";

export const fetchComments = async (user: User, postId: string) => {
  console.log(`fetching comments: ${postId}`);
  const comments = await getData(user, `/post/${postId}/comment`);
  return comments;
};

export const postComment = async (
  user: User,
  postId: string,
  comment: object,
) => {
  const response = await createRecord(user, `/post/${postId}/comment`, comment);
  return response;
};

export const likePost = async (user: User, postId: string) => {
  const likeStatus = await createRecord(user, `/post/${postId}/like`, {});
  return likeStatus;
};

export const unlikePost = async (user: User, postId: string) => {
  const likeStatus = await deleteRecord(user, `/post/${postId}/unlike`);
  return likeStatus;
};

export const getPost = async (user: User, postId: string) => {
  const post = await getData(user, `/post/${postId}`);
  return post;
};

export const fetchPosts = async (user: User) => {
  const posts = await getData(user, "/post");
  return posts;
};
