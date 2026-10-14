import type { User } from "firebase/auth";
import { getData, uploadMedia } from "./api";

const uploadImage = async (
  user: User,
  imageFile: File,
) => {
  const signatureResult = await getData(user, "/signature");

  const formData = new FormData();
  formData.append("file", imageFile);
  formData.append("api_key", signatureResult.apiKey);
  formData.append("signature", signatureResult.signature);
  formData.append("timestamp", `${signatureResult.timestamp}`);
  formData.append("folder", signatureResult.folder);
  const uploadResult = await uploadMedia(formData);
  return uploadResult;
};

export default uploadImage;
