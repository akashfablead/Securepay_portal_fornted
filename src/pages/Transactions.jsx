import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Filter,
  CreditCard,
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { getOrderHistory } from "@/services/paymentService";
import { useVerificationGate } from "@/hooks/useVerificationGate";

const Transactions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { loading: verificationLoading, canTransact } = useVerificationGate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getOrderHistory();
      if (response.success) {
        setTransactions(response.transactions || []);
      } else {
        setError("Failed to fetch transactions");
      }
    } catch (err) {
      console.error("Error fetching transactions:", err);
      setError("Failed to load transaction history");
      toast.error("Failed to load transaction history");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      paid: { variant: "success", icon: CheckCircle, text: "Success" },
      created: { variant: "warning", icon: Clock, text: "Pending" },
      failed: { variant: "destructive", icon: XCircle, text: "Failed" },
    };
    return configs[status] || configs.created;
  };

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (txn.meta?.paymentMethod &&
        txn.meta.paymentMethod
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === "all" || txn.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleExport = () => {
    const dataToExport =
      filteredTransactions.length > 0 ? filteredTransactions : transactions;

    if (dataToExport.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const headers = [
      "Transaction ID",
      "Date & Time",
      "Method",
      "Amount (INR)",
      "Status",
    ];

    const escapeCsv = (value) => {
      const stringValue =
        value === null || value === undefined ? "" : String(value);
      const needsEscaping = /[",\n]/.test(stringValue);
      const escaped = stringValue.replace(/"/g, '""');
      return needsEscaping ? `"${escaped}"` : escaped;
    };

    const rows = dataToExport.map((txn) => {
      const statusConfig = getStatusConfig(txn.status);
      const paymentMethod = txn.meta?.paymentMethod || "Cashfree Payment";
      const formattedDate = new Date(txn.createdAt).toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        txn.orderId,
        formattedDate,
        paymentMethod,
        txn.amount,
        statusConfig.text,
      ]
        .map(escapeCsv)
        .join(",");
    });

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const timestamp = new Date()
      .toISOString()
      .replace(/[:T]/g, "-")
      .split(".")[0];
    link.href = url;
    link.download = `transactions_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Transactions exported successfully");
  };

  const handleMakePayment = () => {
    if (!canTransact) {
      toast.error("Complete KYC and bank verification before making payments.");
      return;
    }
    navigate("/payment");
  };

  const successCount = transactions.filter((t) => t.status === "paid").length;
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6 pb-16 md:pb-6 w-full">
      <div>
        <h1 className="text-4xl font-bold mb-2">Transaction History</h1>
        <p className="text-muted-foreground text-lg">
          View and manage all your payment transactions
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-soft hover:shadow-medium transition-all cursor-default border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Total Transactions
            </CardDescription>
            <CardTitle className="text-4xl font-bold">
              {transactions.length}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft hover:shadow-medium transition-all cursor-default border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Successful
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-success">
              {successCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card className="shadow-soft hover:shadow-medium transition-all cursor-default border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Total Amount
            </CardDescription>
            <CardTitle className="text-4xl font-bold">
              ₹{totalAmount.toLocaleString()}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-medium border-2">
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div>
              <CardTitle className="text-xl">All Transactions</CardTitle>
              <CardDescription>
                Complete history of your payments
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleMakePayment}
                className="gap-2 bg-gradient-primary shadow-soft hover:shadow-medium"
                disabled={verificationLoading || !canTransact}
              >
                <CreditCard className="h-4 w-4" />
                New Payment
              </Button>
              <Button
                onClick={handleExport}
                variant="outline"
                size="sm"
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID or payment method..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="paid">Success</SelectItem>
                <SelectItem value="created">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">
                      Transaction ID
                    </TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="font-semibold">Method</TableHead>
                    <TableHead className="text-right font-semibold">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                          <p>Loading transactions...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <XCircle className="h-8 w-8 mb-2 text-destructive" />
                          <p className="text-destructive">{error}</p>
                          <Button
                            onClick={fetchTransactions}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredTransactions.length > 0 ? (
                    filteredTransactions.map((txn) => {
                      const statusConfig = getStatusConfig(txn.status);
                      const StatusIcon = statusConfig.icon;
                      const paymentMethod =
                        txn.meta?.paymentMethod || "Cashfree Payment";
                      const formattedDate = new Date(
                        txn.createdAt
                      ).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <TableRow
                          key={txn._id}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="font-mono font-semibold text-primary">
                            {txn.orderId}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formattedDate}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                                <CreditCard className="h-4 w-4 text-primary" />
                              </div>
                              <span className="text-sm font-medium">
                                {paymentMethod}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <span className="font-bold text-lg">
                              ₹{txn.amount.toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={statusConfig.variant}
                              className="gap-1 shadow-soft"
                            >
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig.text}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Search className="h-8 w-8 mb-2 opacity-50" />
                          <p>No transactions found matching your search</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {filteredTransactions.length > 0 && (
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span>
                Showing {filteredTransactions.length} of {transactions.length}{" "}
                transactions
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
