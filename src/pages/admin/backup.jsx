import axios from "axios";
import { useState } from "react";

export default function BackupPage() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        import.meta.env.VITE_BACKEND_URL + "/api/backup-now/now"
      );
      alert(response.data.message || "Backup started successfully!");
    } catch (err) {
      console.error("Backup failed:", err);
      const msg =
        err.response?.data?.message ||
        "Backup failed. Please check the server logs.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4">
      <button
        onClick={handleBackup}
        disabled={loading}
        className={`${
          loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white px-4 py-2 rounded transition`}
      >
        {loading ? "Starting Backup..." : "Run Manual Backup"}
      </button>
    </div>
  );
}
