import { useEffect, useState, useRef, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";
import { useNavigate } from "react-router-dom";
import { FaRegFilePdf } from "react-icons/fa";
import html2pdf from "html2pdf.js/dist/html2pdf.bundle";

Modal.setAppElement("#root");

export default function BagSaleInvoicePage() {

  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  // ---------------- STATE ----------------

  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState([]);
  const [orders, setOrders] = useState([]);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const [items, setItems] = useState([]);

  const [invoiceDate, setInvoiceDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [orderNumber, setOrderNumber] = useState("");
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [loading, setLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const [isCustomerModalOpen, setCustomerModalOpen] = useState(false);
  const [isOrderModalOpen, setOrderModalOpen] = useState(false);

  const reportRef = useRef();

  // ---------------- FETCH ----------------

  useEffect(() => {
    fetchCustomers();
    fetchProducts();
    fetchBatches();
    fetchOrders();
  }, []);

  const fetchCustomers = async () => {
    try {

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/member`,
        { headers }
      );

      setCustomers(res.data || []);

    } catch {
      toast.error("Failed to load customers");
    }
  };

  const fetchProducts = async () => {
    try {

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        { headers }
      );

      const filtered = res.data.filter(
        (item) =>
          item.stockCategory === "finished products"
      );

      setProducts(filtered || []);

    } catch {
      toast.error("Failed to load products");
    }
  };

  const fetchBatches = async () => {
    try {

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/batch`
      );

      setBatches(res.data || []);

    } catch {
      toast.error("Failed to load batches");
    }
  };

  const fetchOrders = async () => {
    try {

      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/bag-order`,
        { headers }
      );

      setOrders(res.data || []);

    } catch {
      toast.error("Failed to load orders");
    }
  };

  // ---------------- FILTERED ORDERS ----------------

  const filteredOrders = orders.filter(
    (o) =>
      o.memberId === selectedCustomer?.memberId &&
      o.orderStatus === "Completed"
  );

  // ---------------- FILTERED BATCHES ----------------

  const filteredBatches = batches.filter((batch) => {

    if (!selectedOrder) return false;

    const statusMatch =
      (batch.status || "").toLowerCase() ===
      (selectedOrder.orderBagStatus || "").toLowerCase();

    const hasBalance =
      Number(batch.balanceBags || 0) > 0;

    return statusMatch && hasBalance;
  });

  // ---------------- FORMAT ----------------

  const formatDate = (date) => {

    if (!date) return "N/A";

    return new Date(date).toLocaleDateString();
  };

  const formatCurrency = (value) => {

    return Number(value || 0).toFixed(2);
  };

  const formatNumber = (value) =>
    `Rs. ${Number(value || 0).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;

  // ---------------- SELECT ORDER ----------------

  const selectOrder = (order) => {

    setSelectedOrder(order);

    setOrderNumber(order.orderNo || "");

    setItems([]);

    setOrderModalOpen(false);
  };

  // ---------------- SELECT BATCH ----------------

  const selectBatch = (batch) => {
    if (!selectedOrder) {
      return toast.error("Select order first");
    }

    const statusToStockId = {
      Substrate: "5000",
      Sterilized: "5001",
      Inoculated: "5002",
      Incubating: "5003",
    };

    const requiredStatus = selectedOrder.orderBagStatus;
    const requiredStockId = statusToStockId[requiredStatus];

    if (!requiredStockId) {
      return toast.error("Invalid order bag status");
    }

    // 1. FIND PRODUCT BY STOCK ID
    const matchedProduct = products.find(
      (p) => String(p.stockId) === String(requiredStockId)
    );

    if (!matchedProduct) {
      return toast.error("No product matches stockId for this status");
    }

    // 2. RATE CALCULATION
    const rate =
      Number(batch.totalJobValue || 0) /
      Number(batch.numberOfBags || 1);

    // 3. SET ITEM
    setItems([
      {
        productId: matchedProduct.stockId,
        productName: matchedProduct.stockName,

        qty: 0,
        inStock: batch.balanceBags || 0,
        unit: matchedProduct.stockUOM || "Bag",

        rate,
        amount: 0,

        batch: batch.batchNo,
        batchId: batch._id,

        batchNo: batch.batchNo || "",
        batchDate: batch.batchDate || "",

        batchStatus: batch.status || "",

        statusDate:
          batch.incubationDate ||
          batch.inoculationDate ||
          batch.sterilizationDate ||
          batch.batchDate ||
          "",
      },
    ]);
  };

  // ---------------- UPDATE ITEM ----------------

  const updateItem = (index, field, value) => {

    const updated = [...items];

    if (field === "qty") {

      const max = Number(updated[index].inStock || 0);

      value = Math.min(
        Math.max(Number(value || 0), 0),
        max
      );
    }

    updated[index][field] = value;

    const qty = Number(updated[index].qty || 0);
    const rate = Number(updated[index].rate || 0);

    updated[index].amount = qty * rate;

    setItems(updated);
  };

  // ---------------- REMOVE ITEM ----------------

  const removeItem = (index) => {

    setItems(items.filter((_, i) => i !== index));
  };

  // ---------------- TOTAL ----------------

  const totalAmount = items.reduce(
    (sum, item) =>
      sum + Number(item.amount || 0),
    0
  );

  // ---------------- PDF ----------------

  const handleDownloadPDF = async () => {

    try {

      const element = reportRef.current;

      await html2pdf()
        .set({
          margin: 0.3,
          filename: `Invoice_${invoiceNumber}.pdf`,
          image: {
            type: "jpeg",
            quality: 0.98,
          },
          html2canvas: {
            scale: 2,
            backgroundColor: "#ffffff",
          },
          jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait",
          },
        })
        .from(element)
        .save();

    } catch (err) {

      console.error(err);

      toast.error("PDF failed");
    }
  };

  // ---------------- SUBMIT ----------------

  const handleSubmit = async () => {
    if (!selectedCustomer) {
      return toast.error("Select customer");
    }

    if (!selectedOrder) {
      return toast.error("Select order");
    }

    if (items.length === 0) {
      return toast.error("No items added");
    }

    // VALIDATE ITEMS
    const invalidItem = items.find(
      (i) =>
        !i.productId ||
        !i.productName ||
        !i.batchNo ||
        Number(i.qty) <= 0
    );

    if (invalidItem) {
      return toast.error(
        "Each item must have product, batch and quantity"
      );
    }

    try {
      setLoading(true);

      const stockTrxPayload = {
        referenceId: selectedOrder.orderNo,
        trxDate: invoiceDate,
        trxType: "SalesInvoice",

        description:
          selectedCustomer.nameInSinhala ||
          `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,

        isAdded: false,

        clientId: selectedCustomer.memberId,

        items: items.map((i) => ({
          stockId: Number(i.productId),
          stockName: i.productName,
          quantity: Number(i.qty),
          quantityBalance: 0,
          stockUOM: i.unit || "Bag",
          stockCost: Number(i.cost || 0),
          stockPrice: Number(i.rate || 0),
        })),
      };

      const stockTrxRes = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
        stockTrxPayload,
        { headers }
      );

      const newTrxId = stockTrxRes.data.data.issuedTrxId;

      setInvoiceNumber(newTrxId);

      toast.success("Invoice Created");

      setIsSaved(true);

    } catch (err) {
      console.error("FULL ERROR => ", err?.response?.data || err);

      toast.error(
        err?.response?.data?.message ||
        "Failed to create invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------- UI ----------------

  return (
    <div className="max-w-6xl mx-auto p-4">

      {/* HEADER */}

      <div className="flex justify-between items-center mb-6">

        <div>
          <h1 className="text-2xl font-bold text-orange-600">
            🧾 Bag Sale Invoice
          </h1>

          <p className="text-sm text-gray-500">
            Create bag sales invoice
          </p>
        </div>

        <div className="flex gap-3">

          <button
            onClick={handleDownloadPDF}
            disabled={!isSaved}
            className="flex gap-2 items-center px-5 py-3 rounded-xl text-white"
            style={{
              backgroundColor:
                !isSaved
                  ? "#9ca3af"
                  : "#ea580c",
            }}
          >
            <FaRegFilePdf size={20} />
            PDF
          </button>

          <button
            onClick={() => navigate("/control")}
            className="bg-black text-white px-5 py-3 rounded-xl"
          >
            ← Back
          </button>

        </div>
      </div>

      {/* CUSTOMER */}

      <div className="bg-white p-4 rounded-xl shadow mb-6">

        <label className="text-sm font-medium">
          Customer
        </label>

        <button
          onClick={() =>
            setCustomerModalOpen(true)
          }
          className="w-full border p-3 mt-2 rounded-lg text-left"
        >

          {selectedCustomer ? (

            <>
              <p className="font-semibold">
                {selectedCustomer.nameInSinhala ||
                  `${selectedCustomer.firstName} ${selectedCustomer.lastName}`}
              </p>

              <p className="text-xs text-gray-500">
                {selectedCustomer.memberId}
              </p>
            </>

          ) : (

            <span className="text-gray-400">
              Select Customer
            </span>
          )}
        </button>
      </div>

      {/* DATE + ORDER */}

      <div className="flex flex-col md:flex-row bg-white p-4 rounded-xl shadow mb-6 gap-4">

        {/* DATE */}

        <div className="flex flex-col w-full md:w-1/4">

          <label className="text-sm font-medium">
            Invoice Date
          </label>

          <input
            type="date"
            value={invoiceDate}
            onChange={(e) =>
              setInvoiceDate(e.target.value)
            }
            className="border p-2 mt-2 rounded-lg"
          />
        </div>

        {/* ORDER */}

        <div className="flex flex-col w-full md:w-3/4">

          <label className="text-sm font-medium">
            Order No
          </label>

          <button
            disabled={
              !selectedCustomer ||
              filteredOrders.length === 0
            }
            onClick={() =>
              setOrderModalOpen(true)
            }
            className="w-full border p-2 mt-2 rounded-lg text-left"
          >

            {selectedOrder ? (

              <div className="flex flex-col md:flex-row md:items-center gap-2">
                <p className="font-semibold">
                  {selectedOrder.orderNo}
                </p>

                <p className="text-gray-500">
                   {formatDate(selectedOrder.orderDate)}{" "}|{" "}
                  {formatDate(selectedOrder.orderRequestedDate)}{" "}|{" "}
                  {selectedOrder.orderQuantity}{" "}
                  {selectedOrder.orderBagStatus} Bags
                </p>
              </div>

            ) : (

              <span className="text-gray-400">
                Select Order
              </span>
            )}
          </button>
        </div>
      </div>

      {/* BATCHES */}

      <div className="bg-white p-4 rounded-xl shadow mb-6">

        <h2 className="font-semibold mb-4">
          Available Batches
        </h2>

        {!selectedOrder ? (

          <div className="text-gray-400">
            Select order to view batches
          </div>

        ) : filteredBatches.length === 0 ? (

          <div className="text-red-500">
            No available batches
          </div>

        ) : (

          <table className="w-full text-sm border">

            <thead className="bg-orange-100">
              <tr>
                <th className="p-2 text-left">
                  Select
                </th>

                <th className="p-2 text-left">
                  Batch No
                </th>

                <th className="p-2 text-left">
                  Batch Date
                </th>

                <th className="p-2 text-left">
                  Status
                </th>

                <th className="p-2 text-right">
                  Available
                </th>

                <th className="p-2 text-right">
                  Price
                </th>
              </tr>
            </thead>

            <tbody>

              {filteredBatches.map((batch) => (

                <tr
                  key={batch._id}
                  className="border-t"
                >

                  <td className="p-2">

                    <button
                      onClick={() =>
                        selectBatch(batch)
                      }
                      className="bg-orange-500 text-white px-3 py-1 rounded"
                    >
                      Select
                    </button>
                  </td>

                  <td className="p-2">
                    {batch.batchNo}
                  </td>

                  <td className="p-2">
                    {formatDate(batch.batchDate)}
                  </td>

                  <td className="p-2">
                    {batch.status}
                  </td>

                  <td className="p-2 text-right">
                    {batch.balanceBags}
                  </td>

                  <td className="p-2 text-right">
                    {formatNumber(
                      Number(batch.totalJobValue || 0) /
                        Number(batch.numberOfBags || 1)
                    )}
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ITEMS */}

      <div className="bg-white p-4 rounded-xl shadow mb-6">

        <table className="w-full text-sm">

          <thead className="bg-orange-50">
            <tr>

              <th className="p-2 text-left">
                Product
              </th>

              <th className="p-2 text-right">
                Qty
              </th>

              <th className="p-2 text-right">
                Available
              </th>

              <th className="p-2 text-left">
                UOM
              </th>

              <th className="p-2 text-right">
                Rate
              </th>

              <th className="p-2 text-right">
                Amount
              </th>

              <th className="p-2 text-center"></th>

            </tr>
          </thead>

          <tbody>

            {items.map((item, index) => (

              <Fragment key={index}>

                <tr className="border-t">

                  <td className="p-2">

                    <div>
                      {item.productName}
                    </div>

                    <div className="text-xs text-blue-600">
                      Batch: {item.batchNo}
                    </div>
                  </td>

                  <td className="p-2 text-right">

                    <input
                      type="number"
                      value={item.qty}
                      max={item.inStock}
                      min={0}
                      onChange={(e) =>
                        updateItem(
                          index,
                          "qty",
                          e.target.value
                        )
                      }
                      className="w-20 text-right border rounded px-2 py-1"
                    />
                  </td>

                  <td className="p-2 text-right">
                    {item.inStock}
                  </td>

                  <td className="p-2">
                    {item.unit}
                  </td>

                  <td className="p-2 text-right">
                    {formatCurrency(item.rate)}
                  </td>

                  <td className="p-2 text-right">
                    {formatCurrency(item.amount)}
                  </td>

                  <td className="p-2 text-center">

                    <button
                      onClick={() =>
                        removeItem(index)
                      }
                      className="text-red-500"
                    >
                      ✖
                    </button>
                  </td>
                </tr>

              </Fragment>
            ))}

          </tbody>
        </table>
      </div>

      {/* TOTAL */}

      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow mb-4">

        <span className="font-semibold">
          Total
        </span>

        <span className="text-xl font-bold text-green-600">
          {formatCurrency(totalAmount)}
        </span>
      </div>

      {/* SUBMIT */}

      <button
        onClick={handleSubmit}
        disabled={loading || isSaved}
        className={`w-full py-3 rounded-xl text-white ${
          loading || isSaved
            ? "bg-gray-400"
            : "bg-green-600"
        }`}
      >
        {loading
          ? "Saving..."
          : isSaved
          ? "Completed"
          : "Create Invoice"}
      </button>

      {/* PDF */}

      <div style={{ display: "none" }}>
        <div ref={reportRef}>

          <h1>
            Invoice #{invoiceNumber}
          </h1>

        </div>
      </div>

      {/* CUSTOMER MODAL */}

      <Modal
        isOpen={isCustomerModalOpen}
        onRequestClose={() =>
          setCustomerModalOpen(false)
        }
        className="bg-white p-4 max-w-md mx-auto mt-20 rounded-xl max-h-[70vh] overflow-y-auto"
      >

        <h2 className="font-bold mb-3">
          Select Customer
        </h2>

        {customers.map((c) => (

          <div
            key={c._id}
            onClick={() => {

              setSelectedCustomer(c);

              setSelectedOrder(null);

              setItems([]);

              setOrderNumber("");

              setCustomerModalOpen(false);
            }}
            className="p-3 border mb-2 rounded cursor-pointer hover:bg-orange-50"
          >

            {c.nameInSinhala ||
              `${c.firstName} ${c.lastName}`}
          </div>
        ))}
      </Modal>

      {/* ORDER MODAL */}

      <Modal
        isOpen={isOrderModalOpen}
        onRequestClose={() =>
          setOrderModalOpen(false)
        }
        className="bg-white p-4 max-w-md mx-auto mt-20 rounded-xl max-h-[70vh] overflow-y-auto"
      >

        <h2 className="font-bold mb-3">
          Select Order
        </h2>

        {filteredOrders.map((o) => (

          <div
            key={o._id}
            onClick={() =>
              selectOrder(o)
            }
            className="p-3 border mb-2 rounded cursor-pointer hover:bg-orange-50"
          >

            {o.orderNo} |{" "}
            {formatDate(o.orderRequestedDate)} |{" "}
            {o.orderQuantity}{" "}
            {o.orderBagStatus} Bags

          </div>
        ))}
      </Modal>

    </div>
  );
}