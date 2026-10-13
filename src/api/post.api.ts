import { createRecord, deleteRecord, getData, updateRecord } from "@/utils/api";
import type { User } from "firebase/auth";

export const createPost = async (user: User, postData: object) => {
  const post = await createRecord(user, "/post", postData);
  return post;
}

export const fetchComments = async (
  user: User,
  postId: string,
  pageParam?: Cursor,
) => {
  let url = `/post/${postId}/comment`;
  if (pageParam) {
    url += `?cursor=${pageParam.id}`;
  }
  const comments = await getData(user, url);
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

interface Cursor {
  id: string;
}

export const fetchPosts = async (user: User, pageParam?: Cursor) => {
  console.log(pageParam)
  let url = `/post`;
  if (pageParam) {
    url += `?cursor=${pageParam.id}`;
  }
  const posts = await getData(user, url);
  return posts;
};

export const fetchSinglePost = async (user: User, postId: string) => {
  const post = await getData(user, `/post/${postId}`);
  return post;
};

interface userRatingScore {
  score: number;
}

export const ratePost = async (
  user: User,
  postId: string,
  userRatingScore: userRatingScore,
) => {
  const ratingOfUser = await updateRecord(
    user,
    `/post/${postId}/rate`,
    userRatingScore,
  );
  return ratingOfUser;
};

export const removeRating = async (user: User, postId: string) => {
  const removedRating = await deleteRecord(user, `/post/${postId}/rate`);
  return removedRating;
};

export const fetchNotifications = async (user: User, pageParam?: Cursor) => {
  let url = `/user/notification`;
  if (pageParam) {
    url += `?cursor=${pageParam.id}`;
  }
  const notifications = await getData(user, url);
  return notifications;
};

export const updateNotificationStatus = async (user: User) => {
  await updateRecord(user, `/user/notification/status`, {});
};