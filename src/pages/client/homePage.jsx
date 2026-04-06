import { Fragment, useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import LoadingSpinner from "../../components/loadingSpinner";

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [president, setPresident] = useState({});
  const [treasurer, setTreasurer] = useState({});
  const [secretary, setSecretary] = useState({});

  const programs = [
    {
      id: "prog-1",
      title: "Annual Reunion",
      desc: "Connecting past students, sharing memories, and strengthening bonds.",
      image: "/images/reunion.jpg",
    },
    {
      id: "prog-2",
      title: "Community Service",
      desc: "Giving back to society through volunteering and social projects.",
      image: "/images/community.jpg",
    },
    {
      id: "prog-3",
      title: "Networking & Mentorship",
      desc: "Providing career guidance and mentorship to current students.",
      image: "/images/mentorship.png",
    },
  ];


  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);

    axios
      .get(import.meta.env.VITE_BACKEND_URL + "/api/member")
      .then((res) => {

        // Filter by roles
        setPresident(res.data.find(m => m.memberRole === "president") || {});
        setSecretary(res.data.find(m => m.memberRole === "secretary") || {});
        setTreasurer(res.data.find(m => m.memberRole === "treasurer") || {});

        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching members:", err);
        setIsLoading(false);
      });
  }, [location]);

  const exCoMembers = [
    { name: `${president?.firstName ?? ""} ${president?.lastName ?? ""}`.trim(), role: "President", image: president?.image },
    { name: `${secretary?.firstName ?? ""} ${secretary?.lastName ?? ""}`.trim(), role: "Secretary", image: secretary?.image },
    { name: `${treasurer?.firstName ?? ""} ${treasurer?.lastName ?? ""}`.trim(), role: "Treasurer", image: treasurer?.image },
  ];


  const navClass = ({ isActive }) =>
  isActive
    ? "text-yellow-400 border-b-2 border-yellow-400"
    : "hover:text-yellow-400";

  return (
    <Fragment>
      {/* ---------- HERO ---------- */}
      <section className="relative w-full min-h-screen flex items-start bg-black overflow-hidden">
        <motion.img
          src="/LandingPage1.jpg"
          alt="Tholangamuwa Central College Banner"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1 }}
        />

        <div className="absolute inset-0">
            <div className="relative z-30 flex items-center gap-4 sm:gap-8 px-4 sm:px-20 pt-20 sm:pt-10">
              {/* Logo */}
              <motion.img
                src="/NewLogoPng.png"
                alt="College Logo"
                className="w-16 h-16 sm:w-35 sm:h-35 object-contain"
              />

              {/* Text */}
              <div className="flex flex-col leading-tight">
                <h1 className="text-white text-base text-md sm:text-3xl font-bold drop-shadow-lg">
                  THOLANGAMUWA CENTRAL COLLEGE
                </h1>
                <h2 className="sm:mt-2 text-yellow-400 text-md sm:text-3xl font-semibold text-base drop-shadow-lg">
                  COLOMBO GROUP
                </h2>
              </div>
            </div>
        </div>

        <div className="relative z-10 px-8 max-w-xl mx-auto text-white mt-50 sm:mt-60 sm:ml-20">
          <motion.h1
            className="text-4xl sm:text-6xl font-bold drop-shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Unity and Fellowship
          </motion.h1>
          <motion.p
            className="mt-8 text-lg sm:text-2xl drop-shadow-lg"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            Connecting Past Students of Tholangamuwa Central College in Colombo for Unity, Lifelong Bonds, and Mutual Support. 
          </motion.p>
        </div>

        {/* ---------- HERO CONTENT ---------- */}
        <div className="absolute mt-100 sm:bottom-25 left-20 w-full z-20 px-6 sm:px-20">
          <motion.div
            className="flex flex-col sm:flex-row sm:items-left sm:items-start gap-6 sm:gap-8 mt-32 sm:mt-48"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Link
              to="/register"
              className="px-12 py-3 bg-yellow-400 border border-yellow-200 text-white font-semibold rounded-xl shadow hover:bg-yellow-500 transition"
            >
              JOIN US
            </Link>

            <Link
              to="/about"
              className="px-8 py-3 bg-blue-600 text-white border border-yellow-200 font-semibold rounded-xl hover:bg-blue-800 transition"
            >
              LEARN MORE
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ---------- KEY PROGRAMS ---------- */}
      <section className="py-16 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          OUR KEY PROGRAMS
        </h2>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((prog, idx) => (
            <motion.div
              key={prog.id}
              className="bg-white rounded-2xl shadow hover:shadow-xl transition"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
            >
              <img src={prog.image} alt={prog.title} className="h-48 w-full object-cover" />
              <div className="p-5">
                <h3 className="text-lg font-semibold">{prog.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{prog.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- MEMBERS ---------- */}
      <section className="py-16 px-4 bg-gray-50">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">
          MEET OUR MEMBERS
        </h2>

        {isLoading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {exCoMembers.map((m) => (
              <div
                key={m.role}   // UNIQUE KEY
                className="bg-white rounded-2xl shadow p-6 flex flex-col items-center"
              >
                <img
                  src={m.image || "/default-user.png"}   // fallback image
                  alt={m.name || m.role}
                  className="w-28 h-28 sm:w-32 sm:h-32 rounded-full object-cover border-4 border-indigo-600"
                />
                <h3 className="mt-4 font-bold text-center">
                  {m.name || "Not Assigned"}
                </h3>
                <p className="text-gray-600">{m.role}</p>
              </div>
            ))}
          </div>
        )}
      </section>


      {/* ---------- CTA ---------- */}
      <section className="w-full py-16 px-4 bg-indigo-700 text-white text-center">
        <h2 className="text-2xl sm:text-4xl font-bold mb-4">
          JOIN OUR COMMUNITY
        </h2>
        <p className="max-w-2xl mx-auto mb-6 text-sm sm:text-base">
          Be part of a strong alumni network, attend events, share experiences,
          and maintain lifelong friendships.
        </p>
        <Link
          to="/register"
          className="inline-block px-8 py-3 bg-white text-indigo-700 font-semibold rounded-full shadow hover:bg-gray-100 transition"
        >
          Become a Member
        </Link>
      </section>

      {/* ---------- FOOTER ---------- */}
      <footer className="w-full bg-gray-900 text-white py-8 px-4 text-center text-sm">
        <p>© 2025 Tholangamuwa Central College Past Students Colombo Group</p>
        <p className="opacity-75">Powered by nSoft Technologies</p>
      </footer>
    </Fragment>
  );
}
