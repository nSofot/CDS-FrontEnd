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
    customers: "bg-[#edf6ff] text-[#175cd3]",
    suppliers: "bg-[#eef8f0] text-[#276b3b]",
    inventory: "bg-[#f0f2ff] text-[#4245a8]",
    finance: "bg-[#fff7e8] text-[#9a5b13]",
  };

  const iconColors = {
    customers: "bg-[#edf6ff] text-[#175cd3]",
    suppliers: "bg-[#eef8f0] text-[#276b3b]",
    inventory: "bg-[#f0f2ff] text-[#4245a8]",
    finance: "bg-[#fff7e8] text-[#9a5b13]",
  };

  const reports = {
    customers: [
      { title: "Customer Ledger", desc: "View customer transaction history", path: "/control/customer-ledger", icon: <FaUsers /> },
      { title: "Customer Outstanding Report", desc: "All outstanding invoices for customers", path: "/control/customer-outstanding-report", icon: <FaFileInvoice /> },
      { title: "Customer Outstanding Transactions", desc: "All outstanding transactions for customers", path: "/control/customer-outstanding-transaction", icon: <TbReportAnalytics /> },
      { title: "Customer Receipts", desc: "All customer payments received", path: "/control/customer-receipts-report", icon: <FaReceipt /> },
    ],
    suppliers: [
      { title: "Supplier Ledger", desc: "View supplier transaction history", path: "/control/reports/supplier-ledger", icon: <FaTruck /> },
      { title: "Supplier Outstanding Report", desc: "All outstanding invoices for suppliers", path: "/control/reports/supplier-outstanding-report", icon: <FaFileInvoice /> },
      { title: "Supplier Payments", desc: "Payments made to suppliers", path: "/control/reports/supplier-payments", icon: <FaMoneyCheckAlt /> },
    ],
    inventory: [
      { title: "Substrate Bag Sales", desc: "Bag sales performance report", path: "/control/reports/substrate-bag-sales", icon: <FaBoxes /> },
      { title: "Material Sales", desc: "Raw material sales summary", path: "/control/reports/material-sales", icon: <FaBoxes /> },
      { title: "Purchase Invoice", desc: "All purchase invoices (GRN)", path: "/control/reports/purchase-invoice", icon: <FaFileInvoice /> },
      { title: "Other Invoice", desc: "Miscellaneous invoices", path: "/control/reports/other-invoice", icon: <FaFileInvoice /> },
    ],
    finance: [
      { title: "Cash Book", desc: "All cash transactions", path: "/control/reports/cash-book", icon: <FaMoneyCheckAlt /> },
      { title: "Profit & Loss", desc: "Financial performance report", path: "/control/reports/profit-loss", icon: <TbReportAnalytics /> },
      { title: "Trial Balance", desc: "Accounting trial balance report", path: "/control/reports/trial-balance", icon: <FaBalanceScale /> },
      { title: "Balance Sheet", desc: "Financial position statement", path: "/control/reports/balance-sheet", icon: <FaBalanceScale /> },
      { title: "Other Receipts", desc: "Non-customer receipts", path: "/control/reports/other-receipts", icon: <FaReceipt /> },
      { title: "Other Payments", desc: "Miscellaneous payments", path: "/control/reports/other-payments", icon: <FaMoneyCheckAlt /> },
      { title: "Inward Cheques", desc: "Received cheque tracking", path: "/control/reports/inward-cheques", icon: <FaCreditCard /> },
      { title: "Outward Cheques", desc: "Issued cheque tracking", path: "/control/reports/outward-cheques", icon: <FaCreditCard /> },
      { title: "Card Vouchers", desc: "Credit/Debit card transactions", path: "/control/reports/card-vouchers", icon: <FaCreditCard /> },
    ],
  };

  const filteredReports = useMemo(() => {
    const searchTerm = search.trim().toLowerCase();
    const allReports = Object.entries(reports).flatMap(([category, items]) =>
      items.map((item) => ({ ...item, category }))
    );

    if (!searchTerm) {
      return allReports.filter((report) => report.category === activeTab);
    }

    return allReports.filter(
      (report) =>
        report.title.toLowerCase().includes(searchTerm) ||
        report.desc.toLowerCase().includes(searchTerm)
    );
  }, [activeTab, search]);

  const tabs = [
    { key: "customers", label: "Customers", icon: <FaUsers /> },
    { key: "suppliers", label: "Suppliers", icon: <FaTruck /> },
    { key: "inventory", label: "Inventory", icon: <FaBoxes /> },
    { key: "finance", label: "Finance", icon: <FaMoneyCheckAlt /> },
  ];

  return (
    <div className="erp-page">
      <div className="erp-page-shell">
        <div className="erp-page-header">
          <div>
            <p className="erp-eyebrow">Reporting</p>
            <h1 className="erp-title">Reports Dashboard</h1>
            <p className="erp-subtitle">Finance and operations reporting for the production society.</p>
          </div>
          <div className="erp-surface px-4 py-3 text-sm font-bold text-[#35523c]">
            {filteredReports.length} reports
          </div>
        </div>

        <section className="erp-panel mb-6 p-4">
          <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Search reports..."
                className="erp-input pr-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <FaSearch className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#7b8b80]" />
            </div>

            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={
                    "erp-btn min-h-10 border " +
                    (activeTab === tab.key
                      ? "border-[#2f7d46] bg-[#2f7d46] text-white shadow-sm"
                      : "border-[#dfe7df] bg-white text-[#405547] hover:bg-[#eef8f0]")
                  }
                >
                  {tab.icon}
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredReports.length === 0 ? (
            <div className="erp-panel col-span-full py-14 text-center text-[#627069]">No reports found</div>
          ) : (
            filteredReports.map((report, index) => (
              <button
                type="button"
                key={index}
                onClick={() => navigate(report.path)}
                className="erp-panel group p-5 text-left transition duration-200 hover:-translate-y-1 hover:border-[#a9c6af] hover:shadow-xl"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className={"flex h-12 w-12 items-center justify-center rounded-lg text-xl " + iconColors[report.category]}>
                    {report.icon}
                  </div>
                  <span className={"erp-chip capitalize " + categoryColors[report.category]}>{report.category}</span>
                </div>
                <h2 className="text-base font-extrabold text-[#172017] transition group-hover:text-[#2f7d46]">{report.title}</h2>
                <p className="mt-2 text-sm leading-6 text-[#627069]">{report.desc}</p>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
