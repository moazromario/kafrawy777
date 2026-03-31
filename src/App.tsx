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

import { ErrorBoundary } from './components/ErrorBoundary';

export default function App() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-100 text-slate-900 font-sans" dir="rtl">
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
                </Route>
              </Routes>
            </BrowserRouter>
          </CommunityProvider>
        </AuthProvider>
      </div>
    </ErrorBoundary>
  );
}
