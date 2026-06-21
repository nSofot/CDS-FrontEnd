import { useGoogleLogin } from "@react-oauth/google";
import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { FcGoogle } from "react-icons/fc";
import { useNavigate, Link } from "react-router-dom";

export default function LoginPage() {
  const [loginId, setLoginId] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(false);

  const navigate = useNavigate();

  // Google Login
  const googleLogin = useGoogleLogin({
    onSuccess: async ({ access_token }) => {
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_BACKEND_URL}/api/user/login-google`,
          {
            accessToken: access_token,
          }
        );

        toast.success("Login Successful");

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data));

        if (res.data.googleAccessToken) {
          localStorage.setItem(
            "google_token",
            res.data.googleAccessToken
          );
        }

        if (res.data.memberRole === "admin") {
          navigate("/control");
        } else {
          navigate("/");
        }
      } catch (error) {
        toast.error(
          error?.response?.data?.message || "Google login failed"
        );
      }
    },
    onError: () => {
      toast.error("Google login failed");
    },
  });

  // Login Function
  const handleLogin = async () => {
    if (!loginId || !password) {
      toast.error("User ID, Mobile or Email and Password are required");
      return;
    }

    const res = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/user/login`,
      {
        loginId,
        password,
      }
    );

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data));

    toast.success("Login Successful");

    if (res.data.memberRole === "admin") {
      navigate("/control");
    } else {
      navigate("/");
    }
  };

  // Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) return;

    try {
      setIsLogin(true);
      await handleLogin();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
    } finally {
      setIsLogin(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex justify-center items-center px-4">
      <div className="w-full max-w-sm bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 sm:p-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-700 mb-6 text-center">
          Login
        </h2>

        <form
          onSubmit={handleSubmit}
          autoComplete="on"
          className="flex flex-col space-y-4"
        >
          {/* Login ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              User ID / Mobile / Email
            </label>

            <input
              type="text"
              name="username"
              placeholder="Enter your User ID / Mobile / Email"
              value={loginId}
              onChange={(e) => setLoginId(e.target.value)}
              autoComplete="username"
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full h-11 px-3 rounded-lg border border-gray-300 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLogin}
            className={`w-full h-11 text-white font-semibold rounded-lg transition ${
              isLogin
                ? "bg-purple-400 cursor-not-allowed"
                : "bg-purple-600 hover:bg-purple-700 active:bg-purple-800"
            }`}
          >
            {isLogin ? "Logging in..." : "Login"}
          </button>

          {/* Google Login */}
          <button
            type="button"
            onClick={googleLogin}
            className="w-full h-11 flex items-center justify-center gap-3 text-purple-700 font-semibold border border-purple-600 hover:bg-purple-700 hover:text-white active:bg-purple-800 rounded-lg transition"
          >
            <FcGoogle className="text-2xl" />
            <span>Login with Google</span>
          </button>
        </form>

        {/* Links */}
        <div className="flex justify-between items-center text-sm text-blue-700 mt-6">
          <Link to="/forget" className="hover:underline">
            Forgot Password?
          </Link>
        </div>

        {/* Footer */}
        <div>
          <p className="mt-8 text-sm text-gray-600 text-center">
            © 2026 Collective Development Society.
          </p>

          <p className="text-sm text-gray-600 text-center">
            Powered by nSoft Technologies.
          </p>
        </div>
      </div>
    </div>
  );
}