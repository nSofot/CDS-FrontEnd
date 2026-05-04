import { useEffect, useState, useRef, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { FaRegFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle";

export default function MemberReceiptPage() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const reportRef = useRef();
  const [receiptNumber, setReceiptNumber] = useState("");

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "Receipt",
    trxDate: new Date().toISOString().split("T")[0],
    memberId: "",
    memberName: "",
    memberAddress: "",
    paymentMethod: "",
    accountId: "",
    accountName: "",
    description: "",
    amount: "",
  });

  const numberToWords = (num) => {
    if (!num) return "Zero";

    const a = [
      "",
      "One","Two","Three","Four","Five","Six","Seven","Eight","Nine","Ten",
      "Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen",
      "Seventeen","Eighteen","Nineteen",
    ];

    const b = [
      "", "", "Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"
    ];

    const convert = (n) => {
      if (n < 20) return a[n];
      if (n < 100)
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      if (n < 1000)
        return (
          a[Math.floor(n / 100)] +
          " Hundred " +
          (n % 100 ? convert(n % 100) : "")
        );
      if (n < 100000)
        return (
          convert(Math.floor(n / 1000)) +
          " Thousand " +
          (n % 1000 ? convert(n % 1000) : "")
        );
      if (n < 10000000)
        return (
          convert(Math.floor(n / 100000)) +
          " Lakh " +
          (n % 100000 ? convert(n % 100000) : "")
        );

      return (
        convert(Math.floor(n / 10000000)) +
        " Crore " +
        (n % 10000000 ? convert(n % 10000000) : "")
      );
    };

    return convert(Math.floor(num)) + " Rupees Only";
  };

  // ================= FETCH MEMBERS =================
  const fetchMembers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`
      );
      setMembers(res.data.data || res.data);   
    } catch {
      toast.error("Failed to load members");
    }
  };

  const fetchLedgers = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`
      );

      const data = res.data.data || res.data;

      // Only Cash & Bank (110,115)
      const filtered = data.filter(
        (item) =>
          item.headerAccountId === "110" ||
          item.headerAccountId === "115"
      );

      setLedgers(filtered);
    } catch {
      toast.error("Failed to load ledgers");
    }
  };

  useEffect(() => {
    fetchMembers();
    fetchLedgers();
  }, []);

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({
      ...form,
      [name]: name === "amount" ? Number(value) : value,
    });
  };

  const formatCurrency = (value) => {
    return Number(value || 0).toFixed(2);
  };
    
  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString();
  };
  
  const formatNumber = (value) =>
  `Rs. ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
  
  
  const pdfPage = {
    width: "760px",
    padding: "30px 40px",
    fontFamily: "Arial",
    fontSize: "12px",
    color: "#000",
    background: "#fff",
    boxSizing: "border-box",
  };

  const center = {
    textAlign: "center",
  };

  const twoCol = {
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

  const section = {
    marginTop: "20px",
  };

  const table = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "10px",
    pageBreakInside: "auto",
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

  /* ---------------- PDF DOWNLOAD ---------------- */
  const handleDownloadPDF = async () => {
    try {
      const element = reportRef.current;

      await html2pdf()
        .set({
          margin: 0.3,
          filename: `Receipt_${receiptNumber}.pdf`,
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
          pagebreak: {
            mode: ["avoid-all", "css", "legacy"],
          },
        })
        .from(element)
        .save();
    } catch (err) {
      console.error("PDF ERROR:", err);
      toast.error("PDF failed");
    }
  };


  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.referenceId || !form.trxDate || !form.memberId || !form.amount) {
      return toast.error("Please fill required fields");
    }

    if (form.paymentMethod === "Bank" && !form.bankName) {
      return toast.error("Enter bank name");
    }

    if (form.paymentMethod === "Cheque" && !form.chequeNo) {
      return toast.error("Enter cheque number");
    }

    try {
      setLoading(true);

      const amount = Number(form.amount || 0);
      
      const memberTrxPayload = {
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        trxType: form.trxType,
        memberId: form.memberId,
        memberName: form.memberName,
        description: `${form.accountName} - ${form.description}`,
        isCredit: true,
        amount: amount,
        dueAmount: 0,
      };

      // Save member transaction
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        memberTrxPayload
      );

      const savedTrxId = res.data.data.trxId || res.data.trxId;
      setReceiptNumber(savedTrxId);

      // Reduce member due
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member/${form.memberId}/due/subtract`,
        {
          amount: amount,
        }
      );


      // ================= 3. UPDATE LEDGER BALANCE =================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/add-balance`,
        {
          updates: [
            {
              accountId: form.accountId,
              amount: amount,
            },
          ],
        }
      );

      // ================= 4. SAVE LEDGER TRANSACTION =================
      const ledgerTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceId,
        trxDate: form.trxDate,
        transactionType: form.trxType,
        accountId: form.accountId,
        accountName: form.accountName,
        description: form.memberName + " - " + form.description,
        isCredit: false,
        trxAmount: amount,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerTrxPayload
      );      

      toast.success("Payment recorded successfully");

    } catch (err) {
      console.error(err);
      toast.error("Error saving payment");
    } finally {
      setIsSaved(true);
    }
  };

  // ================= UI =================
  return (
    <div className="sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-3 sm:p-6 rounded-xl shadow">
        <div className="flex sm:col justify-between items-center mb-6">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">
              Member Receipt Entry
            </h1>
            <h2 className="text-sm text-gray-600 mb-6">
              Record Cash, Bank Transfer and Cheque Receipts from Members
            </h2>
          </div>

          <div className="flex gap-3 no-print">
            <button
              onClick={handleDownloadPDF}
              disabled={isSaved === false}
              className="flex gap-2 items-center px-5 py-3 rounded-xl text-white"
              style={{
                backgroundColor: isSaved === false ? "#9ca3af" : "#ea580c",
              }}
            >
              <FaRegFilePdf size={20} />
              PDF
            </button>

            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
            >
              ← Back
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>

          {/* TOP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 mb-4">

            <input
              disabled = {isSaved}
              type="text"
              name="referenceId"
              placeholder="Reference ID"
              value={form.referenceId}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              disabled = {isSaved}
              type="date"
              name="trxDate"
              value={form.trxDate}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <select
              disabled = {isSaved}
              value={form.memberId}
              onChange={(e) => {
                const selected = members.find(
                  (m) => m.memberId === e.target.value
                );

                setForm({
                  ...form,
                  memberId: selected?.memberId || "",
                  memberName: selected?.nameInSinhala || selected?.firstName || "",
                  memberAddress: selected?.address || "",
                });
              }}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  {m.nameInSinhala || `${m.firstName} ${m.lastName}`}
                </option>
              ))}
            </select>

            {/* Ledger */}
            <select
              disabled = {isSaved}
              value={form.accountId}
              onChange={(e) => {
                const selected = ledgers.find(
                  (l) => l.accountId === e.target.value
                );

                setForm({
                  ...form,
                  accountId: selected?.accountId || "",
                  accountName: selected?.accountName || "",
                });
              }}
              className="border p-2 rounded"
              required
            >
              <option value="">Select receiving account</option>
              {ledgers.map((l) => (
                <option key={l.accountId} value={l.accountId}>
                  {l.accountName}
                </option>
              ))}
            </select>            

            <input
              disabled = {isSaved}
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              disabled = {isSaved}
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />
          </div>

          {/* TOTAL */}
          <div className="text-right font-bold text-lg mb-4">
            Amount: Rs. {Number(form.amount || 0).toFixed(2)}
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading || isSaved}
            className={`w-full sm:w-auto text-white px-6 py-2 rounded hover:bg-green-700 ${
              loading || isSaved ?  "bg-gray-400 cursor-not-allowed" : "bg-green-600"
            }`}
          >
            {loading && !isSaved
              ? "Saving..."
              : isSaved
              ? "Completed, Download PDF"
              : "Save Payment"}
          </button>

        </form>
      </div>

      {/* ================= PDF LAYOUT ================= */}
      {/* ⚠️ NO TAILWIND HERE */}
      <div style={{ display: "none" }}>

        <div ref={reportRef} style={{ pageBreakInside: "avoid" }}>
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
                fontSize: "16px",
                marginBottom: "25px",
              }}
            >
              PAYMENT RECEIPT
            </h2>

            {/* DETAILS BOX */}
            <div style={twoCol}>
              
              {/* LEFT */}
              <div style={colBox}>
                <p><b>Member ID:</b> {form.memberId || "N/A"}</p>
                <p><b>Name:</b> {form.memberName || "N/A"}</p>
                <p>
                  <b>Address:</b>{" "}
                  {form?.memberAddress
                    ? Object.values(form.memberAddress)
                        .filter(Boolean)
                        .join(", ")
                    : "N/A"}
                </p>
              </div>

              {/* RIGHT */}
              <div style={colBox}>
                <p><b>Receipt No:</b> {receiptNumber}</p>
                <p><b>Date:</b> {formatDate(form.trxDate)}</p>
                <p><b>Reference:</b> {form.referenceId}</p>
              </div>

            </div>


            {/* RECEIPT TEXT BLOCK */}
            <div style={{ fontSize: "13px", lineHeight: "1.8", marginTop: "25px" }}>

              <p>
                Received with thanks from <b>{form.memberName || "N/A"}</b>
              </p>

              <p>
                a sum of Rs.{" "}
                <b>
                  {numberToWords(Number(form.amount || 0))}
                </b>
              </p>
              
              <p style={{ marginTop: "10px" }}>
                Paid Amount:{" "}
                <b>
                  {Number(form.amount || 0).toFixed(2)}
                </b>
              </p>

              <p>
                Pay Mode: <b>{form.paymentMethod || "Cash"}</b>
              </p>

              <p>
                Description: <b>{form.description || "N/A"}</b>
              </p>

            </div>

            <hr style={{ marginTop: "30px", marginBottom: "10px", borderColor: "#ddd" }} />
            {/* FOOTER */}
            <div
              style={{
                marginTop: "5px",
                textAlign: "center",
                fontSize: "11px",
                color: "#555",
              }}
            >
              This is a system generated receipt. No signature is required.
            </div>

          </div>
        </div>
      </div>

    </div>
  );
}