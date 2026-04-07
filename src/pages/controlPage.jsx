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
        <Route path="add-member-secretary" element={<AddNewMembers />} />
        <Route path="edit-member-secretary" element={<EditMembers />} />   

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );

}
