import { useState } from "react";
import { FaEnvelope } from "react-icons/fa";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";
import { useLogin } from "../../hooks/api/Post";
import { useNavigate } from "react-router";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const { postData, loading } = useLogin();
  const navigate = useNavigate("");
  const handleSubmit = async (e) => {
    e.preventDefault();

    await postData(
      "/auth/forgot", // URL
      false, // isFormData
      null, // formdata (not used here)
      { email }, // data
      (res) => {
        // callback
        SuccessToast("Password reset link sent to your email!");
        navigate("/auth/verify-otp", { state: { email } });
        setEmail("");
      }
    );
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f4f8ff] px-6 py-12">
        <div className="w-full max-w-md bg-[rgb(237 237 237)] rounded-3xl p-10 shadow-2xl transition-all duration-300 hover:shadow-blue-100">
          {/* Logo / Heading */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-black">Forgot Password</h2>
            <p className="text-gray-500 mt-2">We'll send you a reset link</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div className="relative">
              <label className="block text-gray-800 font-semibold mb-2">
                Email
              </label>
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

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 bg-[#f40e00] text-white rounded-xl font-semibold shadow-md hover:opacity-90 transition-all"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Section - Image/Gradient */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-cover bg-center bg-no-repeat bg-[#f40e00]">
        <img src="/demo.png" alt="" />
      </div>
    </div>
  );
}
