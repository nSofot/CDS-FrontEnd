import { Outlet, Routes, Route } from "react-router-dom";

import MemberHomePage from "./member/memberHomePage";
import MemberDashboardPage from "./member/memberDashboard";
import MemberProfilePage from "./member/memberProfilePage";
import BagOrderDetailsPage from "./member/bagOrderDetailsPage";
import ProductionEntryPage from "./member/productionEntryPage";
import MemberSalesEntryPage from "./member/memberSalesEntryPage";
import ViewIncomePage from "./member/viewIncomePage";
import ViewAccountStatementPage from "./member/viewAccountStatementPage";

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

export default function MemberPortalPage() {
  return (  
    <Routes>
      <Route element={<MemberHomePage />}>
        {/* DEFAULT PAGE */}
        <Route index element={<MemberDashboardPage />} />
        {/* OTHER PAGES */}
        <Route path="profile" element={<MemberProfilePage />} />
        <Route path="bag-orders" element={<BagOrderDetailsPage />} />
        <Route path="production-entry" element={<ProductionEntryPage />} />
        <Route path="sales-entry" element={<MemberSalesEntryPage />} />
        <Route path="finance" element={<ViewIncomePage />} />
        <Route path="account-statement" element={<ViewAccountStatementPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};