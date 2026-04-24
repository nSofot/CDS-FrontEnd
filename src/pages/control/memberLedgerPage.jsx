import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import LoadingSpinner from "../../components/loadingSpinner";

export default function MemberLedgerPage() {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [selectedMember, setSelectedMember] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const handleAuthError = (err) => {
    if (err.response?.status === 403) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      toast.error("Something went wrong");
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`,
        { headers: getAuthHeaders() }
      );
      setMembers(Array.isArray(res?.data) ? res.data : []);
    } catch (err) {
      handleAuthError(err);
    }
  };

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        { headers: getAuthHeaders() }
      );
      setTransactions(Array.isArray(res?.data?.data) ? res.data.data : []);
    } catch (err) {
      setTransactions([]);
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    fetchMembers();
    fetchTransactions();
  }, []);

  // ✅ FIXED LOGIC
  const processedTransactions = useMemo(() => {
    if (!selectedMember) return [];

    let runningBalance = 0;

    const filtered = transactions.filter(
      (t) => t.memberId === selectedMember
    );

    return filtered
      .sort((a, b) => new Date(a.trxDate) - new Date(b.trxDate))
      .map((trx) => {
        const debit = !trx.isCredit
          ? Number(trx.amount || 0)
          : 0;

        const credit = trx.isCredit
          ? Number(trx.amount || 0)
          : 0;

        runningBalance += debit - credit;

        return {
          ...trx,
          debit,
          credit,
          balance: runningBalance,
        };
      });
  }, [transactions, selectedMember]);

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4">
      {/* HEADER */}
      <div className="flex md:flex-row flex-col justify-between gap-2 py-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            📒 Member Ledger
          </h1>
          <p className="text-gray-600 text-sm">
            View member transaction history
          </p>
        </div>

        <button
          onClick={() => navigate("/members")}
          className="px-4 py-2 border border-orange-400 text-orange-500 rounded hover:bg-orange-400 hover:text-white"
        >
          ← Back
        </button>
      </div>

      {/* FILTER */}
      <div className="bg-white p-3 rounded shadow flex flex-col md:flex-row gap-3 md:items-center">
        <label className="font-semibold">Select Member:</label>

        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-64"
        >
          <option value="">-- Select Member --</option>
          {members.map((m) => (
            <option key={m.memberId} value={m.memberId}>
              {m.nameInSinhala?.trim()
                ? m.nameInSinhala
                : `${m.firstName || ""} ${m.lastName || ""}`.trim()}
            </option>
          ))}
        </select>
      </div>

      {/* CONTENT */}
      <div className="bg-white rounded shadow overflow-hidden">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : !selectedMember ? (
          <div className="py-10 text-center text-gray-500">
            Please select a member to view ledger
          </div>
        ) : processedTransactions.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          <>
            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto max-h-[60vh]">
              <table className="min-w-full text-sm border">
                <thead className="bg-orange-100 sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Date</th>
                    <th className="p-2 text-left">Reference</th>
                    <th className="p-2 text-left">Type</th>
                    <th className="p-2 text-left">Description</th>
                    <th className="p-2 text-right text-red-600">Debit</th>
                    <th className="p-2 text-right text-green-600">Credit</th>
                    <th className="p-2 text-right">Balance</th>
                  </tr>
                </thead>

                <tbody>
                  {processedTransactions.map((trx) => (
                    <tr key={trx._id} className="border-t hover:bg-orange-50">
                      <td className="p-2">
                        {new Date(trx.trxDate).toLocaleDateString()}
                      </td>
                      <td className="p-2">{trx.referenceId || "-"}</td>
                      <td className="p-2 capitalize">{trx.trxType}</td>
                      <td className="p-2">{trx.description || "-"}</td>

                      <td className="p-2 text-right text-red-600">
                        {trx.debit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td className="p-2 text-right text-green-600">
                        {trx.credit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>

                      <td
                        className={`p-2 text-right font-semibold ${
                          trx.balance < 0
                            ? "text-red-600"
                            : "text-gray-800"
                        }`}
                      >
                        {trx.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* MOBILE */}
            <div className="md:hidden">
              {processedTransactions.map((trx) => (
                <div key={trx._id} className="border-b p-3 text-sm">
                  <div className="flex justify-left gap-4">
                    <span>
                      {new Date(trx.trxDate).toLocaleDateString()}
                    </span>
                    <span>{trx.referenceId || "-"}</span>
                    <span className="capitalize">{trx.trxType}</span>
                  </div>

                  <div className="mt-1">
                    {trx.description || "-"}
                  </div>

                  {/* LINE 3 */}
                  <div className="flex justify-right text-sm">
                    <span className="text-red-600 w-1/3 text-right">
                      {Number(trx.debit || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>

                    <span className="text-green-600 w-1/3 text-right">
                      {Number(trx.credit || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>

                    <span
                      className={`w-1/3 text-right font-semibold ${
                        Number(trx.balance || 0) < 0
                          ? "text-red-600"
                          : "text-gray-900"
                      }`}
                    >
                      {Number(trx.balance || 0).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </span>
                  </div>

                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}