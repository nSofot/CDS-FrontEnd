import { useEffect, useState } from "react";
import axios from "axios";
import Modal from "react-modal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

export default function VendorLedgerPage() {
  const [vendors, setVendors] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

    const [fromDate, setFromDate] = useState("");
    const [toDate, setToDate] = useState("");

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------- FETCH VENDORS ----------------
  const fetchVendors = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor`,
        { headers }
      );
      setVendors(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load vendors");
    }
  };

  // ---------------- FETCH TRANSACTIONS ----------------
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        { headers }
      );

      setTransactions(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchTransactions();
  }, []);

  // ---------------- GENERATE LEDGER ----------------
    const generateLedger = (vendor) => {
    setSelectedVendor(vendor);
    setLoading(true);

    let filtered = transactions.filter(
        (t) =>
        String(t.vendorId).trim() === String(vendor.vendorId).trim()
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
    <div className="max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex md:flex-row flex-col justify-between gap-2 py-3">
        <div >
        <h1 className="text-2xl font-bold text-orange-600">
          🧾 Vendor Ledger
        </h1>
        <h2 className="text-sm text-gray-600">
          Track complete financial history of vendor accounts
        </h2>
        </div>

        <button
          onClick={() => navigate("/vendors")}
          className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
        >
          ← Back
        </button>
      </div>

        {/* DATE RANGE FILTER */}
        <div className="flex gap-2 border-b flex-wrap bg-gray-50 py-4">
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

          <button
              onClick={() => generateLedger(selectedVendor)}
              className="px-3 py-2 text-sm border rounded bg-orange-100"
          >
              Apply Filter
          </button>

          <button
              onClick={() => {
              setFromDate("");
              setToDate("");
              generateLedger(selectedVendor);
              }}
              className="px-3 py-2 text-sm border rounded"
          >
              Reset
          </button>
        </div>

      {/* VENDORS */}
      <div className="grid md:grid-cols-3 gap-4">
        {vendors.map((v) => (
          <div
            key={v._id}
            onClick={() => generateLedger(v)}
            className="border rounded-lg p-4 bg-white shadow hover:bg-orange-50 cursor-pointer"
          >
            <h2 className="font-semibold text-orange-600">
              {v.vendorName}
            </h2>
            <p className="text-sm text-gray-500">{v.vendorId}</p>
            <p className="text-sm">
              Due: Rs. {v.vendorDueAmount}
            </p>
          </div>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        overlayClassName="fixed inset-0 bg-black/60 flex md:items-center justify-center md:pl-64 p-3"
        className="bg-white w-full md:max-w-4xl rounded-xl shadow-xl max-h-[95vh] flex flex-col overflow-hidden mt-20 md:mt-0"
      >
        {selectedVendor && (
          <>
            {/* HEADER */}
            <div className="flex justify-between p-4 border-b">
              <div>
                <h2 className="text-lg font-bold text-orange-600">
                  Vendor Ledger - {selectedVendor.vendorName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedVendor.vendorId}
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
                      <thead className="bg-orange-100">
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
                            {Number(row.debit || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </td>

                            <td className="p-2 text-right text-green-600">
                            {Number(row.credit || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </td>

                            <td
                            className={`p-2 text-right font-semibold ${
                                Number(row.balance || 0) < 0 ? "text-red-600" : "text-gray-700"
                            }`}
                            >
                            {Number(row.balance || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </td>
                            
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* MOBILE */}
                  <div className="md:hidden">
                    {ledger.map((row, i) => (
                      <div
                        key={i}
                        className="border-b border-gray-600 p-3 bg-white"
                      >
                        <div className="flex justify-left gap-6">
                          <span className="text-sm">
                            {new Date(row.trxDate).toLocaleDateString()}
                          </span>                       
                          <span className="text-sm">
                            {row.trxType}
                          </span>
                          <span className="text-sm">
                            {row.referenceId}
                          </span>
                        </div>

                        <div className="flex justify-right items-right start-end mt-2 text-sm">
                            <span className="text-red-600 text-right w-1/3">
                            {Number(row.debit || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </span>

                            <span className="text-green-600 text-right w-1/3">
                            {Number(row.credit || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </span>

                            <span
                            className={`text-right w-1/3 font-semibold ${
                                row.balance < 0 ? "text-red-600" : "text-gray-900"
                            }`}
                            >
                            {Number(row.balance || 0).toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                            })}
                            </span>
                        </div>

                        {/* <div className="text-right font-bold mt-2">
                          Balance: {row.balance}
                        </div> */}
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