import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

export default function MemberLedgerPage() {
  const [members, setMembers] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------- FETCH MEMBERS ----------------
  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`,
        { headers }
      );
      setMembers(res.data.data || res.data || []);
    } catch (err) {
      toast.error("Failed to load members");
    }
  };

  // ---------------- FETCH TRANSACTIONS ----------------
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        { headers }
      );
      setTransactions(res.data.data || res.data || []);
    } catch (err) {
      console.log(err);
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchTransactions();
  }, []);

  // ---------------- GENERATE LEDGER ----------------
  const generateLedger = (member) => {
    setSelectedMember(member);
    setLoading(true);

    let filtered = transactions.filter(
      (t) =>
        String(t.memberId).trim() === String(member.memberId).trim()
    );

    // DATE FILTER
    if (fromDate) {
      filtered = filtered.filter(
        (t) => new Date(t.trxDate) >= new Date(fromDate)
      );
    }

    if (toDate) {
      filtered = filtered.filter(
        (t) => new Date(t.trxDate) <= new Date(toDate)
      );
    }

    filtered.sort(
      (a, b) => new Date(a.trxDate) - new Date(b.trxDate)
    );

    let balance = 0;

    const computed = filtered.map((t) => {
      const amount = Number(t.amount || 0);
      const isCredit = t.isCredit === true;

      const debit = isCredit ? 0 : amount;
      const credit = isCredit ? amount : 0;

      balance += debit - credit;

      return {
        ...t,
        debit,
        credit,
        balance,
      };
    });

    setLedger(computed);
    setLoading(false);
    setIsModalOpen(true);
  };

  // ---------------- FORMAT NUMBER ----------------
  const format = (val) =>
    Number(val || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="p-4 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div>
            <h1 className="text-2xl font-bold text-blue-600">
            🧾 Member Ledger
            </h1>
            <h2 className="text-sm text-gray-600">
            Track complete financial history of member accounts
            </h2>
        </div>

        <button
          onClick={() => navigate("/members")}
          className="px-4 py-2 border rounded"
        >
          ← Back
        </button>
      </div>

      {/* DATE FILTER */}
      <div className="flex gap-2 p-3 border-b flex-wrap bg-gray-50">
        <input
          type="date"
          className="border p-2 rounded text-sm"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded text-sm"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      {/* MEMBERS */}
      <div className="grid md:grid-cols-3 gap-4 mt-3">
        {members.map((m) => (
          <div
            key={m._id}
            onClick={() => generateLedger(m)}
            className="border rounded-lg p-4 bg-white shadow hover:bg-blue-50 cursor-pointer"
          >
            <h2 className="font-semibold text-blue-600">
              {m.nameInSinhala || m.firstName + " " + m.lastName}
            </h2>
            <p className="text-sm text-gray-500">{m.memberId}</p>
            <p className="text-sm">
              Due: Rs. {m.dueAmount}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center md:pl-64 p-3"
        className="bg-white w-full md:max-w-4xl rounded-xl shadow-xl max-h-[95vh] flex flex-col overflow-hidden"
      >
        {selectedMember && (
          <>
            {/* HEADER */}
            <div className="flex justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-blue-600">
                  Member Ledger - {selectedMember.memberName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedMember.memberId}
                </p>
              </div>

              <button onClick={() => setIsModalOpen(false)}>
                ✖
              </button>
            </div>

            {/* BODY */}
            <div className="flex-1 overflow-y-auto p-3">

              {loading ? (
                <p>Loading...</p>
              ) : (
                <>
                  {/* TABLE */}
                  <div className="hidden md:block">
                    <table className="w-full text-sm border">
                      <thead className="bg-blue-100">
                        <tr>
                          <th className="p-2 text-left">Date</th>
                          <th className="p-2 text-left">Ref</th>
                          <th className="p-2 text-left">Type</th>
                          <th className="p-2 text-right">Debit</th>
                          <th className="p-2 text-right">Credit</th>
                          <th className="p-2 text-right">Balance</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ledger.map((row, i) => (
                          <tr key={i} className="border-t">
                            <td className="p-2">
                              {new Date(row.trxDate).toLocaleDateString()}
                            </td>
                            <td className="p-2">{row.referenceId}</td>
                            <td className="p-2">{row.trxType}</td>

                            <td className="p-2 text-right text-red-600">
                              {format(row.debit)}
                            </td>

                            <td className="p-2 text-right text-green-600">
                              {format(row.credit)}
                            </td>

                            <td
                              className={`p-2 text-right font-semibold ${
                                row.balance < 0
                                  ? "text-red-600"
                                  : "text-gray-700"
                              }`}
                            >
                              {format(row.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE */}
                  <div className="md:hidden space-y-3">
                    {ledger.map((row, i) => (
                      <div
                        key={i}
                        className="border rounded-lg p-3 bg-white"
                      >
                        <div className="flex justify-between">
                          <span className="text-sm">
                            {new Date(row.trxDate).toLocaleDateString()}
                          </span>
                          <span className="text-blue-600 text-sm">
                            {row.trxType}
                          </span>
                        </div>

                        <div className="text-xs text-gray-500">
                          {row.referenceId}
                        </div>

                        <div className="flex justify-between mt-2 text-sm">
                          <span className="text-red-600">
                            Dr: {format(row.debit)}
                          </span>

                          <span className="text-green-600">
                            Cr: {format(row.credit)}
                          </span>
                        </div>

                        <div
                          className={`mt-2 text-right font-bold ${
                            row.balance < 0
                              ? "text-red-600"
                              : "text-gray-700"
                          }`}
                        >
                          Balance: {format(row.balance)}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Modal>
    </div>
  );
}