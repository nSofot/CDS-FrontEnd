import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUsersCog, FaUserClock, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { m } from "framer-motion";
import { t } from "i18next";

/* ───────── DASHBOARD PAGE ───────── */

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [activeMembers, setActiveMembers] = useState([]);
  const [todayProductionBags, setTodayProductionBags] = useState([]);
  const [todaySterilizedBags, setTodaySterilizedBags] = useState([]);
  const [todayInoculatedBags, setTodayInoculatedBags] = useState([]);
  const [todayHarvestedKg, setTodayHarvestedKg] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  const [todaySaleAmount, setTodaySaleAmount] = useState([]);
  const [todayExpenses, setTodayExpenses] = useState([]);
  const [contaminationLoss, setContaminationLoss] = useState([]);

  const [cashInHand, setCashInHand] = useState(0);
  const [savingAccounts, setSavingAccounts] = useState(0);
  const [currentAccounts, setCurrentAccounts] = useState(0);

  const [openSections, setOpenSections] = useState({
    exco: true,
    sales: true,
    finance: true,
  });

  /* ───── HELPERS ───── */
  const formatCurrency = (num) =>
    new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(num || 0);

  const toggleSection = (key) =>
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  /* ───── DATA FETCH ───── */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        const membersRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/member`
        );
        const list = membersRes.data;

        // setActiveMembers(list.filter((m) => m.status === "active"));
        setActiveMembers(membersRes.data.length);

        const financeRes = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`
        );
        const accounts = financeRes.data;

        setCashInHand(
          accounts.find((a) => a.accountId === "325-001")?.accountBalance || 0
        );
        setSavingAccounts(
          accounts.find((a) => a.accountId === "325-002")?.accountBalance || 0
        );
        setCurrentAccounts(
          accounts.find((a) => a.accountId === "325-003")?.accountBalance || 0
        );
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="w-full max-w-none px-1 lg:px-6">

      {/* DASHBOARD GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* MEMBERS */}
        <DashboardCard
          title="Production Summary"
          icon={<FaUsersCog />}
          collapsible
          open={openSections.exco}
          onToggle={() => toggleSection("exco")}
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Active Members" value={activeMembers} color="text-blue-600" />
            <Stat label="Today Produced Bags" value={todayProductionBags.length} color="text-blue-600" />
            <Stat label="Today Sterilized Bags" value={todaySterilizedBags.length} color="text-green-600" />
            <Stat label="Today Inoculated Bags" value={todayInoculatedBags.length} color="text-purple-600" />
            <Stat label="Today Harvested (kg)" value={todayHarvestedKg.length} color="text-orange-600" />
            <Stat label="Pending Orders" value={pendingOrders.length} color="text-red-600" />
          </div>
        </DashboardCard>

        {/* SALES & EXPENSES */}
        <DashboardCard
          title="Sales & Expenses"
          icon={<FaUserClock />}
          collapsible
          open={openSections.sales}
          onToggle={() => toggleSection("sales")}
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Today Sale Amount" value={formatCurrency(todaySaleAmount)} color="text-blue-600" />
            <Stat label="Today Expenses" value={formatCurrency(todayExpenses)} color="text-green-600" />
            <Stat label="Contamination Loss" value={formatCurrency(contaminationLoss)} color="text-purple-600" />
            <Stat
                label="GROSS PROFIT"
                value={formatCurrency(todaySaleAmount - (todayExpenses + contaminationLoss))}
                color="text-red-600"
                isTotal
            />

          </div>
        </DashboardCard>

        {/* FINANCE */}
        <DashboardCard
          title="Financial Summary"
          icon={<FaSackDollar />}
          collapsible
          open={openSections.finance}
          onToggle={() => toggleSection("finance")}
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Cash In Hand" value={formatCurrency(cashInHand)} color="text-blue-600" />
            <Stat label="Savings Account" value={formatCurrency(savingAccounts)} color="text-green-600" />
            <Stat label="Current Account" value={formatCurrency(currentAccounts)} color="text-purple-600" />
            <Stat
                label="TOTAL"
                value={formatCurrency(cashInHand + savingAccounts + currentAccounts)}
                color="text-red-600"
                isTotal
            />

          </div>
        </DashboardCard>

      </div>
    </div>
  );
}

/* ───────── COMPONENTS ───────── */

const Stat = ({ label, value, color, isTotal = false }) => (
  <div className="p-4 bg-gray-50 rounded-lg shadow-sm text-center">
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    <p className={`text-xs text-gray-600 ${isTotal ? "font-bold" : ""}`}>
      {label}
    </p>
  </div>
);


const DashboardCard = ({
  title,
  icon,
  children,
  collapsible,
  open,
  onToggle,
  className = "",
}) => (
  <div className={`bg-white rounded-2xl shadow-md overflow-hidden ${className}`}>
    <div
      className={`flex justify-between items-center px-6 py-4 bg-orange-50 ${
        collapsible ? "cursor-pointer" : ""
      }`}
      onClick={collapsible ? onToggle : undefined}
    >
      <h2 className="flex gap-2 font-semibold text-lg">
        {icon} {title}
      </h2>
      {collapsible &&
        (open ? <FaChevronUp /> : <FaChevronDown />)}
    </div>

    <div className={`p-6 ${collapsible && !open ? "hidden" : ""}`}>
      {children}
    </div>
  </div>
);

const Empty = ({ text }) => (
  <p className="text-sm text-gray-400 text-center py-8">{text}</p>
);
