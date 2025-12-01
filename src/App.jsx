import { Routes, Route, useLocation } from 'react-router-dom';
import { Home, Package, ShoppingCart, Users, Settings, LandPlot, Puzzle, ChartColumnStacked, Store, ChartBar, Wallet, } from 'lucide-react';
import { DashboardLayout } from './Components/DashboardLayout';
import Dashboard from './pages/Dashboard/Dashboard';
import Login from './pages/Auth/Login';
import Banners from './pages/Banners/Banners';
// import RequireAuth from "./pages/Auth/RequireAuth"
import { FaInfoCircle } from "react-icons/fa";
import Coupons from './pages/Coupons/Coupons';
import Orders from './pages/Orders/Orders';
import Categories from './pages/Categories/Categories';
import SettingsPage from './pages/Settings/Settings';
import Vendors from './pages/Vendors/Vendors';
import VendorOverview from './pages/Vendors/VendorOverview';
import VendorsStatistics from './pages/VendorsStatistics';
import RequireBack from './pages/Auth/RequireBack';
import RequireAuth from './pages/Auth/RequireAuth';
import UsersPage from './pages/Users/Users';
import GrowthTrend from './pages/Users/GrowthTrend';
import UsersStatistics from './pages/Users/UsersStatistics';
import Zones from './pages/Zones/Zones';
import AppVersionSettings from './pages/General-settings/General-settings';
import AdminWalletPage from './pages/Wallet/Wallet';


function App() {
  const location = useLocation();

  const sidebarItems = [
    { label: 'Dashboard', icon: Home, path: '/' },
    { label: 'Banners', icon: FaInfoCircle, path: '/banners' },
    { label: 'Zones', icon: LandPlot, path: '/zones' },
    { label: 'Coupons', icon: Puzzle, path: '/coupons' },
    { label: 'Orders', icon: ShoppingCart, path: '/orders' },
    { label: 'Categories', icon: ChartColumnStacked, path: '/categories' },
    { label: 'Settings', icon: Settings, path: '/settings' },
    { label: 'Vendors', icon: Store, path: '/vendors' },
    { label: 'Vendors Statistics', icon: ChartBar, path: '/vendors/statistics' },
    { label: "Users", icon: Users, path: "/users" },
    { label: "Users Statistics", icon: ChartBar, path: "/users/statistics" },
    { label: 'General Settings', icon: Settings, path: '/general-settings' },
    { label: 'Wallet', icon: Wallet, path: '/wallet' },



    // { label: 'Products', icon: Package, path: '/products' },
    // { label: 'Customers', icon: Users, path: '/customers' },
    // { label: 'Analytics', icon: BarChart3, path: '/analytics' },
  ];

  return (
    <Routes>
      {/* لو المستخدم داخل بالفعل، مايرجعش للوجن */}
      <Route path="/login" element={<RequireBack><Login /></RequireBack>} />

      {/* باقي الصفحات محتاجة توكن */}
      <Route
        path="/*"
        element={
          <RequireAuth>
            <DashboardLayout sidebarItems={sidebarItems} activePath={location.pathname} brandName="Maghani Store">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/banners" element={<Banners />} />
                <Route path="/zones" element={<Zones />} />
                <Route path="/coupons" element={<Coupons />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/vendors" element={<Vendors />} />
                <Route path="/vendors/overview" element={<VendorOverview />} />
                <Route path="/vendors/statistics" element={<VendorsStatistics />} />
                <Route path="/users" element={<UsersPage />} />
                <Route path="/users/growth-trend" element={<GrowthTrend />} />
                <Route path="/users/statistics" element={<UsersStatistics />} />
                <Route path='/general-settings' element={<AppVersionSettings />} />
                <Route path='/wallet' element={<AdminWalletPage />} />
              </Routes>
            </DashboardLayout>
          </RequireAuth>
        }
      />
    </Routes>
  );
}

export default App;
