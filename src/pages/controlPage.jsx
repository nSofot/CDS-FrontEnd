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
import MemberLedgerPage from "./control/memberLedgerPage";
import StockPage from "./control/stockPage";
import AddStockPage from "./control/addStockPage";
import EditStockPage from "./control/editStockPage";
import StockBinCardPage from "./control/stockBinCardPage";
import VendorListPage from "./control/vendorPage";
import AddVendorPage from "./control/addVendorPage";
import EditVendorPage from "./control/editVendorPage";
import VendorLedgerPage from "./control/vendorLedgerPage";

import CashBookPage from "./control/cashBookPage";

import GRNsPage from "./control/grnsPage";
import OtherInvoicePage from "./control/otherInvoicePage";
import VendorPaymentPage from "./control/vendorPayment";
import MemberReceiptPage from "./control/memberReceiptPage";
import OtherReceiptsPage from "./control/otherReceiptPage";
import BagSaleInvoicePage from "./control/bagSaleInvoicePage"
import SalesInvoicePage from "./control/salesInvoicePage";
import OtherPayment from "./control/otherPayment";

import MushroomProcessMenu from "./control/mushroomProcessMenu";
import MakeSubstrateBagPage from "./control/makeSubstrateBagPage";
import MakeInoculatingBagPage from "./control/makeInoculatingBagPage";
import MakeSterilizedBagPage from "./control/makeSterilizedBagPage";
import MakeIncubatingBagPage from "./control/makeIncubatingBagPage";
import BatchListPage from "./control/batchListPage";
import ViewBatchPage from "./control/viewBatchPage";
import BagOrderManagementPage from "./control/bagOrderManagementPage";

import LedgerAccountsPage from "./control/ledgerAccountsPage";

import ReportsPage from "./reports/reportsPage";

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
        <Route path="member-ledger" element={<MemberLedgerPage />} />

        <Route path="stock" element={<StockPage />} />
        <Route path="add-stock" element={<AddStockPage />} />
        <Route path="edit-stock" element={<EditStockPage />} />
        <Route path="stock-bin-card" element={<StockBinCardPage />} />

        <Route path="vendors" element={<VendorListPage />} />
        <Route path="add-vendor" element={<AddVendorPage />} />
        <Route path="edit-vendor" element={<EditVendorPage />} />
        <Route path="vendor-ledger" element={<VendorLedgerPage />} />

        <Route path="cash-book" element={<CashBookPage />} />
    
        <Route path="grns" element={<GRNsPage />} />
        <Route path="other-invoice" element={<OtherInvoicePage />} />
        <Route path="vendor-payment" element={<VendorPaymentPage />} />
        <Route path="member-receipt" element={<MemberReceiptPage />} />
        <Route path="other-receipt" element={<OtherReceiptsPage />} />
        <Route path="bagSale-invoice" element={<BagSaleInvoicePage />} />
        <Route path="sales-invoice" element={<SalesInvoicePage />} />
        <Route path="other-payment" element={<OtherPayment />} />
        <Route path="mushroom-process" element={<MushroomProcessMenu />} />
        <Route path="make-substrate-bag" element={<MakeSubstrateBagPage />} />
        <Route path="make-sterilized-bag" element={<MakeSterilizedBagPage />} />
        <Route path="make-inoculating-bag" element={<MakeInoculatingBagPage />} />
        <Route path="incubated-substrate-bag" element={<MakeIncubatingBagPage />} />
        <Route path="batch-list" element={<BatchListPage />} />
        <Route path="view-batch/:batchNo" element={<ViewBatchPage />} />
        <Route path="bag-orders-management" element={<BagOrderManagementPage />} />

        <Route path="ledger-accounts" element={<LedgerAccountsPage />} />

        <Route path="reports" element={<ReportsPage />} />
        
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );

}
