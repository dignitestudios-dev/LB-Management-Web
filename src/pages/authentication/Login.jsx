import { useState } from "react";
import { FaEye, FaEyeSlash, FaEnvelope, FaLock } from "react-icons/fa";
import { useLogin } from "../../hooks/api/Post"; // ✅ Adjust path if needed
import Cookies from "js-cookie";
import { useNavigate } from "react-router";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { postData, loading } = useLogin();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    await postData(
      "/auth/login",
      false,
      null,
      { email, password },
      (res, navigate) => {
        const token = res?.data?.token;
        const user = res?.data?.user;

        if (!token || !user) {
          alert("Login failed: Token or user not received");
          return;
        }

        // Save token and user info
        Cookies.set("token", token, { expires: 1 });
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));
        alert("Login successful!");

        // ✅ Redirect based on role
        const role = user?.role?.name?.toLowerCase();
        if (role === "admin") {
          navigate("/app/dashboard");
        } else {
          navigate("/app/userdashboard");
        }
      }
    );
  };


  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f4f8ff] px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-2xl transition-all duration-300 hover:shadow-blue-100">
          {/* Logo / Heading */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black">Welcome Back</h2>
            <p className="text-gray-500 mt-2">Login to your account</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <label className="block text-gray-800 font-semibold mb-2">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="Enter your email"
                  className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <FaEnvelope className="absolute top-4 left-3 text-gray-400" />
              </div>
            </div>

            {/* Password */}
            <div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 pl-10 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <FaLock className="absolute top-4 left-3 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#f40e00] text-white rounded-xl font-semibold shadow-md hover:opacity-90 transition-all"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>


            {/* Switch to Register */}

          </form>
        </div>
      </div>

      {/* Right Section - Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-cover bg-center bg-no-repeat bg-[#f40e00]" >
        <img src="/demo.png" alt="" />
      </div>


    </div>
  );
}
