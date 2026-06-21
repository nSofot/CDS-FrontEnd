import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaTruck,
  FaBoxes,
  FaMoneyCheckAlt,
  FaSearch,
  FaFileInvoice,
  FaReceipt,
  FaBalanceScale,
  FaCreditCard,
} from "react-icons/fa";
import { TbReportAnalytics } from "react-icons/tb";

export default function ReportsPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("finance");
  const [search, setSearch] = useState("");

  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
  });

  /* ───────── REPORT CONFIG (CLEAN ERP STRUCTURE) ───────── */
  const reports = {
    members: [
      {
        title: "Customer Ledger",
        desc: "View customer transaction history",
        path: "/control/reports/customer-ledger",
        icon: <FaUsers />,
      },
      {
        title: "Customer Receipts",
        desc: "All customer payments received",
        path: "/control/reports/customer-receipts",
        icon: <FaReceipt />,
      },
    ],

    suppliers: [
      {
        title: "Supplier Ledger",
        desc: "Supplier transaction history",
        path: "/control/reports/supplier-ledger",
        icon: <FaTruck />,
      },
      {
        title: "Supplier Payments",
        desc: "Payments made to suppliers",
        path: "/control/reports/supplier-payments",
        icon: <FaMoneyCheckAlt />,
      },
    ],

    inventory: [
      {
        title: "Substrate Bag Sales",
        desc: "Bag sales performance report",
        path: "/control/reports/substrate-bag-sales",
        icon: <FaBoxes />,
      },
      {
        title: "Material Sales",
        desc: "Raw material sales summary",
        path: "/control/reports/material-sales",
        icon: <FaBoxes />,
      },
      {
        title: "Purchase Invoice",
        desc: "All purchase invoices (GRN)",
        path: "/control/reports/purchase-invoice",
        icon: <FaFileInvoice />,
      },
      {
        title: "Other Invoice",
        desc: "Miscellaneous invoices",
        path: "/control/reports/other-invoice",
        icon: <FaFileInvoice />,
      },
    ],

    finance: [
      {
        title: "Cash Book",
        desc: "All cash transactions",
        path: "/control/reports/cash-book",
        icon: <FaMoneyCheckAlt />,
      },
      {
        title: "Profit & Loss",
        desc: "Financial performance report",
        path: "/control/reports/profit-loss",
        icon: <TbReportAnalytics />,
      },
      {
        title: "Trial Balance",
        desc: "Accounting trial balance report",
        path: "/control/reports/trial-balance",
        icon: <FaBalanceScale />,
      },
      {
        title: "Balance Sheet",
        desc: "Financial position statement",
        path: "/control/reports/balance-sheet",
        icon: <FaBalanceScale />,
      },
      {
        title: "Other Receipts",
        desc: "Non-customer receipts",
        path: "/control/reports/other-receipts",
        icon: <FaReceipt />,
      },
      {
        title: "Other Payments",
        desc: "Miscellaneous payments",
        path: "/control/reports/other-payments",
        icon: <FaMoneyCheckAlt />,
      },
      {
        title: "Inward Cheques",
        desc: "Received cheque tracking",
        path: "/control/reports/inward-cheques",
        icon: <FaCreditCard />,
      },
      {
        title: "Outward Cheques",
        desc: "Issued cheque tracking",
        path: "/control/reports/outward-cheques",
        icon: <FaCreditCard />,
      },
      {
        title: "Card Vouchers",
        desc: "Credit/Debit card transactions",
        path: "/control/reports/card-vouchers",
        icon: <FaCreditCard />,
      },
    ],
  };

  /* ───────── FILTER LOGIC ───────── */
  const filteredReports = useMemo(() => {
    const list = reports[activeTab] || [];

    return list.filter((r) =>
      r.title.toLowerCase().includes(search.toLowerCase())
    );
  }, [activeTab, search]);

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-screen">

      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Reports Dashboard
        </h1>
        <p className="text-gray-500 mt-1">
          Finance & Operations reporting system
        </p>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid md:grid-cols-3 gap-3">

        {/* Search */}
        <div className="flex items-center gap-2 border rounded-lg px-3">
          <FaSearch className="text-gray-400" />
          <input
            type="text"
            placeholder="Search reports..."
            className="w-full h-10 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* From Date */}
        <input
          type="date"
          className="border rounded-lg px-3 h-10"
          value={filters.fromDate}
          onChange={(e) =>
            setFilters({ ...filters, fromDate: e.target.value })
          }
        />

        {/* To Date */}
        <input
          type="date"
          className="border rounded-lg px-3 h-10"
          value={filters.toDate}
          onChange={(e) =>
            setFilters({ ...filters, toDate: e.target.value })
          }
        />
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[
          { key: "members", label: "Members", icon: <FaUsers /> },
          { key: "suppliers", label: "Suppliers", icon: <FaTruck /> },
          { key: "inventory", label: "Inventory", icon: <FaBoxes /> },
          { key: "finance", label: "Finance", icon: <FaMoneyCheckAlt /> },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition ${
              activeTab === tab.key
                ? "bg-purple-600 text-white"
                : "bg-white hover:bg-gray-100"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* REPORT GRID */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredReports.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-10">
            No reports found
          </div>
        ) : (
          filteredReports.map((report, index) => (
            <div
              key={index}
              onClick={() => navigate(report.path)}
              className="cursor-pointer bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition border"
            >
              <div className="text-2xl text-purple-600 mb-3">
                {report.icon}
              </div>

              <h2 className="font-semibold text-gray-800">
                {report.title}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                {report.desc}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}