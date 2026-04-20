import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";

Modal.setAppElement("#root");

export default function StockBinCardPage() {
  const [stocks, setStocks] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [binCard, setBinCard] = useState([]);
  const [selectedStock, setSelectedStock] = useState(null);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [totals, setTotals] = useState({ inQty: 0, outQty: 0 });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const headers = { Authorization: `Bearer ${token}` };

  // ---------------- FETCH STOCKS ----------------
  const fetchStocks = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        { headers }
      );
      setStocks(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load stocks");
    }
  };

  // ---------------- FETCH TRANSACTIONS ----------------
  const fetchTransactions = async () => {
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
        { headers }
      );
      setTransactions(res.data.data || res.data || []);
    } catch {
      toast.error("Failed to load transactions");
    }
  };

  useEffect(() => {
    fetchStocks();
    fetchTransactions();
  }, []);

  // ---------------- CLOSE MODAL (SAFE FOCUS RESET) ----------------
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedStock(null);

    // ✅ FIX ARIA / FOCUS ISSUE
    document.activeElement?.blur();
  };

  // ---------------- GENERATE BIN CARD ----------------
  const generateBinCard = (stock) => {
    // ✅ IMPORTANT FIX: remove focus BEFORE opening modal
    document.activeElement?.blur();

    setSelectedStock(stock);
    setLoading(true);

    const flat = [];

    transactions.forEach((trx) => {
      trx.items.forEach((item) => {
        if (item.stockId === stock.stockId) {
          flat.push({
            trxDate: trx.trxDate,
            trxType: trx.trxType,
            referenceId: trx.referenceId,
            quantity: item.quantity,
            isAdded: trx.isAdded,
          });
        }
      });
    });

    let filtered = [...flat];

    if (fromDate) {
      filtered = filtered.filter(
        (t) => new Date(t.trxDate) >= new Date(fromDate)
      );
    }

    if (toDate) {
      filtered = filtered.filter(
        (t) => new Date(t.trxDate) <= new Date(toDate)
      );
    }

    filtered.sort((a, b) => new Date(a.trxDate) - new Date(b.trxDate));

    let openingBalance = 0;

    flat.forEach((t) => {
      if (!fromDate || new Date(t.trxDate) < new Date(fromDate)) {
        openingBalance += t.isAdded ? t.quantity : -t.quantity;
      }
    });

    let balance = openingBalance;
    let totalIn = 0;
    let totalOut = 0;

    const computed = filtered.map((t) => {
      let qtyIn = 0;
      let qtyOut = 0;

      if (t.isAdded) {
        qtyIn = t.quantity;
        balance += qtyIn;
        totalIn += qtyIn;
      } else {
        qtyOut = t.quantity;
        balance -= qtyOut;
        totalOut += qtyOut;
      }

      return { ...t, qtyIn, qtyOut, balance };
    });

    setTotals({ inQty: totalIn, outQty: totalOut });
    setBinCard(computed);

    setIsModalOpen(true);
    setLoading(false);
  };

  // ---------------- UI ----------------
  return (
    <div className="p-4 max-w-7xl mx-auto">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            📦 Stock Bin Card
          </h1>
          <p className="text-sm text-gray-600">
            Inventory movement & stock tracking
          </p>
        </div>

        <button
          onClick={() => navigate("/stock")}
          className="px-6 h-12 rounded-lg border border-orange-400 text-orange-400 font-semibold hover:bg-orange-400 hover:text-white transition"
        >
          ← Back
        </button>
      </div>

      {/* FILTER */}
      <div className="flex gap-3 mb-4 flex-wrap">
        <input
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
          className="border p-2 rounded"
        />
        <input
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
          className="border p-2 rounded"
        />
      </div>

      {/* STOCK LIST */}
      <div className="grid md:grid-cols-3 gap-4">
        {stocks.map((stock) => (
          <button
            key={stock._id}
            onClick={() => generateBinCard(stock)}
            className="border rounded-lg p-4 bg-white shadow hover:bg-orange-50 text-left"
          >
            <h2 className="font-semibold text-orange-600">
              {stock.stockName}
            </h2>
            <p className="text-sm text-gray-500">ID: {stock.stockId}</p>
            <p className="text-sm">
              Qty: {stock.stockQuantity} {stock.stockUOM}
            </p>
          </button>
        ))}
      </div>

      {/* MODAL */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={closeModal}
        overlayClassName="fixed inset-0 bg-black/60 flex md:items-center justify-center md:pl-64 p-3"
        className="bg-white w-full md:max-w-4xl rounded-xl shadow-xl max-h-[95vh] flex flex-col overflow-hidden mt-20 md:mt-0"
      >
        {selectedStock && (
          <>
            {/* HEADER */}
            <div className="flex justify-between p-4 border-b">
              <div>
                <h2 className="text-xl font-bold text-orange-600">
                  Bin Card - {selectedStock.stockName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedStock.stockId}
                </p>
              </div>

              <button onClick={closeModal}>✖</button>
            </div>

            {/* TOTALS */}
            <div className="flex gap-6 mb-3 font-semibold text-sm">
              <span>Total IN: {totals.inQty}</span>
              <span>Total OUT: {totals.outQty}</span>
            </div>

            {/* TABLE */}
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm border">
                  <thead className="bg-orange-100">
                    <tr>
                      <th className="px-2 py-2 text-left">Date</th>
                      <th className="px-2 py-2 text-left">Type</th>
                      <th className="px-2 py-2 text-left">Ref</th>
                      <th className="px-2 py-2 text-right">IN</th>
                      <th className="px-2 py-2 text-right">OUT</th>
                      <th className="px-2 py-2 text-right">Balance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {binCard.map((row, i) => (
                      <tr key={i} className="border-t">
                        <td className="px-2 py-2">
                          {new Date(row.trxDate).toLocaleDateString()}
                        </td>
                        <td className="px-2 py-2">{row.trxType}</td>
                        <td className="px-2 py-2">{row.referenceId || "-"}</td>
                        <td className="px-2 py-2 text-right text-green-600">
                          {row.qtyIn || ""}
                        </td>
                        <td className="px-2 py-2 text-right text-red-600">
                          {row.qtyOut || ""}
                        </td>
                        <td className="px-2 py-2 text-right font-semibold">
                          {row.balance}
                        </td>
                      </tr>
                    ))}

                    {binCard.length === 0 && (
                      <tr>
                        <td colSpan="6" className="text-center py-4 text-gray-500">
                          No transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </Modal>
    </div>
  );
}