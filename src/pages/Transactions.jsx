import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Search,
  Calendar,
  CreditCard,
  ArrowDownToLine,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { getOrderHistory } from "@/services/paymentService";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { useVerificationGate } from "@/hooks/useVerificationGate";

const Transactions = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  const {
    loading: verificationLoading,
    canTransact,
    kycStatus,
    bankStatus,
    error: verificationError,
  } = useVerificationGate();

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const data = await getOrderHistory();
      setTransactions(data?.transactions || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const filteredTransactions = transactions.filter((transaction) => {
    const matchesSearch =
      transaction.orderId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.providerReferenceId
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || transaction.status === statusFilter;

    const matchesType = typeFilter === "all" || transaction.type === typeFilter;

    // Date filtering would require more complex logic based on your needs
    const matchesDate = true;

    return matchesSearch && matchesStatus && matchesType && matchesDate;
  });

  const getStatusConfig = (status) => {
    const configs = {
      paid: {
        icon: CheckCircle,
        variant: "success",
        text: "Paid",
        className: "bg-success/10 text-success border-success/20",
      },
      failed: {
        icon: XCircle,
        variant: "destructive",
        text: "Failed",
        className: "bg-destructive/10 text-destructive border-destructive/20",
      },
      pending: {
        icon: Clock,
        variant: "warning",
        text: "Pending",
        className: "bg-warning/10 text-warning border-warning/20",
      },
      created: {
        icon: AlertCircle,
        variant: "secondary",
        text: "Created",
        className: "bg-secondary/10 text-secondary border-secondary/20",
      },
    };
    return configs[status] || configs.pending;
  };

  const getTypeConfig = (type) => {
    return type === "payout"
      ? {
          icon: ArrowDownToLine,
          text: "Payout",
          className: "bg-blue-100 text-blue-800 border-blue-200",
        }
      : {
          icon: CreditCard,
          text: "Payment",
          className: "bg-green-100 text-green-800 border-green-200",
        };
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleMakePayment = () => {
    if (!canTransact) {
      toast.error("Complete bank verification before making payments.");
      return;
    }
    navigate("/payment");
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold">Transaction History</h1>
        <p className="text-muted-foreground">
          View your payment and payout transaction records
        </p>
      </div>

      {/* Filters */}
      <Card className="shadow-soft">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by order ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="created">Created</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="payout">Payouts</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="week">This Week</SelectItem>
                <SelectItem value="month">This Month</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleMakePayment} className="gap-2">
              <CreditCard className="h-4 w-4" />
              Make Payment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Transactions
          </CardTitle>
          <CardDescription>
            List of all your payment and payout transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-muted-foreground">
                Loading transactions...
              </p>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="py-8 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-medium">No transactions found</h3>
              <p className="mt-1 text-muted-foreground">
                {searchTerm || statusFilter !== "all" || typeFilter !== "all"
                  ? "No transactions match your filters."
                  : "You haven't made any transactions yet."}
              </p>
              <Button
                onClick={handleMakePayment}
                className="mt-4"
                disabled={!canTransact}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Make Your First Payment
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => {
                const statusConfig = getStatusConfig(transaction.status);
                const typeConfig = getTypeConfig(transaction.type);
                const StatusIcon = statusConfig.icon;
                const TypeIcon = typeConfig.icon;

                return (
                  <div
                    key={transaction._id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">
                            {transaction.orderId || transaction._id}
                          </p>
                          <Badge className={typeConfig.className}>
                            {typeConfig.text}
                          </Badge>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(transaction.createdAt)}
                          </div>
                          {transaction.providerReferenceId && (
                            <>
                              <div className="hidden sm:block">•</div>
                              <span className="font-mono text-xs">
                                Ref: {transaction.providerReferenceId}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="font-medium">
                          {formatINR(transaction.amount)}
                        </p>
                        <div className="flex items-center gap-1">
                          <Badge className={statusConfig.className}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig.text}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
