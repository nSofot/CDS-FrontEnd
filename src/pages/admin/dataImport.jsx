import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function DataImport() {
    const [file, setFile] = useState(null);
    const [dateAsAt, setDateAsAt] = useState(new Date().toISOString().split("T")[0]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingProfitsSheet, setLoadingProfitsSheet] = useState(false);

    const navigate = useNavigate();

    const handleUploadCustomers = async () => {
        if (!file) return alert("Please select an Excel file first!");
        
        setLoadingCustomers(true);

        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/api/import-customers",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            alert(`✅ Imported ${res.data.inserted} customer records`);
        } catch (err) {
            console.error(err);
            alert("❌ Error importing: " + err.message);
        } finally {
            setLoadingCustomers(false);
        }
    };

    const handleUploadSharesProfits = async () => {
        if (!file) return alert("Please select an Excel file first!");
        
        setLoadingProfitsSheet(true);

        const formData = new FormData();
        formData.append("file", file);
        formData.append("dateAsAt", dateAsAt);

        try {
            const res = await axios.post(
                import.meta.env.VITE_BACKEND_URL + "/api/importSharesProfits",
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );
            alert(`✅ Imported ${res.data.inserted} shares profits records`);
        } catch (err) {
            console.error(err);
            alert("❌ Error importing: " + err.message);
        } finally {
            setLoadingProfitsSheet(false);
        }
    };    

    return (
        <div className="w-full h-full flex flex-col bg-gray-100 rounded-md px-12 py-4">
            <div className='flex justify-between items-center mb-4'>
                <div className='w-40% h-full flex flex-col item-center'>
                    <h1 className='text-xl font-semibold text-gray-800'>📥📗 Import Data from Excel</h1>
                    <p className='text-sm text-gray-600'>Easily import bulk data from Excel sheets into the system.</p>
                </div>
                <div className="w-[30%] flex justify-end gap-6">
                    <button
                            onClick={() => navigate(-1)}
                            className="cursor-pointer rounded-md transition duration-300 ease-in-out"
                        >
                            ✖️
                    </button>
                </div>
            </div>  

            <div className="flex flex-col items-center p-4 gap-4">
                <div className="bg-white shadow rounded-md flex justify-between w-full p-4">
                    <h1 className="text-lg font-semibold text-gray-800">Upload Share Profits from Excel File</h1>
                    <input
                        type="date"
                        value={dateAsAt}
                        onChange={(e) => setDateAsAt(e.target.value)}
                        className="cursor-pointer text-blue-600"
                    />
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="cursor-pointer text-blue-600"
                    />
                    <button
                        onClick={handleUploadSharesProfits}
                        disabled={loadingProfitsSheet}
                        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer ${loadingProfitsSheet ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                        {loadingProfitsSheet ? "Uploading..." : "Upload"}
                    </button>              
                </div>

                <div className="bg-white shadow rounded-md flex justify-between w-full p-4">
                    <h1 className="text-lg font-semibold text-gray-800">Upload Customer Master Data from Excel File</h1>
                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={(e) => setFile(e.target.files[0])}
                        className="cursor-pointer text-blue-600"
                    />
                    <button
                        onClick={handleUploadCustomers}
                        disabled={loadingCustomers}
                        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 cursor-pointer ${loadingCustomers ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                        {loadingCustomers ? "Uploading..." : "Upload"}
                    </button>              
                </div>
            </div>
        </div>
    );
}