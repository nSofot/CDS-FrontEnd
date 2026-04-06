import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner.jsx";
import { m } from "framer-motion";

export default function ReceiptEntryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [receiptType, setReceiptType] = useState("");
  const [description, setDescription] = useState("");
  const [receivedAccount, setReceivedAccount] = useState("");
  const [memberId, setMemberId] = useState("");
  const [member, setMember] = useState(null);
  const [trxDate, setTrxDate] = useState(new Date().toISOString().split("T")[0]);
  const [receivedFrom, setReceivedFrom] = useState(""); 
  const [totalAmount, setTotalAmount] = useState(0);
  const [amountInWords, setAmountInWords] = useState("");
  const [receiptNo, setReceiptNo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [receiptNoOk, setReceiptNoOk] = useState(false);

  const navigate = useNavigate();

  const accountMap = {
    cash: "325-001",
    saving: "325-002",
    current: "325-003"
  };


  // Convert number to words function
  const numberToWords = (num) => {
    const a = [
      "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen",
      "Seventeen", "Eighteen", "Nineteen"
    ];
    const b = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"
    ];

    const convert = (n) => {
      if (n < 20) return a[n];
      if (n < 100) return b[Math.floor(n / 10)] + " " + a[n % 10];
      if (n < 1000) return a[Math.floor(n / 100)] + " Hundred " + convert(n % 100);
      if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand " + convert(n % 1000);
      if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh " + convert(n % 100000);
      return convert(Math.floor(n / 10000000)) + " Crore " + convert(n % 10000000);
    };

    return num === 0 ? "" : convert(num).trim() + " Rupees Only";
  };

  useEffect(() => {
    if (!totalAmount || isNaN(totalAmount)) setAmountInWords("");
    else setAmountInWords(numberToWords(parseInt(totalAmount)));
  }, [totalAmount]);


  // 🔍 Search Member
  const findMember = async (id) => {
    if (!id || id === "0" || id.length < 4) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/member/${id}`);
      if (res.data) {
        setMember(res.data);
        setTotalAmount("");
        setReceiptNo("");
        setDescription("");
        setReceivedAccount
        setReceivedFrom(`${res.data.title}${res.data.firstName} ${res.data.lastName}`)
      } else {
        setMember(null);
        toast.error("🚫 Invalid member ID");
      }
    } catch (err) {
      setMember(null);
      toast.error(err.response?.data?.message || "🚫 Invalid member ID");
    } finally {
      setIsLoading(false);
    }
  };

  // 🔄 Auto-search member when 3 digits entered
  useEffect(() => {
    if (memberId && memberId.length === 4) findMember(memberId);
  }, [memberId]);

  // ✅ Validate receipt number
  const checkReceiptExists = async (no) => {
    try {
      const trxType = "receipt";
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/book-reference/trxbook/${no}/${trxType}`
      );
      if (res.data.exists) {
        setError("🚨 Receipt number already exists!");
        setReceiptNoOk(false);
      } else {
        setError("");
        setReceiptNoOk(true);
      }
    } catch {
      setError("⚠️ Error validating receipt number.");
    }
  };

  // 💾 Save Membership Receipt
  const handleSave = async () => {
    setIsSubmitting(true);

    if (receiptType === "") {
      toast.error("Please select a receipt type.");
      setIsSubmitting(false);
      return;
    }

    if (receiptType === "membership") {
      if (!memberId || memberId.length < 4) {
        toast.error("🚫 Please submit a valid member ID");
        setIsSubmitting(false);
        return;
      }
    }

    if (receivedFrom.trim() === "" && receiptType !== "membership") {
      toast.error("Please enter the payer's name or source.");
      setIsSubmitting(false);
      return;
    }

    if (!receiptNo || !/^\d{6}$/.test(receiptNo) || receiptNo === "000000" || receiptNoOk === false) {
      toast.error("Please enter a valid receipt number.");
      setIsSubmitting(false);
      return;
    }

    if (!trxDate) {
      toast.error("Please enter a valid date.");
      setIsSubmitting(false);
      return;
    }

    if (!description || description.trim() === "") {
      toast.error("Please enter a description for the payment.");
      setIsSubmitting(false);
      return;
    }

    const amt = Number(totalAmount);
    if (isNaN(amt)) throw new Error(`Invalid amount for accountId ${accountId}`);

    if (totalAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      setIsSubmitting(false);
      return;
    }

    const lgAcIdDr = accountMap[receivedAccount];
    if (!lgAcIdDr) return toast.error("Invalid account selected");

    try {

      // 1️⃣ update ledger account balance
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/add-balance`, {
            updates: [{ accountId: lgAcIdDr, amount: Number(totalAmount) || 0 }],
        });



      // 2️⃣ create ledger transaction
      const accTrxPayload = {
        memberId: memberId || null,
        memberName: receivedFrom || null,
        receivedFrom: receivedFrom || null,
        trxBookNo: String(receiptNo),
        trxDate: new Date(trxDate).toISOString(),
        transactionType: "receipt",
        transactionCategory: receiptType,
        accountId: lgAcIdDr,
        description: description.trim(),
        isCredit: false,
        trxAmount: parseFloat(totalAmount),
      };

      const trxRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        accTrxPayload
      );

      const newRefferenceNo = trxRes.data?.transaction?.trxId;   // <- Now valid


      // 3️⃣ save in book references
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/book-reference`, {
        transactionType: "receipt",
        trxBookNo: String(receiptNo),
        trxReference: String(newRefferenceNo),
      });

      toast.success("🎉 Receipt saved successfully!");
      setIsSubmitted(true);

    } catch (err) {
      toast.error("❌ Failed to save the receipt.");
      console.log(err)
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="max-w-6xl mx-auto w-full px-3 py-6 flex flex-col space-y-6">

      {/* Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h1 className="text-xl md:text-3xl font-bold text-green-700 flex items-center gap-2">🧾 Receipt Entry</h1>
        <p className="text-gray-600 text-sm md:text-base">
          Manage and post <span className="font-semibold">all types of received payments</span>.
        </p>
      </div>

      {/* Receipt Type */}
      <div className="bg-white shadow-md rounded-xl border-l-4 border-green-700 p-4">
        <label className="text-sm font-semibold text-green-700">Receipt Type</label>
        <select
          disabled={isSubmitting || isSubmitted}
          value={receiptType}
          onChange={(e) => {
            setReceiptType(e.target.value);
            setMember(null);
            setMemberId("");
            setReceivedFrom("");
          }}
          className="w-full p-3 border rounded-lg mt-1 focus:ring-2 border-green-300 text-gray-700"
        >
          <option value="">Select Type</option>
          <option value="membership">Membership Fee</option>
          <option value="welfare">Welfare Fund</option>
          <option value="donation">Donation</option>
          <option value="events">Events</option>
          <option value="interest">Bank Interest</option>
          <option value="others">Others</option>
        </select>
      </div>

      {/* ================= MEMBERSHIP SECTION ================= */}
      {receiptType === "membership" && (
        <div className="bg-white shadow-md rounded-xl border-l-4 border-blue-700 p-4 space-y-4">

          <label className="text-sm font-semibold text-blue-700">Member ID</label>
          <input
            disabled={isSubmitting || isSubmitted}
            type="text"
            value={memberId}
            maxLength={4}
            placeholder="0000"
            onChange={(e) => setMemberId(e.target.value.replace(/\D/g, ""))}
            onBlur={() => memberId && findMember(memberId)}
            className="w-full text-center p-3 border border-blue-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-400"
          />

          {/* If member found → show info */}
          {member && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div>
                <label className="block text-sm font-medium text-blue-700">Name</label>
                <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg text-center font-medium mt-1">
                  {member.title} {member.firstName} {member.lastName}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-700">Due Membership Fee</label>
                <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg text-center font-medium mt-1">
                  {member.membership || 0}
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ================= NON MEMBERSHIP RECEIPTS ================= */}
      {receiptType !== "membership" && receiptType !== "" && (
        <div className="bg-white shadow-md rounded-xl border-l-4 border-purple-700 p-4">
          <label className="text-sm font-semibold text-purple-700">Received From</label>
          <input
            disabled={isSubmitting || isSubmitted}
            type="text"
            placeholder="Enter payer name or source"
            value={receivedFrom}
            onChange={(e) => setReceivedFrom(e.target.value)}
            className="w-full text-center p-3 border border-purple-300 rounded-lg mt-1 focus:ring-2 focus:ring-purple-400"
          />
        </div>
      )}

      {/* ================= MAIN PAYMENT ENTRY FORM ================= */}
      {receiptType && (
        <div className="bg-white shadow-md rounded-xl border-l-4 border-orange-700 p-4 space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Receipt No */}
            <div>
              <label className="block text-sm font-medium mb-1">Receipt Number</label>
              <input
                disabled={isSubmitting || isSubmitted}
                type="text"
                value={receiptNo}
                maxLength={6}
                placeholder="000000"
                onChange={(e) => setReceiptNo(e.target.value.replace(/\D/g, ""))}
                onBlur={() => {
                  const padded = String(receiptNo).padStart(6, "0");
                  setReceiptNo(padded);
                  if (padded !== "000000") checkReceiptExists(padded);
                }}
                className={`w-full p-3 rounded-lg text-center border ${error ? "border-red-500" : "border-gray-600"}`}
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-medium mb-1">Payment Date</label>
              <input
                disabled={isSubmitting || isSubmitted}
                type="date"
                value={trxDate}
                onChange={(e) => setTrxDate(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-600 text-center"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                disabled={isSubmitting || isSubmitted}
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Payment purpose / note..."
                className="w-full p-3 rounded-lg border border-gray-600"
              />
            </div>

            {/* Amount */}
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                disabled={isSubmitting || isSubmitted}
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                placeholder="0.00"
                className="w-full p-3 rounded-lg border border-gray-600 text-center"
              />

              {/* Display amount in words */}
              {amountInWords && (
                <p className="text-xs text-green-700 font-medium mt-1 italic">
                  {amountInWords}
                </p>
              )}
            </div>


            {/* Account */}
            <div>
              <label className="block text-sm font-medium mb-1">Receive To Account</label>
              <select
                disabled={isSubmitting || isSubmitted}
                value={receivedAccount}
                onChange={(e) => setReceivedAccount(e.target.value)}
                className="w-full p-3 rounded-lg border border-gray-600"
              >
                <option value="">Select Account</option>
                <option value="cash">Cash in Hand</option>
                <option value="saving">Saving Account</option>
                <option value="current">Current Account</option>
              </select>
            </div>

          </div>
        </div>
      )}

      {/* ================= ACTION BUTTONS ================= */}
      <div className="flex flex-col md:flex-row gap-4">
        <button
          disabled={isSubmitting || isSubmitted}
          onClick={handleSave}
          className={`w-full md:w-auto md:px-10 h-12 rounded-lg font-semibold text-white
            ${isSubmitting || isSubmitted ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
          `}
        >
          {isSubmitting ? "Processing..." : isSubmitted ? "Submitted" : "Submit Receipt"}
        </button>


        <button
          onClick={() => navigate("/control")}
          className="w-full md:w-auto px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
        >
          ← Go Back
        </button>
      </div>

    </div>
  );

}
