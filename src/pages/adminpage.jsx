import { Route, Routes, Link, useLocation, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Admin Pages
import AdminMembersPage from "./admin/adminMembersPage";
import AddCustomerPage from "./admin/addCustomerPage";
import EditCustomerPage from "./admin/editCustomerPage";
import PostAnnualMembershipFee from "./admin/postAnnualMembershipFee";
import InitalizeMasterFields from "./admin/initalizeMasterFields";
import ImportData from "./admin/dataImport";
import Reports from "./admin/reports";
import BackupPage from "./admin/backup";
import Loading from "../components/loadingSpinner";
import NotFoundPage from "./notFoundPage";

export default function AdminPage() {
  const location = useLocation();
  const path = location.pathname;
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const controller = new AbortController();
    const token = localStorage.getItem("token");

    if (!token) {
      setStatus("unauthenticated");
      toast.error("Please login");
      navigate("/login", { replace: true });
      return;
    }

    axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/user/`, {
      headers: { Authorization: `Bearer ${token}` },
      signal: controller.signal
    })
    .then(res => {
      const role = res.data.memberRole?.toLowerCase();
      if (role !== "admin") {
        setStatus("unauthorized");
        toast.error("Unauthorized access");
        navigate("/", { replace: true });
      } else {
        setStatus("authenticated");
      }
    })
    .catch(err => {
      if (!axios.isCancel(err)) {
        setStatus("unauthenticated");
        toast.error("Session expired. Please login again");
        navigate("/login", { replace: true });
      }
    });

    return () => controller.abort();
  }, [navigate]);


  const getClass = (name) =>
    path.includes(`/admin/${name}`)
      ? "text-white bg-purple-600 px-3 py-2 rounded hover:bg-gray-600 transition"
      : "text-purple-600 px-3 py-2 rounded hover:bg-gray-300 transition";

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login", { replace: true });
  };

  if (status === "loading") return <Loading />;

  return (
    <div className="w-full h-screen bg-purple-600 flex flex-col font-sans">
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-[256px] bg-white border-r shadow-md flex flex-col justify-between p-4">
          <div className="flex flex-col space-y-2">
            <h2 className="text-lg font-semibold text-purple-800 mb-4">Admin Panel</h2>
            <Link className={getClass("members")} to="/admin/members">📦 Members</Link>
            <Link className={getClass("Membership Fee Adjustment")} to="/admin/membership-fee-adjustment">💰 Membership Fee Adjustment</Link>
            <Link className={getClass("Shares Adjustment")} to="/admin/shares-adjustment">💰 Shares Adjustment</Link>
            <Link className={getClass("Ledger Adjustment")} to="/admin/ledger-adjustment">💰 Ledger Adjustment</Link>
            <Link className={getClass("Reports")} to="/admin/reports">📊 Reports</Link>
            <Link className={getClass("Post Annual Membership Fee")} to="/admin/post-annual-membership-fee">💰 Post Annual Membership Fee</Link>
            <Link className={getClass("Initalize Master Fields")} to="/admin/master-fields">📦 Initalize Master Fields</Link>
            <Link className={getClass("Upload Data")} to="/admin/upload-data">📦 Upload Data</Link>
            <Link className={getClass("edit-customer")} to="/admin/edit-customer">✏️ Edit Customer</Link>
            <Link className={getClass("add-product")} to="/admin/add-customer">➕ Add Customer</Link>
            <Link className={getClass("backup")} to="/admin/backup">💾 Backup</Link>
          </div>

          <button
            onClick={handleLogout}
            className="mt-6 text-red-600 font-semibold px-3 py-2 rounded hover:bg-red-100 transition text-left"
          >
            🔓 Logout
          </button>
        </aside>

        {/* Page Content */}
        <main className="h-full w-[calc(100%-256px)] border-purple-600 border-4 rounded-xl bg-white overflow-y-auto">
          <Routes>
            <Route index element={<Navigate to="members" replace />} />
            <Route path="members" element={<AdminMembersPage />} />
            <Route path="add-customer" element={<AddCustomerPage />} />
            <Route path="edit-customer" element={<EditCustomerPage />} />
            <Route path="post-annual-membership-fee" element={<PostAnnualMembershipFee />} />
            <Route path="master-fields" element={<InitalizeMasterFields />} />
            <Route path="upload-data" element={<ImportData />} />
            <Route path="reports" element={<Reports />} />
            <Route path="backup" element={<BackupPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
