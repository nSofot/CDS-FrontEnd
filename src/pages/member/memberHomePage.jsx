import { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaSignOutAlt,
  FaUser,
  FaShoppingCart,
  FaLeaf,
  FaChartLine,
  FaMoneyBillWave,
  FaHome,
  FaAtom,
} from "react-icons/fa";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

/* ───────── MEMBER PORTAL ───────── */

export default function MemberHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  /* 🔐 AUTH CHECK */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) navigate("/login");
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user"));
  const normalizedRole = user?.memberRole?.toLowerCase()?.trim();
  const userName = user?.firstName || "User";

  /* ───── MENU ITEMS ───── */
  const menuItems = [
    {
      label: "ප්‍රධාන පිටුව",
      to: "/",
      icon: <FaHome />,
      roles: ["member", "admin"],
    },
    {
      label: "උපකරණ පුවරුව",
      to: "/member",
      icon: <FaAtom />,
      roles: ["member", "admin"],
    },
    {
      label: "සාමාජිකයාගේ විස්තර",
      to: "/member/profile",
      icon: <FaUser />,
      roles: ["member", "admin"],
    },
    {
      label: "බෑග් ඇණවුම්",
      to: "/member/orders",
      icon: <FaShoppingCart />,
      roles: ["member", "admin"],
    },
    {
      label: "අස්වනු වාර්තා",
      to: "/member/harvests",
      icon: <FaLeaf />,
      roles: ["member", "admin"],
    },
    {
      label: "විකුණුම් වාර්තා",
      to: "/member/sales",
      icon: <FaChartLine />,
      roles: ["member", "admin"],
    },
    {
      label: "මූල්‍ය වාර්තා",
      to: "/member/finance",
      icon: <FaMoneyBillWave />,
      roles: ["member", "admin"],
    },
  ];

  return (
    <div className="flex w-full min-h-screen bg-gradient-to-br from-emerald-50 to-slate-100">

      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static z-40 w-64 h-full bg-white/90 backdrop-blur-md shadow-xl border-r border-emerald-100 transition-transform duration-300
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >

        {/* HEADER */}
        <div className="p-4 flex justify-between items-center font-bold text-emerald-700 border-b border-emerald-100">
            <div className="flex flex-col">
                <span className="tracking-wide">Member Portal</span>
                <span className="text-sm text-gray-500">{userName}</span>
            </div>
          <button className="md:hidden text-emerald-700" onClick={() => setSidebarOpen(false)}>
            <FaTimes />
          </button>
        </div>

        {/* NAV */}
        <nav className="flex flex-col p-3 gap-1">

          {menuItems
            .filter(
              (item) =>
                !normalizedRole ||
                item.roles.includes(normalizedRole)
            )
            .map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={() => setSidebarOpen(false)}
              />
            ))}

          {/* LOGOUT */}
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-2 mt-4 rounded-lg text-red-600 hover:bg-red-50 transition"
          >
            <FaSignOutAlt />
            පිටවීම
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">

        {/* TOP BAR */}
        <header className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-4 py-3 flex items-center gap-4 shadow-sm border-b border-gray-200">

          <button
            className="md:hidden text-emerald-700 text-2xl"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>

          <div className="flex items-center gap-3">
            <img src="/CDSLogo.png" alt="logo" className="w-11 h-11 rounded-full shadow" />

            <div className="leading-tight">
              <h1 className="text-base md:text-lg font-semibold text-gray-800">
                සාමූහික සංවර්ධන සංගමය (CDS)
              </h1>
              <p className="text-xs text-gray-500">
                සාමාජික නිෂ්පාදන සහ විකුණුම් කළමනාකරණ පද්ධතිය
              </p>
            </div>
          </div>

        </header>

        {/* PAGE CONTENT */}
        <div className="p-6">
          <Outlet />
        </div>

      </main>
    </div>
  );
}

/* ───────── SIDEBAR LINK ───────── */
const SidebarLink = ({ to, icon, label, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-200
      ${
        isActive
          ? "bg-emerald-100 text-emerald-700 font-semibold shadow-sm"
          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
      }`
    }
  >
    <span className="text-emerald-600">{icon}</span>
    {label}
  </NavLink>
);