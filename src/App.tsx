import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import KYCVerification from "./pages/KYCVerification";
import KYCStatus from "./pages/KYCStatus";
import AddBank from "./pages/AddBank";
import BankStatus from "./pages/BankStatus";
import Transactions from "./pages/Transactions";
import Payment from "./pages/Payment";
import PaymentSuccess from "./pages/PaymentSuccess";
import Profile from "./pages/Profile";
import Support from "./pages/Support";
import NotFound from "./pages/NotFound";
import MasterRetailers from "./pages/MasterRetailers";
import MasterPayout from "./pages/MasterPayout";

const queryClient = new QueryClient();

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    Boolean(localStorage.getItem("token"))
  );
  const [userRole, setUserRole] = useState(localStorage.getItem("role"));

  useEffect(() => {
    const syncAuthFromStorage = () => {
      setIsAuthenticated(Boolean(localStorage.getItem("token")));
      setUserRole(localStorage.getItem("role"));
    };
    window.addEventListener("storage", syncAuthFromStorage);
    // In case other parts of app set token without storage event (same tab)
    const interval = setInterval(syncAuthFromStorage, 500);
    return () => {
      window.removeEventListener("storage", syncAuthFromStorage);
      clearInterval(interval);
    };
  }, []);

  const isMaster = userRole === "master";

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route
                path="/login"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <Login />
                }
              />
              <Route
                path="/signup"
                element={
                  isAuthenticated ? <Navigate to="/" replace /> : <Register />
                }
              />
              <Route
                path="/forgot-password"
                element={
                  isAuthenticated ? (
                    <Navigate to="/" replace />
                  ) : (
                    <ForgotPassword />
                  )
                }
              />
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/kyc-verification"
                element={
                  isAuthenticated ? (
                    <KYCVerification />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/kyc-status"
                element={
                  isAuthenticated ? (
                    <KYCStatus />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/add-bank"
                element={
                  isAuthenticated ? (
                    <AddBank />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/bank-status"
                element={
                  isAuthenticated ? (
                    <BankStatus />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/transactions"
                element={
                  isAuthenticated ? (
                    <Transactions />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/support"
                element={
                  isAuthenticated ? (
                    <Support />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/payment"
                element={
                  isAuthenticated ? (
                    <Payment />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/payout"
                element={
                  isAuthenticated ? (
                    <MasterPayout />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/payment-success"
                element={
                  isAuthenticated ? (
                    <PaymentSuccess />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/profile"
                element={
                  isAuthenticated ? (
                    <Profile />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/support"
                element={
                  isAuthenticated ? (
                    <Support />
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />
              <Route
                path="/master/retailers"
                element={
                  isAuthenticated ? (
                    isMaster ? (
                      <MasterRetailers />
                    ) : (
                      <Navigate to="/" replace />
                    )
                  ) : (
                    <Navigate to="/login" replace />
                  )
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
