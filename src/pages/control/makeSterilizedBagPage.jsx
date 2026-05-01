import { useEffect, useMemo, useState, Fragment } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function MakeSterilizedBagPage() {
   
    const navigate = useNavigate();

    const getLocalDate = () => {
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const localDate = new Date(today.getTime() - offset * 60000);
      return localDate.toISOString().split("T")[0];
    };

    const [trxDate, setTrxDate] = useState(getLocalDate());     
    const [batchDetails, setBatchDetails] = useState([]);
    const [sterilizingMmaterial, setSterilizingMmaterial] = useState([]);
    const [materials, setMaterials] = useState([]);
   
    const [numberOfBags, setNumberOfBags] = useState("");
    const [batchNumber, setBatchNumber] = useState("");
    let newBatchId = "";
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState("");

    const token = localStorage.getItem("token");

    const getAuthHeaders = () => {
      if (!token) return null;
      return { Authorization: `Bearer ${token}` };
    };

    const handleAuthError = (err) => {
      if (err.response?.status === 403) {
        toast.error("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      } else {
        toast.error("Something went wrong");
      }
    };

    const fetchStocks = async () => {
      try {
        setLoading(true);

        const [stockRes, batchRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stock`, {
            headers: getAuthHeaders(),
          }),

          axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/batch`, {
            headers: getAuthHeaders(),
          }),
        ]);

        /* ---------------- STOCKS ---------------- */
        const allStocks = stockRes.data?.data || stockRes.data || [];

        const filteredSmStocks = allStocks
          .filter((item) => item.stockCategory === "sterilizing material")
          .sort((a, b) => a.stockName.localeCompare(b.stockName));

        setSterilizingMmaterial(filteredSmStocks);

        /* ---------------- BATCHES ---------------- */
        const allBatches = batchRes.data?.data || batchRes.data || [];

        const filteredBatches = allBatches.filter(
          (item) => item.status === "Substrate"
        );

        setBatchDetails(filteredBatches);

      } catch (error) {
        console.error(error);
        toast.error("Failed to load stock materials");
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchStocks();
    }, []);

    const [otherExpenses, setOtherExpenses] = useState({
      "9010": { expenseId: "9010", name: "Water for Sterilization", price: 2.5, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9011": { expenseId: "9011", name: "Electricity for Sterilization", price: 3.0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9012": { expenseId: "9012", name: "Machine Depreciation for Sterilization", price: 5.0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9013": { expenseId: "9013", name: "Labor Cost for Sterilization", price: 6.0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9014": { expenseId: "9014", name: "Transport for Sterilization", price: 0, editablePrice: 0, qty: 0, rowTotal: 0 },
      "9015": { expenseId: "9015", name: "Other for Sterilization", price: 0, editablePrice: 0, qty: 0, rowTotal: 0 },
    });


    useEffect(() => {
      const bagCount = Number(numberOfBags || 0);

      setSterilizingMmaterial((prev) =>
        prev.map((item) => {
          if (!item.isSelected) return item;

          const calculatedQty =
            bagCount * Number(item.baseQuantity || 0);

          const maxQty = Number(item.stockQuantity || 0);

          // Ensure totalQty does not exceed available stock
          const finalQty =
            calculatedQty > maxQty ? maxQty : calculatedQty;

          return {
            ...item,
            totalQty: finalQty,
            rowTotalValue:
              finalQty * Number(item.stockPrice || 0),
            rowCostValue:
              finalQty * Number(item.stockCost || 0),
          };
        })
      );

      setOtherExpenses((prev) => {
        const updated = {};

        Object.entries(prev).forEach(([id, item]) => {
          updated[id] = {
            ...item,
            qty: item.isSelected ? bagCount : 0,
            rowTotal:
              item.isSelected && item.editablePrice > 0
                ? bagCount * Number(item.editablePrice || 0)
                : 0,
          };
        });

        return updated;
      });
    }, [numberOfBags]);


    const handleQtyChange = (type, index, value) => {
      const bagCount = Number(numberOfBags || 0);
      const totalQty = Number(value || 0);

      setSterilizingMmaterial((prev) =>
        prev.map((item, i) =>
          i === index
            ? {
                ...item,
                totalQty,
                rowTotalValue: totalQty * Number(item.stockPrice || 0),
                rowCostValue: totalQty * Number(item.stockCost || 0),
              }
            : item
        )        
      );     
    };

    const handleOtherExpenseChange = (id, value) => {
      const editablePrice = Number(value || 0);
      const bagCount = Number(numberOfBags || 0);

      setOtherExpenses((prev) => {
        return {
          ...prev,
          [id]: {
            ...prev[id],
            editablePrice,
            qty: bagCount,
            rowTotal: bagCount > 0 ? bagCount * editablePrice : 0,
          },
        };
      });
    };

    const formatDate = (date) => {
      if (!date) return "N/A";
      return new Date(date).toLocaleDateString();
    }

    const handleCheckboxChange = (type, index, checked) => {
      const bagCount = Number(numberOfBags || 0);

      /* =======================
        STERILIZING MATERIALS
      ======================== */
      if (type === "sm") {        
        setSterilizingMmaterial((prev) =>
          prev.map((item, i) => {
            if (i !== index) return item;

            const baseQty = Number(item.baseQuantity || 0);
            const maxQty = Number(item.stockQuantity || 0);

            const calculatedQty = checked ? bagCount * baseQty : 0;

            const finalQty = Math.min(calculatedQty, maxQty);

            return {
              ...item,
              isSelected: checked,
              totalQty: finalQty,
              rowTotalValue: checked
                ? finalQty * Number(item.stockPrice || 0)
                : 0,
              rowCostValue: checked
                ? finalQty * Number(item.stockCost || 0)
                : 0,
            };
          })
        );
      }

      /* =======================
        BAG DETAILS
      ======================== */
      if (type === "bd") {
        setBatchDetails((prev) => {
          const updated = prev.map((item, i) => ({
            ...item,
            isSelected: i === index ? checked : false,
          }));

          const selected = updated.find((item) => item.isSelected);

          setNumberOfBags(selected ? Number(selected.numberOfBags || 0) : 0);

          return updated;
        });
      }

      /* =======================
        OTHER EXPENSES
      ======================== */
      if (type === "oe") {        
        setOtherExpenses((prev) => {
          const item = prev[index];

          const price = checked
            ? Number(item.editablePrice || item.price || 0)
            : 0;

          return {
            ...prev,
            [index]: {
              ...item,
              isSelected: checked,
              editablePrice: price,
              qty: checked ? bagCount : 0,
              rowTotal: checked ? bagCount * price : 0,
            },
          };
        });
      }
    };

    const bagCount = Number(numberOfBags || 0);

    const selectedSubstrate = useMemo(() => {
      return sterilizingMmaterial.filter((i) => i.isSelected);
    }, [sterilizingMmaterial]);

    const substrateTotals = useMemo(() => {
      return sterilizingMmaterial
        .filter((item) => item.isSelected)
        .reduce(
          (acc, item) => {
            acc.totalQty += Number(item.totalQty || 0);
            acc.cost += Number(item.rowCostValue || 0);
            acc.value += Number(item.rowTotalValue || 0);

            return acc;
          },
          {
            totalQty: 0,
            cost: 0,
            value: 0,
          }
        );
    }, [sterilizingMmaterial]);    

    const otherExpenseTotals = useMemo(() => {
      return Object.values(otherExpenses)
        .filter((item) => item.isSelected)
        .reduce(
          (acc, item) => {
            acc.value += Number(item.rowTotal || 0);
            return acc;
          },
          {
            value: 0,
          }
        );
    }, [otherExpenses]);

    const batchTotals = useMemo(() => {
      return batchDetails
        .filter((item) => item.isSelected)
        .reduce(
          (acc, item) => {
            acc.cost += Number(item.totalCostValue || 0);
            acc.value += Number(item.totalJobValue || 0);
            return acc;
          },
          { cost: 0, value: 0 }
        );
    }, [batchDetails]);    

    const totalCostValue = useMemo(() => {
      return (
        substrateTotals.cost +
        otherExpenseTotals.value +
        batchTotals.cost
      );
    }, [substrateTotals, otherExpenseTotals, batchTotals]);

    const totalJobValue = useMemo(() => {
      return (
        substrateTotals.value +
        otherExpenseTotals.value +
        batchTotals.value
      );
    }, [substrateTotals, otherExpenseTotals, batchTotals]);


    // Submitting the form save
    const handleSubmit = async () => {
      setIsSubmitting(true);

      if (!numberOfBags || Number(numberOfBags) <= 0) {
        toast.error("Please select batch details.");
        setIsSubmitting(false);
        return;
      }

      const selectedBatch = Object.values(batchDetails).filter((item) => item.isSelected);
      const selectedOther = Object.values(otherExpenses).filter((item) => item.isSelected);
      const materials = [...selectedSubstrate];

      if (materials.length === 0) {
        toast.error("No materials found");
        setIsSubmitting(false);
        return;
      }

      try {  
          // 1. Create batch            
          const batchPayload = {
            batches: selectedBatch.map((item) => ({
              batchNo: item.batchNo,
              status: "Sterilized",
              sterilizationDate: trxDate,
              totalCostValue: totalCostValue,
              totalJobValue: totalJobValue,
              materials: materials,
              otherExpenses: selectedOther,
            })),
            materials: selectedSubstrate,
            otherExpenses: selectedOther,
          };
          const response = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/batch/bulk-update`,
            batchPayload
          );


          const newBatchId = selectedBatch[0].batchNo;
          setBatchNumber(newBatchId);


          // 2. Update stock quantities
          await axios.post(
              `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-reduce`,
              {
                  items: materials.map((item) => ({
                  stockId: item.stockId,
                  quantity: Number(item.totalQty || 0),
                  })),
              },
              {
                  headers: getAuthHeaders(),
              }
          );


          // 3. Write stock movement logs - Issued
          const stockTrxPayload = {       
            referenceId: newBatchId,
            trxDate: trxDate,
            trxType: "GoodIssue",
            description: "Sterilization Substrate Bag",
            isAdded: false,
            clientId: "",
            items: materials.map((item) => ({
              stockId: item.stockId,
              stockName: item.stockName,
              quantity: Number(item.totalQty || 0),
              quantityBalance: Number(0),
              stockUOM: item.stockUOM,
              stockCost: Number(item.stockCost || 0),
              stockPrice: Number(item.stockPrice || 0),
            })),
          };               
          const issuedTrxResponse = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
            stockTrxPayload
          );


          // 4. Update Add Sterilized Bag stock
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-add`,
            {
              items: [
                {
                  stockId: "5001",
                  quantity: Number(numberOfBags || 0),
                },
              ],
            },
            {
              headers: getAuthHeaders(),
            }
          );


          // 5. Write stock movement logs - Received Sterilized bags
          const bagSterilizedTrxPayload = {
            trxId: String(newBatchId),
            referenceId: String(newBatchId),
            trxDate: new Date(trxDate),
            trxType: "Sterilized",
            description: "Sterilization Substrate Bag",
            isAdded: true,
            clientId: "",
            items: [
              {
                stockId: "5001",
                stockName: "Sterilized Substrate Bag",
                quantity: Number(numberOfBags || 0),
                quantityBalance: Number(numberOfBags || 0),
                stockUOM: "pcs",
                stockCost:
                  Number(totalCostValue || 0) / Number(numberOfBags || 1),
                stockPrice:
                  Number(totalJobValue || 0) / Number(numberOfBags || 1),
              },
            ],
          };
          const res1 = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
            bagSterilizedTrxPayload,
            {
              headers: getAuthHeaders(),
            }
          );

          
          // 6. Update Substract Substrate Bag stock
          await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock/bulk-reduce`,
            {
              items: [
                {
                  stockId: "5000",
                  quantity: Number(numberOfBags || 0),
                },
              ],
            },
            {
              headers: getAuthHeaders(),
            }
          );   


          // 7. Write stock movement logs - Issued Substract bags
          const bagTrxPayload = {
            trxId: String(newBatchId),
            referenceId: String(newBatchId),
            trxDate: new Date(trxDate),
            trxType: "Sterilized",
            description: "Sterilization Substrate Bag",
            isAdded: true,
            clientId: "",
            items: [
              {
                stockId: "5000",
                stockName: "Substrate Bag",
                quantity: Number(numberOfBags || 0),
                quantityBalance: Number(numberOfBags || 0),
                stockUOM: "pcs",
                stockCost:
                  Number(totalCostValue || 0) / Number(numberOfBags || 1),
                stockPrice:
                  Number(totalJobValue || 0) / Number(numberOfBags || 1),
              },
            ],
          };
          const res = await axios.post(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction`,
            bagTrxPayload,
            {
              headers: getAuthHeaders(),
            }
          );


          // 8. Update stock quantity balance in GRN
          const payload = {
            items: materials,
          };
     
          const detailsRes = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-transaction/updateQuantityBalance`,
            payload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );
          const updatedDetails = detailsRes?.data?.issueDetails || [];


          // 9. Update Stock Issue Details
          const issuedTrxId = issuedTrxResponse.data.data?.issuedTrxId;
          const issuedTrxDate = issuedTrxResponse.data.data?.trxDate;         

          const updatePayload = {
            items: updatedDetails,
          };   
                
          const updateRes = await axios.put(
            `${import.meta.env.VITE_BACKEND_URL}/api/stock-issue-details/batchNo/${newBatchId}`,
            updatePayload,
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );


        setIsSubmitted(true);
        toast.success("Substrate bag details prepared successfully");
      } catch (error) {
        console.error(error.response?.data || error);
        toast.error(error.response?.data?.message || "Failed to save");
      } finally {
        setIsSubmitting(false); // ✅ always reset
      }
    };
    
    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="max-w-7xl mx-auto bg-white rounded-2xl shadow-lg p-6">
                <div className="flex justify-between gap-3 mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                          Substrate Bag Sterilization Process
                        </h1>

                        <p className="text-sm text-gray-500">
                            Monitoring sterilization status and progress of substrate bags                        </p>
                    </div>
                    <button
                      onClick={() => navigate("/mushroom-process")}
                      className="flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:opacity-90 transition"
                    >
                      <ArrowLeft size={20} />
                      Back
                    </button>                    
                </div>

                {/* Number of Bags */}
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                    <div className="flex justify-between gap-6">
                        < div className="flex flex-col w-full">
                            <label className="block mb-2 font-medium text-gray-700">
                                Number of Bags
                            </label>
                            <input
                                disabled
                                type="number"
                                min="1"
                                value={numberOfBags}
                                onChange={(e) =>
                                  setNumberOfBags(e.target.value)
                                }
                                placeholder="Enter number of bags"
                                className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="block mb-2 font-medium text-gray-700">
                                Sterilization Date
                            </label>

                            <input
                              disabled={isSubmitting || isSubmitted}
                              type="date"
                              value={trxDate}
                              onChange={(e) => setTrxDate(e.target.value)}
                              className="w-full border rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                              required
                            />
                        </div>
                    </div>

                    <div className="flex items-end gap-4">
                        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 w-full">
                            <p className="text-sm text-gray-500 text-right">
                              Total Cost Value
                            </p>

                            <p className="text-xl font-bold text-orange-600 text-right">
                              {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              }).format(totalCostValue)}
                            </p> 
                        </div>

                        <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3 w-full">
                            <p className="text-sm text-gray-500 text-right">
                              Total Job Value
                            </p>

                            <p className="text-xl font-bold text-orange-600 text-right">
                              {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                              }).format(totalJobValue)}
                            </p>                           
                        </div>            
                    </div>
                </div>

                {/* Material Table */}
                <div className="overflow-x-auto">
                  <table className="w-full border rounded-xl overflow-hidden">
                    <tbody>

                      {/* ================= BATCH DETAILS ================= */}
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center p-6">
                            Loading batch details...
                          </td>
                        </tr>
                      ) : batchDetails.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center p-6 text-gray-500">
                            Enter number of bags to generate material rows
                          </td>
                        </tr>
                      ) : (
                        <Fragment key="batch-section">
                          <tr className="bg-orange-100 text-orange-500">
                            <th className="p-3 text-left">Use</th>
                            <th className="p-3 text-left">Batch Number</th>
                            <th className="p-3 text-left">Date</th>
                            <th className="p-3 text-right">Bags</th>
                            <th className="p-3 text-right">Total Cost</th>
                            <th className="p-3 text-right">Total Value</th>
                            <th>  </th>
                            <th>  </th>
                          </tr>

                          {batchDetails.map((item, index) => (
                            <tr
                              key={`bd-${item.batchNo}-${index}`}
                              className={item.isSelected ? "" : "opacity-50 bg-gray-50"}
                            >
                              {/* Use */}
                              <td className="p-3">
                                <input
                                  type="radio"
                                  name="batchSelect"
                                  checked={item.isSelected || false}
                                  onChange={(e) =>
                                    handleCheckboxChange("bd", index, e.target.checked)
                                  }
                                />
                              </td>

                              {/* Batch No */}
                              <td className="p-3">{item.batchNo}</td>

                              {/* Date */}
                              <td className="p-3">{formatDate(item.batchDate)}</td>

                              {/* Bags */}
                              <td className="p-3 text-right">
                                {Number(item.numberOfBags || 0)}
                              </td>

                              {/* Total Cost */}
                              <td className="p-3 text-right">
                                {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(item.totalCostValue || 0)}
                              </td>

                              {/* Total Value */}
                              <td className="p-3 text-right">
                                {new Intl.NumberFormat("en-US", {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(item.totalJobValue || 0)}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )}                      

                      {/* ================= SUBSTRATE MATERIALS ================= */}
                      {loading ? (
                        <tr>
                          <td colSpan="8" className="text-center p-6">
                            Loading sterilizing materials...
                          </td>
                        </tr>
                      ) : sterilizingMmaterial.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="text-center p-6 text-gray-500">
                            Enter number of bags to generate material rows
                          </td>
                        </tr>
                      ) : (
                        <Fragment key="substrate-section">
                          <tr className="bg-orange-100 text-orange-500">
                            <th className="p-3 text-left">Use</th>
                            <th className="p-3 text-left">Sterilizing Material</th>
                            <th className="p-3 text-right">Base Qty</th>
                            <th className="p-3 text-left">UOM</th>
                            <th className="p-3 text-left">Total Quantity</th>
                            <th className="p-3 text-right">Available</th>
                            <th className="p-3 text-right">Stock Price</th>
                            <th className="p-3 text-right">Amount</th>
                          </tr>

                          {sterilizingMmaterial.map((item, index) => (
                            <tr
                              key={`sm-${item.stockId}-${index}`}
                              className={item.isSelected ? "" : "opacity-50 bg-gray-50"}
                            >
                              <td className="p-3">
                                <input
                                  disabled={isSubmitting || isSubmitted}
                                  type="checkbox"
                                  checked={item.isSelected || false}
                                  onChange={(e) =>
                                    handleCheckboxChange("sm", index, e.target.checked)
                                  }
                                />
                              </td>

                              <td className="p-3">{item.stockName}</td>
                              <td className="p-3 text-right">{item.baseQuantity}</td>
                              <td className="p-3">{item.stockUOM}</td>

                              <td className="p-3">
                                <input
                                  type="number"
                                  value={Number(item.totalQty || 0)}
                                  max={Number(item.stockQuantity || 0)}
                                  disabled={
                                    !item.isSelected ||
                                    Number(numberOfBags) <= 0 ||
                                    isSubmitting ||
                                    isSubmitted
                                  }
                                  onChange={(e) => {
                                    const value = Number(e.target.value || 0);
                                    const maxQty = Number(item.stockQuantity || 0);

                                    if (value <= maxQty) {
                                      handleQtyChange("sm", index, value);
                                    }
                                  }}
                                  className={`w-full border rounded-lg px-3 py-2 ${
                                    !item.isSelected && Number(numberOfBags) <= 0
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : "focus:ring-2 focus:ring-orange-400"
                                  }`}
                                />
                              </td>

                              <td className="p-3 text-right text-gray-500">
                                {Number(item.stockQuantity || 0).toFixed(3)}
                              </td>

                              <td className="p-3 text-right">
                                {Number(item.stockPrice || 0).toFixed(2)}
                              </td>

                              <td className="p-3 text-right font-semibold">
                                {Number(item.rowTotalValue || 0).toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </Fragment>
                      )}

                      {/* ================= OTHER EXPENSES ================= */}
                      {!loading && Object.keys(otherExpenses).length > 0 && (
                        <Fragment key="otherExpense-section">
                          <tr className="bg-orange-100 text-orange-500">
                            <th className="p-3 text-left">Use</th>
                            <th className="p-3 text-left">Other Expense</th>
                            <th className="p-3 text-right">Base Price</th>
                            <th className="p-3 text-left"></th>
                            <th className="p-3 text-left">Unit Price</th>
                            <th className="p-3 text-right"></th>
                            <th className="p-3 text-right">Quantity</th>
                            <th className="p-3 text-right">Amount</th>
                          </tr>

                          {Object.entries(otherExpenses).map(([id, item]) => {
                            const bagCount = Number(numberOfBags || 0);
                            const rowTotal =
                              item.isSelected && item.editablePrice > 0 && numberOfBags > 0
                                ? Number(numberOfBags) * Number(item.editablePrice)
                                : 0;

                            return (
                              <tr
                                key={`oe-${id}`}
                                className={item.isSelected ? "" : "opacity-50 bg-gray-50"}
                              >
                                {/* CHECKBOX */}
                                <td className="p-3">
                                  <input
                                    disabled={isSubmitting || isSubmitted}
                                    type="checkbox"
                                    checked={item.isSelected || false}
                                    onChange={(e) =>
                                      handleCheckboxChange("oe", id, e.target.checked)
                                    }
                                  />
                                </td>

                                {/* NAME */}
                                <td className="p-3">{item.name}</td>
                                <td className="p-3 text-right">{item.price.toFixed(2)}</td>
                                <td className="p-3"></td>

                                {/* PRICE */}
                                <td className="p-3">
                                  <input
                                    type="number"
                                    step="0.01"
                                    value={Number(item.editablePrice || 0)}
                                    disabled={
                                      !item.isSelected ||
                                      Number(numberOfBags) <= 0 ||
                                      isSubmitting ||
                                      isSubmitted
                                    }
                                    onChange={(e) =>
                                      handleOtherExpenseChange(id, e.target.value)
                                    }
                                    className={`w-full border rounded-lg px-3 py-2 ${
                                      !item.isSelected && Number(numberOfBags) <= 0
                                        ? "bg-gray-100 cursor-not-allowed"
                                        : "focus:ring-2 focus:ring-orange-400"
                                    }`}
                                  />
                                </td>

                                <td className="p-3 text-right text-gray-500"></td>

                                {/* QTY */}
                                <td className="p-3 text-right">
                                  {Number(numberOfBags || 0).toFixed(2)}
                                </td>

                                {/* AMOUNT */}
                                <td className="p-3 text-right font-semibold">
                                  {rowTotal.toFixed(2)}
                                </td>
                              </tr>
                            );
                          })}
                        </Fragment>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mt-6">
                    <p className="text-sm text-gray-500">
                        Batch Number:{" "}
                        <span className="font-semibold text-gray-800">
                            {batchNumber || "N/A"}
                        </span>
                    </p>

                    <p className="text-sm text-gray-500">
                        Cost Value of a Bag:{" "}
                        <span className="font-semibold text-gray-800">
                            {numberOfBags
                              ? (totalCostValue / numberOfBags).toFixed(2)
                              : "N/A"}
                        </span>
                    </p>

                    <p className="text-sm text-gray-500">
                        Selling Value of a Bag:{" "}
                        <span className="font-semibold text-gray-800">
                            {numberOfBags
                              ? (totalJobValue / numberOfBags).toFixed(2)
                              : "N/A"}
                        </span>
                    </p>  

                    {/* Buttons */}
                    <div className="flex justify-end gap-3">

                        <button
                          onClick={() => navigate(-1)}
                          className="px-6 py-3 rounded-xl border border-gray-300 hover:bg-gray-100 transition"
                        >
                          Cancel
                        </button>

                        <button
                          onClick={handleSubmit}
                          disabled={isSubmitting || isSubmitted}
                          className={`px-6 py-3 rounded-xl text-white transition min-w-[140px] ${
                            isSubmitted
                              ? "bg-green-600 cursor-not-allowed"
                              : isSubmitting
                              ? "bg-gray-500 cursor-not-allowed"
                              : "bg-orange-600 hover:bg-orange-700"
                          }`}
                        >
                          {isSubmitted
                            ? "Submitted ✓"
                            : isSubmitting
                            ? "Submitting..."
                            : "Submit"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}