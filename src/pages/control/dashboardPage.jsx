import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUsersCog, FaUserClock, FaChevronUp, FaChevronDown, FaReceipt } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [totalPendingOrders, setTotalPendingOrders] = useState(0);
  const [totalCompletedOrders, setTotalCompletedOrders] = useState(0);
  const [totalSubstrateBagsOrders, setTotalSubstrateBagsOrders] = useState(0);
  const [totalSterilizedBagsOrders, setTotalSterilizedBagsOrders] = useState(0);
  const [totalInoculatedBagsOrders, setTotalInoculatedBagsOrders] = useState(0);
  const [totalIncubatingBagsOrders, setTotalIncubatingBagsOrders] = useState(0);
  const [activeMembers, setActiveMembers] = useState([]);
  const [todayProductionBags, setTodayProductionBags] = useState(0);
  const [todaySterilizedBags, setTodaySterilizedBags] = useState(0);
  const [todayInoculatedBags, setTodayInoculatedBags] = useState(0);
  const [currentIcubatingBags, setCurrentIcubatingBags] = useState(0);
  const [todaySoldBags, setTodaySoldBags] = useState(0);
  const [todaySaleAmount, setTodaySaleAmount] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [contaminationLoss, setContaminationLoss] = useState(0);
  const [cashInHand, setCashInHand] = useState(0);
  const [savingAccounts, setSavingAccounts] = useState(0);
  const [currentAccounts, setCurrentAccounts] = useState(0);
  const [openSections, setOpenSections] = useState({ orders: true, exco: true, sales: true, finance: true });

  const formatNumber = (num) => new Intl.NumberFormat().format(num || 0);
  const formatCurrency = (num) => new Intl.NumberFormat("en-US", { minimumFractionDigits: 2 }).format(num || 0);
  const toggleSection = (key) => setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [ordersRes, membersRes, financeRes, batchRes] = await Promise.all([
          axios.get(import.meta.env.VITE_BACKEND_URL + "/api/bag-order"),
          axios.get(import.meta.env.VITE_BACKEND_URL + "/api/member"),
          axios.get(import.meta.env.VITE_BACKEND_URL + "/api/ledger-account"),
          axios.get(import.meta.env.VITE_BACKEND_URL + "/api/batch"),
        ]);

        const orders = ordersRes.data;
        setTotalPendingOrders(orders.filter((o) => o.orderStatus === "Pending").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setTotalCompletedOrders(orders.filter((o) => o.orderStatus === "Completed").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setTotalSubstrateBagsOrders(orders.filter((o) => (o.orderStatus === "Approved" || o.orderStatus === "Pending") && o.orderBagStatus === "Substrate").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setTotalSterilizedBagsOrders(orders.filter((o) => (o.orderStatus === "Approved" || o.orderStatus === "Pending") && o.orderBagStatus === "Sterilized").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setTotalSubstrateBagsOrders(orders.filter((o) => (o.orderStatus === "Approved" || o.orderStatus === "Pending") && o.orderBagStatus === "Inoculated").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setTotalSterilizedBagsOrders(orders.filter((o) => (o.orderStatus === "Approved" || o.orderStatus === "Pending") && o.orderBagStatus === "Incubating").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setTotalInoculatedBagsOrders(orders.filter((o) => (o.orderStatus === "Approved" || o.orderStatus === "Pending") && o.orderBagStatus === "Inoculated").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setTotalIncubatingBagsOrders(orders.filter((o) => (o.orderStatus === "Approved" || o.orderStatus === "Pending") && o.orderBagStatus === "Incubating").reduce((sum, o) => sum + Number(o.orderQuantity || 0), 0));
        setActiveMembers(membersRes.data.length);

        const accounts = financeRes.data;
        setCashInHand(accounts.find((a) => a.accountId === "110-0001")?.accountBalance || 0);
        setSavingAccounts(accounts.find((a) => a.accountId === "115-0001")?.accountBalance || 0);
        setCurrentAccounts(accounts.find((a) => a.accountId === "115-0002")?.accountBalance || 0);

        const batches = batchRes.data;
        setTodayProductionBags(batches.filter((b) => b.status === "Substrate" && new Date(b.batchDate).toDateString() === new Date().toDateString()).reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0));
        setTodaySterilizedBags(batches.filter((b) => b.status === "Sterilized" && new Date(b.sterilizationDate).toDateString() === new Date().toDateString()).reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0));
        setTodayInoculatedBags(batches.filter((b) => b.status === "Inoculated" && new Date(b.inoculationDate).toDateString() === new Date().toDateString()).reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0));
        setCurrentIcubatingBags(batches.filter((b) => b.status === "Incubating").reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0));
        setTodaySoldBags(batches.filter((b) => b.status === "Sold" && new Date(b.soldDate).toDateString() === new Date().toDateString()).reduce((sum, b) => sum + Number(b.numberOfBags || 0), 0));
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
    <div className="erp-page">
      <div className="erp-page-shell">
        <div className="erp-page-header">
          <div>
            <p className="erp-eyebrow">Control Center</p>
            <h1 className="erp-title">Operations Dashboard</h1>
            <p className="erp-subtitle">Live overview of orders, production, sales, and finance.</p>
          </div>
          <div className="erp-surface px-4 py-3 text-sm font-bold text-[#35523c]">Today: {new Date().toLocaleDateString("en-GB")}</div>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <DashboardCard title="Order Summary" eyebrow="Substrate bag demand" icon={<FaReceipt />} collapsible open={openSections.orders} onToggle={() => toggleSection("orders")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Pending Orders" value={formatNumber(totalPendingOrders)} tone="red" />
              <Stat label="Completed Orders" value={formatNumber(totalCompletedOrders)} tone="green" />
              <Stat label="Pending - Substrate" value={formatNumber(totalSubstrateBagsOrders)} tone="amber" />
              <Stat label="Pending - Sterilized" value={formatNumber(totalSterilizedBagsOrders)} tone="yellow" />
              <Stat label="Pending - Inoculated" value={formatNumber(totalInoculatedBagsOrders)} tone="indigo" />
              <Stat label="Pending - Incubating" value={formatNumber(totalIncubatingBagsOrders)} tone="blue" />
            </div>
          </DashboardCard>

          <DashboardCard title="Production Summary" eyebrow="Daily process flow" icon={<FaUsersCog />} collapsible open={openSections.exco} onToggle={() => toggleSection("exco")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Active Members" value={formatNumber(activeMembers)} tone="blue" />
              <Stat label="Today Produced Bags" value={formatNumber(todayProductionBags)} tone="green" />
              <Stat label="Today Sterilized Bags" value={formatNumber(todaySterilizedBags)} tone="teal" />
              <Stat label="Today Inoculated Bags" value={formatNumber(todayInoculatedBags)} tone="indigo" />
              <Stat label="Current Incubating Bags" value={formatNumber(currentIcubatingBags)} tone="amber" />
              <Stat label="Today Sold Bags" value={formatNumber(todaySoldBags)} tone="red" />
            </div>
          </DashboardCard>

          <DashboardCard title="Sales & Expenses" eyebrow="Daily profitability" icon={<FaUserClock />} collapsible open={openSections.sales} onToggle={() => toggleSection("sales")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Today Sale Amount" value={formatCurrency(todaySaleAmount)} tone="blue" />
              <Stat label="Today Expenses" value={formatCurrency(todayExpenses)} tone="green" />
              <Stat label="Contamination Loss" value={formatCurrency(contaminationLoss)} tone="indigo" />
              <Stat label="Gross Profit" value={formatCurrency(todaySaleAmount - (todayExpenses + contaminationLoss))} tone="red" isTotal />
            </div>
          </DashboardCard>

          <DashboardCard title="Financial Summary" eyebrow="Cash position" icon={<FaSackDollar />} collapsible open={openSections.finance} onToggle={() => toggleSection("finance")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Stat label="Cash In Hand" value={formatCurrency(cashInHand)} tone="blue" />
              <Stat label="Savings Account" value={formatCurrency(savingAccounts)} tone="green" />
              <Stat label="Current Account" value={formatCurrency(currentAccounts)} tone="indigo" />
              <Stat label="Total" value={formatCurrency(cashInHand + savingAccounts + currentAccounts)} tone="red" isTotal />
            </div>
          </DashboardCard>
        </div>
      </div>
    </div>
  );
}

const toneClasses = {
  red: "bg-[#fff1f0] text-[#b42318] border-[#ffd5d1]",
  green: "bg-[#eef8f0] text-[#276b3b] border-[#c9e8d0]",
  amber: "bg-[#fff7e8] text-[#9a5b13] border-[#ffe2ac]",
  yellow: "bg-[#fbf8df] text-[#806600] border-[#eee49a]",
  indigo: "bg-[#f0f2ff] text-[#4245a8] border-[#d9ddff]",
  blue: "bg-[#edf6ff] text-[#175cd3] border-[#cfe6ff]",
  teal: "bg-[#eaf8f5] text-[#0f766e] border-[#c7ebe4]",
};

const Stat = ({ label, value, tone, isTotal = false }) => (
  <div className={"rounded-lg border p-4 transition duration-200 hover:-translate-y-0.5 hover:shadow-md " + toneClasses[tone]}>
    <p className={"text-2xl font-extrabold leading-tight " + (isTotal ? "tracking-wide" : "")}>{value}</p>
    <p className="mt-1 text-xs font-bold uppercase tracking-[0.04em] opacity-75">{label}</p>
  </div>
);

const DashboardCard = ({ title, eyebrow, icon, children, collapsible, open, onToggle, className = "" }) => (
  <section className={"erp-panel overflow-hidden " + className}>
    <button
      type="button"
      className={"flex w-full items-center justify-between gap-4 border-b border-[#edf2ed] bg-white px-5 py-4 text-left " + (collapsible ? "cursor-pointer" : "cursor-default")}
      onClick={collapsible ? onToggle : undefined}
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-[#eef8f0] text-lg text-[#2f7d46]">{icon}</span>
        <div>
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-[#6b7b70]">{eyebrow}</p>
          <h2 className="text-lg font-extrabold text-[#172017]">{title}</h2>
        </div>
      </div>
      {collapsible && <span className="text-[#5f7a64]">{open ? <FaChevronUp /> : <FaChevronDown />}</span>}
    </button>
    <div className={"p-5 transition-all " + (collapsible && !open ? "hidden" : "")}>{children}</div>
  </section>
);
