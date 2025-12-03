import { useState, Suspense } from "react";
import DashboardOverview from "./DashboardOverview";
import RecentActivity from "./RecentActivity";
import RevenueTimeline from "./RevenueTimeline";
import { PulseLoader } from "react-spinners";
import TopPerformers from "./TopPerformers";
import RevenueTab from "./RevenueTab";
import OrdersTab from "./OrdersTab";
import UsersTab from "./UsersTab";
import VendorsPerformanceTab from "./VendorsPerformanceTab";
import ProductsPerformance from "./ProductsPerformance ";
import ShippingTab from "./ShippingTab";
import TrendsAndGeographicTab from "./TrendsAndGeographicTab";
import SuperAdminDashboard from "./SuperAdminDashboard";
import ExportSummaryPage from "./ExportSummaryPage";
import CouponsStatsMock from "./Coupons";
import LowStockProducts from "./LowStockProducts";
import SalesReport from "./SalesReport";

/*
  Simple Tabs layout.
  We'll lazy-load other sections later (they can be separate components).
*/
export default function Dashboard() {
    const [activeTab, setActiveTab] = useState("orders");

    const tabs = [
        // { key: "overview", label: "Overview" },        
        // { key: "revenue", label: "Revenue" },          
        { key: "orders", label: "Orders" },
        // { key: "users", label: "Users" },           
        // { key: "vendors", label: "Vendors" },       
        // { key: "products", label: "Products" },     
        // { key: "coupons", label: "Coupons" },       
        // { key: "shipping", label: "Shipping" },     
        // { key: "trends", label: "Trends" },         
        // { key: "SuperAdmin", label: "SuperAdmin" }, 
        { key: "analytics", label: "Analytics" },
        { key: "lowStock", label: "Low Stock" },
        { key: "report", label: "Report" },


        // { key: "top", label: "Top Performers" }     
    ];


    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-extrabold mb-6">Dashboard</h1>

            {/* Tabs */}
            <div className="flex gap-2 mb-6 flex-wrap">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setActiveTab(t.key)}
                        className={`px-4 py-2 rounded-lg font-medium ${activeTab === t.key
                            ? "bg-red-600 text-white shadow"
                            : "bg-white border text-gray-700"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="space-y-6">
                {activeTab === "overview" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <DashboardOverview />
                        <RecentActivity />
                        <RevenueTimeline />
                    </Suspense>
                )}

                {
                    activeTab === "lowStock" && (
                        <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                            <LowStockProducts />
                        </Suspense>
                    )
                }

                {
                    activeTab === "report" && (
                        <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                            <SalesReport />
                        </Suspense>
                    )
                }

                {activeTab === "top" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <TopPerformers />
                    </Suspense>
                )}

                {activeTab === "revenue" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <RevenueTab />
                    </Suspense>
                )}

                {activeTab === "orders" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <OrdersTab />
                    </Suspense>
                )}

                {activeTab === "users" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <UsersTab />
                    </Suspense>
                )}

                {activeTab === "vendors" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <VendorsPerformanceTab />
                    </Suspense>
                )}

                {activeTab === "products" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <ProductsPerformance />
                    </Suspense>
                )}

                {activeTab === "shipping" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <ShippingTab />
                    </Suspense>
                )}

                {activeTab === "trends" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <TrendsAndGeographicTab />
                    </Suspense>
                )}

                {activeTab === "SuperAdmin" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <SuperAdminDashboard />
                    </Suspense>
                )}

                {activeTab === "analytics" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <ExportSummaryPage />
                    </Suspense>
                )}


                {/* Placeholder for other tabs: lazy-load them later */}
                {activeTab == "coupons" && (
                    <Suspense fallback={<div className="flex justify-center py-20"><PulseLoader /></div>}>
                        <CouponsStatsMock />
                    </Suspense>
                )}
            </div>
        </div>
    );
}
