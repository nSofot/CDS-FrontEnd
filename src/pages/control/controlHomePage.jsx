import { useState, useEffect } from "react";
import {
  FaMoneyCheckAlt,
  FaUserClock,
  FaUsersCog,
  FaHome,
  FaAtom,
  FaUsers,
  FaBars,
  FaReceipt,
  FaSignOutAlt,
  FaTimes,
  FaFileAlt,
} from "react-icons/fa";
import { FaSackDollar, FaMoneyBillTransfer } from "react-icons/fa6";
import { TbReport } from "react-icons/tb";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

/* ───────── MAIN PAGE ───────── */

export default function ControlHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  /* 🔐 PROTECT PAGE (REDIRECT IF NOT LOGGED IN) */
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  /* ───── USER & ROLE ───── */
  let memberRoll = "";
  const user = JSON.parse(localStorage.getItem("user"));
  memberRoll = user?.memberRole;

  // Override role for a specific email
  if (user?.email === "nihalranathunge@gmail.com") {
    memberRoll = "admin";
  }

  const normalizedRole = memberRoll?.toLowerCase().trim();

  /* ───── MENU CONFIG ───── */
  const menuItems = [
    {
      label: "Home",
      to: "/",
      icon: <FaHome />,
      roles: [
        "admin",
        "president",
      ],
    },
    {
      label: "Dashboard",
      to: "*",
      icon: <FaAtom />,
      roles: [
        "admin",
        "president",
      ],
    },
    {
      label: "Members",
      to: "/members",
      icon: <FaUsers />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "Stock",
      to: "/stock",
      icon: <FaSackDollar />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "Vendors",
      to: "/vendors",
      icon: <FaMoneyBillTransfer />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "Cashbook",
      to: "/cash-book",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "GRNs & Purchases",
      to: "/grns",
      icon: <FaReceipt />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "Other Invoices",
      to: "/other-invoice",
      icon: <FaFileAlt />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "Vendor Payments",
      to: "/vendor-payment",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "Member Payments",
      to: "/member-payment",
      icon: <FaUserClock />,
      roles: [
        "admin",
        "president",
      ],
    },

    {
      label: "Other Payments",
      to: "/other-payment",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
        "president",
      ],
    },
      
    {
      label: "Stock Adjustments",
      to: "/stock-adjustments",
      icon: <TbReport />,
      roles: [
        "admin",
        "president",
      ],
    },
  ];

  return (
    <div className="flex w-full min-h-screen bg-gray-100">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static z-40 w-64 bg-white shadow-lg transition-transform duration-300
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-4 flex justify-between items-center font-bold text-orange-600 border-b">
          CDS ERP
          <button
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>

        <nav className="flex flex-col p-2 gap-1">
          {menuItems
            .filter(
              (item) =>
                !normalizedRole ||
                item.roles
                  .map((r) => r.toLowerCase())
                  .includes(normalizedRole)
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

          {/* 🚪 LOGOUT */}
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-red-50"
          >
            <FaSignOutAlt className="text-red-500" /> Logout
          </button>
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col">
        <header className="sticky top-0 z-20 bg-white px-4 py-3 flex gap-4 shadow-sm">
          <button
            className="md:hidden text-orange-600 text-4xl"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>
          <img src="/CDSLogo.png" alt="logo" className="w-12 h-12" />
          <div className="flex flex-col">
            <h1 className="md:text-xl text-lg font-semibold">Collective Development Society</h1>
            <h2 className="md:text-sm text-xs text-gray-500">Smart Mushroom Production Management System</h2>
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ───────── COMPONENTS ───────── */
const SidebarLink = ({ to, icon, label, onClick, end }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center gap-3 px-4 py-2 rounded-lg transition
      ${
        isActive
          ? "bg-orange-200 font-semibold"
          : "hover:bg-orange-50"
      }`
    }
  >
    <span className="text-orange-500">{icon}</span>
    {label}
  </NavLink>
);