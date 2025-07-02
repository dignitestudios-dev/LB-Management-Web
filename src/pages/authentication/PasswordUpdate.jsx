import { useState } from "react";
import { FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router";
import { useLogin } from "../../hooks/api/Post";
import { SuccessToast, ErrorToast } from "../../components/global/Toaster";

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const { postData, loading } = useLogin();
  const navigate = useNavigate();
  const location = useLocation();
  const email = location?.state?.token;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      ErrorToast("Passwords do not match");
      return;
    }
    await postData(
      "/auth/updatePassword",
      false,
      null,
      { password: newPassword },
      () => {
        SuccessToast("Password updated successfully!");
        navigate("/auth/login");
      }
    );
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f4f8ff] px-6 py-12">
        <div className="w-full max-w-md bg-[rgb(237 237 237)] rounded-3xl p-10 shadow-2xl transition-all duration-300 hover:shadow-blue-100">
          <h2 className="text-3xl font-bold mb-6 text-center">
            Reset Password
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* New Password */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 pl-10 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <FaLock className="absolute top-4 left-3 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-gray-800 font-semibold mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 pl-10 pr-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <FaLock className="absolute top-4 left-3 text-gray-400" />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-[#f40e00] text-white rounded-xl font-semibold shadow-md hover:opacity-90 transition-all"
              disabled={loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-cover bg-center bg-no-repeat bg-[#f40e00]">
        <img src="/demo.png" alt="" />
      </div>
    </div>
  );
}
