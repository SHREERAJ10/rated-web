import { useContext, useEffect, useState } from "react";
import Login from "./Auth/Login";
import { AuthContext } from "../context/AuthContext";
import { Outlet, useNavigate } from "react-router-dom";
import { getData } from "../utils/api";
import OnboardingPage from "./OnboardingPage";

interface OnboardingStatusType {
  userOnboard: boolean;
}

function ProtectedRoute() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      (async () => {
        const onboardingStatus: OnboardingStatusType = await getData(
          user,
          "/user/me",
        );
        if (!onboardingStatus.userOnboard) {
          navigate("/onboarding");
        }
      })();
    }
  }, [user]);

  if (!user) {
    return <Login />;
  }

  return (
    <>
      <Outlet />
    </>
  );
}

export default ProtectedRoute;
