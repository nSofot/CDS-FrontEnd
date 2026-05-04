import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MemberReceiptPage() {
  const [members, setMembers] = useState([]);
  const [ledgers, setLedgers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "Receipt",
    trxDate: "",
    memberId: "",
    memberName: "",
    paymentMethod: "",
    accountId: "",
    accountName: "",
    description: "",
    amount: "",
  });

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

      const savedTrxId = res.data.data || res.data;

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

      // RESET
      setForm({
        referenceId: "",
        trxType: "Receipt",
        trxDate: "",
        memberId: "",
        memberName: "",
        paymentMethod: "",
        description: "",
        amount: "",
        bankName: "",
        chequeNo: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Error saving payment");
    } finally {
      setLoading(false);
    }
  };

  // ================= UI =================
  return (
    <div className="sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-3 sm:p-6 rounded-xl shadow">

        <h1 className="text-xl sm:text-2xl font-bold">
          Member Receipt Entry
        </h1>
        <h2 className="text-sm text-gray-600 mb-6">
          Record Cash, Bank Transfer and Cheque Receipts from Members
        </h2>

        <form onSubmit={handleSubmit}>

          {/* TOP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-3 mb-4">

            <input
              type="text"
              name="referenceId"
              placeholder="Reference ID"
              value={form.referenceId}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
              type="date"
              name="trxDate"
              value={form.trxDate}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <select
              value={form.memberId}
              onChange={(e) => {
                const selected = members.find(
                  (m) => m.memberId === e.target.value
                );

                setForm({
                  ...form,
                  memberId: selected?.memberId || "",
                  memberName: selected?.nameInSinhala || selected?.firstName || "",
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
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded"
              required
            />

            <input
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
            disabled={loading}
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
          >
            {loading ? "Saving..." : "Save Payment"}
          </button>

        </form>
      </div>
    </div>
  );
}