import type { User } from "firebase/auth";

const BASE_URL = `http://localhost:3000`;

export const getData = async (user: User, route: string) => {
  const token = await user.getIdToken();
  const response = await fetch(`${BASE_URL}${route}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });

  const parsedResponse = await response.json();
  if (!response.ok) {
    throw new Error(parsedResponse.error);
  }

  return parsedResponse.data;
};

export const createRecord = async (user: User, route: string, data: object) => {
  const token = await user.getIdToken();
  const response = await fetch(`${BASE_URL}${route}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const parsedResponse = await response.json();

  if (!response.ok) {
    throw new Error(parsedResponse.error);
  }

  return parsedResponse;
};

export const updateRecord = async (user: User, route: string, data: object) => {
  const token = await user.getIdToken();
  const response = await fetch(`${BASE_URL}${route}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  const parsedResponse = await response.json();

  if (!response.ok) {
    throw new Error(parsedResponse.error);
  }

  return parsedResponse;
};

export const deleteRecord = async (user: User, route: string) => {
  const token = await user.getIdToken();
  const response = await fetch(`${BASE_URL}${route}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      authorization: `Bearer ${token}`,
    },
  });
  const parsedResponse = await response.json();
  if (!response.ok) {
    throw new Error(parsedResponse.error);
  }
  return parsedResponse;
};

export const uploadMedia = async (formData: FormData) => {
  const response = await fetch(
    "https://api.cloudinary.com/v1_1/medialibrary123/image/upload",
    { 
      method: "POST",
      body: formData,
    },
  );
  const parsedResponse = await response.json();
  if (!response.ok) {
    throw new Error(parsedResponse.error);
  }
  return parsedResponse;
};
