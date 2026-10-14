import { Route, Routes, useLocation } from "react-router-dom";
import ProtectedRoute from "./pages/ProtectedRoute";
import Feed from "./pages/Feed";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import { onAuthStateChanged } from "firebase/auth";
import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import { auth } from "./config/firebase";
import OnboardingPage from "./pages/OnboardingPage";
import { CommentSection } from "./components/CommentSection";
import NotificationPage from "./pages/NotificationPage";
import UserSearch from "./pages/UserSearch";
import UserProfile from "./pages/UserProfile";
import { Toaster } from "sonner";

function App() {
  const location = useLocation();
  const state = location.state || null;
  const backgroundLocation = state?.backgroundLocation || null;
  const [isLoading, setIsLoading] = useState(true);

  const { setUser } = useContext(AuthContext);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (isLoading)
    return (
      <div className="text-5xl flex min-h-screen items-center justify-center bg-[#f8f8f6] text-[#333333] font-medium tracking-wide">
        Rated
      </div>
    );

  return (
    <>
      <Toaster position="top-right" />
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<ProtectedRoute />}>
          <Route index element={<Feed />} />
          <Route path="post/:postId" element={<CommentSection />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="search" element={<UserSearch />} />
          <Route path=":username" element={<UserProfile />} />
        </Route>
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="onboarding" element={<OnboardingPage />} />
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
