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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { getDashboard } from "../services/authService";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  // Wallet balance (simple JS state, no TypeScript generics in .jsx file)
  const [walletBalance, setWalletBalance] = useState(null);
  const hideNavRoutes = ["/login", "/forgot-password", "/signup"];
  const showNav = !hideNavRoutes.includes(location.pathname);

  // Get user role from localStorage
  const userRole = localStorage.getItem("role") || "user";
  const isMasterDistributor = userRole === "master";

  const navItems = [
    { icon: Home, label: "Dashboard", path: "/" },
    { icon: FileCheck, label: "KYC", path: "/kyc-verification" },
    { icon: Wallet, label: "Bank", path: "/bank-status" },
    { icon: History, label: "History", path: "/transactions" },
    { icon: ArrowDownToLine, label: "Payout", path: "/payout" },
    { icon: List, label: "Payout History", path: "/payout-history" },
    // Only show Retailers and Payout menu for master distributors
    ...(isMasterDistributor
      ? [{ icon: Users, label: "Retailers", path: "/master/retailers" }]
      : []),
    { icon: User, label: "Profile", path: "/profile" },
    { icon: HelpCircle, label: "Support", path: "/support" },
  ];

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch (_) {}
    navigate("/login", { replace: true });
  };

  // Load wallet balance for header
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

    if (showNav) {
      loadBalance();
    }

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
      {showNav && (
        <aside className="hidden md:flex md:flex-col w-64 lg:w-72 border-r border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60 shadow-soft md:sticky md:top-0 md:h-screen md:self-start">
          <div className="flex items-center gap-2 px-6 pt-8">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-primary shadow-medium">
              <Wallet className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              SecurePay
            </span>
          </div>

          <div className="mt-8 flex-1 space-y-1 px-4">
            {navItems.map((item) => {
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
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span>{item.label}</span>
                </Button>
              );
            })}
          </div>

          <div className="px-4 py-6 border-t border-border">
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
      <div className="flex-1 flex flex-col min-h-screen">
        {showNav && (
          <header className="md:hidden sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur-md supports-[backdrop-filter]:bg-card/60 shadow-soft">
            <div className="flex h-16 items-center justify-between px-4">
              <Link
                to="/"
                className="flex items-center gap-2 transition-transform hover:scale-105"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary shadow-medium">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  SecurePay
                </span>
              </Link>

              <Button
                onClick={() => navigate("/profile")}
                variant="ghost"
                size="sm"
              >
                <User className="h-5 w-5" />
              </Button>
            </div>
          </header>
        )}

        {/* Desktop Header – Wallet Balance */}
        {showNav && (
          <div
            className="hidden md:flex items-center justify-end px-8 py-4 
    border-b border-border bg-background/70 backdrop-blur-xl 
    supports-[backdrop-filter]:bg-background/50"
          >
            <div
              className="flex items-center gap-3 rounded-full bg-card/90 
      px-6 py-2 shadow-md border border-border/60"
            >
              {/* Icon Box */}
              <div
                className="flex h-9 w-9 items-center justify-center rounded-full 
        bg-gradient-to-br from-primary/90 to-primary text-primary-foreground 
        shadow-inner"
              >
                <Wallet className="h-4 w-4" />
              </div>

              {/* Wallet Text */}
              <div
                className="flex flex-col leading-none cursor-pointer"
                onClick={() => navigate("/payout")}
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

        <main className={showNav ? "flex-1 px-4 py-6 md:px-8" : ""}>
          {children}
        </main>

        {showNav && (
          <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/80 shadow-medium z-50">
            <div className="flex items-center justify-around py-2 px-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Button
                    key={item.path}
                    onClick={() => navigate(item.path)}
                    variant="ghost"
                    size="sm"
                    className={`flex flex-col items-center gap-1 h-auto py-2 px-3 transition-all ${
                      isActive
                        ? "text-primary bg-primary/10"
                        : "text-muted-foreground"
                    }`}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-medium">{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </nav>
        )}
      </div>
      ;
    </div>
  );
};

export default Layout;
