import { useEffect, useState, useRef, Fragment, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { FaEye, FaSearch, FaTrash, FaPlus, FaRegFilePdf } from "react-icons/fa";
import { formatNumber } from "../../utils/numberFormat.js";
import { formatDate } from "../../utils/dateFormat.js";
import LoadingSpinner from "../../components/loadingSpinner";
import html2pdf from "html2pdf.js";

export default function MemberReceiptPage() {

  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [dueInvoices, setDueInvoices] = useState([]);
  const [members, setMembers] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const reportRef = useRef();
  const [receiptNumber, setReceiptNumber] = useState("");

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);    
  const [formErrors, setFormErrors] = useState({});

  const [selectedMember, setSelectedMember] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState([]);
  const [selectedInvoiceTotal, setSelectedInvoiceTotal] = useState(0);
  const [outstandingInvoices, setOutstandingInvoices] = useState([]);
  const [customerModal, setCustomerModal] = useState(false);
  const [customerSearch, setCustomerSearch] = useState("");

  const [banks, setBanks] = useState([]);
  const [branches, setBranches] = useState([]);
  const [chequeError, setChequeError] = useState("");  
  const [isLoading, setIsLoading] = useState(true);
  
  const [loading, setLoading] = useState(false);  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaved, setIsSaved] = useState(false);    

  const headers = {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  };

  const [form, setForm] = useState({
    referenceNo: "",
    trxType: "Receipt",
    receiptDate: new Date().toISOString().split("T")[0],
    memberId: "",
    memberName: "",
    memberAddress: "",
    paymentMethod: "",
    receivedAmount: 0,
    totalOutstanding: 0,
    totalSelected: 0,
    accountId: "",
    accountName: "",
    cardType: "",
    cardLast4: "",
    cardApprovalCode: "",
    chequeNumber: "",
    bankName: "",
    branchName: "",
    chequeDate: "",
    transferRef: "",
    transferDate: "",    
    receiptNo: "",
  });


  const initialForm = {  
    referenceNo: "",
    trxType: "Receipt",
    receiptDate: new Date().toISOString().split("T")[0],
    memberId: "",
    memberName: "",
    memberAddress: "",
    paymentMethod: "",
    receivedAmount: 0,
    totalOutstanding: 0,
    totalSelected: 0,
    accountId: "",
    accountName: "",
    cardType: "",
    cardLast4: "",
    cardApprovalCode: "",
    chequeNumber: "",
    bankName: "",
    branchName: "",
    chequeDate: "",
    transferRef: "",
    transferDate: "",
    receiptNo: "",
  };

  const resetForm = () => {
    setForm(initialForm);
    setSelectedMember(null);
    setReceipts([]);
    setDueInvoices([]);
    setSelectedInvoiceTotal(0);
    setSelectedInvoice([]);
    setIsSaved(false);
    setIsSubmitting(false);
  };
  
  

