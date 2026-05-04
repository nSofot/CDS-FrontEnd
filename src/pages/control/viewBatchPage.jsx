import { useEffect, useState, Fragment, useMemo, useRef } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";
import { FaRegFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle";

export default function ViewBatchPage() {
  const { batchNo } = useParams();
  const navigate = useNavigate();
  const reportRef = useRef();

  const [batch, setBatch] = useState(null);
  const [issueInfo, setIssueInfo] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  /* ---------------- FETCH DATA ---------------- */

  const fetchBatch = async () => {
    try {
      setLoading(true);

      const [batchRes, infoRes, vendorRes] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/batch/${batchNo}`
        ),

        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/stock-issue-details/issue-reference/${batchNo}`
        ),

        axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/vendor`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        ),
      ]);

      setBatch(batchRes.data || null);
      setIssueInfo(infoRes.data || null);
      setVendors(vendorRes.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchNo) {
      fetchBatch();
    }
  }, [batchNo]);

  /* ---------------- MEMO MAPS ---------------- */

  const issueMap = useMemo(() => {
    const map = {};

    issueInfo?.items?.forEach((item) => {
      map[item.stockId] = item;
    });

    return map;
  }, [issueInfo]);

  const vendorMap = useMemo(() => {
    const map = {};

    vendors.forEach((vendor) => {
      map[vendor.vendorId] = vendor.vendorName;
    });

    return map;
  }, [vendors]);

  /* ---------------- HELPERS ---------------- */

  const formatCurrency = (value) => {
    return Number(value || 0).toFixed(2);
  };

  const formatNumber = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };

  const threeCol = {
    display: "flex",
    justifyContent: "space-between",
    gap: "15px",
    marginTop: "10px",
  };

  const colBox = {
    width: "32%",
    border: "1px solid #ddd",
    padding: "10px",
    borderRadius: "6px",
  };

  const sectionBold = {
    fontWeight: "bold",
    fontSize: "14px",
    marginBottom: "8px",
  };

  /* ---------------- PDF DOWNLOAD ---------------- */

  const handleDownloadPDF = async () => {
    try {
      const element = reportRef.current;

      await html2pdf().set({
        margin: 0.3,
        filename: `Batch_${batch.batchNo}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "in",
          format: "a4",
          orientation: "portrait",
        },
      }).from(element).save();

    } catch (err) {
      console.error("PDF ERROR:", err);
      toast.error("PDF failed");
    }
  };


  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading batch details...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-6 text-center text-red-500">
        Batch not found
      </div>
    );
  }

  /* ---------------- UI ---------------- */

  return (
    <div
      ref={reportRef}
      className="p-6 min-h-screen"
      style={{
        backgroundColor: "#f9fafb",
        color: "#000000",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Batch Details
            </h1>

            <p className="text-sm text-gray-500">
              Complete overview of batch production, materials usage,
              and financial summary of batch {batch.batchNo}
            </p>
          </div>

          <div className="flex gap-3 no-print">
            <button
              onClick={handleDownloadPDF}
              className="flex gap-2 items-center px-5 py-3 rounded-xl text-white"
              style={{ backgroundColor: "#ea580c" }}
            >
              <FaRegFilePdf size={20} />
              PDF
            </button>

            <button
              onClick={() => navigate("/batch-list")}
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white"
              style={{ backgroundColor: "#000000" }}
            >
              <ArrowLeft size={20} />
              Back
            </button>
          </div>
        </div>

        {/* TOP CARDS */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {/* Batch Information */}

          <div
            className="rounded-2xl shadow-sm p-6"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 className="text-lg font-semibold mb-4">
              Batch Information
            </h2>

            <div className="space-y-3 text-sm">
              <Row label="Batch No" value={batch.batchNo} />
              <Row
                label="Batch Date"
                value={formatDate(batch.batchDate)}
              />
              <Row
                label="Number of Bags"
                value={batch.numberOfBags}
              />
              <Row label="Status" value={batch.status} />
            </div>
          </div>

          {/* Lifecycle Dates */}

          <div
            className="rounded-2xl shadow-sm p-6"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 className="text-lg font-semibold mb-4">
              Batch Lifecycle Dates
            </h2>

            <div className="space-y-3 text-sm">
              <Row
                label="Sterilized Date"
                value={formatDate(batch.sterilizationDate)}
              />
              <Row
                label="Inoculation Date"
                value={formatDate(batch.inoculationDate)}
              />
              <Row
                label="Incubation Date"
                value={formatDate(batch.incubationDate)}
              />
              <Row
                label="Sold Date"
                value={formatDate(batch.soldDate)}
              />
            </div>
          </div>

          {/* Financial Summary */}

          <div
            className="rounded-2xl shadow-sm p-6"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <h2 className="text-lg font-semibold mb-4">
              Financial Summary
            </h2>

            <div className="space-y-3 text-sm">
              <Row
                label="Total Cost Value"
                value={`Rs. ${formatCurrency(batch.totalCostValue)}`}
              />

              <Row
                label="Total Job Value"
                value={`Rs. ${formatCurrency(batch.totalJobValue)}`}
              />

              <Row
                label="Cost Per Bag"
                value={`Rs. ${formatCurrency(
                  (batch.totalCostValue || 0) /
                    (batch.numberOfBags || 1)
                )}`}
              />

              <Row
                label="Price Per Bag"
                value={`Rs. ${formatCurrency(
                  (batch.totalJobValue || 0) /
                    (batch.numberOfBags || 1)
                )}`}
              />
            </div>
          </div>
        </div>

        {/* MATERIALS */}

        <div
          className="rounded-2xl shadow-sm p-6 mb-6"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 className="text-lg font-semibold mb-4">
            Materials Used
          </h2>

          {!batch.materials?.length ? (
            <p className="text-gray-500">
              No materials found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  style={{
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Material
                    </th>
                    <th className="px-4 py-3 text-left">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left">
                      UOM
                    </th>
                    <th className="px-4 py-3 text-left">
                      Cost
                    </th>
                    <th className="px-4 py-3 text-left">
                      Value
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {batch.materials.map((item, index) => {
                    const grn = issueMap[item.stockId];

                    return (
                      <Fragment
                        key={`material-${item.stockId || index}`}
                      >
                        <tr
                          style={{
                            borderTop:
                              "1px solid #e5e7eb",
                          }}
                        >
                          <td className="px-4 py-3 font-medium">
                            {item.stockName}
                          </td>

                          <td className="px-4 py-3">
                            {item.totalQty}
                          </td>

                          <td className="px-4 py-3">
                            {item.stockUOM || "-"}
                          </td>

                          <td className="px-4 py-3">
                            Rs.{" "}
                            {formatCurrency(
                              item.rowCostValue
                            )}
                          </td>

                          <td className="px-4 py-3">
                            Rs.{" "}
                            {formatCurrency(
                              item.rowTotalValue
                            )}
                          </td>
                        </tr>

                        {grn && (
                          <tr
                            style={{
                              backgroundColor:
                                "#f9fafb",
                            }}
                          >
                            <td
                              colSpan="5"
                              className="px-4 py-3 text-xs"
                            >
                              <div className="grid grid-cols-4 gap-4">
                                <InfoBlock
                                  title="GRN ID"
                                  value={grn.receivedTrxId}
                                />

                                <InfoBlock
                                  title="Received Date"
                                  value={formatDate(
                                    grn.receivedDate
                                  )}
                                />

                                <InfoBlock
                                  title="Vendor"
                                  value={
                                    vendorMap[
                                      grn.receivedVendorId
                                    ] ||
                                    grn.receivedVendorId
                                  }
                                />

                                <InfoBlock
                                  title="Issued Qty"
                                  value={
                                    grn.issuedQuantity
                                  }
                                />
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* OTHER EXPENSES */}

        <div
          className="rounded-2xl shadow-sm p-6"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2 className="text-lg font-semibold mb-4">
            Other Expenses
          </h2>

          {!batch.otherExpenses?.length ? (
            <p className="text-gray-500">
              No other expenses found
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead
                  style={{
                    backgroundColor: "#f3f4f6",
                  }}
                >
                  <tr>
                    <th className="px-4 py-3 text-left">
                      Expense
                    </th>
                    <th className="px-4 py-3 text-left">
                      Price
                    </th>
                    <th className="px-4 py-3 text-right">
                      Total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {batch.otherExpenses.map(
                    (item, index) => (
                      <tr
                        key={`expense-${
                          item.expenseId || index
                        }`}
                        style={{
                          borderTop:
                            "1px solid #e5e7eb",
                        }}
                      >
                        <td className="px-4 py-3 font-medium">
                          {item.name}
                        </td>

                        <td className="px-4 py-3">
                          {formatCurrency(
                            item.price
                          )}
                        </td>

                        <td className="px-4 py-3 text-right">
                          Rs.{" "}
                          {formatCurrency(
                            item.rowTotal
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* ================= PDF LAYOUT ================= */}
      {/* ⚠️ NO TAILWIND HERE */}
      <div style={{ display: "none" }}>
        <div ref={reportRef}>
          <div style={pdfPage}>

            <h2
              style={{
                ...center,
                fontWeight: "bold",
                fontSize: "14px",
              }}
            >
              Collective Development Society
            </h2>
            <h2
              style={{
                ...center,
                fontWeight: "normal",
                fontSize: "10px",
                marginBottom: "10px",
              }}
            >
              Malmaduwa, Kotiyakumbura. Tel: 022-2222222
            </h2>
            <h2
              style={{
                ...center,
                fontWeight: "bold",
                fontSize: "18px",
                marginBottom: "20px",
              }}
            >
              Batch Details Report
            </h2>

            <div style={threeCol}>
              
              {/* COLUMN 1 */}
              <div style={colBox}>
                <h3 style={sectionBold}>Batch Details</h3>

                <p><b>Batch No:</b> {batch.batchNo}</p>
                <p><b>Date:</b> {formatDate(batch.batchDate)}</p>
                <p><b>Bags:</b> {batch.numberOfBags}</p>
                <p><b>Status:</b> {batch.status}</p>
              </div>

              {/* COLUMN 2 */}
              <div style={colBox}>
                <h3 style={sectionBold}>Batch Life Cycle</h3>

                <p><b>Sterilized:</b> {formatDate(batch.sterilizationDate)}</p>
                <p><b>Inoculation:</b> {formatDate(batch.inoculationDate)}</p>
                <p><b>Incubation:</b> {formatDate(batch.incubationDate)}</p>
                <p><b>Sold:</b> {formatDate(batch.soldDate)}</p>
              </div>

              {/* COLUMN 3 */}
              <div style={colBox}>
                <h3 style={sectionBold}>Financial Summary</h3>

                <p><b>Total Cost:</b> {formatNumber(batch.totalCostValue)}</p>
                <p><b>Total Value:</b> {formatNumber(batch.totalJobValue)}</p>
                <p>
                  <b>Cost / Bag:</b>{" "}
                  {formatNumber(batch.totalCostValue / (batch.numberOfBags || 1))}
                </p>
                <p>
                  <b>Value / Bag:</b>{" "}
                  {formatNumber(batch.totalJobValue / (batch.numberOfBags || 1))}
                </p>
              </div>

            </div>


            <h3 style={section}>Materials</h3>

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Material</th>
                  <th style={th}>Qty</th>
                  <th style={th}>Cost</th>
                  <th style={th}>Value</th>
                </tr>
              </thead>

              <tbody>
                {batch.materials?.map((m, i) => {
                  const grn = issueMap[m.stockId];

                  return (
                    <Fragment key={i}>
                      <tr>
                        <td style={td}>{m.stockName}</td>
                        <td style={td}>{m.totalQty}</td>
                        <td style={td}>{formatCurrency(m.rowCostValue)}</td>
                        <td style={td}>{formatCurrency(m.rowTotalValue)}</td>
                      </tr>

                      {grn && (
                        <tr>
                          <td style={td} colSpan={4}>
                            GRN: {grn.receivedTrxId} | 
                            Date: {formatDate(grn.receivedDate)} |
                            Vendor:{" "} {vendorMap[grn.receivedVendorId]} |
                            Quantity: {grn.issuedQuantity}
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>

            <h3 style={section}>Other Expenses</h3>

            <table style={table}>
              <thead>
                <tr>
                  <th style={th}>Expense</th>
                  <th style={th}>Price</th>
                  <th style={th}>Total</th>
                </tr>
              </thead>

              <tbody>
                {batch.otherExpenses?.map((e, i) => (
                  <tr key={i}>
                    <td style={td}>{e.name}</td>
                    <td style={td}>{formatCurrency(e.price)}</td>
                    <td style={td}>{formatCurrency(e.rowTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

          </div>
        </div>
      </div>


    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */

function Row({ label, value }) {
  return (
    <div className="flex justify-between">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium">{value || "N/A"}</span>
    </div>
  );
}

function InfoBlock({ title, value }) {
  return (
    <div>
      <p className="font-semibold">{title}</p>
      <p>{value || "N/A"}</p>
    </div>
  );
}

/* ---------------- PDF STYLES ---------------- */

const pdfPage = {
  width: "760px",        // slightly reduced from 794px
  minHeight: "1123px",
  padding: "30px 40px",  // 👈 more RIGHT padding
  fontFamily: "Arial",
  fontSize: "12px",
  color: "#000",
  background: "#fff",
  boxSizing: "border-box", // 👈 IMPORTANT FIX
};

const center = {
  textAlign: "center",
};

const section = {
  marginTop: "20px",
};

const table = {
  width: "100%",
  borderCollapse: "collapse",
  marginTop: "10px",
};

const th = {
  border: "1px solid #ccc",
  padding: "6px",
  background: "#eee",
  textAlign: "left",
};

const td = {
  border: "1px solid #ccc",
  padding: "6px",
};