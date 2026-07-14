import { useContext } from "react";
import Login from "./Auth/Login";
import { AuthContext } from "../context/AuthContext";
import Feed from "./Feed";

function ProtectedRoute() {
  const { user } = useContext(AuthContext);
  if (!user) {
    return <Login />;
  }
  return (
    <>
      <Feed />
    </>
  );
}

export default ProtectedRoute;
