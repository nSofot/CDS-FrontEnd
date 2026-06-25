import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
  FaFileInvoiceDollar,
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

  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  const normalizedRole = user?.memberRole?.toLowerCase()?.trim();
  const userName = user?.firstName || "User";

  const location = useLocation();

  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]); 

  /* ───── MENU ITEMS ───── */
  const menuItems = [
    {
      label: "ප්‍රධාන පිටුව",
      to: "/",
      icon: <FaHome />,
      roles: ["member", "admin"],
    },
    {
      label: "ප්‍රධාන පුවරුව",
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
      to: "/member/bag-orders",
      icon: <FaShoppingCart />,
      roles: ["member", "admin"],
    },
    {
      label: "අස්වනු වාර්තා",
      to: "/member/production-entry",
      icon: <FaLeaf />,
      roles: ["member", "admin"],
    },
    {
      label: "විකුණුම් වාර්තා",
      to: "/member/sales-entry",
      icon: <FaChartLine />,
      roles: ["member", "admin"],
    },
    {
      label: "අලෙවි වාර්තාව",
      to: "/member/finance",
      icon: <FaMoneyBillWave />,
      roles: ["member", "admin"],
    },
    {
      label: "ගිණුම් විස්තර",
      to: "/member/account-statement",
      icon: <FaFileInvoiceDollar />,
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
        className={`
          fixed md:sticky top-0 left-0 z-40
          w-64 min-h-screen
          bg-gradient-to-b from-white to-emerald-50/30
          backdrop-blur-md
          shadow-lg border-r border-emerald-100
          overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* ───── HEADER ───── */}
        <div className="p-4 flex items-center justify-between border-b border-emerald-100 bg-white/70 backdrop-blur-sm">

          {/* BRAND */}
          <div className="flex flex-col leading-tight">

            <span className="text-emerald-700 font-extrabold tracking-widest text-lg">
              CDS ERP
            </span>

            <span className="text-gray-500 text-[12px] font-medium">
              සාමාජික යෙදුම
            </span>
            <span className="text-[11px] text-gray-400 truncate max-w-[170px]">
              අනුවාදය 1.0.0
            </span>
            <span className="mt-4 text-[11px] text-gray-400 truncate max-w-[170px]">
              Hello, {userName}
            </span>



          </div>

          {/* CLOSE */}
          <button
            className="md:hidden text-emerald-700 hover:bg-emerald-100 active:scale-95 transition p-2 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes className="text-lg" />
          </button>

        </div>

        {/* ───── NAVIGATION ───── */}
        <nav className="flex flex-col p-3 gap-1">

          {/* MENU */}
          {menuItems
            .filter((item) => normalizedRole && item.roles.includes(normalizedRole))
            .map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={() => setSidebarOpen(false)}
              />
            ))}

          {/* Divider */}
          <div className="my-3 border-t border-emerald-100" />

          {/* LOGOUT */}
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="
              flex items-center gap-3 px-4 py-2
              rounded-lg text-red-600
              hover:bg-red-50 hover:pl-5
              transition-all duration-200
              font-medium
            "
          >
            <FaSignOutAlt />
            පිටවීම
          </button>

        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col md:ml-0">

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
                සාමූහික සංවර්ධන සමිතිය (CDS)
              </h1>
              <p className="text-xs text-gray-500">
                සාමාජික නිෂ්පාදන සහ විකුණුම් කළමනාකරණ පද්ධතිය
              </p>
            </div>
          </div>

        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 md:p-6">
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
        ? "bg-emerald-100 text-emerald-700 font-semibold shadow-sm border-l-4 border-emerald-600"
          : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
      }`
    }
  >
    <span className="text-emerald-600">{icon}</span>
    {label}
  </NavLink>
);