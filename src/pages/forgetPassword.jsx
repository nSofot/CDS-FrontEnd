import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function ForgetPasswordPage() {
  const [otpSent, setOtpSent] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();

  // ================= SEND OTP =================
  async function sendOtp() {
    if (!email || !mobile) {
      toast.error("Email and Mobile are required");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/send-OTP`,
        { email, mobile }
      );

      setOtpSent(true);
      toast.success("OTP sent to your email. Please check your inbox.");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP");
    }
  }

  // ================= VERIFY OTP & RESET PASSWORD =================
  async function verifyOtp() {
    if (!email || !mobile) {
      toast.error("Email and Mobile are required");
      return;
    }

    if (!otp) {
      toast.error("OTP is required");
      return;
    }

    if (newPassword.length < 4) {
      toast.error("Password must be at least 4 characters long");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const otpNumber = parseInt(otp.trim(), 10);
    if (isNaN(otpNumber)) {
      toast.error("Please enter a valid numeric OTP");
      return;
    }

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/user/reset-password`,
        {
          email,
          mobile,
          otp: otpNumber,
          newPassword,
        }
      );

      toast.success("Password reset successfully");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Invalid or expired OTP");
    }
  }

  // ================= RESEND OTP =================
  async function handleResend() {
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    await sendOtp(); // 🔑 actually resend OTP
  }

  return (
    <div className="min-h-screen w-full bg-[url('/LandingImageNew.jpg')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-5xl w-full">
        <div className="w-full max-w-sm p-6 md:p-10 backdrop-blur-md bg-white/40 rounded-2xl shadow-xl">

          <h2 className="text-2xl md:text-3xl font-bold text-purple-700 mb-6 text-center">
            {otpSent ? "Reset Password" : "Forgot Password"}
          </h2>

          {!otpSent ? (
            <>
              {/* MOBILE */}
              <input
                type="text"
                placeholder="Enter your mobile number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                className="w-full h-12 px-4 mb-4 rounded-lg border border-purple-200 bg-white"
              />

              {/* EMAIL */}
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-12 px-4 mb-6 rounded-lg border border-purple-200 bg-white"
              />

              {/* SEND OTP BUTTON */}
              <button
                disabled={sendingOtp}
                onClick={async () => {
                  setSendingOtp(true);
                  try {
                    await sendOtp();
                  } finally {
                    setSendingOtp(false);
                  }
                }}
                className={`w-full h-12 rounded-lg font-semibold text-white transition-all duration-200
                  ${
                    sendingOtp
                      ? "bg-purple-400 cursor-not-allowed opacity-70"
                      : "bg-purple-600 hover:bg-purple-700 active:scale-[0.98]"
                  }`}
              >
                {sendingOtp ? "Sending OTP..." : "Send OTP"}
              </button>
            </>
          ) : (
            <>
              {/* READONLY MOBILE */}
              <input
                type="text"
                readOnly
                value={mobile}
                className="w-full h-12 px-4 mb-4 rounded-lg border border-purple-200 bg-gray-100"
              />

              {/* READONLY EMAIL */}
              <input
                type="email"
                readOnly
                value={email}
                className="w-full h-12 px-4 mb-4 rounded-lg border border-purple-200 bg-gray-100"
              />

              {/* OTP */}
              <input
                type="text"
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full h-12 px-4 mb-4 rounded-lg border border-purple-200 bg-white"
              />

              {/* NEW PASSWORD */}
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full h-12 px-4 mb-4 rounded-lg border border-purple-200 bg-white"
              />

              {/* CONFIRM PASSWORD */}
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full h-12 px-4 mb-6 rounded-lg border border-purple-200 bg-white"
              />

              {/* RESET PASSWORD */}
              <button
                disabled={verifyingOtp}
                onClick={async () => {
                  setVerifyingOtp(true);
                  try {
                    await verifyOtp();
                  } finally {
                    setVerifyingOtp(false);
                  }
                }}
                className={`w-full h-12 rounded-lg font-semibold text-white transition-all duration-200 mb-3
                  ${
                    verifyingOtp
                      ? "bg-purple-400 cursor-not-allowed opacity-70"
                      : "bg-purple-600 hover:bg-purple-700 active:scale-[0.98]"
                  }`}
              >
                {verifyingOtp ? "Resetting Password..." : "Reset Password"}
              </button>

              {/* RESEND OTP */}
              <button
                disabled={sendingOtp}
                onClick={async () => {
                  setSendingOtp(true);
                  try {
                    await handleResend();
                  } finally {
                    setSendingOtp(false);
                  }
                }}
                className={`w-full h-12 rounded-lg font-semibold transition-all duration-200
                  ${
                    sendingOtp
                      ? "border border-purple-400 text-purple-400 cursor-not-allowed opacity-70"
                      : "border border-purple-600 text-purple-700 hover:bg-purple-700 hover:text-white active:scale-[0.98]"
                  }`}
              >
                {sendingOtp ? "Resending OTP..." : "Resend OTP"}
              </button>
            </>
          )}
          <div>
            <p className="mt-8 text-sm text-gray-600 text-center">
              © 2025 Tholangamuwa Central College - Colombo Group. All rights reserved.
            </p>
            <p className="mt-2 text-sm text-gray-600 text-center">
              Powered by nSoft Technologies.
            </p>   
          </div>
        </div>
      </div>
    </div>
  );
}
