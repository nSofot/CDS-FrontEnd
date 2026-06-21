import { useEffect, useState, useRef, Fragment, useMemo } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { FaEye, FaSearch, FaTrash, FaPlus, FaRegFilePdf } from "react-icons/fa";
import LoadingSpinner from "../../components/loadingSpinner";
import { formatNumber }  from "../../utils/numberFormat.js";
import { formatDate } from "../../utils/dateFormat.js";
import html2pdf from "html2pdf.js";

export default function OtherPaymentPage() {

  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [dueInvoices, setDueInvoices] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [cashAccounts, setCashAccounts] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const reportRef = useRef();
  const [receiptNumber, setReceiptNumber] = useState("");
  const [description, setDescription] = useState("");

  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("list");
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [selected, setSelected] = useState(null);    
  const [formErrors, setFormErrors] = useState({});

  const [selectedVendor, setSelectedVendor] = useState(null);
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
    trxType: "OtherPayment",
    receiptDate: new Date().toISOString().split("T")[0],
    vendorId: "",
    vendorName: "",
    vendorAddress: "",
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
    trxType: "OtherPayment",
    receiptDate: new Date().toISOString().split("T")[0],
    vendorId: "",
    vendorName: "",
    vendorAddress: "",
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
    setSelectedVendor(null);
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
    if (num === null || num === undefined || isNaN(num)) {
      return "Zero Rupees Only";
    }

    const a = [
      "",
      "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
      "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen",
      "Sixteen", "Seventeen", "Eighteen", "Nineteen",
    ];

    const b = [
      "", "", "Twenty", "Thirty", "Forty", "Fifty",
      "Sixty", "Seventy", "Eighty", "Ninety",
    ];

    const convert = (n) => {
      if (n === 0) return "";
      if (n < 20) return a[n];

      if (n < 100) {
        return b[Math.floor(n / 10)] + (n % 10 ? " " + a[n % 10] : "");
      }

      if (n < 1000) {
        return (
          a[Math.floor(n / 100)] +
          " Hundred" +
          (n % 100 ? " " + convert(n % 100) : "")
        );
      }

      if (n < 100000) {
        return (
          convert(Math.floor(n / 1000)) +
          " Thousand" +
          (n % 1000 ? " " + convert(n % 1000) : "")
        );
      }

      if (n < 10000000) {
        return (
          convert(Math.floor(n / 100000)) +
          " Lakh" +
          (n % 100000 ? " " + convert(n % 100000) : "")
        );
      }

      return (
        convert(Math.floor(n / 10000000)) +
        " Crore" +
        (n % 10000000 ? " " + convert(n % 10000000) : "")
      );
    };

    const rupees = Math.floor(Number(num));
    const cents = Math.round((Number(num) - rupees) * 100);

    let words = `${convert(rupees) || "Zero"} Rupees`;

    if (cents > 0) {
      words += ` and ${convert(cents)} Cents`;
    }

    words += " Only";

    return words;
  };



  /* ------------------ fetch accounts + bank data ------------- */
    useEffect(() => {
        if (!isLoading) return;

      const fetchAll = async () => {
      try {
          const [accRes, banksRes, branchesRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/ledger-account`),
          axios.get(
              "https://raw.githubusercontent.com/samma89/Sri-Lanka-Bank-and-Branch-List/master/banks.json"
          ),
          axios.get(
              "https://raw.githubusercontent.com/samma89/Sri-Lanka-Bank-and-Branch-List/master/branches.json"
          ),
          ]);

          // Members
          const accData = accRes.data.data || accRes.data;

          const sortedVendors = [...accData].sort((a, b) =>
            (a.accountName || "").localeCompare(b.accountName || "")
          );
          setVendors(sortedVendors);          

          // Cash & Bank (301,302)
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
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        { headers }
      );

      const data = Array.isArray(res.data?.data)
        ? res.data.data
        : Array.isArray(res.data)
        ? res.data
        : [];

      const filtered = data
        .filter((i) =>
          i.trxType === "OtherPayment"
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setReceipts(filtered);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payments");
      setReceipts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOutstandingInvoices = async (vendorId) => {
    const res = await axios.get(
      `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction/due/${vendorId}`,
      { headers }
    );
    setDueInvoices(res.data.data || []);
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
    if (viewMode === "list") {
      fetchReceipts();
    }
  }, [viewMode]);  


  useEffect(() => {
    if (form.vendorId) {
      fetchOutstandingInvoices(form.vendorId);
    }
  }, [form.vendorId]);


  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);


  /* FILTER */
  const filteredInvoices = useMemo(() => {    
    return receipts.filter(
      (i) =>
        i.trxId?.toLowerCase().includes(search.toLowerCase()) ||
        i.accountName?.toLowerCase().includes(search.toLowerCase()) ||
        i.referenceId?.toLowerCase().includes(search.toLowerCase())
    );
  }, [receipts, search]);


  const filteredVendors = useMemo(() => {
    return vendors.filter((c) => {
      const name =
        `${c.vendorName || ""}`;

      return (
        name.toLowerCase().includes(customerSearch.toLowerCase()) ||
        String(c.vendorId || "")
          .toLowerCase()
          .includes(customerSearch.toLowerCase())
      );
    });
  }, [vendors, customerSearch]);
  


  const toggleInvoice = (invoiceId) => {
    const received = Number(form.receivedAmount || 0);

    setDueInvoices((prev) => {
      // 1. toggle selection first
      const toggled = prev.map((inv) =>
        inv._id === invoiceId
          ? { ...inv, selected: !inv.selected }
          : inv
      );

      // 2. distribute payment based on selection order
      let remaining = received;

      const updated = toggled.map((inv) => {
        if (!inv.selected) {
          return { ...inv, payAmount: 0 };
        }

        const due = Number(inv.dueAmount || 0);
        const payAmount = Math.min(due, remaining);

        remaining -= payAmount;

        return {
          ...inv,
          payAmount,
        };
      });

      // 3. update total
      const total = updated.reduce(
        (sum, inv) => sum + Number(inv.payAmount || 0),
        0
      );

      setSelectedInvoiceTotal(total);

      return updated;
    });
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
  

  const closeViewModal = () => {
    setIsViewOpen(false);
    // setStockTrx(null);
    setSelected(null);
  };
  

  useEffect(() => {
    if (isViewOpen && selected?.trxId) {
      // setStockTrx(null);
      // fetchStockTrx(selected.trxId);
    }
  }, [isViewOpen, selected?.trxId]);
  


  // ================= PDF STYLES =================
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

    if (form.vendorId === "") {
      return toast.error("Select a supplier");
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
      return toast.error("Select paying cash amount");
    }


    if (form.paymentMethod === "Cheque") {
      if (!form.accountName && !form.accountId) {
        return toast.error("Select paying bank account");
      }       
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
      return toast.error("Select paying bank account");
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
        return toast.error("The total of selected invoices must equal the paying amount.");
      }
    }
    

    try {
      setIsSubmitting(true);

      const amount = Number(form.receivedAmount || 0);
      const description =
          form.paymentMethod === "Cash"
            ? "Cash Payment"
            : form.paymentMethod === "Cheque"
            ? `Cheque No: ${form.chequeNumber}`
            : form.paymentMethod === "BankTransfer"
            ? form.accountName
            : "";
      setDescription(description);


      // ================= 1. SAVE MEMBER TRANSACTION =================            
      const memberTrxPayload = {
        referenceId: form.referenceNo,
        trxDate: form.receiptDate,
        trxType: form.trxType,
        vendorId: form.vendorId,
        vendorName: form.vendorName,
        description: description,
        isCredit: true,
        amount: form.receivedAmount,
        dueAmount: 0,
      };
     
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction`,
        memberTrxPayload
      );


      // ================= 2. GET NEW TRX ID =================
      const savedTrxId = res.data.data.trxId || res.data.trxId;
      setReceiptNumber(savedTrxId);


      // ================= 3. SUBSTRACT MEMBER DUE =================
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/vendor/${form.vendorId}/reduce-due`,
        {
          amount: form.receivedAmount,
        }
      );


      // ================= 4. CLEAR DUE TRANS =================
      await Promise.all(
        dueInvoices
          .filter((inv) => inv.selected)
          .map((inv) =>
            axios.put(
              `${import.meta.env.VITE_BACKEND_URL}/api/vendor-transaction/subtract/${inv.trxId}`,
              { amount: inv.payAmount }
            )
          )
      );


      // ================= 5. UPDATE LEDGER BALANCE - CREDIT ==================
      let accountId = "";
      let accountName = "";
      if (form.paymentMethod === "Cheque") {
        accountId = "307-004";
        accountName = "Outward Cheques (Pending Clearance)";
      } else if (form.paymentMethod === "Cash" || form.paymentMethod === "BankTransfer") {
        accountId = form.accountId;
        accountName = form.accountName;
      }
      if (!accountId || !accountName) {
        toast.error("Invalid ledger account selection");
        setIsSubmitting(false);
        return;
      }

      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/subtract-balance`,
        {
          updates: [
            {
              accountId,
              amount: form.receivedAmount,
            },
          ],
        }
      );

      // ================= 6. SAVE LEDGER TRANSACTION - CREDIT =================
      const ledgerTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceNo,
        trxDate: form.receiptDate,
        transactionType: form.trxType,
        accountId: accountId,
        accountName: accountName,
        description: form.vName + " - " + description,
        isCredit: true,
        trxAmount: form.receivedAmount,
      };    

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerTrxPayload
      );      


      // ================= 7. UPDATE LEDGER ACCOUNT - DEBIT =================
      await axios.put(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-account/add-balance`,
        {
          updates: [
            {
              accountId: form.vendorId,
              amount: form.receivedAmount,
            },
          ],
        }
      );

      // ================= 8. SAVE LEDGER TRANSACTION - DEBIT =================
      const ledgerDrTrxPayload = {
        trxId: savedTrxId,
        referenceId: form.referenceNo,
        trxDate: form.receiptDate,
        transactionType: form.trxType,
        accountId: form.vendorId,
        accountName: form.vendorName,
        description: "",
        isCredit: false,
        trxAmount: form.receivedAmount,
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/ledger-transaction`,
        ledgerDrTrxPayload
      ); 


      try {
        // ================= 9. SAVE CHEQUE =================
        if (form.paymentMethod === "Cheque") {
          const chequePayload = {
            voucherId: savedTrxId,
            vendorId: form.memberId,
            voucherDate: form.receiptDate,
            chequeNumber: form.chequeNumber,
            chequeDate: form.chequeDate,
            chequeAmount: form.receivedAmount,
            chequeStatus: "Pending"
          }
          
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/chequeBookOutward`,
            chequePayload
          )
        }      


               
      } catch (err) {
        console.error("Optional payment save failed:", err);
      }

      setReceiptNumber(savedTrxId);

      setIsSaved(true);
      toast.success("Payment recorded successfully");

    } catch (err) {
      console.error(err);
      setIsSaved(false);
      toast.error("Error saving payment");
    } finally {
      setIsSubmitting(false);
    }
  };


  // ================= UI =================
  return (
    <div className="w-full space-y-4">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-orange-600">
            🧾 Other Payment
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Create and manage other payments.
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
              placeholder="Search payment voucher..."
              className="border px-3 py-2 pl-9 rounded-lg w-full"
            />
          </div>

          {viewMode === "create" && (
            <button
              onClick={handleDownloadPDF}
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
              // if ((viewMode === "create") && (isSaved)) {
              //   setIsSaved(false);         
              //   await fetchReceipts();
              // }
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
        // console.log("filteredInvoices", filteredInvoices),
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
                        <p className="text-sm text-gray-600">{inv.accountName}</p>
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
                      <th className="p-3">Account</th>
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
                        <td className="p-3">{inv.AccountName}</td>
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
              Create Other Payment
            </h2>

            <div className="bg-green-50 border border-green-200 px-4 py-2 rounded-lg">
              <span className="text-xs text-gray-500">
                Voucher No
              </span>
              <p className="font-bold text-green-700">
                {receiptNumber}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* CUSTOMER SECTION */}
            <div className="border rounded-xl border-gray-300 p-4">
              <h3 className="font-semibold mb-4 text-gray-700">
                Payment Information
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Account
                  </label>

                  <button
                    type="button"
                    onClick={() => setCustomerModal(true)}
                    className="w-full border rounded-lg px-4 py-2 text-left bg-gray-50"
                  >
                    {selectedVendor
                      ? `${selectedVendor.vendorName}`
                      : "Select Account"}                      
                  </button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Voucher Date
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
                      setDueInvoices((prev) =>
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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">

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
                        Trx. No
                      </th>
                      <th className="border p-2">
                        Reference No
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
                        <td className="border p-2">{invoice.referenceId}</td>
                        <td className="border p-2 text-right">
                          {formatNumber(invoice.dueAmount)}
                        </td>
                          <td className="border p-2">
                            <input
                              disabled={form.receivedAmount <= 0}
                              type="number"
                              step="0.01"
                              value={
                                invoice.payAmount !== undefined && invoice.payAmount !== null
                                  ? Number(invoice.payAmount).toFixed(2)
                                  : ""
                              }
                              onChange={(e) =>
                                updatePayAmount(invoice._id, Number(e.target.value))
                              }
                              className={`w-full border rounded-lg px-4 py-2 ${
                                form.receivedAmount <= 0
                                  ? "bg-gray-100 cursor-not-allowed"
                                  : "bg-white"
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

            <div>
              <p className="text-xs font-semibold text-gray-500">
                {numberToWords(form.receivedAmount)}
              </p>
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
              SUPPLIER PAYMENT VOUCHER
            </h2>

            {/* DETAILS BOX */}
            <div style={twoCol}>
              
              {/* LEFT */}
              <div style={colBox}>
                <p><b>Supplier ID:</b> {form.vendorId || "N/A"}</p>
                <p><b>Name:</b> {form.vendorName || "N/A"}</p>
                <p>
                  <b>Address:</b>{" "}
                  {form?.vendorAddress
                    ? Object.values(form.vendorAddress)
                        .filter(Boolean)
                        .join(", ")
                    : "N/A"}
                </p>
              </div>

              {/* RIGHT */}
              <div style={colBox}>
                <p><b>Receipt No:</b> {receiptNumber}</p>
                <p><b>Date:</b> {formatDate(form.receiptDate)}</p>
                <p><b>Reference:</b> {form.referenceNo}</p>
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
                  {numberToWords(Number(form.receivedAmount || 0))}
                </b>
              </p>
              
              <p style={{ marginTop: "10px" }}>
                Paid Amount:{" "}
                <b>
                  {Number(form.receivedAmount || 0).toFixed(2)}
                </b>
              </p>

              <p>
                Pay Mode: <b>{form.paymentMethod || "Cash"}</b>
              </p>

              <p>
                Description: <b>{description || "N/A"}</b>
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
          Select Account
        </h2>

        <input
          type="text"
          placeholder="Search account..."
          value={customerSearch}
          onChange={(e) =>
            setCustomerSearch(e.target.value)
          }
          className="w-full border rounded-2xl px-4 py-3 mb-4"
        />

        <div className="space-y-2">
          {filteredVendors.map((c) => (

            <button
              key={c._id}
              onClick={() => {
                setSelectedVendor(c);

                setForm((prev) => ({
                  ...prev,
                  vendorId: c.accountId,
                  vendorName: c.accountName,
                  totalOutstanding: c.accountBalance || 0,
                }));

                setCustomerModal(false);
              }}
              className="w-full text-left border rounded-2xl px-4 py-2 hover:bg-orange-50 transition"
            >
              <p className="font-semibold">
                {c.accountName}
              </p>

              <p className="text-xs text-gray-500 mt-1">
                {c.accountId}
              </p>
            </button>
          ))}
        </div>
      </Modal>


      {/* VIEW MODAL */}
      {isViewOpen && selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">

            {/* Header */}
            <div className="bg-orange-600 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">
                  Other Payment
                </h2>

                <p className="text-xs opacity-90">
                  Payment Details
                </p>
              </div>

              <button
                onClick={closeViewModal}
                className="text-white hover:text-gray-200 text-xl"
              >
                ✕
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-6 space-y-5 overflow-y-auto">

              {/* Customer */}
              <div className="border rounded-xl p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Account Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm">
                  <span className="font-medium text-gray-500">
                    Account Name
                  </span>

                  <span className="col-span-2">
                    {selected.accountName} ({selected.accountId})
                  </span>
                </div>
              </div>

              {/* Invoice */}
              <div className="border rounded-xl p-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Payment Information
                </h3>

                <div className="grid grid-cols-3 gap-2 text-sm mb-4">
                  <span className="font-medium text-gray-500">
                    Voucher No
                  </span>

                  <span className="col-span-2 font-semibold text-orange-600">
                    {selected.trxId}
                  </span>

                  <span className="font-medium text-gray-500">
                    Date
                  </span>

                  <span className="col-span-2">
                    {formatDate(selected.trxDate)}
                  </span>

                  <span className="font-medium text-gray-500">
                    Reference
                  </span>

                  <span className="col-span-2">
                    {selected.referenceId}
                  </span>

                  <span className="font-medium text-gray-500">
                    Description
                  </span>

                  <span className="col-span-2">
                    {selected.description}
                  </span>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-5">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700 font-semibold">
                    Voucher Amount
                  </span>

                  <span className="text-2xl font-bold text-orange-600">
                    Rs. {formatNumber(selected.amount)}
                  </span>
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="border-t px-6 py-4 flex justify-end bg-white">
              <button
                onClick={closeViewModal}
                className="px-5 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}


    </div>
  );
}