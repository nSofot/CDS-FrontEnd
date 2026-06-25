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

  const categoryColors = {
    members: "bg-blue-100 text-blue-700",
    suppliers: "bg-green-100 text-green-700",
    inventory: "bg-purple-100 text-purple-700",
    finance: "bg-orange-100 text-orange-700",
  };

  const iconColors = {
    members: "bg-blue-100 text-blue-600",
    suppliers: "bg-green-100 text-green-600",
    inventory: "bg-purple-100 text-purple-600",
    finance: "bg-orange-100 text-orange-600",
  };

  /* ───────── REPORT CONFIG (CLEAN ERP STRUCTURE) ───────── */
  const reports = {
    members: [
      {
        title: "Customer Ledger",
        desc: "View customer transaction history",
        path: "/control/customer-ledger",
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
  const searchTerm = search.trim().toLowerCase();

  const allReports = Object.entries(reports).flatMap(
    ([category, items]) =>
      items.map((item) => ({
        ...item,
        category,
      }))
  );

  if (!searchTerm) {
    return allReports.filter(
      (report) => report.category === activeTab
    );
  }

  return allReports.filter(
    (report) =>
      report.title.toLowerCase().includes(searchTerm) ||
      report.desc.toLowerCase().includes(searchTerm)
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
      <div className="bg-white p-4 rounded-xl shadow-sm mb-6 grid  gap-3">

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
              className="cursor-pointer bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition border hover:border-orange-300"
            >
              <div className="flex items-start justify-between mb-3">
                <div
                  className={`
                    w-12 h-12 rounded-xl flex items-center justify-center text-xl
                    ${iconColors[report.category]}
                  `}
                >
                  {report.icon}
                </div>

                <span
                  className={`
                    text-xs
                    px-3
                    py-1
                    rounded-full
                    font-medium
                    capitalize
                    whitespace-nowrap
                    ${categoryColors[report.category]}
                  `}
                >
                  {report.category}
                </span>
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

{/*
  const allReports = useMemo(() => {
    return Object.entries(reports).flatMap(([category, items]) =>
      items.map((item) => ({
        ...item,
        category,
      }))
    );
  }, []);

  const filteredReports = useMemo(() => {
    return allReports.filter(
      (report) =>
        report.title.toLowerCase().includes(search.toLowerCase()) ||
        report.desc.toLowerCase().includes(search.toLowerCase()) ||
        report.category.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, allReports]);

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

  
      <div className="mb-8"
        <h1 className="text-3xl font-bold text-gray-800">
          Reports Dashboard
        </h1>

        <p className="text-gray-500 mt-2">
          Browse and generate business reports
        </p>
      </div>


      <div className="bg-white rounded-2xl shadow-sm border p-5 mb-8">

        <div className="flex items-center gap-3 border rounded-xl px-4 h-12">

          <FaSearch className="text-orange-500" />

          <input
            type="text"
            placeholder="Search reports, categories..."
            className="flex-1 outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

      </div>


      <div className="mb-6">
        <span className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-orange-600">
            {filteredReports.length}
          </span>{" "}
          reports
        </span>
      </div>


      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">

        {filteredReports.length === 0 ? (
          <div className="col-span-full py-20 text-center">

            <FaSearch className="mx-auto text-5xl text-gray-300 mb-4" />

            <p className="text-gray-500 text-lg">
              No reports found
            </p>

          </div>
        ) : (
          filteredReports.map((report, index) => (
            <div
              key={index}
              onClick={() => navigate(report.path)}
              className="
                cursor-pointer
                bg-white
                rounded-2xl
                border
                shadow-sm
                p-5
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                group
              "
            >

              <div className="flex justify-between items-start mb-4">

                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    bg-orange-100
                    text-orange-600
                    flex
                    items-center
                    justify-center
                    text-xl
                  "
                >
                  {report.icon}
                </div>

                <span
                  className={`
                    text-xs
                    px-3
                    py-1
                    rounded-full
                    font-medium
                    capitalize
                    ${categoryColors[report.category]}
                  `}
                >
                  {report.category}
                </span>

              </div>

              <h2 className="font-semibold text-gray-800 mb-2 group-hover:text-orange-600 transition-colors">
                {report.title}
              </h2>

              <p className="text-sm text-gray-500 leading-relaxed">
                {report.desc}
              </p>

            </div>
          ))
        )}

      </div>
    </div>
  );
}
```
*/}