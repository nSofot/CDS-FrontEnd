import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUsersCog, FaUserClock, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { m } from "framer-motion";
import { t } from "i18next";

/* ───────── DASHBOARD PAGE ───────── */

export default function MemberDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [pendingOrders, setPendingOrders] = useState(0);
  const [currentIncubatingBags, setCurrentIncubatingBags] = useState(0);
  const [currentFruitingBags, setCurrentFruitingBags] = useState(0);
  const [todayHarvestedPacks, setTodayHarvestedPacks] = useState(0);
  const [todaySoldPacks, setTodaySoldPacks] = useState(0);
  const [todaySaleAmount, setTodaySaleAmount] = useState(0);

  const [openSections, setOpenSections] = useState({
    exco: true,
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

        // const membersRes = await axios.get(
        //   `${import.meta.env.VITE_BACKEND_URL}/api/member`
        // );
        // const list = membersRes.data;
        // // setActiveMembers(list.filter((m) => m.status === "active"));
        // setActiveMembers(membersRes.data.length);


        // const financeRes = await axios.get(
        //   `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`
        // );
        // const accounts = financeRes.data;

        // setCashInHand(
        //   accounts.find((a) => a.accountId === "110-0001")?.accountBalance || 0
        // );
        // setSavingAccounts(
        //   accounts.find((a) => a.accountId === "115-0001")?.accountBalance || 0
        // );
        // setCurrentAccounts(
        //   accounts.find((a) => a.accountId === "115-0002")?.accountBalance || 0
        // );


        // const batchRes = await axios.get(
        //   `${import.meta.env.VITE_BACKEND_URL}/api/batch`
        // );
        // const batches = batchRes.data;

        // setTodayProductionBags(
        //   batches.filter((b) =>b.status === "Substrate" && new Date(b.batchDate).toDateString() === new Date().toDateString()).
        //   reduce((sum, b) => sum + Number(b.numberOfBags || 0),0)
        // );
        // setTodaySterilizedBags(
        //   batches.filter((b) => b.status === "Sterilized" && new Date(b.sterilizationDate).toDateString() === new Date().toDateString()).
        //   reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0)
        // );
        // setTodayInoculatedBags(
        //   batches.filter((b) => b.status === "Inoculated" && new Date(b.inoculationDate).toDateString() === new Date().toDateString()).
        //   reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0)
        // );
        // setCurrentIcubatingBags(
        //   batches.filter((b) => b.status === "Incubating").
        //   reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0)
        // );
        // setTodaySoldBags(
        //   batches.filter((b) => b.status === "Sold" && new Date(b.soldDate).toDateString() === new Date().toDateString()).
        //   reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0)
        // );

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
          title="සාමාජික නිෂ්පාදන දළ විශ්ලේෂණය"
          icon={<FaUsersCog />}
          collapsible
          open={openSections.exco}
          onToggle={() => toggleSection("exco")}
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="පොරොත්තු ඇණවු බෑග් ප්‍රමාණය" value={pendingOrders} color="text-blue-600" />
            <Stat label="වත්මන් ඉන්කියුබේෂන් බෑග් ප්‍රමාණය" value={currentIncubatingBags} color="text-blue-600"/>
            <Stat label="වත්මන් අස්වනු නෙළන බෑග් ප්‍රමාණය" value={currentFruitingBags} color="text-green-600" />
            <Stat label="අද අස්වනු නෙළන ලද පැකට් ප්‍රමාණය" value={todayHarvestedPacks} color="text-purple-600" />
            <Stat label="අද විකුණන ලද පැකට් ප්‍රමාණය" value={todaySoldPacks} color="text-orange-600" />
            <Stat label="අද විකුණුම් මුදල" value={todaySaleAmount} color="text-red-600" />
          </div>
        </DashboardCard>

        {/* SALES & EXPENSES */}
        {/* <DashboardCard
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
        </DashboardCard> */}

        {/* FINANCE */}
        {/* <DashboardCard
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
        </DashboardCard> */}

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
