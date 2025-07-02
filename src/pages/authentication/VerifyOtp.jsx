import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { ErrorToast, SuccessToast } from "../../components/global/Toaster";
import { useLogin } from "../../hooks/api/Post";
import { FaArrowLeft } from "react-icons/fa";
import Cookies from "js-cookie";

export default function VerifyOtp() {
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [resendCooldown, setResendCooldown] = useState(30);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false); // <-- new
  const inputsRef = useRef([]);
  const location = useLocation();
  const navigate = useNavigate();
  const email = location?.state?.email;
  const { postData } = useLogin();

  useEffect(() => {
    inputsRef.current[0]?.focus();
    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleChange = (value, idx) => {
    if (/^[0-9]$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
      if (idx < 5) inputsRef.current[idx + 1]?.focus();
    } else if (value.length === 6 && /^\d{6}$/.test(value)) {
      const newOtp = value.split("");
      setOtp(newOtp);
      inputsRef.current[5]?.focus();
    }
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      const newOtp = [...otp];
      if (otp[idx]) {
        newOtp[idx] = "";
        setOtp(newOtp);
      } else if (idx > 0) {
        inputsRef.current[idx - 1]?.focus();
        const updatedOtp = [...otp];
        updatedOtp[idx - 1] = "";
        setOtp(updatedOtp);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== 6) {
      ErrorToast("Please enter all 6 digits");
      return;
    }

    setVerifying(true);
    try {
      await postData(
        "/auth/verify",
        false,
        null,
        { email, otp: code },
        (res) => {
          SuccessToast("OTP verified successfully");
          Cookies.set("token", res?.data?.token, { expires: 7 });
          navigate("/auth/reset-password", {
            state: { token: res?.data?.token },
          });
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setVerifying(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || resendCooldown > 0 || resending) return;

    setResending(true);
    try {
      await postData("/auth/forgot", false, null, { email }, () => {
        SuccessToast("OTP resent to your email");
        setOtp(Array(6).fill(""));
        inputsRef.current[0]?.focus();
        setResendCooldown(30);
      });
    } catch (err) {
      console.error(err);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#f4f8ff] px-6 py-12">
        <div className="w-full max-w-md bg-[rgb(237 237 237)] rounded-3xl p-10 shadow-2xl transition-all duration-300 hover:shadow-blue-100 relative">
          {/* Back Button */}
          <button
            onClick={() => navigate("/auth/forget-password")}
            className="absolute top-4 left-4 text-gray-500 hover:text-gray-800 flex items-center"
          >
            <FaArrowLeft className="mr-2" />
            Back
          </button>

          <h2 className="text-3xl font-bold mb-6 text-center">Verify OTP</h2>
          <p className="text-gray-500 text-center mb-6">
            Enter the 6-digit OTP sent to <strong>{email}</strong>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-between gap-2">
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  ref={(el) => (inputsRef.current[idx] = el)}
                  onChange={(e) => handleChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  onPaste={
                    idx === 0
                      ? (e) => {
                          const pasted = e.clipboardData.getData("Text").trim();
                          if (/^\d{6}$/.test(pasted)) {
                            const newOtp = pasted.split("");
                            setOtp(newOtp);
                            inputsRef.current[5]?.focus();
                            e.preventDefault();
                          }
                        }
                      : undefined
                  }
                  className="w-12 h-12 text-center text-xl border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#f40e00] text-white rounded-xl font-semibold shadow-md hover:opacity-90 transition-all"
              disabled={verifying}
            >
              {verifying ? "Verifying..." : "Verify OTP"}
            </button>

            {/* Resend OTP */}
            <div className="text-center text-sm text-gray-600 mt-4">
              Didn't get the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                className={`font-semibold ${
                  resendCooldown > 0 || resending
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-blue-600 hover:underline"
                }`}
                disabled={resendCooldown > 0 || resending}
              >
                {resending ? "Resending..." : "Resend OTP"}
              </button>{" "}
              {resendCooldown > 0 && !resending && (
                <span className="text-xs">({resendCooldown}s)</span>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-cover bg-center bg-no-repeat bg-[#f40e00]">
        <img src="/demo.png" alt="" />
      </div>
    </div>
  );
}
