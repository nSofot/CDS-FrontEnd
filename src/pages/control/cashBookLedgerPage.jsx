import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

export default function CashBookLedgerPage() {
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [ledger, setLedger] = useState([]);

  const [selectedAccount, setSelectedAccount] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------- FETCH ACCOUNTS ----------------
  const fetchAccounts = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`,
        { headers }
      );

      setAccounts(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load accounts");
    }
  };

  // ---------------- FETCH TRANSACTIONS ----------------
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        { headers }
      );

      setTransactions(res.data.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchTransactions();
  }, []);

  // ---------------- GENERATE LEDGER ----------------
  const generateLedger = (account) => {
    setSelectedAccount(account);
    setLoading(true);

    let filtered = transactions.filter(
      (t) =>
        String(t.accountId).trim() === String(account.accountId).trim()
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

  return (
    <div className="p-4 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            💰 Cash Book Ledger
          </h1>
          <p className="text-sm text-gray-600">
            Account-wise cash & bank ledger system
          </p>
        </div>

        <button
          onClick={() => navigate("/cash-book")}
          className="px-6 h-12 border border-orange-400 text-orange-400 rounded-lg hover:bg-orange-400 hover:text-white"
        >
          ← Back
        </button>
      </div>

      {/* DATE FILTER */}
      <div className="flex gap-2 p-3 bg-gray-50 border-b flex-wrap">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded text-sm"
        />

        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded text-sm"
        />

        <button
          onClick={() => selectedAccount && generateLedger(selectedAccount)}
          className="px-3 py-2 text-sm border rounded bg-orange-100"
        >
          Apply Filter
        </button>

        <button
          onClick={() => {
            setFromDate("");
            setToDate("");
            selectedAccount && generateLedger(selectedAccount);
          }}
          className="px-3 py-2 text-sm border rounded"
        >
          Reset
        </button>
      </div>

      {/* ACCOUNTS LIST */}
      <div className="grid md:grid-cols-3 gap-4 mt-4">
        {accounts.map((a) => (
          <div
            key={a._id}
            onClick={() => generateLedger(a)}
            className="border p-4 rounded shadow bg-white hover:bg-orange-50 cursor-pointer"
          >
            <h2 className="font-semibold text-orange-600">
              {a.accountName}
            </h2>

            <p className="text-sm text-gray-500">
              {a.accountId}
            </p>

            <p className="text-sm">
              Type: {a.accountType}
            </p>

            <p className="text-sm font-bold">
              Balance: Rs. {a.accountBalance}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex items-center justify-center p-3"
        className="bg-white w-full max-w-4xl rounded-xl shadow-xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {selectedAccount && (
          <>
            {/* HEADER */}
            <div className="flex justify-between p-4 border-b">
              <div>
                <h2 className="font-bold text-orange-600">
                  {selectedAccount.accountName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedAccount.accountId}
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
                <table className="w-full text-sm border">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="p-2">Date</th>
                      <th className="p-2">Ref</th>
                      <th className="p-2">Type</th>
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
                          {row.debit.toLocaleString()}
                        </td>

                        <td className="p-2 text-right text-green-600">
                          {row.credit.toLocaleString()}
                        </td>

                        <td className="p-2 text-right font-bold">
                          {row.balance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}

            </div>
          </>
        )}
      </Modal>
    </div>
  );
}