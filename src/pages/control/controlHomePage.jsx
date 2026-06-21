import { useState, useEffect, useMemo, memo } from "react";
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
  FaCog,
} from "react-icons/fa";

import { FaSackDollar, FaMoneyBillTransfer } from "react-icons/fa6";
import { TbReport } from "react-icons/tb";
import { NavLink, Outlet, useNavigate } from "react-router-dom";

/* ───────── MAIN PAGE ───────── */

export default function ControlHomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const user = useMemo(() => {
    return JSON.parse(localStorage.getItem("user")) || null;
  }, []);

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [navigate, user]);

  let memberRoll = user?.memberRole || "";


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
      roles: ["admin"],
    },

    {
      label: "Dashboard",
      to: "/control/",
      icon: <FaAtom />, // system overview / dashboard
      roles: ["admin"],
    },

    {
      label: "Bag Production",
      to: "/control/mushroom-process",
      icon: <FaSackDollar />, // production / inventory output
      roles: ["admin"],
    },

    {
      label: "Batch Management",
      to: "/control/batch-list",
      icon: <FaFileAlt />, // documents / batches
      roles: ["admin"],
    },

    {
      label: "Order Management",
      to: "/control/bag-orders-management",
      icon: <FaMoneyBillTransfer />, // transactions/orders
      roles: ["admin"],
    },

    {
      label: "Members",
      to: "/control/members",
      icon: <FaUsers />, // people
      roles: ["admin"],
    },

    {
      label: "Vendors",
      to: "/control/vendors",
      icon: <FaUsersCog />, // business partners / admin users
      roles: ["admin"],
    },

    {
      label: "Products",
      to: "/control/stock",
      icon: <FaSackDollar />, // inventory / stock
      roles: ["admin"],
    },

    {
      label: "Cash Book",
      to: "/control/cash-book",
      icon: <FaMoneyCheckAlt />, // cash management
      roles: ["admin"],
    },

    {
      label: "Bag Sale Invoices",
      to: "/control/bagSale-invoice",
      icon: <FaReceipt />, // invoices
      roles: ["admin"],
    },

    {
      label: "Material Sales Invoices",
      to: "/control/sales-invoice",
      icon: <FaReceipt />,
      roles: ["admin"],
    },

    {
      label: "Purchase Invoices",
      to: "/control/grns",
      icon: <FaFileAlt />, // purchase docs
      roles: ["admin"],
    },

    {
      label: "Other Invoices",
      to: "/control/other-invoice",
      icon: <FaFileAlt />,
      roles: ["admin"],
    },

    {
      label: "Member Receipts",
      to: "/control/member-receipt",
      icon: <FaUserClock />, // payments tracking
      roles: ["admin"],
    },

    {
      label: "Other Receipts",
      to: "/control/other-receipt",
      icon: <FaUserClock />,
      roles: ["admin"],
    },

    {
      label: "Supplier Payments",
      to: "/control/vendor-payment",
      icon: <FaMoneyBillTransfer />, // outgoing payments
      roles: ["admin"],
    },

    {
      label: "Other Payments",
      to: "/control/other-payment",
      icon: <FaMoneyBillTransfer />,
      roles: ["admin"],
    },

    {
      label: "Ledger Accounts",
      to: "/control/ledger-accounts",
      icon: <FaUsersCog />, // accounting control
      roles: ["admin"],
    },

    {
      label: "Reports",
      to: "/control/reports",
      icon: <TbReport />, // reports
      roles: ["admin"],
    },

    {
      label: "Settings",
      to: "/control/settings",
      icon: <FaCog />, // settings
      roles: ["admin"],
    },
  ];

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter(item =>
      !normalizedRole ||
      item.roles.includes(normalizedRole)
    );
  }, [normalizedRole]);


  return (
    <div className="flex w-full h-screen overflow-hidden bg-gray-100">
      {/* MOBILE OVERLAY */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 bg-opacity-40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-40
          w-70 bg-white border-r shadow-sm
          flex flex-col h-screen
          transition-transform duration-300
          ${
            sidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* HEADER */}
        <div className="border-b shrink-0 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between p-4">
            <div>
              <h1 className="text-xl font-bold tracking-wide">
                CDS ERP
              </h1>
              <p className="text-xs text-orange-100">
                Version 1.0.0
              </p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden hover:bg-white/20 p-2 rounded-lg"
            >
              <FaTimes />
            </button>
          </div>

          {/* USER CARD */}
          <div className="px-4 pb-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-lg">
                {user?.firstName?.charAt(0)}
                {user?.lastName?.charAt(0)}
              </div>

              <div className="overflow-hidden">
                <p className="text-xs text-orange-100">
                  Welcome Back
                </p>

                <p className="font-medium truncate">
                  {user?.firstName} {user?.lastName}
                </p>

                <p className="text-xs text-orange-100 truncate">
                  {user?.memberRole || "User"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* MENU */}
        <nav
          className="
            flex-1
            overflow-y-auto
            px-3
            py-4
            space-y-1
            scrollbar-thin
            scrollbar-thumb-orange-300
            scrollbar-track-transparent
          "
        >
          {filteredMenuItems.map((item) => (
            <SidebarLink
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={() => setSidebarOpen(false)}
            />
          ))}
        </nav>

        {/* FOOTER */}
        <div className="border-t p-3 shrink-0 bg-gray-50">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="
              w-full
              flex
              items-left
              justify-left
              gap-3
              px-4
              py-3
              rounded-xl
              text-red-600
              font-medium
              hover:bg-red-50
              transition-all
            "
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="sticky top-0 z-20 bg-white px-4 py-3 flex gap-4 shadow-sm">
          <button
            className="md:hidden text-orange-600 text-4xl"
            onClick={() => setSidebarOpen(true)}
          >
            <FaBars />
          </button>
          <img
            src="/CDSLogo.png"
            alt="logo"
            loading="lazy"
            className="w-12 h-12"
          />
          <div className="flex flex-col">
            <h1 className="md:text-xl text-lg font-semibold">Collective Development Society</h1>
            <h2 className="md:text-sm text-xs text-gray-500">Smart Mushroom Production Management System</h2>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

/* ───────── COMPONENTS ───────── */
const SidebarLink = memo(
({ to, icon, label, onClick, end }) => (
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
));