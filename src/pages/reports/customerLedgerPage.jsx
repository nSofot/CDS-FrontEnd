import { useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import html2pdf from "html2pdf.js";
import { FaUsers, FaSearch, FaPrint, FaFilePdf, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function CustomerLedgerPage() {
  const [members, setMembers] = useState([]);
  const [memberId, setMemberId] = useState("");

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
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
        (m) => m.memberType === "Customer" || m.memberType === "Member"
      );

      setMembers(customerMembers);
    } catch {
      toast.error("Failed to load customers");
    }
  };

  const searchLedger = async () => {
    if (!memberId) return toast.error("Select customer");

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

      setTransactions(Array.isArray(data) ? data : data?.data || data?.transactions || []);
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Failed to load ledger"
      );
    } finally {
      setLoading(false);
    }
  };

  const selectedCustomer = useMemo(() => {
    return members.find((m) => m.memberId === memberId);
  }, [memberId, members]);

  // FORMATTERS
  const formatCurrency = (val) =>
    Number(val || 0).toLocaleString("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB");

  // SORT + RUNNING BALANCE
  const ledgerRows = useMemo(() => {
    let runningBalance = 0;

    const sorted = [...transactions].sort(
      (a, b) => new Date(a.trxDate) - new Date(b.trxDate)
    );

    return sorted.map((trx) => {
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

  // TOTALS
  const totals = useMemo(() => {
    return ledgerRows.reduce(
      (acc, r) => {
        acc.debit += r.debit;
        acc.credit += r.credit;
        return acc;
      },
      { debit: 0, credit: 0 }
    );
  }, [ledgerRows]);

  const openingBalance = 0;

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    html2pdf()
      .set({
        margin: 0.3,
        filename: `customer-ledger-${memberId || "report"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "in", format: "a4", orientation: "landscape" },
      })
      .from(printRef.current)
      .save();
  };

  return (
    <div className="erp-page">
      <div className="erp-page-shell">

        {/* ================= HEADER ================= */}
        <div className="erp-page-header">
          <div>
            <div className="erp-eyebrow">
              Reports
            </div>

            <h1 className="erp-title">
              Customer Ledger
            </h1>

            <p className="erp-subtitle">
              View customer transaction history, balances and outstanding amounts.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={handlePrint}
              disabled={!ledgerRows.length}
              className="erp-btn erp-btn-secondary"
            >
              <FaPrint />
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={!ledgerRows.length}
              className="erp-btn erp-btn-danger"
            >
              <FaFilePdf />
              Export PDF
            </button>

            <button
              onClick={() => navigate("/control/reports")}
              className="erp-btn erp-btn-primary"
            >
              <FaArrowLeft />
              Back
            </button>

          </div>
        </div>

        {/* ================= FILTER ================= */}

        <div className="erp-surface p-6 mb-6">

          <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2">

            <div>
              <label className="erp-label">
                Customer
              </label>

              <select
                value={memberId}
                onChange={(e) => setMemberId(e.target.value)}
                className="erp-input"
              >
                <option value="">
                  Select Customer
                </option>

                {members.map((m) => (
                  <option
                    key={m.memberId}
                    value={m.memberId}
                  >
                    {m.memberId} - {m.firstName} {m.lastName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="erp-label">
                From Date
              </label>

              <input
                type="date"
                className="erp-input"
                value={filters.fromDate}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    fromDate: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="erp-label">
                To Date
              </label>

              <input
                type="date"
                className="erp-input"
                value={filters.toDate}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    toDate: e.target.value,
                  })
                }
              />
            </div>

            <div className="flex items-end">

              <button
                onClick={searchLedger}
                disabled={loading}
                className="erp-btn erp-btn-primary w-full"
              >
                <FaSearch />

                {loading ? "Searching..." : "Search Ledger"}

              </button>

            </div>

          </div>

        </div>

        {/* ================= PRINT AREA ================= */}

        <div
          ref={printRef}
          className="print-area pdf-safe"
        >

          {/* Customer */}

          {selectedCustomer && (

            <div className="erp-panel p-6 mb-6">

              <div className="flex items-center gap-3 mb-4">

                <FaUsers
                  size={22}
                  className="text-green-700"
                />

                <h2 className="text-xl font-bold">
                  Customer Information
                </h2>

              </div>

              <div className="grid gap-5 lg:grid-cols-3">

                <div>
                  <span className="erp-label">Customer ID</span>
                  <div>{selectedCustomer.memberId}</div>
                </div>

                <div>
                  <span className="erp-label">Customer Name</span>
                  <div>
                    {selectedCustomer.firstName} {selectedCustomer.lastName}
                  </div>
                </div>

                <div>
                  <span className="erp-label">Mobile</span>
                  <div>{selectedCustomer.mobileNo || "-"}</div>
                </div>

              </div>

            </div>

          )}

          {/* SUMMARY */}

          {selectedCustomer && (

            <div className="grid gap-5 lg:grid-cols-4 md:grid-cols-2 mb-6">

              <div className="erp-panel p-6">
                <p className="erp-label">Customer</p>

                <h3 className="text-xl font-bold">
                  {selectedCustomer.firstName}
                </h3>
              </div>

              <div className="erp-panel p-6 border-l-4 border-red-500">
                <p className="erp-label">Total Debit</p>

                <h2 className="text-2xl font-bold text-red-600">
                  Rs. {formatCurrency(totals.debit)}
                </h2>
              </div>

              <div className="erp-panel p-6 border-l-4 border-green-500">
                <p className="erp-label">Total Credit</p>

                <h2 className="text-2xl font-bold text-green-600">
                  Rs. {formatCurrency(totals.credit)}
                </h2>
              </div>

              <div className="erp-panel p-6 border-l-4 border-blue-500">
                <p className="erp-label">Outstanding</p>

                <h2 className="text-2xl font-bold text-blue-600">
                  Rs. {formatCurrency(
                    totals.debit - totals.credit
                  )}
                </h2>
              </div>

            </div>

          )}

          {/* TABLE */}

          <div className="erp-table-wrap">

            <div className="overflow-x-auto">

              <table className="erp-table">

                <thead>

                  <tr>

                    <th>Date</th>

                    <th>Transaction</th>

                    <th>Type</th>

                    <th>Description</th>

                    <th className="text-right">
                      Debit
                    </th>

                    <th className="text-right">
                      Credit
                    </th>

                    <th className="text-right">
                      Balance
                    </th>

                  </tr>

                </thead>

                <tbody>

                  <tr className="bg-green-50 font-semibold">

                    <td colSpan={6}>
                      Opening Balance
                    </td>

                    <td className="text-right">
                      {formatCurrency(openingBalance)}
                    </td>

                  </tr>

                  {!loading &&
                    ledgerRows.length === 0 && (

                      <tr>

                        <td
                          colSpan={7}
                          className="py-10 text-center text-gray-500"
                        >
                          <div className="flex flex-col items-center gap-2">

                            <FaUsers
                              size={32}
                              className="text-gray-300"
                            />

                            <p className="font-semibold">
                              No Transactions Found
                            </p>

                            <span className="text-sm">
                              Select a customer and click Search.
                            </span>

                          </div>

                        </td>

                      </tr>

                    )}

                  {ledgerRows.map((row) => (

                    <tr key={row._id}>

                      <td>{formatDate(row.trxDate)}</td>

                      <td>{row.trxId}</td>

                      <td>{row.trxType}</td>

                      <td>{row.description}</td>

                      <td className="text-right text-red-600 font-semibold">
                        {formatCurrency(row.debit)}
                      </td>

                      <td className="text-right text-green-600 font-semibold">
                        {formatCurrency(row.credit)}
                      </td>

                      <td
                        className={`text-right font-bold ${
                          row.balance >= 0
                            ? "text-green-700"
                            : "text-red-600"
                        }`}
                      >
                        {formatCurrency(row.balance)}
                      </td>

                    </tr>

                  ))}

                </tbody>

                <tfoot>

                  <tr>

                    <td colSpan={4}>
                      TOTAL
                    </td>

                    <td className="text-right">
                      {formatCurrency(totals.debit)}
                    </td>

                    <td className="text-right">
                      {formatCurrency(totals.credit)}
                    </td>

                    <td className="text-right font-bold">
                      {formatCurrency(
                        totals.debit - totals.credit
                      )}
                    </td>

                  </tr>

                </tfoot>

              </table>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}