import { useEffect, useState, Fragment, useMemo  } from "react";
import axios from "axios";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft } from "lucide-react";

export default function ViewBatchPage() {
  const { batchNo } = useParams(); 
  const navigate = useNavigate();

  const [batch, setBatch] = useState(null);
  const [issueInfo, setIssueInfo] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");


  const fetchBatch = async () => {
    try {
      setLoading(true);

      const [batchRes, infoRes, vendorRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/batch/${batchNo}`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/stock-issue-details/issue-reference/${batchNo}`),
        axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/vendor`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      setBatch(batchRes.data);
      setIssueInfo(infoRes.data);
      setVendors(vendorRes.data);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load batch details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (batchNo) fetchBatch();
  }, [batchNo]);


  const issueMap = useMemo(() => {
    const map = {};
    issueInfo?.items?.forEach((item) => {
      map[item.stockId] = item;
    });
    return map;
  }, [issueInfo]);

  const vendorMap = useMemo(() => {
    const map = {};
    vendors.forEach((v) => {
      map[v.vendorId] = v.vendorName;
    });
    return map;
  }, [vendors]);

  const formatCurrency = (value) => {
    return Number(value || 0).toFixed(2);
  };

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">
        Loading batch details...
      </div>
    );
  }

  if (!batch) {
    return (
      <div className="p-6 text-center text-red-500">
        Batch not found
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/dashboard/batch-list")}
            className="p-2 rounded-lg border hover:bg-white"
          >
            <ArrowLeft size={20} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Batch Details
            </h1>
            <p className="text-sm text-gray-500">
              Complete overview of batch production, materials usage, and financial summary of the batch {batch.batchNo}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Batch Information</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Batch No</span>
                <span className="font-medium">{batch.batchNo}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Batch Date</span>
                <span className="font-medium">
                  {new Date(batch.batchDate).toLocaleDateString()}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Number of Bags</span>
                <span className="font-medium">{batch.numberOfBags}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Status</span>
                <span className="font-medium">{batch.status}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Financial Summary</h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Total Cost Value</span>
                <span className="font-medium">
                  Rs. {formatCurrency(batch.totalCostValue)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Total Job Value</span>
                <span className="font-medium">
                  Rs. {formatCurrency(batch.totalJobValue)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Cost Per Bag</span>
                <span className="font-medium">
                  Rs. {formatCurrency(batch.totalCostValue / batch.numberOfBags)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-500">Price Per Bag</span>
                <span className="font-medium">
                  Rs. {formatCurrency(batch.totalJobValue / batch.numberOfBags)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Materials Used</h2>

          {batch.materials?.length === 0 ? (
            <p className="text-gray-500">No materials found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left">Material</th>
                    <th className="px-4 py-3 text-left">Qty</th>
                    <th className="px-4 py-3 text-left">UOM</th>
                    <th className="px-4 py-3 text-left">Cost</th>
                    <th className="px-4 py-3 text-left">Value</th>
                  </tr>
                </thead>

                  <tbody>
                  {batch.materials.map((item, index) => {
                    const grn = issueMap[item.stockId];

                    return (
                      <Fragment key={item.stockId || index}>

                            {/* MAIN ROW */}
                            <tr className="border-t">
                              <td className="px-4 py-3 font-medium">{item.stockName}</td>
                              <td className="px-4 py-3">{item.totalQty}</td>
                              <td className="px-4 py-3">{item.stockUOM || "-"}</td>
                              <td className="px-4 py-3">Rs. {formatCurrency(item.rowCostValue)}</td>
                              <td className="px-4 py-3">Rs. {formatCurrency(item.rowTotalValue)}</td>
                            </tr>

                            {/* GRN ROW */}
                            {grn && (
                              <tr className="bg-gray-50 text-xs text-gray-600">
                                <td colSpan="5" className="px-4 py-2">
                                  <div className="grid grid-cols-4 gap-4">
                                    
                                    <div>
                                      <p className="font-semibold">GRN ID</p>
                                      <p>{grn.receivedTrxId}</p>
                                    </div>

                                    <div>
                                      <p className="font-semibold">Received Date</p>
                                      <p>{new Date(grn.receivedDate).toLocaleDateString()}</p>
                                    </div>

                                    <div>
                                      <p className="font-semibold">Vendor</p>
                                      <p>{vendorMap[grn.receivedVendorId] || grn.receivedVendorId}</p>
                                    </div>

                                    <div>
                                      <p className="font-semibold">Issued Qty</p>
                                      <p>{grn.issuedQuantity}</p>
                                    </div>

                                  </div>
                                </td>
                              </tr>
                            )}
                          </Fragment>
                        );
                      })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}