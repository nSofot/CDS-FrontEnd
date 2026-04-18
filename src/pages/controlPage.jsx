import { Routes, Route, Outlet, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

import Header from "../components/header";
import ControlHomePage from "./control/controlHomePage";
import DashboardPage from "./control/dashboardPage";
import MembersPage from "./control/membersPage";
import AddNewMembers from "./control/addCustomerBySecratary";
import EditMembers from "./control/editCustomerBySecratary";
import StockPage from "./control/stockPage";
import AddStockPage from "./control/addStockPage";
import EditStockPage from "./control/editStockPage";
import VendorListPage from "./control/vendorPage";
import AddVendorPage from "./control/addVendorPage";
import EditVendorPage from "./control/editVendorPage";
import GRNsPage from "./control/grnsPage";
import OtherInvoicePage from "./control/otherInvoicePage";
import VendorPaymentPage from "./control/vendorPayment";
import MemberPaymentPage from "./control/memberPaymentPage";
import OtherPaymentPage from "./control/otherPaymentPage";

import NotFoundPage from "./notFoundPage";

function Layout() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* <Header /> */}
      <main className="w-full flex-grow flex flex-col items-center px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function ControlPage() {
  // const [status, setStatus] = useState("loading");
  // const navigate = useNavigate();

  // useEffect(() => {
  //   const controller = new AbortController();
  //   const token = localStorage.getItem("token");

  //   if (!token) {
  //     setStatus("unauthenticated");
  //     toast.error("Please login");
  //     navigate("/login", { replace: true });
  //     return;
  //   }

  //   axios
  //     .get(`${import.meta.env.VITE_BACKEND_URL}/api/user/`, {
  //       headers: { Authorization: `Bearer ${token}` },
  //       signal: controller.signal,
  //     })     
  //     .then((res) => {
  //       const role = res.data.memberRole?.toLowerCase();
  //       const allowedRoles = ["president", "secretary", "treasurer", "vice-president", "assistant-secretary", "assistant-treasurer","activity-coordinator","committee-member","internal-auditor"];
        
  //       if (!allowedRoles.includes(role)) {
  //         setStatus("unauthorized");
  //         toast.error("Unauthorized access");
  //         navigate("/", { replace: true });
  //       } else {
  //         setStatus("authenticated");
  //       }
  //     })
  //     .catch((err) => {
  //       if (!axios.isCancel(err)) {
  //         setStatus("unauthenticated");
  //         toast.error("Session expired. Please login again");
  //         navigate("/login", { replace: true });
  //       }
  //     });

  //   return () => controller.abort();
  // }, [navigate]);

  // if (status === "loading") {
  //   return <p className="text-center mt-10 text-lg font-semibold">Loading...</p>;
  // }

  return (
    <Routes>
      <Route element={<ControlHomePage />}>
        {/* DEFAULT PAGE */}
        <Route index element={<DashboardPage />} />

        {/* OTHER PAGES */}
        <Route path="dashboard" element={<DashboardPage />} />

        <Route path="members" element={<MembersPage />} />
        <Route path="add-member" element={<AddNewMembers />} />
        <Route path="edit-member" element={<EditMembers />} />   

        <Route path="stock" element={<StockPage />} />
        <Route path="add-stock" element={<AddStockPage />} />
        <Route path="edit-stock" element={<EditStockPage />} />

        <Route path="vendors" element={<VendorListPage />} />
        <Route path="add-vendor" element={<AddVendorPage />} />
        <Route path="edit-vendor" element={<EditVendorPage />} />

        <Route path="grns" element={<GRNsPage />} />
        <Route path="other-invoice" element={<OtherInvoicePage />} />
        <Route path="vendor-payment" element={<VendorPaymentPage />} />
        <Route path="member-payment" element={<MemberPaymentPage />} />
        <Route path="other-payment" element={<OtherPaymentPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );

}
