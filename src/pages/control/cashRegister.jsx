import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import Cashbook from "../../components/viewCashbook";

export default function CashRegisterPage() {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [selectAccount, setSelectAccount] = useState("");
  const [accountBalance, setAccountBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const formatLocalISODate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const [fromDate, setFromDate] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return formatLocalISODate(firstDay);
  });

  const [toDate, setToDate] = useState(() => formatLocalISODate(new Date()));

  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading) return;

    const fetchAccounts = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`);
        const filtered = res.data.filter(a => a.headerAccountId === "325");
        setAccounts(filtered.sort((a, b) => a.accountId.localeCompare(b.accountId)));
      } catch (err) {
        console.error(err);
        toast.error("Failed to fetch account/bank data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [isLoading]);

  const validateDates = (start, end) => {
    if (start && end && new Date(start) > new Date(end)) {
      setError("⚠️ From Date must be earlier than To Date");
    } else {
      setError("");
    }
  };

  const handleAccountChange = (e) => {
    const value = e.target.value;
    setSelectAccount(value);
    const selected = accounts.find(a => a.accountId === value || a._id === value);
    setAccountBalance(selected?.accountBalance ?? 0);
  };

  return (
    <div className="max-w-6xl w-full mx-auto p-4 md:p-6 space-y-6">

      {/* Page Title */}
      <div className="text-center md:text-left space-y-1">
        <h1 className="text-2xl md:text-3xl font-bold text-green-700">💵 Cash & Bank Transactions Register</h1>
        <p className="text-sm text-gray-600">Record and review all Cash & Bank Movements</p>
      </div>

      {/* Account Selection Section */}
      <div className="bg-white shadow-md border-l-4 border-green-700 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-green-700 text-lg">Select Account</h2>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="text-sm font-medium text-green-700">Account</label>
            <select
              value={selectAccount}
              onChange={handleAccountChange}
              className="mt-1 w-full p-3 border border-green-400 rounded-lg text-sm focus:ring-2 focus:ring-green-300"
            >
              <option value="">-- Select --</option>
              {accounts.map((a, idx) => (
                <option key={`${a.accountId || a._id}-${idx}`} value={a.accountId || a._id}>
                  {a.accountName || a.accountsName}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium text-green-700">Account Balance</label>
            <div className="mt-1 p-3 bg-green-50 border border-green-300 rounded-lg text-right font-semibold text-green-800">
              Rs. {Number(accountBalance ?? 0).toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2})}
            </div>
          </div>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-white shadow-md border-l-4 border-green-700 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-green-700 text-lg">Select Date Range</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-green-700">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e)=>{ setFromDate(e.target.value); validateDates(e.target.value,toDate); }}
              max={toDate}
              className="mt-1 w-full p-3 border border-green-400 rounded-lg text-sm focus:ring-2 focus:ring-green-300"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-green-700">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e)=>{ setToDate(e.target.value); validateDates(fromDate,e.target.value); }}
              min={fromDate}
              className="mt-1 w-full p-3 border border-green-400 rounded-lg text-sm focus:ring-2 focus:ring-green-300"
            />
          </div>
        </div>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* Cashbook Table */}
      <div className="bg-white rounded-xl border-l-4 border-green-700 shadow-md p-5">
        <Cashbook accountId={selectAccount} fromDate={fromDate} toDate={toDate} />
      </div>

      {/* Back Button */}
      <div className="pt-2">
            <button
              onClick={() => navigate("/control")}
              className="w-full md:w-auto px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
            >
              ← Go Back
            </button>
      </div>
    </div>
  );

}
