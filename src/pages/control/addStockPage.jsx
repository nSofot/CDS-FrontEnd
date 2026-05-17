import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "axios";
import mediaUpload from "../../utils/mediaUpload";

export default function AddStockPage() {
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // STOCK STATES
  const [stockCategory, setStockCategory] = useState("");
  const [stockName, setStockName] = useState("");
  const [stockDescription, setStockDescription] = useState("");
  const [stockQuantity, setStockQuantity] = useState("");
  const [baseQuantity, setBaseQuantity] = useState("");
  const [stockUOM, setStockUOM] = useState("");
  const [stockCost, setStockCost] = useState("");
  const [stockPrice, setStockPrice] = useState("");
  const [labelledPrice, setLabelledPrice] = useState("");
  const [stockImage, setStockImage] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const [isAdding, setIsAdding] = useState(false);

  // HANDLE IMAGE CHANGE
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    setStockImage(files);

    const previews = files.map((file) =>
      URL.createObjectURL(file)
    );

    setPreviewImages(previews);
  };

  // REMOVE IMAGE
  const removeImage = (index) => {
    const updatedPreviews = [...previewImages];
    updatedPreviews.splice(index, 1);
    setPreviewImages(updatedPreviews);

    const updatedFiles = [...stockImage];
    updatedFiles.splice(index, 1);
    setStockImage(updatedFiles);
  };

  const handleAddStock = async () => {
    if (!token) {
      toast.error("Please log in first.");
      return;
    }

    if (!stockCategory || !stockName || !stockUOM) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      setIsAdding(true);

      // 1. Upload images to Supabase
      let uploadedImages = [];

      if (stockImage.length > 0) {
        uploadedImages = await Promise.all(
          stockImage.map((img) => mediaUpload(img))
        );
      }

      // 2. CLEAN Supabase URLs
      const imageUrls = uploadedImages.filter(Boolean);

      // 3. Final payload (ONLY JSON, NO multipart)
      const payLoad = {
        stockCategory,
        stockName,
        stockDescription,
        stockQuantity: Number(stockQuantity || 0),
        baseQuantity: Number(baseQuantity || 0),
        stockUOM,
        stockCost: 0,
        stockPrice: Number(stockPrice || 0),
        labelledPrice: Number(labelledPrice || 0),
        stockImage: imageUrls, // ✅ IMPORTANT FIX
      };

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/stock`,
        payLoad,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json", // ✅ FIXED
          },
        }
      );

      toast.success("Stock added successfully!");
      navigate("/control/stock", { replace: true });

    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Something went wrong");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-semibold">
            📦 Add Stock
          </h1>
          <p className="text-sm text-gray-500">
            Create new stock item
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleAddStock}
            disabled={isAdding}
            className={`px-5 py-2 rounded-lg text-white ${
              isAdding
                ? "bg-gray-500"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            {isAdding ? "Adding..." : "Add Stock"}
          </button>

          <Link
            to="/control/stock"
            className="px-5 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white"
          >
            Cancel
          </Link>
        </div>
      </div>

      {/* FORM */}
      <div className="bg-white rounded-xl shadow border p-4 md:p-6 space-y-5">

        {/* ROW 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>
            <label className="text-sm font-medium">
              Category *
            </label>
            <select
              value={stockCategory}
              onChange={(e) =>
                setStockCategory(e.target.value)
              }
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select category</option>
              <option value="packing material">Packing Material</option>
              <option value="substrate material">Substrate Material</option>
              <option value="sterilizing material">Sterilizing Material</option>
              <option value="inoculating material">Inoculating Material</option>
              <option value="incubating material">Incubating Material</option>
              <option value="finished products">Finished Products</option>
              <option value="harvested products">Harvested Products</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">
              Stock Name *
            </label>
            <input
              type="text"
              value={stockName}
              onChange={(e) =>
                setStockName(e.target.value)
              }
              className="w-full p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="text-sm font-medium">
              UOM *
            </label>
            <select
              value={stockUOM}
              onChange={(e) =>
                setStockUOM(e.target.value)
              }
              className="w-full p-2 border rounded-lg"
            >
              <option value="">Select UOM</option>
              <option value="kg">Kilogram</option>
              <option value="g">Gram</option>
              <option value="L">Liter</option>
              <option value="ml">Milliliter</option>
              <option value="m">Meter</option>
              <option value="cm">Centimeter</option>
              <option value="pack">Pack</option>
              <option value="pkt">Packet</option>
              <option value="btl">Bottle</option>
              <option value="box">Box</option>
              <option value="set">Set</option>
              <option value="bag">Bag</option>
            </select>
          </div>
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="text-sm font-medium">
            Description
          </label>
          <textarea
            value={stockDescription}
            onChange={(e) =>
              setStockDescription(e.target.value)
            }
            className="w-full p-2 border rounded-lg min-h-[60px]"
          />
        </div>

        {/* IMAGE */}
        <div>
          <label className="text-sm font-medium">
            Stock Images
          </label>

          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full p-2 border rounded-lg"
          />

          {previewImages.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              {previewImages.map((img, index) => (
                <div key={index} className="relative">
                  <img
                    src={img}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 text-xs rounded"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ROW 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* <input
            type="number"
            placeholder="Quantity"
            value={stockQuantity}
            onChange={(e) =>
              setStockQuantity(e.target.value)
            }
            className="w-full p-2 border rounded-lg"
          /> */}

          <input
            type="number"
            placeholder="Base Qty / Bag"
            value={baseQuantity}
            onChange={(e) =>
              setBaseQuantity(e.target.value)
            }
            className="w-full p-2 border rounded-lg"
          />

          <input
            type="number"
            placeholder="Selling Price"
            value={stockPrice}
            onChange={(e) =>
              setStockPrice(e.target.value)
            }
            className="w-full p-2 border rounded-lg"
          />

          <input
            type="number"
            placeholder="Labelled Price"
            value={labelledPrice}
            onChange={(e) =>
              setLabelledPrice(e.target.value)
            }
            className="w-full p-2 border rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}