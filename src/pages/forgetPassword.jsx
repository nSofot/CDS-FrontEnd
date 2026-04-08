import axios from "axios";
import { useState, useEffect } from "react";
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

  /* 🔐 REDIRECT IF ALREADY LOGGED IN */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      navigate("/");
    }
  }, [navigate]);

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
    await sendOtp();
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-sm p-6 md:p-10 bg-white rounded-2xl shadow-xl">

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
              className="w-full h-12 px-4 mb-4 rounded-lg border"
            />

            {/* EMAIL */}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 mb-6 rounded-lg border"
            />

            {/* SEND OTP */}
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
              className={`w-full h-12 rounded-lg text-white font-semibold
              ${
                sendingOtp
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {sendingOtp ? "Sending OTP..." : "Send OTP"}
            </button>
          </>
        ) : (
          <>
            {/* MOBILE */}
            <input
              type="text"
              readOnly
              value={mobile}
              className="w-full h-12 px-4 mb-4 rounded-lg border bg-gray-100"
            />

            {/* EMAIL */}
            <input
              type="email"
              readOnly
              value={email}
              className="w-full h-12 px-4 mb-4 rounded-lg border bg-gray-100"
            />

            {/* OTP */}
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full h-12 px-4 mb-4 rounded-lg border"
            />

            {/* NEW PASSWORD */}
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full h-12 px-4 mb-4 rounded-lg border"
            />

            {/* CONFIRM PASSWORD */}
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full h-12 px-4 mb-6 rounded-lg border"
            />

            {/* RESET */}
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
              className={`w-full h-12 rounded-lg text-white font-semibold mb-3
              ${
                verifyingOtp
                  ? "bg-purple-400 cursor-not-allowed"
                  : "bg-purple-600 hover:bg-purple-700"
              }`}
            >
              {verifyingOtp ? "Resetting..." : "Reset Password"}
            </button>

            {/* RESEND */}
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
              className="w-full h-12 rounded-lg border border-purple-600 text-purple-700 hover:bg-purple-700 hover:text-white"
            >
              {sendingOtp ? "Resending..." : "Resend OTP"}
            </button>
          </>
        )}

        {/* FOOTER */}
        <p className="mt-6 text-sm text-gray-500 text-center">
          © 2026 Collective Development Society
        </p>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Powered by nSoft Technologies.
          </p>         
        <div className="mt-4 text-center">
          <a
            href="/login"
            className="text-purple-600 hover:underline font-medium"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
}