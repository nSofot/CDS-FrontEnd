import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import {
  FaUsers,
  FaSearch,
  FaPrint,
  FaFilePdf,
} from "react-icons/fa";

export default function CustomerLedgerPage() {
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const printRef = useRef();

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`
      );

      const customerMembers = data.filter(
        (m) =>
          m.memberType === "Customer" ||
          m.memberType === "Member"
      );

      setMembers(customerMembers);
    } catch (error) {
      toast.error("Failed to load customers");
    }
  };

  const searchLedger = async () => {
    if (!memberId) {
      return toast.error("Select customer");
    }

    try {
      setLoading(true);

      const { data } = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        {
          params: {
            memberId,
            fromDate: filters.fromDate,
            toDate: filters.toDate,
          },
        }
      );

      setTransactions(data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Failed to load ledger"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = useMemo(() => {
    return members.find((m) => m.memberId === memberId);
  }, [memberId, members]);

  const ledgerRows = useMemo(() => {
    let runningBalance = 0;

    return transactions.map((trx) => {
      const debit = trx.isCredit ? trx.amount : 0;
      const credit = trx.isCredit ? 0 : trx.amount;

      runningBalance += debit;
      runningBalance -= credit;

      return {
        ...trx,
        debit,
        credit,
        balance: runningBalance,
      };
    });
  }, [transactions]);

  const totals = useMemo(() => {
    return ledgerRows.reduce(
      (acc, row) => {
        acc.debit += row.debit;
        acc.credit += row.credit;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [ledgerRows]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const element = printRef.current;

    const options = {
      margin: 0.3,
      filename: `customer-ledger-${memberId || "report"}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
    };

    html2pdf().set(options).from(element).save();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Customer Ledger</h1>
        <p className="text-gray-500">Customer transaction history</p>
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex gap-3 mb-4">
        <button
          onClick={handlePrint}
          className="bg-gray-800 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaPrint /> Print
        </button>

        <button
          onClick={handleDownloadPDF}
          className="bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <FaFilePdf /> PDF
        </button>
      </div>

      {/* FILTERS */}
      <div className="bg-white p-5 rounded-xl shadow-sm mb-6">
        <div className="grid md:grid-cols-4 gap-4">

          <select
            value={memberId}
            onChange={(e) => setMemberId(e.target.value)}
            className="border rounded-lg h-11 px-3"
          >
            <option value="">Select Customer</option>
            {members.map((member) => (
              <option
                key={member.memberId}
                value={member.memberId}
              >
                {member.memberId} - {member.firstName} {member.lastName}
              </option>
            ))}
          </select>

          <input
            type="date"
            className="border rounded-lg h-11 px-3"
            value={filters.fromDate}
            onChange={(e) =>
              setFilters({ ...filters, fromDate: e.target.value })
            }
          />

          <input
            type="date"
            className="border rounded-lg h-11 px-3"
            value={filters.toDate}
            onChange={(e) =>
              setFilters({ ...filters, toDate: e.target.value })
            }
          />

          <button
            onClick={searchLedger}
            disabled={loading}
            className="bg-purple-600 text-white rounded-lg h-11 flex items-center justify-center gap-2"
          >
            <FaSearch />
            Search
          </button>

        </div>
      </div>

      {/* PRINT AREA */}
      <div ref={printRef} className="print-area">

        {/* SUMMARY */}
        {selectedCustomer && (
          <div className="grid md:grid-cols-3 gap-4 mb-6">

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="flex items-center gap-3">
                <FaUsers />
                <div>
                  <div className="font-semibold">Customer</div>
                  <div>
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="font-semibold">Total Debit</div>
              <div className="text-2xl font-bold text-red-600">
                Rs. {totals.debit.toFixed(2)}
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-sm">
              <div className="font-semibold">Total Credit</div>
              <div className="text-2xl font-bold text-green-600">
                Rs. {totals.credit.toFixed(2)}
              </div>
            </div>

          </div>
        )}

        {/* TABLE */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">

              <thead className="bg-gray-100">
                <tr>
                  <th className="p-3 text-left">Date</th>
                  <th className="p-3 text-left">Trx ID</th>
                  <th className="p-3 text-left">Type</th>
                  <th className="p-3 text-left">Description</th>
                  <th className="p-3 text-right">Debit</th>
                  <th className="p-3 text-right">Credit</th>
                  <th className="p-3 text-right">Balance</th>
                </tr>
              </thead>

              <tbody>
                {ledgerRows.map((row) => (
                  <tr key={row._id} className="border-t">
                    <td className="p-3">
                      {new Date(row.trxDate).toLocaleDateString()}
                    </td>
                    <td className="p-3">{row.trxId}</td>
                    <td className="p-3">{row.trxType}</td>
                    <td className="p-3">{row.description}</td>
                    <td className="p-3 text-right text-red-600">
                      {row.debit.toFixed(2)}
                    </td>
                    <td className="p-3 text-right text-green-600">
                      {row.credit.toFixed(2)}
                    </td>
                    <td className="p-3 text-right font-semibold">
                      {row.balance.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>

              <tfoot className="bg-gray-100">
                <tr>
                  <td colSpan={4} className="p-3 font-bold">
                    TOTAL
                  </td>
                  <td className="p-3 text-right font-bold">
                    {totals.debit.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-bold">
                    {totals.credit.toFixed(2)}
                  </td>
                  <td className="p-3 text-right font-bold">
                    {(totals.debit - totals.credit).toFixed(2)}
                  </td>
                </tr>
              </tfoot>

            </table>
          </div>
        </div>

      </div>
    </div>
  );
}