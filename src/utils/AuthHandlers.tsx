import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, updateProfile } from "firebase/auth";
import { auth } from "../config/firebase";

const BASE_URL = "http://localhost:3000";

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
  await signOut(auth).catch((err) => {
    console.log(err);
  });
};

// export const initializeUser = async (username:string, email:string, password:string) => {
//   try {
//     const user = await handleSignUp(username, email, password);
//     const token = await user.getIdToken();
//     await fetch(`${BASE_URL}/user`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify({ username: username }),
//     });
//   } catch (err) {
//     throw new Error(err);
//   }
// };