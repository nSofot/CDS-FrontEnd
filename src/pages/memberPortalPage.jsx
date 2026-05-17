import { Outlet, Routes, Route } from "react-router-dom";

import MemberHomePage from "./member/memberHomePage";
import MemberDashboardPage from "./member/memberDashboard";
import MemberProfilePage from "./member/memberProfilePage";

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
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};