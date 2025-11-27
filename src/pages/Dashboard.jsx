import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Wallet,
  IndianRupee,
  ArrowDownToLine,
  CreditCard,
  FileText,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
} from "lucide-react";
import { getDashboard } from "@/services/authService";
import { useVerificationGate } from "@/hooks/useVerificationGate";

const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    availableBalance: 0,
    totalPayouts: 0,
    totalPayments: 0,
    totalTransactions: 0,
  });
  const [loading, setLoading] = useState(true);
  const [kyc, setKyc] = useState(null);
  const [bank, setBank] = useState(null);

  const {
    loading: verificationLoading,
    canTransact,
    kycStatus,
    bankStatus,
    error: verificationError,
  } = useVerificationGate();

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setStats({
        availableBalance: Number(data?.stats?.availableBalance || 0),
        totalPayouts: Number(data?.stats?.totalPayouts || 0),
        totalPayments: Number(data?.stats?.totalPayments || 0),
        totalTransactions: Number(data?.stats?.totalTransactions || 0),
      });
      setKyc(data?.kyc || null);
      setBank(data?.bank || null);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const handleQuickAction = (action) => {
    if (!canTransact) {
      toast.error("Complete bank verification before making payments.");
      return;
    }

    switch (action) {
      case "payout":
        navigate("/bank-verification-status");
        break;
      case "payment":
        navigate("/payment");
        break;
      case "reports":
        navigate("/consolidated-reports");
        break;
      default:
        break;
    }
  };

  const getKYCStatusConfig = (status) => {
    const configs = {
      approved: {
        icon: CheckCircle,
        variant: "success",
        text: "Verified",
        bgClass: "bg-success/10 border-success/20",
      },
      pending: {
        icon: Clock,
        variant: "warning",
        text: "Pending Review",
        bgClass: "bg-warning/10 border-warning/20",
      },
      rejected: {
        icon: XCircle,
        variant: "destructive",
        text: "Rejected",
        bgClass: "bg-destructive/10 border-destructive/20",
      },
      failed: {
        icon: XCircle,
        variant: "destructive",
        text: "Verification Failed",
        bgClass: "bg-destructive/10 border-destructive/20",
      },
      not_submitted: {
        icon: AlertCircle,
        variant: "secondary",
        text: "Not Submitted",
        bgClass: "bg-secondary/10 border-secondary/20",
      },
    };
    return configs[status] || configs.not_submitted;
  };

  const getBankStatusConfig = (status) => {
    const configs = {
      verified: {
        icon: CheckCircle,
        variant: "success",
        text: "Verified",
        bgClass: "bg-success/10 border-success/20",
      },
      pending: {
        icon: Clock,
        variant: "warning",
        text: "Pending Verification",
        bgClass: "bg-warning/10 border-warning/20",
      },
      failed: {
        icon: XCircle,
        variant: "destructive",
        text: "Verification Failed",
        bgClass: "bg-destructive/10 border-destructive/20",
      },
      not_verified: {
        icon: AlertCircle,
        variant: "secondary",
        text: "Not Verified",
        bgClass: "bg-secondary/10 border-secondary/20",
      },
    };
    return configs[status] || configs.not_verified;
  };

  const kycConfig = getKYCStatusConfig(kyc?.status);
  const bankConfig = getBankStatusConfig(bank?.verificationStatus);
  const KYCIcon = kycConfig.icon;
  const BankIcon = bankConfig.icon;

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your account today.
        </p>
      </div>

      {/* Balance Card */}
      <Card className="shadow-medium border-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              Available Balance
            </div>
            <Badge variant="secondary" className="text-xs">
              INR
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold mb-4">
            {loading ? (
              <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            ) : (
              formatINR(stats.availableBalance)
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => handleQuickAction("payout")}
              className="h-12 bg-gradient-primary hover:opacity-90"
            >
              <ArrowDownToLine className="h-4 w-4 mr-2" />
              Payout
            </Button>
            <Button
              onClick={() => handleQuickAction("payment")}
              variant="outline"
              className="h-12 border-primary text-primary hover:bg-primary/10"
            >
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Payouts</CardTitle>
            <ArrowDownToLine className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                formatINR(stats.totalPayouts)
              )}
            </div>
            <p className="text-xs text-muted-foreground">All time payouts</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Payments
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                formatINR(stats.totalPayments)
              )}
            </div>
            <p className="text-xs text-muted-foreground">All time payments</p>
          </CardContent>
        </Card>
        <Card className="shadow-soft">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="h-6 w-16 bg-gray-200 rounded animate-pulse" />
              ) : (
                stats.totalTransactions
              )}
            </div>
            <p className="text-xs text-muted-foreground">Payments + Payouts</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Button
              onClick={() => handleQuickAction("payout")}
              variant="outline"
              className="h-16 flex flex-col gap-1 items-center justify-center"
            >
              <ArrowDownToLine className="h-5 w-5" />
              <span>Payout</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("payment")}
              variant="outline"
              className="h-16 flex flex-col gap-1 items-center justify-center"
            >
              <CreditCard className="h-5 w-5" />
              <span>Payment</span>
            </Button>
            <Button
              onClick={() => handleQuickAction("reports")}
              variant="outline"
              className="h-16 flex flex-col gap-1 items-center justify-center"
            >
              <FileText className="h-5 w-5" />
              <span>Reports</span>
            </Button>
            <Button
              onClick={() => navigate("/profile")}
              variant="outline"
              className="h-16 flex flex-col gap-1 items-center justify-center"
            >
              <Users className="h-5 w-5" />
              <span>Profile</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;