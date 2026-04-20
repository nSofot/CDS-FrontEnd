import { useEffect, useState } from "react";
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

  // ✅ Auth Header
  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // ✅ Handle Auth Errors
  const handleAuthError = (err) => {
    if (err.response?.status === 403) {
      toast.error("Session expired. Please login again.");
      localStorage.removeItem("token");
      navigate("/login");
    } else {
      toast.error("Something went wrong");
    }
  };

  // ✅ Fetch Members
  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`,
        { headers: getAuthHeaders() }
      );

      const data = res?.data || [];
      setMembers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Member fetch error:", err);
      handleAuthError(err);
    }
  };

  // ✅ Fetch Transactions
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        { headers: getAuthHeaders() }
      );

      const data = res?.data?.data || [];

      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Transaction fetch error:", err);
      setTransactions([]); // ✅ prevent crash
      handleAuthError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      toast.error("Please login first");
      navigate("/login");
      return;
    }

    fetchMembers();
    fetchTransactions();
  }, []);

  // ✅ Filter transactions by member
  const filteredTransactions = selectedMember
    ? transactions.filter((t) => t.memberId === selectedMember)
    : transactions;

  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-4">
      {/* Header */}
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

      {/* Filter */}
      <div className="bg-white p-3 rounded shadow flex gap-3 items-center">
        <label className="font-semibold">Select Member:</label>

        <select
          value={selectedMember}
          onChange={(e) => setSelectedMember(e.target.value)}
          className="border px-3 py-2 rounded w-64"
        >
          <option value="">All Members</option>
          {members.map((m) => (
            <option key={m.memberId} value={m.memberId}>
              {m.memberId} - {m.firstName} {m.lastName}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-hidden">
        {isLoading ? (
          <div className="py-10 flex justify-center">
            <LoadingSpinner />
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-10 text-center text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto max-h-[60vh]">
            <table className="min-w-full table-fixed border">
              <thead className="bg-orange-100 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left">Date</th>
                  <th className="px-3 py-2 text-left">Member ID</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-right">Amount</th>
                  <th className="px-3 py-2 text-left">Description</th>
                </tr>
              </thead>

              <tbody>
                {filteredTransactions.map((trx) => (
                  <tr key={trx._id} className="border-t hover:bg-orange-50">
                    <td className="px-3 py-2">
                      {new Date(trx.date).toLocaleDateString()}
                    </td>
                    <td className="px-3 py-2">{trx.memberId}</td>
                    <td className="px-3 py-2">{trx.type}</td>
                    <td className="px-3 py-2 text-right">
                      Rs. {trx.amount?.toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {trx.description || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}