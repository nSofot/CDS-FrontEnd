import axios from "axios";
import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGoogleLogin } from "@react-oauth/google";
import { FcGoogle } from "react-icons/fc";

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState("Mr.");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [invitee, setInvitee] = useState("");
  const [inviteeId, setInviteeId] = useState("");
  const [inviteeMobile, setInviteeMobile] = useState("");
  const [inputMobile, setInputMobile] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const navigate = useNavigate();
  const currentYear = new Date().getFullYear();

  const searchCustomer = async (id) => {
    if (!id || id === "0") return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/member/${id}`);
      if (res.data) {
        setInviteeId(res.data.memberId || "");
        setInvitee(`${res.data.title || ""} ${res.data.firstName || ""} ${res.data.lastName || ""}`.trim());
        setInviteeMobile(res.data.mobile || "");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid Member ID");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!firstName || !lastName || !mobile || !email || !inputMobile || !inviteeMobile || !password || !confirmPassword) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (inputMobile !== inviteeMobile) {
      toast.error("Invitee mobile numbers do not match");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    const newMember = {
      title,
      firstName,
      lastName,
      mobile,
      email: email ? email.trim() : undefined,
      password,
      invitedBy: inviteeId || null,
      memberType: "guest",
      memberRole: "guest",
      periodInSchoolFrom: currentYear,
      periodInSchoolTo: currentYear,
    };

    try {
      setIsRegistering(true);
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/member`, newMember);
      toast.success("Registration Successful");
      navigate("/login");
    } catch (err) {
      console.error("Register error:", err);
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleGoogleLogin = () => {
    if (!inputMobile || !inviteeMobile || !mobile) {
      toast.error("Please provide invitee ID, invitee mobile and your mobile before Google registration");
      return;
    }
    if (inputMobile !== inviteeMobile) {
      toast.error("Invitee mobile numbers do not match");
      return;
    }      
    googleRegister(); 
  };

  const googleRegister = useGoogleLogin({
    onSuccess: async (response) => {    
      try {
        setIsRegistering(true);
        const accessToken = response.access_token;
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/user/create-google-user`, {
          accessToken,
          invitedBy: inviteeId,
          mobile,
        });
        toast.success("Google Registration Successful");
        localStorage.setItem("token", res.data.token);
        navigate("/login");
      } catch (err) {
        setIsRegistering(false);
        toast.error(err.response?.data?.message || "Google registration failed");
      }
    },
    onError: () => toast.error("Google registration failed"),
  });

  return (
    <div className="min-h-screen w-full bg-[url('/LandingImageNew.jpg')] bg-cover bg-center flex justify-center items-center px-4 py-6">
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-3xl bg-white/50 backdrop-blur-md rounded-2xl shadow-2xl flex flex-col gap-5 p-6 sm:p-8">
        
        <h2 className="text-2xl sm:text-3xl font-bold text-purple-600 text-center mb-4">
          New Member Registration
        </h2>


        {/* Instructions */}
        <div className="bg-purple-100 border-l-4 border-purple-500 p-4 rounded-md text-sm text-purple-700 mb-4">
          <p className="mb-2 font-semibold">Instructions:</p>
          <ul className="list-disc list-inside">
            <li>
              <strong>Google Registration:</strong> Fill Invitee ID, Invitee Mobile, and your Mobile Number.
            </li>
            <li>
              <strong>Regular Registration:</strong> Fill Invitee ID, Invitee Mobile, select Title, First Name, Last Name, your Mobile Number, and Password.
            </li>
          </ul>
        </div>

        {/* Invitee Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="number"
            name="invitee-id"
            autoComplete="off"
            inputMode="numeric"
            placeholder="Invitee ID"
            maxLength={4}
            value={inviteeId}
            onChange={async (e) => {
              const value = e.target.value;
              setInviteeId(value);
              if (value.length === 4) await searchCustomer(value);
            }}
            className="sm:w-[120px] sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="text"
            name="invitee-name"
            autoComplete="off"
            placeholder="Invitee Name"
            disabled
            value={invitee}
            className="w-full sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm text-gray-700 cursor-not-allowed"
          />
          <input
            type="tel"
            name="invitee-mobile"
            autoComplete="off"
            inputMode="numeric"
            placeholder="Invitee Mobile"
            value={inputMobile}
            onChange={(e) => setInputMobile(e.target.value)}
            className="sm:w-[140px] sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Name Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <select
            name="title"
            autoComplete="off"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            <option>Mr.</option>
            <option>Mrs.</option>
            <option>Miss.</option>
            <option>Dr.</option>
            <option>Prof.</option>
          </select>
          <input
            type="text"
            name="first-name"
            autoComplete="off"
            placeholder="First Name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="text"
            name="last-name"
            autoComplete="off"
            placeholder="Last Name"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Mobile & Email Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="tel"
            name="mobile"
            autoComplete="off"
            inputMode="numeric"
            placeholder="Mobile"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            className="sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="email"
            name="email"
            autoComplete="off"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Password Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="password"
            name="new-password"
            autoComplete="new-password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
          <input
            type="password"
            name="confirm-password"
            autoComplete="new-password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full sm:h-12 h-10 px-3 rounded-md border bg-green-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
          />
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <button
            onClick={async () => {
              setIsRegistering(true);
              await handleRegister();
              setIsRegistering(false);
            }}
            disabled={isRegistering}
            className={`w-full sm:h-12 h-10 rounded-md font-semibold text-white transition-all duration-200
              ${isRegistering
                ? "bg-purple-400 cursor-not-allowed opacity-70"
                : "bg-purple-600 hover:bg-purple-700 active:scale-[0.98]"
              }`}
          >
            {isRegistering ? "Registering..." : "Register"}
          </button>

          <button
            onClick={async () => {
              setIsRegistering(true);
              await handleGoogleLogin();
              setIsRegistering(false);
            }}
            disabled={isRegistering}
            className={`w-full sm:h-12 h-10 flex items-center justify-center gap-2 rounded-md font-semibold transition-all duration-200
              ${isRegistering
                ? "border border-purple-400 text-purple-400 cursor-not-allowed opacity-70 bg-transparent"
                : "border border-purple-600 text-purple-600 hover:bg-purple-700 hover:text-white active:scale-[0.98]"
              }`}
          >
            <FcGoogle className="text-2xl" />
            {isRegistering ? "Processing..." : "Register with Google"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="w-full sm:h-12 h-10 rounded-md border border-orange-600 font-semibold text-orange-600 transition-all duration-200 hover:bg-orange-500 hover:text-white active:scale-[0.98]"
          >
            Back to Home
          </button>

        </div>

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
  );
}
