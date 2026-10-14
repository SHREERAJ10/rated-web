import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

export const handleLogin = async (email:string, password:string) => {
  await signInWithEmailAndPassword(
    auth,
    email,
    password
  );
};

export const handleSignUp = async (email:string, password:string) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );
  const user = userCredential.user;
  return user;
};

export const logout = async () => {
  await signOut(auth);
};