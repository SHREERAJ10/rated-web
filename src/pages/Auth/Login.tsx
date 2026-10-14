import { useContext, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import getIconFromName from "../../utils/getIconFromName.jsx";
import { handleLogin } from "../../utils/AuthHandlers.jsx";
import { AuthContext } from "../../context/AuthContext.js";
import { toast } from "sonner";

const LOGIN_FIELDS = [
  {
    id: "email",
    name: "email",
    placeholder: "Email",
    icon: "Mail",
    type: "email",
  },
  {
    id: "password",
    name: "password",
    placeholder: "Password",
    icon: "Lock",
    type: "password",
  },
];

const authErrorMessages: Record<string, string> = {
  "auth/invalid-credential": "Invalid email or password.",
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/weak-password": "Password must be at least 6 characters.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Try again later.",
  "auth/network-request-failed": "Network error. Check your connection.",
};

function Login() {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const navigate = useNavigate();

  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="w-[85%] max-w-123.75 border border-[#BEBEBE] rounded-2xl bg-[#FAFAFA] px-6 pt-5 pb-7 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-semibold">Hello there,</h1>
          <span className="text-xl">Login to your account</span>
        </div>
        <form
          onSubmit={async (e) => {
            setIsLoggingIn(true);
            e.preventDefault();
            try {
              await handleLogin(loginData.email, loginData.password);
              navigate("/");
            } catch (err) {
              toast.error(
                authErrorMessages[err.code] ?? "Something went wrong!",
              );
            }
            setIsLoggingIn(false);
          }}
        >
          <div className="flex flex-col gap-9">
            <div className="flex flex-col gap-5">
              {LOGIN_FIELDS.map((field) => {
                return (
                  <div
                    key={field.name}
                    className="flex items-center gap-2 border border-[#D3D3D3] rounded-2xl bg-[#FBFBFB] pl-5 py-2 pr-1"
                  >
                    {getIconFromName(field.icon)}
                    <input
                      name={field.name}
                      value={loginData[field.id]}
                      type={field.type}
                      placeholder={field.placeholder}
                      className="outline-none focus:outline-none text-xl placeholder:font-medium text-[#272727] w-full placeholder:text-[#7C7C7C]"
                      onChange={(e) => {
                        setLoginData((prev) => ({
                          ...prev,
                          [field.id]: e.target.value,
                        }));
                      }}
                    />
                  </div>
                );
              })}
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-[#272727] text-semibold text-xl w-full text-[#D9D9D9] rounded-xl cursor-pointer hover:brightness-110 transition-all duration-150 ease-in-out disabled:cursor-not-allowed disabled:brightness-90"
              disabled={isLoggingIn}
            >
              Login
            </button>
          </div>
        </form>
        <div className="text-lg text-[#11111] flex gap-1 justify-center">
          <span className="font-light">Don't have an account?</span>
          <Link
            className="font-semibold hover:underline cursor-pointer"
            to="/register"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Login;
