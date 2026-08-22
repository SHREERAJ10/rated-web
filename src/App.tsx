import {
  BrowserRouter,
  createBrowserRouter,
  Route,
  RouterProvider,
  Routes,
  useLocation,
} from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";
import Feed from "./pages/Feed";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect } from "react";
import { AuthContext } from "./context/AuthContext";
import { auth } from "./config/firebase";
import OnboardingPage from "./pages/OnboardingPage";
import { CommentSection } from "./components/CommentSection";

// const router = createBrowserRouter([
//   {
//     path: "/",
//     Component: ProtectedRoute,
//     children: [
//       {
//         index: true,
//         Component: Feed,
//       },
//       {
//         path: "post/:postId",
//         Component: CommentSection,
//       },
//       {
//         path: "onboarding",
//         Component: OnboardingPage,
//       },
//     ],
//   },
//   {
//     path: "login",
//     Component: Login,
//   },
//   {
//     path: "register",
//     Component: Register,
//   },
// ]);

function App() {
  const location = useLocation();
  const state = location.state || null;
  const backgroundLocation = state?.backgroundLocation || null;

  const { setUser } = useContext(AuthContext);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Feed />} />
          <Route path="post/:postId" element={<CommentSection />} />
          <Route path="onboarding" element={<OnboardingPage />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Routes>
      {backgroundLocation && (
        <Routes>
          <Route path="post/:postId" element={<CommentSection />} />
        </Routes>
      )}
    </>
  );
}

export default App;
