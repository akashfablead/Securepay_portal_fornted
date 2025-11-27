import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileCheck,
  Wallet,
  History,
  ArrowDownToLine,
  Users,
  User,
  HelpCircle,
  LogOut,
  List,
  CreditCard,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "../services/authService";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [walletBalance, setWalletBalance] = useState(null);

  // 🔥 Mobile Sidebar State
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  // State for money transfer submenu
  const [moneyTransferOpen, setMoneyTransferOpen] = useState(false);
  // State for utility payment submenu
  const [utilityPaymentOpen, setUtilityPaymentOpen] = useState(false);

  const hideNavRoutes = [
    "/login",
    "/forgot-password",
    "/signup",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-policy",
  ];
  const showNav = !hideNavRoutes.includes(location.pathname);

  const userRole = localStorage.getItem("role") || "user";
  const isMasterDistributor = userRole === "master";

  // Toggle money transfer submenu
  const toggleMoneyTransfer = () => {
    setMoneyTransferOpen(!moneyTransferOpen);
  };

  // Toggle utility payment submenu
  const toggleUtilityPayment = () => {
    setUtilityPaymentOpen(!utilityPaymentOpen);
  };

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: FileCheck, label: "KYC", path: "/kyc-verification" },
    { icon: Wallet, label: "Bank", path: "/bank-status" },
    // Money Transfer section will be inserted here
    // Utility Payment section will be inserted here
    {
      icon: FileCheck,
      label: "Reports",
      path: "/consolidated-reports",
    },
    ...(isMasterDistributor
      ? [{ icon: Users, label: "Retailers", path: "/master/retailers" }]
      : []),
    { icon: User, label: "Profile", path: "/profile" },
    { icon: HelpCircle, label: "Support", path: "/support" },
    // Demo page for transaction details
  ];

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (_) {}
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    let active = true;

    const loadBalance = async () => {
      try {
        if (!localStorage.getItem("token")) return;
        const data = await getDashboard();
        if (active) {
          setWalletBalance(Number(data?.stats?.availableBalance || 0));
        }
      } catch (_) {}
    };

    if (showNav) loadBalance();

    return () => {
      active = false;
    };
  }, [showNav, location.pathname]);

  const formattedBalance = useMemo(() => {
    if (typeof walletBalance !== "number") return "—";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(walletBalance);
  }, [walletBalance]);

  return (
    <div
      className={`min-h-screen bg-background ${
        showNav ? "md:flex md:items-stretch" : ""
      }`}
    >
      {/* ---------------- DESKTOP SIDEBAR ---------------- */}
      {showNav && (
        <aside className="hidden md:flex md:flex-col w-64 lg:w-72 border-r border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-soft md:sticky md:top-0 md:h-screen md:self-start">
          {/* Logo */}
          <div className="flex items-center gap-2 px-6 pt-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-medium">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SecurePay
            </span>
          </div>

          {/* MENU ITEMS → Scrollable + takes all remaining height */}
          <div className="mt-8 flex-1 space-y-1 px-4 overflow-y-auto">
            {navItems.map((item, index) => {
              // Insert Money Transfer and Utility Payment sections after Bank (index 2)
              if (index === 2) {
                return (
                  <div key="sections-after-bank">
                    {/* Render the Bank item first */}
                    <Button
                      key={item.path}
                      onClick={() => navigate(item.path)}
                      variant={
                        location.pathname === item.path ? "secondary" : "ghost"
                      }
                      className={`w-full justify-start gap-3 py-5 text-base transition-all ${
                        location.pathname === item.path ? "shadow-soft" : ""
                      }`}
                    >
                      <Wallet className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>

                    {/* Money Transfer Section */}
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        className={`w-full justify-between gap-3 py-5 text-base transition-all ${
                          location.pathname.includes("/bank-verification-status") ||
                          location.pathname.includes("/payout-history")
                            ? "bg-secondary text-secondary-foreground shadow-soft"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={toggleMoneyTransfer}
                      >
                        <div className="flex items-center gap-3">
                          <ArrowDownToLine className="h-5 w-5" />
                          <span>Money Transfer</span>
                        </div>
                        {moneyTransferOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Submenu for Money Transfer */}
                      {moneyTransferOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                          <Button
                            onClick={() => navigate("/bank-verification-status")}
                            variant={
                              location.pathname === "/bank-verification-status"
                                ? "secondary"
                                : "ghost"
                            }
                            className={`w-full justify-start gap-3 py-4 text-base ${
                              location.pathname === "/bank-verification-status"
                                ? "shadow-soft"
                                : ""
                            }`}
                          >
                            <span>Payout</span>
                          </Button>
                          <Button
                            onClick={() => navigate("/payout-history")}
                            variant={
                              location.pathname === "/payout-history"
                                ? "secondary"
                                : "ghost"
                            }
                            className={`w-full justify-start gap-3 py-4 text-base ${
                              location.pathname === "/payout-history"
                                ? "shadow-soft"
                                : ""
                            }`}
                          >
                            <span>Payout Reports</span>
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Utility Payment Section */}
                    <div className="mt-2">
                      <Button
                        variant="ghost"
                        className={`w-full justify-between gap-3 py-5 text-base transition-all ${
                          location.pathname.includes("/payment") ||
                          location.pathname.includes("/transactions")
                            ? "bg-secondary text-secondary-foreground shadow-soft"
                            : "hover:bg-accent hover:text-accent-foreground"
                        }`}
                        onClick={toggleUtilityPayment}
                      >
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-5 w-5" />
                          <span>Utility Payment</span>
                        </div>
                        {utilityPaymentOpen ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>

                      {/* Submenu for Utility Payment */}
                      {utilityPaymentOpen && (
                        <div className="ml-8 mt-1 space-y-1">
                          <Button
                            onClick={() => navigate("/payment")}
                            variant={
                              location.pathname === "/payment"
                                ? "secondary"
                                : "ghost"
                            }
                            className={`w-full justify-start gap-3 py-4 text-base ${
                              location.pathname === "/payment"
                                ? "shadow-soft"
                                : ""
                            }`}
                          >
                            <span>PG Method</span>
                          </Button>
                          <Button
                            onClick={() => navigate("/transactions")}
                            variant={
                              location.pathname === "/transactions"
                                ? "secondary"
                                : "ghost"
                            }
                            className={`w-full justify-start gap-3 py-4 text-base ${
                              location.pathname === "/transactions"
                                ? "shadow-soft"
                                : ""
                            }`}
                          >
                            <span>PG Reports</span>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // Render KYC item (index 1) normally
              if (index === 1) {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 py-5 text-base transition-all ${
                      isActive ? "shadow-soft" : ""
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Button>
                );
              }

              // Skip rendering the Bank item again and the next two items since we already rendered them
              if (index === 3 || index === 4) {
                return null;
              }

              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  variant={isActive ? "secondary" : "ghost"}
                  className={`w-full justify-start gap-3 py-5 text-base transition-all ${
                    isActive ? "shadow-soft" : ""
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          {/* LOGOUT — ALWAYS AT BOTTOM (sticky) */}
          <div className="px-4 py-4 border-t border-border">
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </Button>
          </div>
        </aside>
      )}

      {/* ---------------- MOBILE HEADER ---------------- */}
      <div className="flex-1 flex flex-col min-h-screen">
        {showNav && (
          <header className="md:hidden sticky top-0 z-50 bg-white border-b border-border shadow-sm">
            <div className="flex h-16 items-center justify-between px-3">
              {/* LEFT SIDE: MENU + LOGO */}
              <div className="flex items-center gap-3">
                {/* MENU ICON (LEFT) */}
                <Button
                  onClick={() => setIsSidebarOpen(true)}
                  variant="ghost"
                  size="icon"
                  className="p-2 rounded-md active:scale-95"
                >
                  <List className="h-6 w-6 text-gray-700" />
                </Button>

                {/* SecurePay Logo */}
                <div
                  className="flex items-center gap-2 active:scale-95"
                  onClick={() => navigate("/")}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-md">
                    <Wallet className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    SecurePay
                  </span>
                </div>
              </div>

              {/* RIGHT SIDE: COMPACT WALLET PILL */}
              <div
                className="flex items-center gap-2 rounded-full bg-white border border-gray-200 shadow 
        px-3 py-1.5 active:scale-95 transition cursor-pointer"
                onClick={() => navigate("/bank-verification-status")}
              >
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full 
        bg-gradient-primary text-primary-foreground shadow-inner"
                >
                  <Wallet className="h-3.5 w-3.5" />
                </div>

                <div className="leading-tight">
                  <span className="text-[9px] font-semibold text-gray-500 uppercase tracking-wider block">
                    Wallet
                  </span>
                  <span className="text-[13px] font-bold text-gray-900 -mt-[2px] block">
                    {formattedBalance}
                  </span>
                </div>
              </div>
            </div>
          </header>
        )}

        {/* ---------------- MOBILE SIDEBAR DRAWER ---------------- */}
        {showNav && (
          <>
            <div
              className={`fixed top-0 left-0 h-full w-64 bg-white shadow-xl z-50 transform transition-transform duration-300
              ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
            >
              <div className="p-4 flex items-center gap-2  ">
                <Wallet className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold">SecurePay</span>
              </div>

              <div className="mt-4 space-y-1 px-3">
                {navItems.map((item, index) => {
                  // Insert Money Transfer and Utility Payment sections after Bank (index 2)
                  if (index === 2) {
                    return (
                      <div key="mobile-sections-after-bank">
                        {/* Render the Bank item first */}
                        <Button
                          key={item.path}
                          onClick={() => {
                            navigate(item.path);
                            setIsSidebarOpen(false);
                          }}
                          variant="ghost"
                          className="w-full justify-start gap-3 py-4 text-base"
                        >
                          <Wallet className="h-5 w-5" />
                          <span>{item.label}</span>
                        </Button>

                        {/* Money Transfer Section for Mobile */}
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-between gap-3 py-4 text-base"
                            onClick={() => {
                              toggleMoneyTransfer();
                              // Don't close sidebar when toggling menu
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <ArrowDownToLine className="h-5 w-5" />
                              <span>Money Transfer</span>
                            </div>
                            {moneyTransferOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Submenu for Money Transfer */}
                          {moneyTransferOpen && (
                            <div className="ml-8 mt-1 space-y-1">
                              <Button
                                onClick={() => {
                                  navigate("/bank-verification-status");
                                  setIsSidebarOpen(false);
                                }}
                                variant="ghost"
                                className="w-full justify-start gap-3 py-4 text-base"
                              >
                                <span>Payout</span>
                              </Button>
                              <Button
                                onClick={() => {
                                  navigate("/payout-history");
                                  setIsSidebarOpen(false);
                                }}
                                variant="ghost"
                                className="w-full justify-start gap-3 py-4 text-base"
                              >
                                <span>Payout Reports</span>
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Utility Payment Section for Mobile */}
                        <div className="mt-2">
                          <Button
                            variant="ghost"
                            className="w-full justify-between gap-3 py-4 text-base"
                            onClick={() => {
                              toggleUtilityPayment();
                              // Don't close sidebar when toggling menu
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <CreditCard className="h-5 w-5" />
                              <span>Utility Payment</span>
                            </div>
                            {utilityPaymentOpen ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>

                          {/* Submenu for Utility Payment */}
                          {utilityPaymentOpen && (
                            <div className="ml-8 mt-1 space-y-1">
                              <Button
                                onClick={() => {
                                  navigate("/payment");
                                  setIsSidebarOpen(false);
                                }}
                                variant="ghost"
                                className="w-full justify-start gap-3 py-4 text-base"
                              >
                                <span>PG Method</span>
                              </Button>
                              <Button
                                onClick={() => {
                                  navigate("/transactions");
                                  setIsSidebarOpen(false);
                                }}
                                variant="ghost"
                                className="w-full justify-start gap-3 py-4 text-base"
                              >
                                <span>PG Reports</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // Render KYC item (index 1) normally
                  if (index === 1) {
                    const Icon = item.icon;
                    return (
                      <Button
                        key={item.path}
                        onClick={() => {
                          navigate(item.path);
                          setIsSidebarOpen(false);
                        }}
                        variant="ghost"
                        className="w-full justify-start gap-3 py-4 text-base"
                      >
                        <Icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Button>
                    );
                  }

                  // Skip rendering the Bank item again and the next two items since we already rendered them
                  if (index === 3 || index === 4) {
                    return null;
                  }

                  const Icon = item.icon;
                  return (
                    <Button
                      key={item.path}
                      onClick={() => {
                        navigate(item.path);
                        setIsSidebarOpen(false); // 🔥 AUTO CLOSE
                      }}
                      variant="ghost"
                      className="w-full justify-start gap-3 py-4 text-base"
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Button>
                  );
                })}
              </div>
              {/* 🔥 Logout Button (BOTTOM FIXED) */}
              <div className="px-4 py-4 border-t">
                <Button
                  onClick={() => {
                    handleLogout();
                    setIsSidebarOpen(false);
                  }}
                  variant="ghost"
                  className="w-full justify-center gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>

            {/* Overlay */}
            {isSidebarOpen && (
              <div
                className="fixed inset-0 bg-black/40 z-40"
                onClick={() => setIsSidebarOpen(false)}
              />
            )}
          </>
        )}

        {/* ---------------- DESKTOP WALLET HEADER ---------------- */}
        {showNav && (
          <div className="hidden md:flex items-center justify-end px-8 py-4 border-b border-border bg-background/70 backdrop-blur-xl supports-[backdrop-filter]:bg-background/50">
            <div className="flex items-center gap-3 rounded-full bg-card/90 px-6 py-2 shadow-md border border-border/60">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-primary/90 to-primary text-primary-foreground shadow-inner">
                <Wallet className="h-4 w-4" />
              </div>
              <div
                className="flex flex-col leading-none cursor-pointer"
                onClick={() => navigate("/bank-verification-status")}
              >
                <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                  Wallet Balance
                </span>
                <span className="text-base font-bold tracking-tight">
                  {formattedBalance}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ---------------- MAIN CONTENT ---------------- */}
        <main className={showNav ? "flex-1 px-4 py-6 md:px-8" : ""}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;