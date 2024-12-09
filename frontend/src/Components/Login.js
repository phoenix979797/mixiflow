import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import backendAxios from "../utils/backendAxios";
import Alert from "./Alert";
import { useToast } from "../context/ToastContext";
import { useGoogleLogin } from "@react-oauth/google";
import { useMsal } from "@azure/msal-react";

const Login = () => {
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { instance } = useMsal();

  const googleLogin = useGoogleLogin({
    onSuccess: async (response) => {
      try {
        // Get user info from Google
        const userInfo = await backendAxios.post("/auth/google-login", {
          access_token: response.access_token,
        });

        if (userInfo.data) {
          showToast("Login successful!", "success");
          localStorage.setItem("token", userInfo.data.token);
          navigate("/dashboard");
        }
      } catch (err) {
        showToast(
          err.response?.data?.message ||
            "An error occurred during Google login",
          "error"
        );
        setError(
          err.response?.data?.message || "An error occurred during Google login"
        );
      }
    },
    onError: () => {
      showToast("Google login failed", "error");
      setError("Google login failed");
    },
  });

  const microsoftLogin = async () => {
    try {
      const response = await instance.loginPopup({
        scopes: ["user.read", "email"],
        prompt: "select_account",
      });

      if (response) {
        const userInfo = await backendAxios.post("/auth/microsoft-login", {
          access_token: response.accessToken,
        });

        if (userInfo.data) {
          showToast("Login successful!", "success");
          localStorage.setItem("token", userInfo.data.token);
          navigate("/dashboard");
        }
      }
    } catch (err) {
      showToast("Microsoft login failed", "error");
      setError("Microsoft login failed");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await backendAxios.post("/auth/login", formData);
      if (response.data) {
        showToast("Login successful!", "success");
        localStorage.setItem("token", response.data.token);
        if (response.data.role === "admin") {
          navigate("/admin");
        } else {
          navigate("/dashboard");
        }
      }
    } catch (err) {
      showToast(
        err.response?.data?.message || "An error occurred during login",
        "error"
      );
      setError(err.response?.data?.message || "An error occurred during login");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider) => {
    try {
      if (provider === "google") {
        googleLogin();
      } else if (provider === "microsoft") {
        microsoftLogin();
      }
    } catch (err) {
      setError(`Failed to initialize ${provider} login`);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header container with flex */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </Link>

          <h1 className="text-4xl font-bold text-gray-900">Login</h1>

          <div className="w-8"></div>
        </div>

        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 outline-none"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-200 focus:border-gray-200 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleSocialLogin("google")}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.google.com/favicon.ico"
              alt="Google"
              className="w-5 h-5 mr-2"
            />
            Continue with Google
          </button>

          <button
            onClick={() => handleSocialLogin("microsoft")}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <img
              src="https://www.microsoft.com/favicon.ico"
              alt="Microsoft"
              className="w-5 h-5 mr-2"
            />
            Continue with Microsoft
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
