import { Link, useNavigate, useLocation } from "react-router-dom";
import { GiHamburgerMenu } from "react-icons/gi";
import { useEffect, useState } from "react";
import {
  FaRegUser,
  FaHome,
  FaImage,
  FaInfoCircle,
  FaPhone,
  FaMoneyCheck,
  FaGavel,
  FaSignOutAlt,
} from "react-icons/fa";

export default function Header() {
  const [sideDrawerOpened, setSideDrawerOpened] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const token = localStorage.getItem("token");
  const isLoggedIn = Boolean(token);
  const user = JSON.parse(localStorage.getItem("user") || "null");

  // const isCommittee = ["admin", "executive", "manager", "chairman", "secretary", "treasurer"].includes(
  //   user?.memberRole
  // );
  const isCommittee = user && user?.memberRole !== "member" && user?.memberRole !== "guest";

  const isAdmin = user?.memberRole === "admin";
  const isPresident = user?.memberRole === "president";
  const isSecretary = user?.memberRole === "secretary";
  const isTreasurer = user?.memberRole === "treasurer";
  const isVicePresident = user?.memberRole === "vice-president";
  const isAssistantSecretary = user?.memberRole === "assistant-secretary";
  const isAssistantTreasurer = user?.memberRole === "assistant-treasurer";
  const isActivityCoordinator = user?.memberRole === "activity-coordinator";
  const isCommitteeMember = user?.memberRole === "committee-member";
  const isInternalAuditor = user?.memberRole === "internal-auditor";
  const isMember = user?.memberRole === "member";


  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setSideDrawerOpened(false);
    navigate("/", { replace: true });
  };

  // Auto-close drawer on route change
  useEffect(() => {
    setSideDrawerOpened(false);
  }, [location.pathname]);

  const NavItem = ({ to, icon: Icon, label }) => {
    const isActive = location.pathname.startsWith(to);
    return (
      <Link
        to={to}
        onClick={() => setSideDrawerOpened(false)}
        className={`flex items-center gap-3 text-xl py-2 px-2 rounded-md transition ${
          isActive ? "bg-white/20 font-bold" : "hover:bg-white/10"
        }`}
      >
        <Icon /> {label}
      </Link>
    );
  };

  // Base nav links
  const navLinks = [
    { to: "/", label: "Home", icon: FaHome },
    { to: "/gallery", label: "Gallery", icon: FaImage },
    { to: "/about", label: "About Us", icon: FaInfoCircle },
    { to: "/contact", label: "Contact Us", icon: FaPhone },
  ];

  // Authenticated links

    const authLinks = [
        { to: "/member-profile", label: "Member Profile", icon: FaRegUser },
        // { to: "/ledger-membership", label: "Membership Fee", icon: FaMoneyCheck },
        // { to: "/ledger-shares", label: "Share Details", icon: FaMoneyCheck },
        // { to: "/ledger-loan", label: "Loan Details", icon: FaMoneyCheck },
        // { to: "/apply-loan", label: "Apply Loan", icon: FaMoneyCheck },
        // { to: "/constitution", label: "Constitution", icon: FaGavel },
      ];    


  return (
    <header className="w-full h-[64px] shadow-lg flex justify-end items-center px-4 bg-white z-50">
      {/* Hamburger (Mobile) */}
      <GiHamburgerMenu
        className="text-3xl text-blue-600 md:hidden cursor-pointer"
        onClick={() => setSideDrawerOpened(true)}
      />

      {/* <div className="md:hidden flex items-center">
        <h1 className="text-1xl text-green-700 font-bold">
          තෙවන ශක්ති සංවර්ධන පදනම
        </h1>
      </div> */}

      {/* Logo */}
      {/* <img
        src="/NewLogoPng.png"
        alt="Logo"
        className="hidden md:flex w-[50px] h-[50px] object-cover cursor-pointer"
        onClick={() => navigate("/")}
      /> */}

      {/* Desktop Nav */}
      <div>
        <nav className="hidden md:flex items-end gap-2 sm:gap-6 text-gray-800 text-xs sm:text-sm sm:text-xl font-semibold">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to} className="hover:border-b-2 border-yellow-400 hover:text-yellow-600">
              {label}
            </Link>
          ))}

          {isLoggedIn ? (
            <>
              {authLinks.map(({ to, label }) => (
                <Link key={to} to={to} className="hover:border-b-2 border-yellow-400 hover:text-yellow-600">
                  {label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="hover:border-b-2 border-red-400 hover:text-red-600 text-red-600 font-bold"
              >
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="hover:border-b-2 border-blue-400 text-blue-600">
              Login
            </Link>
          )}

          {isCommittee && (
            <Link to="/control" className="hover:border-b-2 border-orange-400 text-orange-400">
              Control Panel
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="hover:border-b-2 border-orange-400 text-orange-600">
              Admin Panel
            </Link>
          )}
        </nav>
      </div>

      {/* Mobile Side Drawer */}
      <div
        className={`fixed inset-0 bg-black/50 md:hidden transition-opacity duration-300 ${
          sideDrawerOpened ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSideDrawerOpened(false)}
      >
        <aside
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className={`w-[280px] bg-blue-700 h-full shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col justify-between ${
            sideDrawerOpened ? "translate-x-0" : "-translate-x-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* User Info */}
          <div className="p-4 flex justify-between items-center gap-3 border-b border-white/20">
              <GiHamburgerMenu
                  className="text-4xl text-white cursor-pointer"
                  onClick={() => setSideDrawerOpened(false)}
              />
              <div className="flex flex-col items-end">
                <p className="text-white font-semibold truncate">
                  {user
                    ? user.nameSinhala || user.nameEnglish || "Member"
                    : "Guest"}
                </p>
                <p className="text-sm text-white">{user?.userId}</p>
              </div>
          </div>

          {/* Nav Items */}
          <div className="flex flex-col text-white p-4 gap-2 flex-1 overflow-y-auto">
            {navLinks.map(({ to, label, icon }) => (
              <NavItem key={to} to={to} icon={icon} label={label} />
            ))}

            {isLoggedIn &&
              authLinks.map(({ to, label, icon }) => (
                <NavItem key={to} to={to} icon={icon} label={label} />
              ))}

            {/* Role-based Links */}
            <div className="text-yellow-400 font-semibold">
              {isCommittee && (
                <NavItem to="/control" icon={FaGavel} label="Control Panel" />
              )}
              {isAdmin && (
                <NavItem to="/admin" icon={FaGavel} label="Admin Panel" />
              )}
            </div>
          </div>

          {/* Footer (Logout/Login) */}
          <div className="p-4 border-t border-white/20">
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 text-white text-lg font-semibold w-full"
              >
                <FaSignOutAlt /> Logout
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setSideDrawerOpened(false)}
                className="flex items-center gap-3 text-white text-lg"
              >
                <FaRegUser /> Login
              </Link>
            )}
          </div>
        </aside>
      </div>
    </header>
  );
}