/** Normalise the shape of banks.json to → [{ code, name }] */
const normaliseBanks = (raw) => {
    if (Array.isArray(raw)) {
        return raw.map((b) => ({
        code: String(b.ID || b.bankCode || b.code).padStart(4, "0"),
        name: b.name || b.bankName || "",
        }));
    }
    if (raw && typeof raw === "object") {
        return Object.entries(raw).map(([code, name]) => ({
        code: String(code).padStart(4, "0"),
        name,
        }));
    }
    return [];
    };

    /** Normalise branches.json to → [{ bankCode, branchCode, name }] */
    const normaliseBranches = (raw) => {
        if (Array.isArray(raw)) {
            return raw.map((br) => ({
            bankCode: String(br.bankCode || br.BankCode).padStart(4, "0"),
            branchCode: String(br.branchCode || br.ID || br.code).padStart(3, "0"),
            name: br.name || br.branchName || "",
            }));
        }
        if (raw && typeof raw === "object") {
            const out = [];
            for (const [bankCode, list] of Object.entries(raw)) {
            if (Array.isArray(list)) {
                list.forEach((br) =>
                out.push({
                    bankCode: String(bankCode).padStart(4, "0"),
                    branchCode: String(br.branchCode || br.ID || br.code).padStart(
                    3,
                    "0"
                    ),
                    name: br.name || br.branchName || "",
                })
                );
            }
            }
            return out;
        }
        return [];
    };

    /** format 0000‑000‑000000 while typing */
    const formatChequeInput = (digits) => {
        if (digits.length <= 4) return digits;
        if (digits.length <= 7) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
        return `${digits.slice(0, 4)}-${digits.slice(4, 7)}-${digits.slice(
            7,
            13
        )}`;
    };
    
    

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



  /* ------------------ fetch accounts + bank data ------------- */
    useEffect(() => {
        if (!isLoading) return;

      const fetchAll = async () => {
      try {
          const [membersRes, accRes, banksRes, branchesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/member`),
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`),
          axios.get(
              "https://raw.githubusercontent.com/samma89/Sri-Lanka-Bank-and-Branch-List/master/banks.json"
          ),
          axios.get(
              "https://raw.githubusercontent.com/samma89/Sri-Lanka-Bank-and-Branch-List/master/branches.json"
          ),
          ]);

          // Members
          const memData = membersRes.data.data || membersRes.data;

          const sortedMembers = [...memData].sort((a, b) =>
            (a.firstName || "").localeCompare(b.firstName || "")
          );
          setMembers(sortedMembers);          

          // Cash & Bank (301,302)
          const accData = accRes.data.data || accRes.data;
          setCashAccounts(
              accRes.data.filter(
                  (a) =>
                  a.headerAccountId === "301"
              )
          );
          setBankAccounts(
              accRes.data.filter(
                  (a) =>
                  a.headerAccountId === "302"
              )
          ); 
                                
          /* banks & branches normalised regardless of shape */
          setBanks(normaliseBanks(banksRes.data));
          setBranches(normaliseBranches(branchesRes.data));

      } catch (err) {
          console.error(err);
          toast.error("Failed to fetch accounts / bank data.");
      } finally {
          setIsLoading(false);
      }
      };
      fetchAll();
  }, [isLoading]);  


  const fetchReceipts = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        { headers }
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const filtered = data
        .filter((i) =>
          i.trxType === "Receipt"
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setReceipts(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load receipts");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };


  const fetchOutstandingInvoices = async (memberId) => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member-transaction`,
        { headers }
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const filtered = data.filter(
          (i) => (i.trxType === "BagInvoice" || i.trxType === "SalesInvoice") && i.memberId === memberId
        )
        .sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
      setDueInvoices(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load invoices");
      setDueInvoices([]);
    }
  };


  const checkChequeExists = async (chequeNumber) => {
      const token = localStorage.getItem("token");
      try {
          const res = await axios.get(
              `${import.meta.env.VITE_BACKEND_URL}/api/chequeBookInward/${chequeNumber}`,
              {
                  headers: {
                      Authorization: `Bearer ${token}`,
                  },
              }
          );
          return res.data;
      } catch (error) {
          console.error("Error checking cheque existence:", error);
          throw error; // rethrow unknown errors
      }
  };
    
    
  useEffect(() => {
    fetchReceipts();
  }, []);


  useEffect(() => {
    if (form.memberId) {
      fetchOutstandingInvoices(form.memberId);
    }
  }, [form.memberId]);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  /* FILTER */
  const filteredInvoices = useMemo(() => {
    return receipts.filter(
      (i) =>
        i.trxId?.toLowerCase().includes(search.toLowerCase()) ||
        i.memberName?.toLowerCase().includes(search.toLowerCase()) ||
        i.referenceId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [receipts, search]);


  const filteredMembers = useMemo(() => {
    return members.filter((c) => {
      const name =
        `${c.firstName || ""} ${c.lastName || ""}`;

      return (
        name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        String(c.memberId || "")
          .toLowerCase()
          .includes(customerSearch.toLowerCase())
      );
    });
  }, [members, customerSearch]);
  


  const toggleInvoice = (invoiceId) => {
    const received = Number(form.receivedAmount || 0);

    const toggled = dueInvoices.map((inv) => {
      if (inv._id === invoiceId) {
        return {
          ...inv,
          selected: !inv.selected,
        };
      }
      return inv;
    });

    const sorted = [...toggled].sort(
      (a, b) => new Date(a.trxDate) - new Date(b.trxDate)
    );

    let remaining = received;

    const updated = sorted.map((inv) => {
      if (!inv.selected) {
        return {
          ...inv,
          payAmount: 0,
        };
      }

      const due = Number(inv.dueAmount || 0);
      const payAmount = Math.min(due, remaining);
      remaining -= payAmount;

      return {
        ...inv,
        payAmount,
      };
    });

    setDueInvoices(updated);

    const total = updated.reduce(
      (sum, inv) => sum + Number(inv.payAmount || 0),
      0
    );

    setSelectedInvoiceTotal(total);
  };



  const updatePayAmount = (invoiceId, value) => {
    const received = Number(form.receivedAmount || 0);

    let newTotal = 0;

    const updated = dueInvoices.map((inv) => {
      if (inv._id === invoiceId) {
        const input = Number(value || 0);

        const otherTotal = dueInvoices.reduce((sum, i) => {
          if (i._id !== invoiceId) {
            return sum + Number(i.payAmount || 0);
          }
          return sum;
        }, 0);

        const remaining = Math.max(received - otherTotal, 0);

        const payAmount = Math.min(
          input,
          remaining,
          Number(inv.dueAmount || 0)
        );

        newTotal = otherTotal + payAmount;

        return {
          ...inv,
          payAmount,
          selected: payAmount > 0,
        };
      }

      return inv;
    });

    setDueInvoices(updated);
    setSelectedInvoiceTotal(newTotal);
  };


  /* SORT */
  const sortedInvoices = useMemo(() => {
    return filteredInvoices.sort((a, b) => {
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }, [filteredInvoices]);
  
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

    if (form.memberId === "") {
      return toast.error("Select a customer");
    }
    if (form.receiptDate === "") {
      return toast.error("Select a date");
    }
    if (form.paymentMethod === "") {
      return toast.error("Select a payment method");
    }
    if (form.receivedAmount <= 0) {
      return toast.error("Enter valid received amount");
    }


    if (form.paymentMethod === "Cash" && !form.accountId) {
      return toast.error("Enter cash amount");
    }


    if (form.paymentMethod === "Card" && !form.cardType) {
      return toast.error("Enter card type");
    }
    if (
      form.paymentMethod === "Card" &&
      !/^\d{4}$/.test(form.cardLast4 || "")
    ) {
      return toast.error("Enter a valid 4-digit card number");
    }
    if (form.paymentMethod === "Card" && !form.cardApprovalCode) {
      return toast.error("Enter card approval code");
    }

    if (form.paymentMethod === "Cheque") {
      if (!form.chequeNumber || form.chequeNumber.trim().length !== 15) {
        return toast.error("Cheque number must be exactly 15 digits");
      }

      if (!form.bankName) {
        return toast.error("Enter cheque number with valid bank code");
      }

      if (!form.branchName) {
        return toast.error("Enter cheque number with valid branch code");
      }
    }
    if (form.paymentMethod === "Cheque") {
        const chequeExists = await checkChequeExists(form.chequeNumber);
        if (chequeExists !== null) {
            return toast.error("Cheque number is already existing in the system");
        }
    }
    if (form.paymentMethod === "Cheque" && !form.chequeDate) {
      return toast.error("Select cheque date");
    }


    if (form.paymentMethod === "BankTransfer" && !form.accountName && !form.accountId) {
      return toast.error("Select received bank account");
    }  
    if (form.paymentMethod === "BankTransfer" && form.transferRef === "") {
      return toast.error("Enter transfer reference");
    }
    if (form.paymentMethod === "BankTransfer" && form.transferDate === "") {
      return toast.error("Select transfer date");
    }

    if (Number(form.totalOutstanding) < Number(form.receivedAmount)) {
      if (Number(selectedInvoiceTotal) !== Number(form.totalOutstanding)) {
        return toast.error("All invoices must be fully paid");
      }
    } else {
      if (Number(form.receivedAmount) !== Number(selectedInvoiceTotal)) {
        return toast.error("The total of selected invoices must equal the received amount.");
      }
    }
    

    try {
      setIsSubmitting(true);

      const amount = Number(form.receivedAmount || 0);
      const description =
          form.paymentMethod === "Cash"
            ? "Cash Receipt"
            : form.paymentMethod === "Card"
            ? `${form.cardType} - ${form.cardLast4} - ${form.cardApprovalCode}`
            : form.paymentMethod === "Cheque"
            ? `Cheque No: ${form.chequeNumber}`
            : form.paymentMethod === "BankTransfer"
            ? form.accountName
            : "";
   
      const memberTrxPayload = {
        referenceId: form.referenceNo,
        trxDate: form.receiptDate,
        trxType: form.trxType,
        memberId: form.memberId,
        memberName: form.memberName,
        description: description,
        isCredit: true,
        amount: form.receivedAmount,
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
          amount: form.receivedAmount,
        }
      );


      // ================= 3. UPDATE LEDGER BALANCE =================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/add-balance`,
        {
          updates: [
            {
              accountId: form.accountId,
              amount: form.receivedAmount,
            },
          ],
        }
      );

      // ================= 4. SAVE LEDGER TRANSACTION =================
      const ledgerTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceNo,
        trxDate: form.receiptDate,
        transactionType: form.trxType,
        accountId: form.accountId,
        accountName: form.accountName,
        description: form.memberName + " - " + description,
        isCredit: false,
        trxAmount: form.receivedAmount,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerTrxPayload
      );      

      setIsSaved(true);
      toast.success("Payment recorded successfully");

    } catch (err) {
      setIsSubmitting(false);
      console.error(err);
      toast.error("Error saving payment");
    } finally {
      setIsSaved(true);
    }
  };


  // ================= UI =================
  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-orange-600">
            🧾 Member Receipt
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage incoming payment receipts for members.
          </p>         
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div
            className={`relative w-full md:w-64 ${
              viewMode === "create" && "hidden"
            }`}
          >
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search Purchase Invoices..."
              className="border px-3 py-2 pl-9 rounded-lg w-full"
            />
          </div>

          {viewMode === "create" && (
            <button
              // onClick={handleDownloadPDF}
              disabled={!isSaved}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white font-medium transition ${
                isSaved
                  ? "bg-orange-600 hover:bg-orange-700"
                  : "bg-gray-400"
              }`}
            >
              <FaRegFilePdf />
              PDF
            </button>
          )}

          <button
            onClick={async () => {

              if ((viewMode === "create") && (isSaved)) {
                setIsSaved(false);         
               await fetchReceipt(); // now valid
              }
              resetForm();  
              setViewMode(viewMode === "list" ? "create" : "list");
            }}
            className={`px-4 py-2 rounded-lg flex items-center gap-2 text-white
              ${viewMode === "list" ? "bg-orange-500" : "bg-gray-700"}`}
          >
            {viewMode === "list" ? (
              <>
                <FaPlus /> Add
              </>
            ) : (
              "← Back"
            )}
          </button>
        </div>
      </div>



      {/* ================= LIST VIEW ================= */}
      {viewMode === "list" && (
        <>
          {loading ? (
            <div className="space-y-3">
              <LoadingSpinner />

              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-200 rounded animate-pulse"
                />
              ))}
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="md:hidden space-y-3">
                {filteredInvoices.map((inv) => (
                  <div key={inv._id} className="bg-white border rounded-xl p-4 shadow-sm">

                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-bold text-orange-600">{inv.trxId}</p>
                        <p className="text-sm text-gray-600">{inv.memberName}</p>
                        <p className="text-xs text-gray-400">Ref: {inv.referenceId}</p>
                        <p className="text-xs text-gray-400">{formatDate(inv.trxDate)}</p>
                      </div>

                      <p className="text-red-600 font-bold">
                        {formatNumber(inv.amount)}
                      </p>
                    </div>

                    <div className="flex gap-3 mt-3">
                      <button
                        onClick={() => {
                          setSelected(inv);
                          setIsViewOpen(true);
                        }}
                        className="text-blue-600 flex items-center gap-1"
                      >
                        <FaEye /> View
                      </button>

                      <button 
                        onClick={() => deleteInvoice(inv.trxId)}
                        className="text-red-600"
                      >

                        <FaTrash />
                      </button>
                    </div>

                  </div>
                ))}
              </div>


              {/* DESKTOP */}
              <div className="hidden md:block bg-white rounded-xl shadow border overflow-hidden">

                <table className="w-full text-sm">

                  <thead className="bg-orange-100 text-left">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">Reference</th>                      
                      <th className="p-3">Customer</th>
                      <th className="p-3 text-right">Amount</th>
                      <th className="p-3">Due Balance</th>
                      <th className="p-3 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredInvoices.map((inv) => (
                      <tr key={inv._id} className="border-t hover:bg-orange-50">

                        <td className="p-3">{formatDate(inv.trxDate)}</td>
                        <td className="p-3 font-semibold text-orange-600">
                          {inv.trxId}
                        </td>
                        <td className="p-3 text-gray-500">{inv.referenceId}</td>
                        <td className="p-3">{inv.memberName}</td>
                        <td className="p-3 text-right text-green-600 font-semibold">
                          {formatNumber(inv.amount)}
                        </td>
                        <td className={`p-3 text-right ${Number(inv.dueAmount) > 0 ? "text-red-600 font-semibold" : "text-gray-300"}`}>
                          {Number(inv.dueAmount) > 0
                            ? formatNumber(inv.dueAmount)
                            : "—"}
                        </td>
                        <td className="p-3 text-center flex justify-center gap-3">
                          <button
                            onClick={() => {
                              setSelected(inv);
                              setIsViewOpen(true);
                            }}
                            className="text-blue-600"
                          >
                            <FaEye />
                          </button>

                          <button 
                            onClick={() => deleteInvoice(inv.trxId)}
                            className="text-red-600"
                          >

                            <FaTrash />
                          </button>
                        </td>

                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>

            </>
          )}
        </>
      )}



      {/* ================= CREATE/EDIT VIEW ================= */}
      {viewMode === "create" && (
        <div className="bg-white rounded-xl shadow border p-4 md:p-6 space-y-6">

          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <h2 className="text-xl font-bold text-orange-600">
              Customer Payment Receipt
            </h2>

            <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <span className="text-xs text-gray-500">
                Receipt No
              </span>
              <p className="font-bold text-green-700">
                {form.receiptNo}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* CUSTOMER SECTION */}
            <div className="border rounded-xl border-gray-300 p-4">
              <h3 className="font-semibold mb-4 text-gray-700">
                Customer Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Customer
                  </label>

                  <button
                    type="button"
                    onClick={() => setCustomerModal(true)}
                    className="w-full border rounded-lg px-4 py-2 text-left bg-gray-50"
                  >
                    {selectedMember
                      ? `${selectedMember.firstName} ${selectedMember.lastName}`
                      : "Select Customer"}                      
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Receipt Date
                  </label>

                  <input
                    type="date"
                    value={form.receiptDate}
                    onChange={(e) =>
                      setForm({ ...form, receiptDate: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Total Outstanding
                  </label>

                  <input
                    readOnly
                    value={formatNumber(form.totalOutstanding)}
                    className="w-full border rounded-lg border-gray-400 px-4 py-2 bg-gray-100 font-bold text-red-600"
                  />
                </div>
              </div>
            </div>

            {/* PAYMENT METHOD */}
            <div className="border rounded-xl border-gray-300 p-4">
              <h3 className="font-semibold mb-4 text-gray-700">
                Payment Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Payment Method
                  </label>

                  <select
                    value={form.paymentMethod}
                    onChange={(e) =>
                      setForm({ ...form, paymentMethod: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  >
                    <option value="">-- Select Method --</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Card</option>
                    <option value="Cheque">Cheque</option>
                    <option value="BankTransfer">
                      Bank Transfer
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Amount Received
                  </label>
                  <input
                    type="number"
                    value={form.receivedAmount ?? 0}
                    onChange={(e) => {
                      const value = Number(e.target.value) || 0;

                      setForm({
                        ...form,
                        receivedAmount: value,
                      });

                      // ✅ reset all invoices selection + payments
                      setInvoices((prev) =>
                        prev.map((inv) => ({
                          ...inv,
                          selected: false,
                          payAmount: 0,
                        }))
                      );

                      // ✅ reset total
                      setSelectedInvoiceTotal(0);
                    }}
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Reference
                  </label>

                  <input
                    value={form.referenceNo || ""}
                    onChange={(e) =>
                      setForm({ ...form, referenceNo: e.target.value })
                    }
                    className="w-full border rounded-lg px-4 py-2"
                  />
                </div>

              </div>


              {/* CASH DETAILS */}
              {form.paymentMethod === "Cash" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">   
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Receiving Cash Account
                    </label>
                    <select
                      value={form.accountId}
                      onChange={(e) => {
                        const selectedAccount = cashAccounts.find(
                          (acc) => acc.accountId === e.target.value
                        );

                        setForm({
                          ...form,
                          accountId: e.target.value,
                          accountName: selectedAccount?.accountName || "",
                        });
                      }}
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      <option value="">-- Select Account --</option>
                      {cashAccounts.map((acc) => (
                        <option key={acc.accountId} value={acc.accountId}>
                          {acc.accountName}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}           

              {/* CHEQUE DETAILS */}
              {form.paymentMethod === "Cheque" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                  <div>
                      <label className="block text-sm font-medium mb-1">
                      Cheque #
                      </label>
                      <input
                          placeholder="0000-000-000000"
                          maxLength={17}
                          value={form.chequeNumber}
                          className={`w-full text-sm border ${
                              chequeError || formErrors.chequeNumber   // ⬅️ combine the flags
                                  ? "border-red-500"
                                  : "border-gray-500"
                              } rounded-lg px-4 py-2 focus:outline-blue-500`}
                          onChange={(e) => {
                              /* digits only */
                              const digits = e.target.value.replace(/\D/g, "").slice(0, 13);
                              const formatted = formatChequeInput(digits);
                              setForm({ ...form, chequeNumber: formatted });

                              /* live lookup */
                              let bankName = "";
                              let branchName = "";

                              if (digits.length >= 4) {
                              const bankCode = digits.slice(0, 4);
                              const bank = banks.find((b) => b.code === bankCode);
                              if (bank) bankName = bank.name;
                              }
                              if (digits.length >= 7 && bankName) {
                              const bankCode = digits.slice(0, 4);
                              const branchCode = digits.slice(4, 7);
                              const branch = branches.find(
                                  (br) =>
                                  br.bankCode === bankCode && br.branchCode === branchCode
                              );
                              if (branch) branchName = branch.name;
                              }
                              if (digits.length < 4) bankName = "";
                              if (digits.length < 7) branchName = "";

                              setForm((p) => ({
                              ...p,
                              bankName: bankName,
                              branchName: branchName,
                              }));

                              if (digits.length === 13) {
                                  if (!bankName)
                                      setChequeError("Unknown bank code.");
                                  else if (!branchName)
                                      setChequeError("Unknown branch code.");
                                  else setChequeError("");
                              } else setChequeError("");
                          }}
                      />
                      {chequeError && (
                      <p className="text-xs text-red-500 mt-1">{chequeError}</p>
                      )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Bank & Branch
                    </label>
                    <input
                      disabled
                      placeholder="Bank Name"
                      value={`${form.bankName}${form.branchName ? ` - ${form.branchName}` : ''}`}
                      onChange={(e) =>
                        setForm({ ...form, bankName: e.target.value })
                      }
                      className="border rounded-lg px-4 py-2 w-full"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Cheque Date
                    </label>
                    <input
                      type="date"
                      value={form.chequeDate}
                      onChange={(e) =>
                        setForm({ ...form, chequeDate: e.target.value })
                      }
                      className="border rounded-lg px-4 py-2 w-full"
                    />
                  </div>

                </div>
              )}

              {/* CARD DETAILS */}
              {form.paymentMethod === "Card" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Card Type
                    </label>                    
                      <select
                      value={form.cardType}
                      onChange={(e) =>
                          setForm({ ...form, cardType: e.target.value })
                      }
                      className={`w-full border rounded-lg px-4 py-2 focus:outline-blue-500
                          ${formErrors.cardType   ? 'border-red-500' : 'border-gray-400'}`}

                      >
                      <option value="">-- Select Card --</option>
                      <option value="visa">Visa</option>
                      <option value="mastercard">Mastercard</option>
                      <option value="lankapay">LankaPay</option>
                      <option value="americanexpress">American Express</option>
                      <option value="unionpay">UnionPay</option>
                      </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Card Number (Last 4 Digits)
                    </label>
                    <input
                      placeholder="Last 4 Digits"
                      className="border rounded-lg px-4 py-2 w-full"
                      maxLength={4}
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={form.cardLast4 || ""}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");

                        setForm((prev) => ({
                          ...prev,
                          cardLast4: value.slice(0, 4),
                        }));
                      }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Approval Code
                    </label>
                    <input
                      placeholder="Approval Code"
                      className="border rounded-lg px-4 py-2 w-full"
                      value={form.cardApprovalCode || ""}
                      onChange={(e) =>
                        setForm({ ...form, cardApprovalCode: e.target.value })
                      }
                    />
                  </div>

                </div>
              )}

              {/* BANK TRANSFER */}
              {form.paymentMethod === "BankTransfer" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Received Bank Account
                    </label>
                    <select
                      value={form.accountId}
                      onChange={(e) => {
                        const selectedAccount = bankAccounts.find(
                          (acc) => acc.accountId === e.target.value
                        );

                        setForm({
                          ...form,
                          accountId: e.target.value,
                          accountName: selectedAccount?.accountName || "",
                        });
                      }}
                      className="w-full border rounded-lg px-4 py-2"
                    >
                      <option value="">-- Select Account --</option>
                      {bankAccounts.map((acc) => (
                        <option key={acc.accountId} value={acc.accountId}>
                          {acc.accountName}
                        </option>
                      ))}
                    </select>
                  </div>
                
                  <div>
                    <label className="block text-sm font-medium mb-1">
                        Transfer Reference
                    </label>
                    <input
                      placeholder="Transfer Ref"
                      className="border rounded-lg px-4 py-2 w-full"
                      value={form.transferRef || ""}
                      onChange={(e) =>
                        setForm({ ...form, transferRef: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Transfer Date
                    </label>
                    <input
                      type="date"
                      className="border rounded-lg px-4 py-2 w-full"
                      value={form.transferDate || ""}
                      onChange={(e) =>
                        setForm({ ...form, transferDate: e.target.value })
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* INVOICE SELECTION */}
            <div className="border rounded-xl border-gray-300 p-4">

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-gray-700">
                  Outstanding Invoices
                </h3>

                <div className="font-bold text-green-600">
                  Selected Total :
                  Rs. {formatNumber(selectedInvoiceTotal)}
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm border">

                  <thead className="bg-gray-100">
                    <tr>
                      <th className="border p-2">
                        Select
                      </th>
                      <th className="border p-2">
                        Date
                      </th>
                      <th className="border p-2">
                        Invoice No
                      </th>
                      <th className="border p-2">
                        Description
                      </th>
                      <th className="border p-2">
                        Balance
                      </th>
                      <th className="border p-2">
                        Pay Amount
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {dueInvoices.map((invoice) => (
                      <tr key={invoice._id}>
                        <td className="border p-2 text-center">
                          <input
                            disabled={form.receivedAmount <= 0}
                            type="checkbox"
                            checked={!!invoice.selected}
                            onChange={() => toggleInvoice(invoice._id)}
                          />
                        </td>
                        <td className="border p-2">{formatDate(invoice.trxDate)}</td>
                        <td className="border p-2">{invoice.trxId}</td>
                        <td className="border p-2">{invoice.description}</td>
                        <td className="border p-2 text-right">
                          {formatNumber(invoice.dueAmount)}
                        </td>
                        <td className="border p-2">
                          <input
                            disabled={form.receivedAmount <= 0}
                            type="number"
                            value={invoice.payAmount ?? ""}
                            onChange={(e) =>
                              updatePayAmount(invoice._id, Number(e.target.value))
                            }
                            className={`w-full border rounded-lg px-4 py-2 ${
                              form.receivedAmount <= 0
                                ? "bg-gray-100 cursor-not-allowed" : "bg-white"
                            }`}
                          />                         
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </div>

            {/* SUMMARY */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="bg-orange-50 border rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Total Selected
                </p>
                <h3 className="font-bold text-xl">
                  {formatNumber(selectedInvoiceTotal)}
                </h3>
              </div>

              <div className="bg-blue-50 border rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Amount Received
                </p>
                <h3 className="font-bold text-xl">
                  {formatNumber(form.receivedAmount)}
                </h3>
              </div>

              <div className="bg-green-50 border rounded-xl p-4">
                <p className="text-xs text-gray-500">
                  Balance Remaining
                </p>
                <h3
                  className={`font-bold text-xl ${
                    form.totalOutstanding > form.receivedAmount
                      ? "text-green-700"
                      : "text-red-600"
                  }`}
                >
                  {formatNumber(form.receivedAmount - selectedInvoiceTotal)}
                </h3>

              </div>

            </div>


            {/* ACTION BUTTONS */}
            <div className="flex flex-col sm:flex-row gap-3 justify-end">

              <button
                type="button"
                className="px-5 py-2 rounded-lg border"
                onClick={() => {
                  resetForm();
                }}
              >
                Refresh
              </button>

              <button
                onClick={handleSubmit}
                disabled={isSubmitting || isSaved}
                className={`px-5 py-2 rounded-lg font-semibold text-white transition ${
                  isSaved
                    ? "bg-green-600"
                    : isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-orange-500 hover:bg-orange-600"
                }`}
              >
                {isSubmitting
                  ? "Saving Invoice..."
                  : isSaved
                  ? "Saved ✓ Ready for PDF"
                  : "Save Invoice"}
              </button>

            </div>

          </form>
        </div>
      )}


      {/* ================= PDF LAYOUT ================= */}
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
              <div>This is a computer-generated receipt and No signature is required.</div>

              <div style={{ fontWeight: "bold", color: "#333" }}>
                Software by nSoft Technology © 2026
              </div>              
            </div>

          </div>
        </div>
      </div>


      {/* CUSTOMER MODAL */}
      <Modal
        isOpen={customerModal}
        onRequestClose={() =>
          setCustomerModal(false)
        }
        overlayClassName="fixed inset-0 bg-black/40 z-40"
        className="bg-white max-w-lg mx-auto mt-10 rounded-3xl p-5 outline-none max-h-[85vh] overflow-y-auto"
      >

        <h2 className="text-xl font-bold mb-4">
          Select Customer
        </h2>

        <input
          type="text"
          placeholder="Search customer..."
          value={customerSearch}
          onChange={(e) =>
            setCustomerSearch(e.target.value)
          }
          className="w-full border rounded-2xl px-4 py-3 mb-4"
        />

        <div className="space-y-2">
          {filteredMembers.map((c) => (

            <button
              key={c._id}
              onClick={() => {
                setSelectedMember(c);

                setForm((prev) => ({
                  ...prev,
                  memberId: c.memberId,
                  memberName: `${c.firstName} ${c.lastName}`,
                  memberAddress: c.address || "",
                  totalOutstanding: c.dueAmount || 0,
                }));

                setCustomerModal(false);
              }}
              className="w-full text-left border rounded-2xl px-4 py-2 hover:bg-orange-50 transition"
            >
              <p className="font-semibold">
                {`${c.firstName} ${c.lastName}`}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {c.memberId}
              </p>
            </button>
          ))}
        </div>
      </Modal>


    </div>
  );
}