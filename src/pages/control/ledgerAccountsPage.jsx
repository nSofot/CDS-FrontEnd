import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Plus, Search, Edit, View, X, RefreshCw, Landmark } from "lucide-react";
import LoadingSpinner from "../../components/loadingSpinner";
import Modal from "react-modal";
import { formatNumber } from "../../utils/numberFormat.js";

export default function LedgerAccountsPage() {
  window.scrollTo(0, 0);
  const [accounts, setAccounts] = useState([]);
  const [headerAccounts, setHeaderAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [transactions, setTransactions] = useState([]);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [trxLoading, setTrxLoading] = useState(false);  

  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);

  const [form, setForm] = useState({
    _id: "",
    accountId: "",
    accountName: "",
    accountType: "",
    accountBalance: 0,
    headerAccountId: "",
    headerAccountName: "",
    isNewHeader: false,
  });

  const token = localStorage.getItem("token");
  const API = import.meta.env.VITE_BACKEND_URL;

  /* ───────── FETCH DATA ───────── */
  const fetchAccounts = async () => {
    try {
      setLoading(true);

      const [accRes, headerRes] = await Promise.all([
        axios.get(`${API}/api/ledger-account`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(`${API}/api/ledger-header-account`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const sortedAccounts = (accRes.data || []).sort((a, b) =>
        a.accountId.localeCompare(b.accountId)
      );

      const sortedHeaders = (headerRes.data || []).sort((a, b) =>
        a.headerAccountName.localeCompare(b.headerAccountName)
      );

      setAccounts(sortedAccounts);
      setHeaderAccounts(sortedHeaders);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load accounts");
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchAccounts();
  }, [token]);

  const fetchTransactions = async (accountId, from, to) => {
    try {
      setTrxLoading(true);

      const res = await axios.get(
        `${API}/api/ledger-transaction/${accountId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      let data = res.data || [];

      // date filter (frontend filter for flexibility)
      if (from) {
        data = data.filter((t) => new Date(t.trxDate) >= new Date(from));
      }
      if (to) {
        data = data.filter((t) => new Date(t.trxDate) <= new Date(to));
      }

      // sort by date
      data.sort((a, b) => new Date(a.trxDate) - new Date(b.trxDate));

      // calculate running balance
      let balance = 0;

      const enriched = data.map((t) => {
        if (t.isCredit) {
          balance += t.trxAmount;
        } else {
          balance -= t.trxAmount;
        }

        return { ...t, balance };
      });

      setTransactions(enriched);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setTrxLoading(false);
    }
  };


  /* ───────── FILTER ACCOUNTS ───────── */
  const filteredAccounts = useMemo(() => {
    return accounts.filter((a) =>
      `${a.accountName} ${a.accountId}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [accounts, search]);


  /* ───────── FILTER HEADERS ───────── */
  const filteredHeaders = useMemo(() => {
    return headerAccounts.filter(
      (h) => h.accountType === form.accountType
    );
  }, [headerAccounts, form.accountType]);


  const headerMap = useMemo(() => {
    const map = {};
    headerAccounts.forEach((h) => {
      map[h.headerAccountId] = h.headerAccountName;
    });
    return map;
  }, [headerAccounts]);


  /* ───────── RESET FORM ───────── */
  const resetForm = () => {
    setForm({
      _id: "",
      accountId: "",
      accountName: "",
      accountType: "",
      accountBalance: 0,
      headerAccountId: "",
      headerAccountName: "",
      isNewHeader: false,
    });
  };

  /* ───────── CREATE ───────── */
  const openCreate = () => {
    resetForm();
    setIsEdit(false);
    setIsModalOpen(true);
  };


  /* ───────── EDIT ───────── */
  const openEdit = (acc) => {
    setForm({
      _id: acc._id,
      accountId: acc.accountId,
      accountName: acc.accountName,
      accountType: acc.accountType,
      accountBalance: acc.accountBalance || 0,
      headerAccountId: acc.headerAccountId || "",
      headerAccountName: headerMap[acc.headerAccountId] || "",
      isNewHeader: false,
    });

    setIsEdit(true);
    setIsModalOpen(true);
  };


    /* ───────── VIEW ───────── */
  const openView = (acc) => {
    setForm(acc);

    setFromDate("");
    setToDate("");
    setTransactions([]);

    setIsViewModalOpen(true);

    fetchTransactions(acc.accountId, "", "");
  };


  /* ───────── SAVE ───────── */
  const handleSave = async () => {      
    try {
      if (!form.accountType?.trim()) {
        return toast.error("Account type required");
      }
      if (!form.headerAccountName?.trim()) {
        return toast.error("Header account required");
      }
      if (!form.accountName?.trim()) {
        return toast.error("Account Name required");
      }

      let headerAccountId = form.headerAccountId;

      /* CREATE HEADER IF NEEDED */
      if (!headerAccountId || form.isNewHeader) {
        if (!form.headerAccountName) {
          return toast.error("Header account name required");
        }

        const headerRes = await axios.post(
          `${API}/api/ledger-header-account`,
          {
            accountType: form.accountType,
            headerAccountName: form.headerAccountName,
          },
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );     
        toast.success("Header account created");  
        headerAccountId = headerRes.data.headerAccountId;
      }

      const payload = {
        accountName: form.accountName,
        accountType: form.accountType,
        headerAccountId,
        accountBalance: Number(form.accountBalance || 0),
      };

      if (isEdit) {
        await axios.put(
          `${API}/api/ledger-account/${form.accountId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        toast.success("Account updated");
      } else {         
        await axios.post(`${API}/api/ledger-account`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Account created");
      }

      setIsModalOpen(false);
      resetForm();
      fetchAccounts();
    } catch (err) {
      console.error(err);
      toast.error("Operation failed");
    }
  };


  /* ───────── UI ───────── */
  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
      <div className="max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border p-5 mb-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Landmark className="text-orange-500" />
              Ledger Accounts
            </h1>
            <p className="text-sm text-gray-500">
              Manage financial accounts
            </p>
          </div>

          <button
            onClick={openCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white px-5 py-3 rounded-xl flex items-center gap-2"
          >
            <Plus size={18} />
            New Account
          </button>
        </div>

        {/* SEARCH */}
        <div className="bg-white border rounded-2xl p-5 mb-5 flex gap-3">
          <div className="relative w-full">
            <Search className="absolute left-3 top-3 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search accounts..."
              className="w-full pl-10 p-3 border rounded-xl bg-gray-50"
            />
          </div>

          <button
            onClick={fetchAccounts}
            className="px-4 py-3 border rounded-xl text-orange-600"
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="bg-white p-10 text-center rounded-2xl border">
            Loading...
          </div>
        )}

        {/* EMPTY */}
        {!loading && filteredAccounts.length === 0 && (
          <div className="bg-white p-10 text-center rounded-2xl border">
            No accounts found
          </div>
        )}

        {/* TABLE (DESKTOP + TABLET) */}
        <div className="hidden md:block bg-white border rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px]">
              <thead className="bg-orange-50">
                <tr>
                  <th className="p-4 text-left whitespace-nowrap">Account ID</th>
                  <th className="p-4 text-left whitespace-nowrap">Type</th>
                  <th className="p-4 text-left whitespace-nowrap">Header Account</th>
                  <th className="p-4 text-left whitespace-nowrap">Name</th>
                  <th className="p-4 text-right whitespace-nowrap">Balance</th>
                  <th className="p-4 text-center whitespace-nowrap">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map((acc) => (
                  <tr key={acc._id} className="border-t hover:bg-orange-50">
                    <td className="p-4 whitespace-nowrap">{acc.accountId}</td>
                    <td className="p-4 whitespace-nowrap">{acc.accountType}</td>
                    <td className="p-4 whitespace-nowrap">
                      {headerMap[acc.headerAccountId] || "N/A"}
                    </td>
                    <td className="p-4 whitespace-nowrap">{acc.accountName}</td>
                    <td className="p-4 text-right whitespace-nowrap">
                      {formatNumber(acc.accountBalance || 0)}
                    </td>
                    <td className="p-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => openEdit(acc)}
                        className="px-3 py-2 border rounded-xl"
                      >
                        <Edit size={16} />
                      </button>
                       <button
                        onClick={() => openView(acc)}
                        className="px-3 py-2 border rounded-xl ml-2"
                      >
                        <View size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MOBILE CARDS (optional but recommended) */}
        <div className="md:hidden space-y-3">
          {filteredAccounts.map((acc) => (
            <div key={acc._id} className="bg-white border rounded-2xl p-4">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm text-gray-500">{acc.accountId}</p>
                  <p className="font-semibold">{acc.accountName}</p>
                </div>
              </div>

              <div className="mt-3 text-sm grid grid-cols-2 gap-2">
                <div>
                  <p className="text-gray-500">Type</p>
                  <p>{acc.accountType}</p>
                </div>

                <div>
                  <p className="text-gray-500">Header</p>
                  <p>{headerMap[acc.headerAccountId] || "N/A"}</p>
                </div>

                <div className="flex justify-between col-span-2 items-center">
                  <div className="col-span-2">
                    <p className="text-gray-500">Balance</p>
                    <p className="font-semibold">
                      {formatNumber(acc.accountBalance || 0)}
                    </p>
                  </div>
                  <div>
                    <button
                      onClick={() => openEdit(acc)}
                      className="px-3 py-2 border rounded-xl"
                    >
                      <Edit size={16} />
                    </button>
                      <button
                      onClick={() => openView(acc)}
                      className="px-3 py-2 border rounded-xl ml-2"
                    >
                      <View size={16} />
                    </button>    
                  </div>              
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl p-6 relative">

              <button
                onClick={() => setIsModalOpen(false)}
                className="absolute right-4 top-4"
              >
                <X />
              </button>

              <h2 className="text-xl font-bold mb-4">
                {isEdit ? "Edit Account" : "Create Account"}
              </h2>

              <div className="space-y-3">

                {/* TYPE */}
                <select
                  disabled={isEdit}
                  value={form.accountType}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      accountType: e.target.value,
                      headerAccountId: "",
                      headerAccountName: "",
                      isNewHeader: false,
                    }))
                  }
                  className="w-full p-3 border rounded-xl"
                >
                  <option value="">Select Type</option>
                  <option value="Income">Income</option>
                  <option value="Expense">Expense</option>
                  <option value="Asset">Asset</option>
                  <option value="Liability">Liability</option>
                  <option value="Equity">Equity</option>
                </select>

                {/* HEADER */}
                {form.accountType && (
                  <div className="space-y-2">

                    <select
                      disabled={isEdit}
                      value={form.isNewHeader ? "__new" : form.headerAccountId || ""}
                      onChange={(e) => {
                        const value = e.target.value;

                        // NEW HEADER
                        if (value === "__new") {
                          setForm((prev) => ({
                            ...prev,
                            isNewHeader: true,
                            headerAccountId: "",
                            headerAccountName: "",
                          }));
                          return;
                        }

                        // EXISTING HEADER
                        const selected = headerAccounts.find(
                          (h) => h.headerAccountId === value
                        );

                        if (selected) {
                          setForm((prev) => ({
                            ...prev,
                            headerAccountId: selected.headerAccountId,
                            headerAccountName: selected.headerAccountName,
                            isNewHeader: false,
                          }));
                        }
                      }}
                      className="w-full p-3 border rounded-xl"
                    >
                      <option value="">Select Header</option>

                      {headerAccounts
                        .filter((h) => h.accountType === form.accountType)
                        .map((h) => (
                          <option key={h.headerAccountId} value={h.headerAccountId}>
                            {h.headerAccountName}
                          </option>
                        ))}

                      <option value="__new">+ New Header</option>
                    </select>

                    {/* NEW HEADER INPUT */}
                    {form.isNewHeader && (
                      <input
                        value={form.headerAccountName}
                        onChange={(e) =>
                          setForm((prev) => ({
                            ...prev,
                            headerAccountName: e.target.value,
                          }))
                        }
                        placeholder="Header name"
                        className="w-full p-3 border rounded-xl"
                      />
                    )}
                  </div>
                )}

                {/* NAME */}
                <input
                  value={form.accountName}
                  onChange={(e) =>
                    setForm({ ...form, accountName: e.target.value })
                  }
                  placeholder="Account Name"
                  className="w-full p-3 border rounded-xl"
                />

                {/* SAVE */}
                <button
                  onClick={handleSave}
                  className="w-full bg-orange-500 text-white py-3 rounded-xl"
                >
                  {isEdit ? "Update" : "Create"}
                </button>

              </div>
            </div>
          </div>
        )}


        {/* VIEW MODAL */}
        {isViewModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-black/40">
          <div className="flex items-center justify-center min-h-screen p-4">
            
            <div className="bg-white w-full max-w-4xl rounded-2xl p-6 relative max-h-[90vh] overflow-y-auto">
              {/* CLOSE */}
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute right-4 top-4"
              >
                <X />
              </button>

              <h2 className="text-xl font-bold mb-4">
                Ledger Account Statement
              </h2>
              <p className="text-xl text-gray-800 mb-1">
                Account: {form.accountName}
              </p>

              {/* ACCOUNT INFO */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5 bg-gray-50 p-4 rounded-xl">
                <Info label="Account ID" value={form.accountId} />
                <Info label="Type" value={form.accountType} />
                <Info label="Header" value={headerMap[form.headerAccountId] || "N/A"} />
                <Info label="Balance" value={formatNumber(form.accountBalance || 0)} />
              </div>

              {/* DATE FILTER */}
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="border p-2 rounded-xl w-full"
                />

                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="border p-2 rounded-xl w-full"
                />

                <button
                  onClick={() =>
                    fetchTransactions(form.accountId, fromDate, toDate)
                  }
                  className="bg-orange-500 text-white px-4 py-2 rounded-xl"
                >
                  Filter
                </button>
              </div>

              {/* TABLE */}
              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full min-w-[800px] text-sm">
                  <thead className="bg-orange-50">
                    <tr>
                      <th className="p-3 text-left">Date</th>
                      <th className="p-3 text-left">Trx ID</th>
                      <th className="p-3 text-left">Description</th>
                      <th className="p-3 text-right">Debit</th>
                      <th className="p-3 text-right">Credit</th>
                      <th className="p-3 text-right">Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {trxLoading ? (
                      <tr>
                        <td colSpan="6" className="text-center p-5">
                          Loading...
                        </td>
                      </tr>
                    ) : transactions.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center p-5">
                          No transactions found
                        </td>
                      </tr>
                    ) : (
                      transactions.map((t) => (
                        <tr key={t._id} className="border-t">
                          <td className="p-3">
                            {new Date(t.trxDate).toLocaleDateString()}
                          </td>
                          <td className="p-3">{t.trxId}</td>
                          <td className="p-3">{t.description}</td>

                          <td className="p-3 text-right">
                            {!t.isCredit ? formatNumber(t.trxAmount) : "-"}
                          </td>

                          <td className="p-3 text-right">
                            {t.isCredit ? formatNumber(t.trxAmount) : "-"}
                          </td>

                          <td className="p-3 text-right font-semibold">
                            {formatNumber(t.balance)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        )}


      </div>
    </div>
  );
}

/* INFO COMPONENT */
function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-semibold">{value}</p>
    </div>
  );
}