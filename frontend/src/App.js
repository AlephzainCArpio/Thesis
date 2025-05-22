import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import axios from "axios";
import { ConfigProvider } from 'antd';
import vibrantTheme, { minimalistTheme } from './theme/vibrantTheme';
// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import ProviderLayout from "./layouts/ProviderLayout";

// Public pages
import HomePage from "./pages/public/HomePage";
import LoginPage from "./pages/public/LoginPage";
import RegisterPage from "./pages/public/RegisterPage";

// User pages
import UserDashboard from "./pages/user/UserDashboard";
import VenueListPage from "./pages/user/VenueListPage";
import VenueDetailPage from "./pages/user/VenueDetailPage";
import CateringListPage from "./pages/user/CateringListPage";
import CateringDetailPage from "./pages/user/CateringDetailPage";
import PhotographerListPage from "./pages/user/PhotographerListPage";
import PhotographerDetailPage from "./pages/user/PhotographerDetailPage";
import DesignerListPage from "./pages/user/DesignerListPage";
import DesignerDetailPage from "./pages/user/DesignerDetailPage";
import UserProfilePage from "./pages/user/UserProfilePage";
import HistoryPage from "./pages/user/HistoryPage";
import CustomizationPage from "./pages/user/CustomizationPage";

// Provider pages
import ProviderDashboard from "./pages/provider/ProviderDashboard";
import RegisterServicePage from "./pages/provider/RegisterServicePage";


// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminVenuesPage from "./pages/admin/AdminVenuesPage";
import AdminCateringPage from "./pages/admin/AdminCateringPage";
import AdminPhotographersPage from "./pages/admin/AdminPhotographersPage";
import AdminDesignersPage from "./pages/admin/AdminDesignersPage";
import ProviderManagementPage from "./pages/admin/ProviderManagementPage";

// Set axios base URL
const API_URL = process.env.REACT_APP_API_URL;
axios.defaults.baseURL = API_URL;

// Axios interceptors
axios.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

axios.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

function App() {
  const { currentUser, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
       <ConfigProvider theme={vibrantTheme}>
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* User Routes */}
      <Route path="/user" element={<ProtectedRoute allowedRoles={["USER"]} element={<MainLayout />} />}>
        <Route index element={<UserDashboard />} />
        <Route path="profile" element={<UserProfilePage />} />
        <Route path="venues" element={<VenueListPage />} />
        <Route path="venues/:id" element={<VenueDetailPage />} />
        <Route path="catering" element={<CateringListPage />} />
        <Route path="catering/:id" element={<CateringDetailPage />} />
        <Route path="photographers" element={<PhotographerListPage />} />
        <Route path="photographers/:id" element={<PhotographerDetailPage />} />
        <Route path="designers" element={<DesignerListPage />} />
        <Route path="designers/:id" element={<DesignerDetailPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="customize" element={<CustomizationPage />} />
      </Route>

      {/* Provider Routes */}
      <Route path="/provider" element={<ProtectedRoute allowedRoles={["PROVIDER"]} element={<ProviderLayout />} />}>
        <Route index element={<ProviderDashboard />} />
        <Route path="dashboard" element={<ProviderDashboard />} />
        <Route path="register-service" element={<RegisterServicePage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]} element={<AdminLayout />} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="venues" element={<AdminVenuesPage />} />
        <Route path="catering" element={<AdminCateringPage />} />
        <Route path="photographers" element={<AdminPhotographersPage />} />
        <Route path="designers" element={<AdminDesignersPage />} />
        <Route path="provider-management" element={<ProviderManagementPage />} />
      </Route>

      {/* Catch All */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </ConfigProvider>
  );
}

export default App;