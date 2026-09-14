import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AlertProvider } from './context/AlertContext';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import ManageDocuments from './pages/ManageDocuments';
import AdminUsers from './pages/AdminUsers';
import AdminDocuments from './pages/AdminDocuments';
import AdminCategories from './pages/AdminCategories';
import AdminDashboard from './pages/AdminDashboard';
import DownloadLogs from './pages/DownloadLogs';
import TermsOfService from './pages/TermsOfService';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Forbidden from './pages/Forbidden';
import NotFound from './pages/NotFound';
import DocumentViewer from './pages/DocumentViewer';
import SidebarLayout from './components/SidebarLayout';
import { Toaster } from './components/ui/sonner';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-[#000000]">กำลังโหลดข้อมูล...</div>;
  }
  
  if (!user) {
    return <Forbidden />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Forbidden />;
  }
  
  return <SidebarLayout>{children}</SidebarLayout>;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AlertProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/terms" element={<TermsOfService />} />
              <Route path="/privacy" element={<PrivacyPolicy />} />
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/profile" 
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/manage" 
                element={
                  <ProtectedRoute>
                    <ManageDocuments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/users" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminUsers />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/documents" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDocuments />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/categories" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminCategories />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/logs" 
                element={
                  <ProtectedRoute requiredRole="admin">
                    <DownloadLogs />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/document/:id" 
                element={
                  <ProtectedRoute>
                    <DocumentViewer />
                  </ProtectedRoute>
                } 
              />
              {/* Catch all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster position="bottom-right" theme="dark" />
        </AlertProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
