import { Link, useNavigate, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import {
  FaRegUser,
  FaHome,
  FaUsers,
  FaFileSignature,
  FaCheckCircle,
  FaHandHoldingUsd,
  FaReceipt,
  FaMoneyBillWave,
  FaExchangeAlt,
  FaWallet,
  FaChartLine,
  FaBook,
  FaAddressBook,
  FaClipboardList,
  FaChartPie,
  FaSignOutAlt,
  FaUserPlus,
  FaUserEdit,
  FaUserCheck,
  FaGavel,
} from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Header() {
  const [sideDrawerOpened, setSideDrawerOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  const user = JSON.parse(localStorage.getItem("user"));

  const roleMap = {
    member: "සාමාජික",
    manager: " කළමනාකරු",
    chairman: "සභාපති",
    secretary: "ලේකම්",
    treasurer: "භාණ්ඩාගාරික",
    executive: "විධායක සභික​",
    admin: "පද්ධති පරිපාලකයා",
  };
  const userRoleSinhala =
    roleMap[user?.memberRole?.toLowerCase()] || "භූමිකාව නොදනී";


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/", { replace: true });
  };

  useEffect(() => {
    setSideDrawerOpened(false);
  }, [location.pathname]);

  // Role-based navigation links
  const roleBasedNavLinks = {
    common: [
      { path: "/", label: "මුල් පිටුව", icon: <FaHome /> },
      { path: "/control/", label: "පාලන පුවරුව", icon: <FaChartLine /> },
      { path: "/control/members", label: "සාමාජික ලැයිස්තුව", icon: <FaUsers /> },
      { path: "/control/membership-fee", label: "සාමාජික ගාස්තු ශේෂ ලැයිස්තුව", icon: <FaClipboardList /> },
      { path: "/control/shares", label: "කොටස් මුදල් ලැයිස්තුව", icon: <FaChartPie /> },
      { path: "/control/cash-book", label: "මුදල් පොත", icon: <FaBook /> },
    ],
    admin: [
      { path: "/control/apply-loan", label: "Apply Loan", icon: <FaFileSignature /> },
      { path: "/control/approve-loan", label: "Approve Loan", icon: <FaCheckCircle /> },
      { path: "/control/grant-loan", label: "Grant Loan", icon: <FaHandHoldingUsd /> },
      { path: "/control/loan-repayment", label: "Loan Repayment", icon: <FaMoneyBillWave /> },
      { path: "/control/receipts-shares", label: "Shares Receipts", icon: <FaReceipt /> },
      { path: "/control/receipts-membership", label: "Membership Income", icon: <FaReceipt /> },
      { path: "/control/expense", label: "Expenses", icon: <FaWallet /> },
      { path: "/control/expense-others", label: "Other Expenses", icon: <FaMoneyBillWave /> },
      { path: "/control/income", label: "Income", icon: <FaChartLine /> },
      { path: "/control/fund-transfer", label: "Fund Transfer", icon: <FaExchangeAlt /> },
      { path: "/control/ledger-membership", label: "Membership Ledger", icon: <FaAddressBook /> },
      { path: "/control/ledger-loan", label: "Loan Ledger", icon: <FaClipboardList /> },
      { path: "/control/ledger-shares", label: "Shares Ledger", icon: <FaBook /> },
      { path: "/control/attendance-mark", label: "Mark Attendance", icon: <FaUserCheck /> },
      { path: "/control/transactions-report", label: "Transactions Report", icon: <FaChartLine /> },
    ],
    manager: [
      { path: "/control/loans", label: "ණය ශේෂ ලැයිස්තුව", icon: <FaGavel /> },
      { path: "/control/apply-loan", label: "ණය අයදුම්පත", icon: <FaFileSignature /> },
      { path: "/control/approve-loan", label: "ණය අනුමත කිරීම", icon: <FaCheckCircle /> },
      { path: "/control/grant-loan", label: "ණය නිකුත් කිරීම", icon: <FaHandHoldingUsd /> },
      { path: "/control/loan-repayment", label: "ණය ආපසු ලැබීම්", icon: <FaMoneyBillWave /> },
      { path: "/control/receipts-shares", label: "කොටස් මුදල් ලැබීම්", icon: <FaReceipt /> },
      { path: "/control/income", label: "වෙනත් ලැබීම්", icon: <FaChartLine /> },
      { path: "/control/expense", label: "සාමාජිකයින් සඳහා ගෙවීම්", icon: <FaWallet /> },
      { path: "/control/expense-others", label: "වෙනත් ගෙවීම්", icon: <FaMoneyBillWave /> },
      { path: "/control/fund-transfer", label: "අන්තර් මුදල් හුවමාරු", icon: <FaExchangeAlt /> },
      { path: "/control/ledger-loan", label: "ණය ලෙජරය", icon: <FaClipboardList /> },
      { path: "/control/ledger-shares", label: "කොටස් මුදල් ලෙජරය", icon: <FaBook /> },
      { path: "/control/transactions-report", label: "ගනුදෙනු වාර්තාව", icon: <FaChartLine /> },
    ],
    treasurer: [
      { path: "/control/receipts-membership", label: "සාමාජික ගාස්තු ලැබීම්", icon: <FaReceipt /> },
      { path: "/control/income", label: "වෙනත් ලැබීම්", icon: <FaChartLine /> },
      { path: "/control/expense", label: "සාමාජික පරිත්‍යාග ගෙවීම්", icon: <FaWallet /> },
      { path: "/control/expense-others", label: "වෙනත් ගෙවීම්", icon: <FaMoneyBillWave /> },
      { path: "/control/fund-transfer", label: "අන්තර් මුදල් හුවමාරු", icon: <FaExchangeAlt /> },
      { path: "/control/ledger-membership", label: "සාමාජික ගාස්තු ලෙජරය", icon: <FaAddressBook /> },
      { path: "/control/ledger-shares", label: "කොටස් මුදල් ලෙජරය", icon: <FaBook /> },
      { path: "/control/transactions-report", label: "ගනුදෙනු වාර්තාව", icon: <FaChartLine /> },
    ],
    secretary: [
      { path: "/control/attendance-mark", label: "පැමිණීම සලකුණු කිරීම", icon: <FaUserCheck /> },
      { path: "/control/approve-loan", label: "ණය අනුමත කිරීම", icon: <FaCheckCircle /> },
      { path: "/control/add-customer-secretary", label: "නව සාමාජිකයින් ඇතුළත් කිරීම", icon: <FaUserPlus /> },
      { path: "/control/edit-customer-secretary", label: "සාමාජික තොරතුරු සංශෝධනය කිරීම", icon: <FaUserEdit /> },
    ],
    chairman: [
      { path: "/control/approve-loan", label: "ණය අනුමත කිරීම", icon: <FaCheckCircle /> },
    ],
    executive: [
      { path: "/control/approve-loan", label: "ණය අනුමත කිරීම", icon: <FaCheckCircle /> },
    ],
  };

  const allowedRoles = ["admin", "executive", "manager", "chairman", "secretary", "treasurer"];
  const showLinks = allowedRoles.includes(user?.memberRole?.toLowerCase());

  const userRole = user?.memberRole?.toLowerCase() || "";
  const navLinks = [...(roleBasedNavLinks.common || []), ...(roleBasedNavLinks[userRole] || [])];

  return (
    <>
      {/* Header */}
      <header className="w-full h-[64px] shadow-lg flex justify-between items-center px-4 bg-white z-50">
        <div className="w-full flex justify-between items-center">
          <GiHamburgerMenu
            className="text-4xl text-orange-600 cursor-pointer"
            onClick={() => setSideDrawerOpened(true)}
            aria-label="Open navigation menu"
          />

          <h1 className="text-sm font-bold text-green-700 leading-tight">
            තෙවන ශක්ති සංවර්ධන පදනම
          </h1>

          <img
            src="/LogoTSDF.png"
            alt="Logo"
            className="w-[70px] h-[70px] object-cover cursor-pointer"
            onClick={() => navigate("/")}
          />
        </div>
      </header>

      {/* Mobile Side Drawer */}
      <div
        className={`fixed inset-0 z-[60] bg-black/60 transition-opacity duration-300 ${
          sideDrawerOpened ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSideDrawerOpened(false)}
      >
        <aside
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={`fixed top-0 left-0 w-[280px] h-full bg-orange-600 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between z-[70] ${
            sideDrawerOpened ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drawer Header */}
          <div className="h-[74px] w-full flex justify-between items-center px-4 border-b border-white">
            <GiHamburgerMenu
              className="text-4xl text-white cursor-pointer"
              onClick={() => setSideDrawerOpened(false)}
              aria-label="Close navigation menu"
            />
            <div className="flex flex-col">
              <h1 className="text-right text-white font-bold text-sm">{user?.nameSinhala || "Guest"}</h1>
              <h1 className="text-right text-yellow-300 font-semibold text-sm">
                {userRoleSinhala}
              </h1>
            </div>
          </div>

          {/* Drawer Navigation */}
          {showLinks && (
            <nav className="flex flex-col text-white p-4 gap-4 flex-1 overflow-y-auto">
              {navLinks.map(({ path, label, icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setSideDrawerOpened(false)}
                  className={`flex items-center gap-2 text-base font-medium hover:text-gray-200 transition ${
                    location.pathname === path
                      ? "text-yellow-300 underline"
                      : "text-gray-100"
                  }`}
                >
                  {icon} {label}
                </Link>
              ))}
            </nav>
          )}

          {/* Drawer Footer */}
          <div className="p-4 border-t border-white">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-white text-sm font-medium w-full"
              >
                <FaSignOutAlt /> පිටවීම
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setSideDrawerOpened(false)}
                className="flex items-center gap-3 text-red-600 text-sm font-medium w-full"
              >
                <FaRegUser /> පිවිසෙන්න
              </Link>
            )}
          </div>
        </aside>
      </div>

    </>
  );
}
