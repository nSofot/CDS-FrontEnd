import { useEffect, useState } from "react";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner";
import { FaUsersCog, FaUserClock, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { FaSackDollar } from "react-icons/fa6";
import { m } from "framer-motion";

/* ───────── DASHBOARD PAGE ───────── */

export default function DashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  const [ordinaryMembers, setOrdinaryMembers] = useState([]);
  const [lifeMembers, setLifeMembers] = useState([]);
  const [associateMembers, setAssociateMembers] = useState([]);
  const [honoraryMembers, setHonoraryMembers] = useState([]);
  const [overseasMembers, setOverseasMembers] = useState([]);
  const [guestMembers, setGuestMembers] = useState([]);

  const [cashInHand, setCashInHand] = useState(0);
  const [savingAccounts, setSavingAccounts] = useState(0);
  const [currentAccounts, setCurrentAccounts] = useState(0);

  const [openSections, setOpenSections] = useState({
    exco: true,
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

        setOrdinaryMembers(list.filter((m) => m.memberType === "ordinary"));
        setLifeMembers(list.filter((m) => m.memberType === "life"));
        setAssociateMembers(list.filter((m) => m.memberType === "associate"));
        setHonoraryMembers(list.filter((m) => m.memberType === "honorary"));
        setOverseasMembers(list.filter((m) => m.memberType === "overseas"));
        setGuestMembers(list.filter((m) => m.memberRole === "guest"));

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
          title="Members Count"
          icon={<FaUsersCog />}
          collapsible
          open={openSections.exco}
          onToggle={() => toggleSection("exco")}
        >
          <div className="grid grid-cols-2 gap-4">
            <Stat label="Ordinary Members" value={ordinaryMembers.length} color="text-blue-600" />
            <Stat label="Life Members" value={lifeMembers.length} color="text-green-600" />
            <Stat label="Associate Members" value={associateMembers.length} color="text-purple-600" />
            <Stat label="Honorary Members" value={honoraryMembers.length} color="text-orange-600" />
            <Stat label="Overseas Members" value={overseasMembers.length} color="text-pink-600" />
            <Stat
              label="TOTAL"
              value={
                ordinaryMembers.length +
                lifeMembers.length +
                associateMembers.length +
                honoraryMembers.length +
                overseasMembers.length
              }
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

        {/* PENDING – FULL WIDTH */}
        <DashboardCard
          title="Pending Applications"
          icon={<FaUserClock />}
          className="xl:col-span-2"
        >
          {guestMembers && guestMembers.length > 0 ? (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-orange-200 table-fixed">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="w-5 px-3 py-2 text-left">#</th>
                      <th className="w-10 px-3 py-2 text-center">ID</th>
                      <th className="w-50 px-3 py-2 text-left">Name</th>
                      <th className="w-10 px-3 py-2 text-left">Mobile</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-orange-200">
                    {guestMembers.map((item, index) => (
                      <tr
                        key={item.memberId}
                        onClick={() => {
                          setActiveRecord(item);
                          setIsModalOpen(true);
                        }}
                        className="hover:bg-orange-50 cursor-pointer"
                      >
                        <td className="px-3 py-2">{index + 1}</td>
                        <td className="px-3 py-2 text-center">{item.memberId}</td>
                        <td className="px-3 py-2 break-words">
                          {item.title} {item.firstName} {item.lastName}
                        </td>
                        <td className="px-3 py-2">{item.mobile}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="md:hidden flex flex-col gap-3 p-3">
                {guestMembers.map((item) => (
                  <div
                    key={item.memberId}
                    onClick={() => {
                      setActiveRecord(item);
                      setIsModalOpen(true);
                    }}
                    className="flex items-center gap-3 p-3 border border-orange-200 rounded-lg shadow-sm hover:bg-orange-50 cursor-pointer"
                  >
                    <div className="flex-1">
                      <p className="font-semibold">
                        {item.title} {item.firstName} {item.lastName}
                      </p>
                      <p className="text-sm text-gray-600">{item.memberId}</p>
                      <p className="text-sm text-gray-600">{item.mobile}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <Empty text="No pending applications" />
          )}
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
