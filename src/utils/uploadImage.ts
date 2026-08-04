import type { User } from "firebase/auth";
import { getData, uploadMedia } from "./api";
// import type { Dispatch, SetStateAction } from "react";

const uploadImage = async (
  user: User,
  imageFile: File,
  // setImageUrl: Dispatch<SetStateAction<string>>,
) => {
  const signatureResult = await getData(user, "/signature");

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("api_key", signatureResult.apiKey);
  formData.append("signature", signatureResult.signature);
  formData.append("timestamp", `${signatureResult.timestamp}`);
  formData.append("folder", signatureResult.folder);
  const uploadResult = await uploadMedia(formData);
  // setImageUrl(uploadResult.secure_url);
  return uploadResult;
};

export default uploadImage;
