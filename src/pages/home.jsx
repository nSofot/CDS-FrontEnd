import { Routes, Route, Outlet } from "react-router-dom";
import Header from "../components/header";
// import ConstitutionPage from "./client/constitutionPage";
// import Gallery from "./client/galleryPage";
// import About from "./client/about";
// import Contact from "./client/contact";
// import Home from "./client/homePage";
import MemberProfilePage from "./client/memberProfile";
import NotFoundPage from "./notFoundPage";
// import MainLayout from "../layout/MainLayout";

function Layout() {
  return (
    <div className="w-full min-h-screen flex flex-col">
      <Header />
      <main className="w-full flex-grow flex flex-col items-center px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}

export default function HomePage() {
  return (
    <Routes>
      {/* <Route element={<MainLayout />}> */}
        <Route path="*" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="gallery" element={<Gallery />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="constitution" element={<ConstitutionPage />} />
          <Route path="member-profile" element={<MemberProfilePage />} />
          
          <Route path="*" element={<NotFoundPage />} />
        </Route>      
      {/* </Route> */}
    </Routes>
  );
}
