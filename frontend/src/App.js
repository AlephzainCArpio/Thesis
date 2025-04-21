"use client"
import { Routes, Route, Navigate } from "react-router-dom"
import { useAuth } from "./contexts/AuthContext"
import ProtectedRoute from "./components/common/ProtectedRoute"

// Layouts
import MainLayout from "./layouts/MainLayout"
import AdminLayout from "./layouts/AdminLayout"
import ProviderLayout from "./layouts/ProviderLayout"

// Public pages
import HomePage from "./pages/public/HomePage"
import LoginPage from "./pages/public/LoginPage"
import RegisterPage from "./pages/public/RegisterPage"

// User pages
import UserDashboard from "./pages/user/UserDashboard"
import VenueListPage from "./pages/user/VenueListPage"
import VenueDetailPage from "./pages/user/VenueDetailPage"
import CateringListPage from "./pages/user/CateringListPage"
import CateringDetailPage from "./pages/user/CateringDetailPage"
import PhotographerListPage from "./pages/user/PhotographerListPage"
import PhotographerDetailPage from "./pages/user/PhotographerDetailPage"
import DesignerListPage from "./pages/user/DesignerListPage"
import DesignerDetailPage from "./pages/user/DesignerDetailPage"
import UserProfilePage from "./pages/user/UserProfilePage"
import HistoryPage from "./pages/user/HistoryPage"
import CustomizationPage from "./pages/user/CustomizationPage"

// Provider pages
import ProviderDashboard from "./pages/provider/ProviderDashboard"
import RegisterServicePage from "./pages/provider/RegisterServicePage"
import PendingServicesPage from "./pages/provider/PendingServicesPage"

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard"
import AdminVenuesPage from "./pages/admin/AdminVenuesPage"
import AdminCateringPage from "./pages/admin/AdminCateringPage"
import AdminPhotographersPage from "./pages/admin/AdminPhotographersPage"
import AdminDesignersPage from "./pages/admin/AdminDesignersPage"
import ProviderManagementPage from "./pages/admin/ProviderManagementPage" 

function App() {
  const { currentUser, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* User routes */}
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

      {/* Provider routes */}
      <Route path="/provider" element={<ProtectedRoute allowedRoles={["PROVIDER"]} element={<ProviderLayout />} />}>
        <Route index element={<ProviderDashboard />} />
        <Route path="register-service" element={<RegisterServicePage />} />
        <Route path="pending" element={<PendingServicesPage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={["ADMIN"]} element={<AdminLayout />} />}>
        <Route index element={<AdminDashboard />} />
        <Route path="venues" element={<AdminVenuesPage />} />
        <Route path="catering" element={<AdminCateringPage />} />
        <Route path="photographers" element={<AdminPhotographersPage />} />
        <Route path="designers" element={<AdminDesignersPage />} />
        <Route path="provider-management" element={<ProviderManagementPage />} /> 
      </Route>

      {/* Redirect for any other routes */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
