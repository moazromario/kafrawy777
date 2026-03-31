/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CommunityProvider } from './context/CommunityContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import Splash from './components/Splash';
import Onboarding from './components/Onboarding';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import Profile from './components/Profile';
import Friends from './components/Friends';
import Feed from './components/Feed';
import ProductList from './components/ProductList';
import ProductDetails from './components/ProductDetails';
import AddProduct from './components/AddProduct';
import Notifications from './components/Notifications';
import Chat from './components/Chat';
import Jobs from './components/Jobs';
import JobDetails from './components/JobDetails';
import AddJob from './components/AddJob';
import JobApplications from './components/JobApplications';
import Islamiat from './components/Islamiat/Islamiat';
import DesignShowcase from './components/Islamiat/DesignShowcase';
import ServicesHome from './pages/Services/ServicesHome';
import ProviderList from './pages/Services/ProviderList';
import ProviderProfile from './pages/Services/ProviderProfile';
import RegisterProvider from './pages/Services/RegisterProvider';
import AddService from './pages/Services/AddService';
import AllReviews from './pages/Services/AllReviews';
import BookingHome from './pages/Bookings/BookingHome';
import BookingDetails from './pages/Bookings/BookingDetails';
import WalletPage from './pages/Bookings/WalletPage';
import KafrawyGoHome from './pages/KafrawyGo/KafrawyGoHome';
import RequestRide from './pages/KafrawyGo/RequestRide';
import RideMatching from './pages/KafrawyGo/RideMatching';
import RideActive from './pages/KafrawyGo/RideActive';
import RegisterDriver from './pages/KafrawyGo/RegisterDriver';
import DriverDashboard from './pages/KafrawyGo/DriverDashboard';
import DriverRideRequest from './pages/KafrawyGo/DriverRideRequest';
import RateRide from './pages/KafrawyGo/RateRide';
import AdminLayout from './pages/Admin/AdminLayout';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AdminUsers from './pages/Admin/AdminUsers';
import AdminBookings from './pages/Admin/AdminBookings';
import AdminPayments from './pages/Admin/AdminPayments';
import AdminItems from './pages/Admin/AdminItems';
import AdminSettings from './pages/Admin/AdminSettings';
import AdminAuditLogs from './pages/Admin/AdminAuditLogs';
import CategoriesSystem from './pages/CategoriesSystem';

import { ErrorBoundary } from './components/ErrorBoundary';

import { Toaster } from 'sonner';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans" dir="rtl">
        <Toaster position="top-center" richColors />
        <AuthProvider>
          <CommunityProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Routes */}
                <Route path="/splash" element={<Splash />} />
                <Route path="/onboarding" element={<Onboarding />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                
                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="bookings" element={<AdminBookings />} />
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="items" element={<AdminItems />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="audit" element={<AdminAuditLogs />} />
                </Route>

                {/* Protected Routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<Navigate to="/feed" replace />} />
                  <Route path="/feed" element={<Feed />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/friends" element={<Friends />} />
                  <Route path="/marketplace" element={<ProductList />} />
                  <Route path="/marketplace/item/:id" element={<ProductDetails />} />
                  <Route path="/marketplace/create" element={<AddProduct />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/applications" element={<JobApplications />} />
                  <Route path="/jobs/:id" element={<JobDetails />} />
                  <Route path="/jobs/create" element={<AddJob />} />
                  <Route path="/notifications" element={<Notifications />} />
                  <Route path="/chat" element={<Chat />} />
                  <Route path="/islamiat" element={<Islamiat />} />
                  <Route path="/islamiat/showcase" element={<DesignShowcase />} />
                  
                  {/* Services Module Routes */}
                  <Route path="/categories" element={<CategoriesSystem />} />
                  <Route path="/services" element={<ServicesHome />} />
                  <Route path="/services/list" element={<ProviderList />} />
                  <Route path="/services/provider/:id" element={<ProviderProfile />} />
                  <Route path="/services/register" element={<RegisterProvider />} />
                  <Route path="/services/add" element={<AddService />} />
                  <Route path="/services/reviews/:id" element={<AllReviews />} />
                  
                  {/* Booking Module Routes */}
                  <Route path="/bookings" element={<BookingHome />} />
                  <Route path="/bookings/:id" element={<BookingDetails />} />
                  <Route path="/wallet" element={<WalletPage />} />
                  
                  {/* Kafrawy Go Routes */}
                  <Route path="/kafrawy-go" element={<KafrawyGoHome />} />
                  <Route path="/kafrawy-go/request" element={<RequestRide />} />
                  <Route path="/kafrawy-go/matching" element={<RideMatching />} />
                  <Route path="/kafrawy-go/active" element={<RideActive />} />
                  <Route path="/kafrawy-go/register" element={<RegisterDriver />} />
                  <Route path="/kafrawy-go/driver-dashboard" element={<DriverDashboard />} />
                  <Route path="/kafrawy-go/ride-request" element={<DriverRideRequest />} />
                  <Route path="/kafrawy-go/rate" element={<RateRide />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CommunityProvider>
        </AuthProvider>
      </div>
    </ErrorBoundary>
  );
}
