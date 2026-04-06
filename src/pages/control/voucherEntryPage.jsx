import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import LoadingSpinner from "../../components/loadingSpinner.jsx";
import { m } from "framer-motion";
import { t } from "i18next";

export default function VoucherEntryPage() {
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


  // ✅ Validate receipt number
  const checkReceiptExists = async (no) => {
    try {
      const trxType = "voucher";
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/book-reference/trxbook/${no}/${trxType}`
      );
      if (res.data.exists) {
        setError("🚨 Voucher number already exists!");
        setReceiptNoOk(false);
      } else {
        setError("");
        setReceiptNoOk(true);
      }
    } catch {
      setError("⚠️ Error validating voucher number.");
    }
  };

  // 💾 Save Membership Receipt
  const handleSave = async () => {
    setIsSubmitting(true);

    if (receiptType === "") {
      toast.error("Please select a voucher type.");
      setIsSubmitting(false);
      return;
    }

    if (receivedFrom.trim() === "") {
      toast.error("Please enter the payee's name or source.");
      setIsSubmitting(false);
      return;
    }

    if (!receiptNo || !/^\d{6}$/.test(receiptNo) || receiptNo === "000000" || receiptNoOk === false) {
      toast.error("Please enter a valid voucher number.");
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

    // const amt = Number(totalAmount);
    // if (isNaN(amt)) throw new Error(`Invalid amount for accountId ${accountId}`);

    if (totalAmount <= 0) {
      toast.error("Please enter a valid amount greater than zero.");
      setIsSubmitting(false);
      return;
    }

    const lgAcIdDr = accountMap[receivedAccount];
    if (!lgAcIdDr) {
      toast.error("Invalid account selected");
      setIsSubmitting(false);
      return 
    }
    
    try {

      // 1️⃣ update ledger account balance
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/subtract-balance`, {
            updates: [{ accountId: lgAcIdDr, amount: Number(totalAmount) || 0 }],
        });


      // 2️⃣ create ledger transaction
      const accTrxPayload = {
        memberId: memberId || null,
        memberName: receivedFrom || null,
        receivedFrom: receivedFrom || null,
        trxBookNo: String(receiptNo),
        trxDate: new Date(trxDate).toISOString(),
        transactionType: "voucher",
        transactionCategory: receiptType,
        accountId: lgAcIdDr,
        description: description.trim(),
        isCredit: true,
        trxAmount: parseFloat(totalAmount),
      };

      const trxRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        accTrxPayload
      );

      const newRefferenceNo = trxRes.data?.transaction?.trxId;   // <- Now valid


      // 3️⃣ save in book references
      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/book-reference`, {
        transactionType: "voucher",
        trxBookNo: String(receiptNo),
        trxReference: String(newRefferenceNo),
      });

      toast.success("🎉 Voucher saved successfully!");
      setIsSubmitted(true);

    } catch (err) {
      toast.error("❌ Failed to save the voucher.");
      console.log(err)
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="max-w-5xl w-full mx-auto p-4 md:p-6 space-y-6">

      {/* Page Header */}
      <div className="bg-green-600 text-white p-5 rounded-xl shadow-md">
        <h1 className="text-2xl md:text-3xl font-bold flex gap-2 items-center">🧾 Payment Voucher Entry</h1>
        <p className="text-sm opacity-90">Issue and manage outgoing payments smoothly.</p>
      </div>

      {/* Voucher Type */}
      <div className="bg-white p-5 rounded-xl shadow border-l-4 border-green-600 space-y-2">
        <h2 className="font-semibold text-gray-700 text-base">Voucher Type</h2>
        <select
          disabled={isSubmitting || isSubmitted}
          value={receiptType}
          onChange={(e)=>{ setReceiptType(e.target.value); setMember(null); setMemberId(""); setReceivedFrom(""); }}
          className="w-full p-3 rounded-lg border text-gray-700 border-gray-300 focus:ring-2 focus:ring-green-500"
        >
          <option value="">Select Type</option>
          <option value="welfare">Welfare Fund</option>
          <option value="printing & stationery">Printing & Stationery</option>
          <option value="food & beverages">Food & Beverages</option>
          <option value="traveling & transport">Traveling & Transport</option>
          <option value="membership">Events</option>
          <option value="others">Others</option>
        </select>
      </div>

      {/* Paying To */}
      <div className="bg-white p-5 rounded-xl shadow border-l-4 border-purple-600 space-y-2">
        <h2 className="font-semibold text-purple-700 text-base">Paying To</h2>
        <input
          disabled={isSubmitting || isSubmitted}
          value={receivedFrom}
          onChange={(e)=>setReceivedFrom(e.target.value)}
          placeholder="Receiver / Supplier Name"
          className="w-full p-3 rounded-lg border text-center border-purple-300 focus:ring-2 focus:ring-purple-400"
        />
      </div>

      {/* Main Form */}
      <div className="bg-white p-5 rounded-xl shadow border-l-4 border-orange-600 space-y-5">

        <h2 className="font-semibold text-gray-700 text-lg">Payment Details</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Voucher No */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Voucher Number</label>
            <input
              disabled={isSubmitting || isSubmitted}
              value={receiptNo}
              maxLength={6}
              placeholder="000000"
              onChange={(e)=>setReceiptNo(e.target.value.replace(/\D/g,""))}
              onBlur={()=>{
                const padded=String(receiptNo).padStart(6,"0");
                setReceiptNo(padded);
                if(padded!=="000000") checkReceiptExists(padded);
              }}
              className={`w-full p-3 rounded-lg text-center tracking-widest font-semibold border 
                ${error ? "border-red-500 ring-2 ring-red-300" : "border-gray-400 focus:ring-2 focus:ring-green-500"}
              `}
            />
            {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
          </div>

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Payment Date</label>
            <input
              disabled={isSubmitting || isSubmitted}
              type="date"
              value={trxDate}
              onChange={(e)=>setTrxDate(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-400 text-center focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-600 mb-1">Description</label>
            <input
              disabled={isSubmitting || isSubmitted}
              value={description}
              onChange={(e)=>setDescription(e.target.value)}
              placeholder="Purpose / Note..."
              className="w-full p-3 rounded-lg border border-gray-400 focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Amount</label>
            <input
              disabled={isSubmitting || isSubmitted}
              type="number"
              value={totalAmount}
              onChange={(e)=>setTotalAmount(e.target.value)}
              placeholder="0.00"
              className="w-full p-3 rounded-lg border text-center font-semibold border-gray-400 focus:ring-2 focus:ring-green-500"
            />
            {amountInWords && <p className="text-xs text-green-700 italic mt-1">{amountInWords}</p>}
          </div>

          {/* Account */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">Issue From Account</label>
            <select
              disabled={isSubmitting||isSubmitted}
              value={receivedAccount}
              onChange={(e)=>setReceivedAccount(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-400 focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select Account</option>
              <option value="cash">Cash in Hand</option>
              <option value="saving">Saving Account</option>
              <option value="current">Current Account</option>
            </select>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="sticky bottom-0 bg-white p-4 rounded-lg shadow-md flex flex-col md:flex-row gap-4">

        <button
          disabled={isSubmitting||isSubmitted}
          onClick={handleSave}
          className={`w-full md:w-auto px-10 h-12 rounded-lg font-semibold text-white transition 
            ${isSubmitting||isSubmitted ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"}
          `}
        >
          {isSubmitting ? "Processing..." : isSubmitted ? "Submitted" : "Submit Voucher"}
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