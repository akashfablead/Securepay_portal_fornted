import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Download,
  Filter,
  CreditCard,
  Wallet,
  CheckCircle,
  Clock,
  XCircle,
  Loader2,
  Eye,
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
import { getConsolidatedReports } from "../services/reportsService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const ConsolidatedReports = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    fetchReports();
  }, [currentPage]);

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getConsolidatedReports();

      setReports(response.reports || []);
      setTotalPages(1);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load consolidated reports");
      toast.error("Failed to load consolidated reports");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status, type) => {
    const configs = {
      paid: { variant: "success", icon: CheckCircle, text: "Success" },
      success: { variant: "success", icon: CheckCircle, text: "Success" },
      pending: { variant: "warning", icon: Clock, text: "Pending" },
      failed: { variant: "destructive", icon: XCircle, text: "Failed" },
      processing: { variant: "warning", icon: Clock, text: "Processing" },
      completed: { variant: "success", icon: CheckCircle, text: "Completed" },
      refunded: { variant: "destructive", icon: XCircle, text: "Refunded" },
      cancelled: { variant: "destructive", icon: XCircle, text: "Cancelled" },
      rejected: { variant: "destructive", icon: XCircle, text: "Rejected" },
      RECEIVED: { variant: "success", icon: CheckCircle, text: "Received" },
    };
    return configs[status] || configs.pending;
  };

  const getStatusBadge = (status, type) => {
    const s = String(status || "").toLowerCase();
    const styleBy = {
      paid: "bg-success/10 text-success border-success/20",
      success: "bg-success/10 text-success border-success/20",
      failed: "bg-destructive/10 text-destructive border-destructive/20",
      pending: "bg-warning/10 text-warning border-warning/20",
      created: "bg-warning/10 text-warning border-warning/20",
      processing: "bg-secondary/10 text-secondary border-secondary/20",
      received: "bg-blue-100 text-blue-800 border-blue-200",
      completed: "bg-success/10 text-success border-success/20",
    };
    const labelBy = {
      paid: "Paid",
      success: "Success",
      failed: "Failed",
      pending: "Pending",
      created: "Created",
      processing: "Processing",
      received: "Received",
      completed: "Completed",
    };
    const cls = styleBy[s] || "bg-muted/30 text-foreground border-border/40";
    const label =
      labelBy[s] ||
      (status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown");
    return (
      <Badge variant="outline" className={cls}>
        {label}
      </Badge>
    );
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.orderId
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const handleExport = () => {
    const dataToExport = filteredReports.length > 0 ? filteredReports : reports;

    if (dataToExport.length === 0) {
      toast.error("No reports to export");
      return;
    }

    const headers = [
      "Transaction ID",
      "Type",
      "Date & Time",
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

    const rows = dataToExport.map((report) => {
      const statusConfig = getStatusConfig(report.status);
      const formattedDate = new Date(report.createdAt).toLocaleString("en-IN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });

      return [
        report.orderId,
        report.type,
        formattedDate,
        report.amount,
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
    link.download = `consolidated_reports_${timestamp}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Reports exported successfully");
  };

  const successCount = reports.filter(
    (r) =>
      r.status === "paid" ||
      r.status === "success" ||
      r.status === "completed" ||
      r.status === "received"
  ).length;
  const totalAmount = reports.reduce((sum, r) => sum + Math.abs(r.amount), 0);

  const openReportDetails = (report) => {
    setSelectedReport(report);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6 w-full">
      <div>
        <h1 className="text-4xl font-bold mb-2">Reports</h1>
        <p className="text-muted-foreground text-lg">
          View all your payment and payout transactions in one place
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-soft hover:shadow-medium transition-all cursor-default border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs font-medium uppercase tracking-wide">
              Total Transactions
            </CardDescription>
            <CardTitle className="text-4xl font-bold">
              {reports.length}
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
                Complete reports of your payments and payouts
              </CardDescription>
            </div>
            <div className="flex gap-2">
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
                placeholder="Search by Transaction ID..."
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
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
                <SelectItem value="payout">Payouts</SelectItem>
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
                    <TableHead className="font-semibold">Type</TableHead>
                    <TableHead className="font-semibold">Date & Time</TableHead>
                    <TableHead className="text-right font-semibold">
                      Amount
                    </TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <Loader2 className="h-8 w-8 mb-2 animate-spin" />
                          <p>Loading reports...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
                        <div className="flex flex-col items-center justify-center text-muted-foreground">
                          <XCircle className="h-8 w-8 mb-2 text-destructive" />
                          <p className="text-destructive">{error}</p>
                          <Button
                            onClick={fetchReports}
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredReports.length > 0 ? (
                    filteredReports.map((report) => {
                      const statusConfig = getStatusConfig(report.status);
                      const StatusIcon = statusConfig.icon;
                      const formattedDate = new Date(
                        report.createdAt
                      ).toLocaleString("en-IN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      });

                      return (
                        <TableRow
                          key={report.id}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="font-mono font-semibold text-primary">
                            {report.orderId}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                report.type === "payout"
                                  ? "bg-blue-100 text-blue-800 border-blue-200"
                                  : "bg-green-100 text-green-800 border-green-200"
                              }
                            >
                              {report.type === "payout" ? (
                                <Wallet className="h-3 w-3 mr-1" />
                              ) : (
                                <CreditCard className="h-3 w-3 mr-1" />
                              )}
                              {report.type === "payout" ? "Payout" : "Payment"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formattedDate}
                          </TableCell>

                          <TableCell className="text-right">
                            <span
                              className={`font-bold text-lg ${
                                report.type === "payout"
                                  ? "text-destructive"
                                  : "text-success"
                              }`}
                            >
                              {report.type === "payout" ? "-" : "+"}₹
                              {Math.abs(report.amount).toLocaleString()}
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
                          <TableCell>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openReportDetails(report)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-32 text-center">
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

          {filteredReports.length > 0 && (
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span>
                Showing {filteredReports.length} of {reports.length}{" "}
                transactions
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Report Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
          </DialogHeader>
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    Transaction ID
                  </p>
                  <p className="font-medium">{selectedReport.orderId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <Badge
                    variant="outline"
                    className={
                      selectedReport.type === "payout"
                        ? "bg-blue-100 text-blue-800 border-blue-200"
                        : "bg-green-100 text-green-800 border-green-200"
                    }
                  >
                    {selectedReport.type === "payout" ? "Payout" : "Payment"}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  {getStatusBadge(selectedReport.status, selectedReport.type)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Amount</p>
                  <p
                    className={`font-medium ${
                      selectedReport.type === "payout"
                        ? "text-destructive"
                        : "text-success"
                    }`}
                  >
                    {selectedReport.type === "payout" ? "-" : "+"}₹
                    {Math.abs(selectedReport.amount).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Date & Time</p>
                  <p>
                    {new Date(selectedReport.createdAt).toLocaleString(
                      "en-IN",
                      {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}
                  </p>
                </div>
              </div>

              {selectedReport.meta && (
                <div className="border-t pt-4">
                  <h3 className="font-medium mb-2">Additional Details</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {Object.entries(selectedReport.meta).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, " $1").trim()}
                        </span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ConsolidatedReports;
