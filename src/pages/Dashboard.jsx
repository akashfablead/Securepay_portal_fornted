import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Shield,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  Wallet,
  FileCheck,
  TrendingUp,
  History,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDashboard } from "@/services/authService";
import { toast } from "sonner";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [kycStatus, setKycStatus] = useState("pending");
  const [bank, setBank] = useState(null);
  const [stats, setStats] = useState({
    totalTransactions: 0,
    paidCount: 0,
    failedCount: 0,
    totalPaidAmount: 0,
    availableBalance: 0,
  });
  const [recentTransactions, setRecentTransactions] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDashboard();
        setKycStatus(data?.kyc?.status || "pending");
        setBank(data?.bank || null);
        setStats(
          data?.stats || {
            totalTransactions: 0,
            paidCount: 0,
            failedCount: 0,
            totalPaidAmount: 0,
          }
        );
        setRecentTransactions(
          (data?.recentTransactions || []).map((t) => ({
            id: t.id || t.orderId,
            date: new Date(t.createdAt).toLocaleDateString(),
            amount: t.amount,
            method: t.method,
            status: t.status,
            description: t.description,
          }))
        );
      } catch (err) {
        toast.error(
          err?.response?.data?.message ||
            err.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getStatusBadge = (status) => {
    const variants = {
      verified: { variant: "success", icon: CheckCircle, label: "Verified" },
      pending: { variant: "warning", icon: Clock, label: "Pending" },
      rejected: {
        variant: "destructive",
        icon: AlertCircle,
        label: "Rejected",
      },
      failed: { variant: "destructive", icon: AlertCircle, label: "Failed" },
      success: { variant: "success", icon: CheckCircle, label: "Success" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1 shadow-soft">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const isBankVerified = bank?.verificationStatus === "verified";
  const canTransact = kycStatus === "approved" && isBankVerified;

  const handlePaymentClick = () => {
    if (!canTransact) {
      toast.error("Complete KYC and bank verification before making payments.");
      return;
    }
    navigate("/payment");
  };

  // Format INR currency
  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6 w-full">
      <div>
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground text-lg">
          Welcome back! Here's your account overview
        </p>
      </div>

      {!loading && !canTransact && (
        <div className="rounded-lg border border-warning/70 bg-warning/10 p-4 text-sm text-warning">
          Complete your KYC and bank verification to unlock payments and
          retailer onboarding.
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card
          className={`shadow-medium transition-all border-2 ${
            canTransact
              ? "cursor-pointer hover:shadow-glow hover:border-primary"
              : "cursor-not-allowed opacity-70"
          }`}
          onClick={handlePaymentClick}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-primary">
                <CreditCard className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">Make Payment</p>
                <p className="text-sm text-muted-foreground">Pay your bills</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="shadow-medium hover:shadow-glow transition-all cursor-pointer border-2 hover:border-primary"
          onClick={() => navigate("/add-bank")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-success">
                <Wallet className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="font-semibold text-lg">Add Bank</p>
                <p className="text-sm text-muted-foreground">Link account</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="shadow-medium hover:shadow-glow transition-all cursor-pointer border-2 hover:border-primary"
          onClick={() => navigate("/kyc-verification")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <FileCheck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">Complete KYC</p>
                <p className="text-sm text-muted-foreground">Verify identity</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="shadow-medium hover:shadow-glow transition-all cursor-pointer border-2 hover:border-primary"
          onClick={() => navigate("/transactions")}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-secondary">
                <History className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-lg">Transactions</p>
                <p className="text-sm text-muted-foreground">View history</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          className="shadow-medium hover:shadow-soft transition-all cursor-pointer"
          onClick={() => navigate("/kyc-status")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <FileCheck className="h-6 w-6" />
              KYC Verification Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-lg">Verification Status</p>
                <p className="text-sm text-muted-foreground">
                  Last updated: just now
                </p>
              </div>
              {getStatusBadge(
                kycStatus === "approved"
                  ? "verified"
                  : kycStatus === "rejected"
                  ? "rejected"
                  : kycStatus === "failed"
                  ? "failed"
                  : "pending"
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">PAN Verification</span>
                {getStatusBadge(
                  kycStatus === "approved" ? "verified" : "pending"
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Aadhaar Verification
                </span>
                {getStatusBadge(
                  kycStatus === "approved" ? "verified" : "pending"
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Selfie Verification
                </span>
                {getStatusBadge(
                  kycStatus === "approved" ? "verified" : "pending"
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="shadow-medium hover:shadow-soft transition-all cursor-pointer"
          onClick={() => navigate("/bank-status")}
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Wallet className="h-6 w-6" />
              Bank Account Status
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
              <div>
                <p className="font-medium text-lg">Bank Verification</p>
                <p className="text-sm text-muted-foreground">
                  {bank
                    ? `${bank.bankName || ""} ${bank.accountLast4 || ""}`
                    : "No bank linked"}
                </p>
              </div>
              {getStatusBadge(
                bank?.verificationStatus === "verified"
                  ? "verified"
                  : bank?.verificationStatus === "failed"
                  ? "failed"
                  : "pending"
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Account Holder</p>
                <p className="font-medium">{bank?.accountHolderName || "—"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">IFSC Code</p>
                <p className="font-medium">{bank?.ifsc || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wallet Balance Card */}
      <Card
        className="shadow-medium hover:shadow-glow transition-all cursor-pointer border-2 hover:border-primary"
        onClick={() => navigate("/payout")}
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Wallet className="h-6 w-6" />
            Wallet Balance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">
                {loading
                  ? "Loading..."
                  : formatINR(stats.availableBalance || 0)}
              </p>
              <p className="text-sm text-muted-foreground">
                Available for payout
              </p>
            </div>
            <Button variant="outline" className="gap-2">
              Withdraw <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card className="shadow-medium">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Recent Transactions</CardTitle>
            <CardDescription>Your latest payment activity</CardDescription>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/transactions")}
            className="gap-2"
          >
            View All <ArrowUpRight className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentTransactions.map((txn) => (
              <div
                key={txn.id}
                onClick={() => navigate("/transactions")}
                className="flex items-center justify-between p-4 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-all cursor-pointer border border-transparent hover:border-primary"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-3 rounded-lg ${
                      txn.status === "success"
                        ? "bg-success/20"
                        : txn.status === "pending"
                        ? "bg-warning/20"
                        : "bg-destructive/20"
                    }`}
                  >
                    <CreditCard
                      className={`h-5 w-5 ${
                        txn.status === "success"
                          ? "text-success"
                          : txn.status === "pending"
                          ? "text-warning"
                          : "text-destructive"
                      }`}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-base">{txn.description}</p>
                    <p className="text-sm text-muted-foreground">{txn.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">₹{txn.amount}</p>
                  {getStatusBadge(txn.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;