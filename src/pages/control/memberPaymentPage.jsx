import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function MemberPaymentPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    referenceId: "",
    trxType: "MemberPayment",
    trxDate: "",
    memberId: "",
    memberName: "",
    paymentMethod: "Cash", // Cash | Bank | Cheque
    description: "",
    amount: "",
    bankName: "",
    chequeNo: "",
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

  useEffect(() => {
    fetchMembers();
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

      // Save transaction
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        {
          referenceId: form.referenceId,
          trxDate: form.trxDate,
          trxType: form.trxType,
          memberId: form.memberId,
          description: `${form.paymentMethod} Payment - ${form.description}`,
          isCredit: true,
          amount: amount,
          dueAmount: -amount,
          paymentMethod: form.paymentMethod,
          bankName: form.bankName,
          chequeNo: form.chequeNo,
        }
      );

      // Reduce member due
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/member/${form.memberId}/add-due`,
        {
          amount: -amount,
        }
      );

      toast.success("Payment recorded successfully");

      // RESET
      setForm({
        referenceId: "",
        trxType: "MemberPayment",
        trxDate: "",
        memberId: "",
        memberName: "",
        paymentMethod: "Cash",
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
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-xl shadow">

        <h1 className="text-xl sm:text-2xl font-bold">
          Member Payment Entry
        </h1>
        <h2 className="text-sm text-gray-600 mb-6">
          Record Cash, Bank Transfer and Cheque Payments from Members
        </h2>

        <form onSubmit={handleSubmit}>

          {/* TOP */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-4">

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
                  memberName: selected?.memberName || "",
                });
              }}
              className="border p-2 rounded"
              required
            >
              <option value="">Select Member</option>
              {members.map((m) => (
                <option key={m.memberId} value={m.memberId}>
                  {m.memberName}
                </option>
              ))}
            </select>
          </div>

          {/* PAYMENT METHOD */}
          <div className="mb-4">
            <label className="block mb-1 font-medium">
              Payment Method
            </label>
            <select
              name="paymentMethod"
              value={form.paymentMethod}
              onChange={(e) => {
                const value = e.target.value;

                setForm({
                  ...form,
                  paymentMethod: value,
                  bankName: "",
                  chequeNo: "",
                });
              }}
              className="border p-2 rounded w-full"
            >
              <option value="Cash">Cash</option>
              <option value="Bank">Bank Transfer</option>
              <option value="Cheque">Cheque</option>
            </select>
          </div>

          {/* BANK FIELD */}
          {form.paymentMethod === "Bank" && (
            <input
              type="text"
              name="bankName"
              placeholder="Bank Name"
              value={form.bankName}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-4"
              required
            />
          )}

          {/* CHEQUE FIELD */}
          {form.paymentMethod === "Cheque" && (
            <input
              type="text"
              name="chequeNo"
              placeholder="Cheque Number"
              value={form.chequeNo}
              onChange={handleChange}
              className="border p-2 rounded w-full mb-4"
              required
            />
          )}

          {/* DESCRIPTION + AMOUNT */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">

            <input
              type="text"
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="border p-2 rounded col-span-2"
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