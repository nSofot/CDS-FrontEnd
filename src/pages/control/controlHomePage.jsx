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

  if (user?.email === "nihalranathunge@gmail.com") {
    memberRoll = "admin";
  }

  const normalizedRole = memberRoll?.toLowerCase().trim();

  const menuItems = [
    { label: "Home", to: "/", icon: <FaHome />, roles: ["admin"] },
    { label: "Dashboard", to: "/control/", icon: <FaAtom />, roles: ["admin"] },
    { label: "Bag Production", to: "/control/mushroom-process", icon: <FaSackDollar />, roles: ["admin"] },
    { label: "Batch Management", to: "/control/batch-list", icon: <FaFileAlt />, roles: ["admin"] },
    { label: "Order Management", to: "/control/bag-orders-management", icon: <FaMoneyBillTransfer />, roles: ["admin"] },
    { label: "Members", to: "/control/members", icon: <FaUsers />, roles: ["admin"] },
    { label: "Vendors", to: "/control/vendors", icon: <FaUsersCog />, roles: ["admin"] },
    { label: "Products", to: "/control/stock", icon: <FaSackDollar />, roles: ["admin"] },
    { label: "Cash Book", to: "/control/cash-book", icon: <FaMoneyCheckAlt />, roles: ["admin"] },
    { label: "Bag Sale Invoices", to: "/control/bagSale-invoice", icon: <FaReceipt />, roles: ["admin"] },
    { label: "Material Sales Invoices", to: "/control/sales-invoice", icon: <FaReceipt />, roles: ["admin"] },
    { label: "Purchase Invoices", to: "/control/grns", icon: <FaFileAlt />, roles: ["admin"] },
    { label: "Other Invoices", to: "/control/other-invoice", icon: <FaFileAlt />, roles: ["admin"] },
    { label: "Member Receipts", to: "/control/member-receipt", icon: <FaUserClock />, roles: ["admin"] },
    { label: "Other Receipts", to: "/control/other-receipt", icon: <FaUserClock />, roles: ["admin"] },
    { label: "Supplier Payments", to: "/control/vendor-payment", icon: <FaMoneyBillTransfer />, roles: ["admin"] },
    { label: "Other Payments", to: "/control/other-payment", icon: <FaMoneyBillTransfer />, roles: ["admin"] },
    { label: "Ledger Accounts", to: "/control/ledger-accounts", icon: <FaUsersCog />, roles: ["admin"] },
    { label: "Reports", to: "/control/reports", icon: <TbReport />, roles: ["admin"] },
    { label: "Settings", to: "/control/settings", icon: <FaCog />, roles: ["admin"] },
  ];

  const filteredMenuItems = useMemo(() => {
    return menuItems.filter((item) => !normalizedRole || item.roles.includes(normalizedRole));
  }, [normalizedRole]);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#f4f7f4] text-[#172017]">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#101810]/55 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={
          "fixed inset-y-0 left-0 z-40 flex h-screen w-[18.5rem] flex-col border-r border-[#d8e3d9] bg-[#142116] text-white shadow-2xl shadow-black/15 transition-transform duration-300 md:static md:translate-x-0 " +
          (sidebarOpen ? "translate-x-0" : "-translate-x-full")
        }
      >
        <div className="shrink-0 border-b border-white/10 p-4">
          <div className="mb-5 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src="/CDSLogo.png" alt="CDS logo" loading="lazy" className="h-11 w-11 rounded-lg bg-white p-1" />
              <div>
                <h1 className="text-lg font-extrabold leading-tight">CDS ERP</h1>
                <p className="text-xs font-medium text-[#b9cbbb]">Version 1.0.0</p>
              </div>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 md:hidden"
              aria-label="Close menu"
            >
              <FaTimes />
            </button>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.06] p-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#e6f4e9] text-sm font-extrabold text-[#276b3b]">
                {user?.firstName?.charAt(0)}{user?.lastName?.charAt(0)}
              </div>
              <div className="min-w-0">
                <p className="text-[0.68rem] font-bold uppercase tracking-[0.08em] text-[#9db39f]">Signed in</p>
                <p className="truncate text-sm font-bold">{user?.firstName} {user?.lastName}</p>
                <p className="truncate text-xs text-[#b9cbbb]">{user?.memberRole || "User"}</p>
              </div>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="mb-2 px-3 text-[0.68rem] font-bold uppercase tracking-[0.12em] text-[#8fa292]">Workspace</div>
          <div className="space-y-1">
            {filteredMenuItems.map((item) => (
              <SidebarLink
                key={item.to}
                to={item.to}
                icon={item.icon}
                label={item.label}
                onClick={() => setSidebarOpen(false)}
              />
            ))}
          </div>
        </nav>

        <div className="shrink-0 border-t border-white/10 p-3">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/login");
            }}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-bold text-[#ffd5d1] transition hover:bg-[#b42318]/20"
          >
            <FaSignOutAlt />
            Logout
          </button>
        </div>
      </aside>

      <main className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
        <header className="sticky top-0 z-20 border-b border-[#dfe7df] bg-white/90 px-4 py-3 shadow-sm backdrop-blur md:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <button
                className="rounded-lg border border-[#d8e3d9] p-2.5 text-[#2f7d46] transition hover:bg-[#eef8f0] md:hidden"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <FaBars />
              </button>
              <div className="min-w-0">
                <p className="erp-eyebrow hidden sm:block">Collective Development Society</p>
                <h1 className="truncate text-base font-extrabold text-[#172017] md:text-xl">Smart Mushroom Production Management System</h1>
              </div>
            </div>

            <div className="hidden items-center gap-2 rounded-lg border border-[#dfe7df] bg-[#f8fbf8] px-3 py-2 text-xs font-bold text-[#5f7a64] sm:flex">
              <span className="h-2 w-2 rounded-full bg-[#2f7d46]" />
              ERP Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

const SidebarLink = memo(({ to, icon, label, onClick, end }) => (
  <NavLink
    to={to}
    end={end}
    onClick={onClick}
    className={({ isActive }) =>
      "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition " +
      (isActive
        ? "bg-[#e6f4e9] text-[#17361f] shadow-sm"
        : "text-[#dce8dd] hover:bg-white/10 hover:text-white")
    }
  >
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[#9cd2a8] transition group-hover:bg-white/15 group-hover:text-white">
      {icon}
    </span>
    <span className="truncate">{label}</span>
  </NavLink>
));
