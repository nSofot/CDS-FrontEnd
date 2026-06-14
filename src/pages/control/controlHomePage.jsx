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
      roles: [
        "admin",
      ],
    },

    {
      label: "Dashboard",
      to: "/control/",
      icon: <FaAtom />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Bag Production",
      to: "/control/mushroom-process",
      icon: <FaUsersCog />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Batch Management",
      to: "/control/batch-list",
      icon: <FaFileAlt />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Order Management",
      to: "/control/bag-orders-management",
      icon: <FaFileAlt />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Members",
      to: "/control/members",
      icon: <FaUsers />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Vendors",
      to: "/control/vendors",
      icon: <FaMoneyBillTransfer />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Products",
      to: "/control/stock",
      icon: <FaSackDollar />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Cash Book",
      to: "/control/cash-book",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Bag Sale Invoices",
      to: "/control/bagSale-invoice",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Sales Invoices",
      to: "/control/sales-invoice",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Purchase Invoices",
      to: "/control/grns",
      icon: <FaReceipt />,
      roles: [
        "admin",
      ],
    },
        
    {
      label: "Other Invoices",
      to: "/control/other-invoice",
      icon: <FaFileAlt />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Member Receipts",
      to: "/control/member-receipt",
      icon: <FaUserClock />,
      roles: [
        "admin",
      ],
    },    
        
    {
      label: "Other Receipts",
      to: "/control/other-receipt",
      icon: <FaUserClock />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Supplier Payments",
      to: "/control/vendor-payment",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
      ],
    },

    {
      label: "Other Payments",
      to: "/control/other-payment",
      icon: <FaMoneyCheckAlt />,
      roles: [
        "admin",
      ],
    },
      
    // {
    //   label: "Stock Adjustments",
    //   to: "/control/stock-adjustments",
    //   icon: <TbReport />,
    //   roles: [
    //     "admin",
    //   ],
    // },
    
    {
      label: "Ledger Accounts",
      to: "/control/ledger-accounts",
      icon: <FaUsersCog />,
      roles: [
        "admin",
      ]
    }
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
        className={`fixed md:static z-40 w-64 h-screen bg-white shadow-lg flex flex-col
        transition-transform duration-300
        ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* SIDEBAR HEADER */}
        <div className="p-4 flex justify-between items-center font-bold text-orange-600 border-b shrink-0">
          <span className="text-lg">CDS ERP</span>

          <button
            className="md:hidden text-gray-600 hover:text-red-500"
            onClick={() => setSidebarOpen(false)}
          >
            <FaTimes />
          </button>
        </div>


        {/* SCROLLABLE MENU AREA */}
        <nav
          className="
            flex-1
            overflow-y-auto
            px-2
            py-3
            space-y-1

            scrollbar-thin
            scrollbar-thumb-orange-300
            scrollbar-track-gray-100
          "
        >
          {filteredMenuItems.map((item)=>(
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
        </nav>


        {/* FIXED LOGOUT BUTTON */}
        <div className="border-t p-3 shrink-0">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="
              w-full
              flex
              items-center
              gap-3
              px-4
              py-2
              rounded-lg
              text-red-600
              hover:bg-red-50
              transition
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