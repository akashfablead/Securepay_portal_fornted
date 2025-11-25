import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  Loader2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { getUserPayouts } from "../services/payoutService";
import { mapCashfreeStatus } from "../services/utils";

const PayoutHistory = () => {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadPayouts();
  }, [currentPage]);

  const loadPayouts = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getUserPayouts({ page: currentPage, limit: 10 });
      setPayouts(response.payouts || []);
      setTotalPages(response.totalPages || 1);
    } catch (err) {
      setError("Failed to load payout Reports");
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status) => {
    return (
      {
        pending: {
          variant: "default",
          icon: Clock,
          text: "Pending",
        },
        received: {
          variant: "success",
          icon: CheckCircle,
          text: "Received",
        },
        sent_to_beneficiary: {
          variant: "success",
          icon: CheckCircle,
          text: "Sent to Beneficiary",
        },
        approval_pending: {
          variant: "warning",
          icon: Clock,
          text: "Approval Pending",
        },
        reversed: {
          variant: "destructive",
          icon: XCircle,
          text: "Reversed",
        },
        rejected: {
          variant: "destructive",
          icon: XCircle,
          text: "Rejected",
        },
        completed: {
          variant: "success",
          icon: CheckCircle,
          text: "Completed",
        },
        failed: {
          variant: "destructive",
          icon: XCircle,
          text: "Failed",
        },
      }[status] || {
        variant: "default",
        icon: Clock,
        text: "Pending",
      }
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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
        <h1 className="text-4xl font-bold mb-2">Payout Reports</h1>
        <p className="text-muted-foreground text-lg">
          View your payout request Reports and status
        </p>
      </div>

      <Card className="shadow-medium border-2">
        <CardHeader>
          <CardTitle className="text-xl">Payout Requests</CardTitle>
          <CardDescription>
            Complete Reports of your payout requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading payout Reports...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-6 w-6 mr-2" />
              <span>{error}</span>
            </div>
          ) : payouts.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <span>No payout requests found</span>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50">
                      <TableHead className="font-semibold">Date</TableHead>
                      <TableHead className="font-semibold">Amount</TableHead>
                      <TableHead className="font-semibold">Fee</TableHead>
                      <TableHead className="font-semibold">
                        Total Deduction
                      </TableHead>
                      <TableHead className="font-semibold">Status</TableHead>
                      <TableHead className="font-semibold">
                        Transaction ID
                      </TableHead>
                      <TableHead className="font-semibold">
                        Bank Account
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payouts.map((payout) => {
                      // Use the mapped status instead of displayStatus
                      const displayStatus = mapCashfreeStatus(
                        payout.cashfreeStatus
                      );
                      const statusConfig = getStatusConfig(displayStatus);
                      console.log("Status Config:", statusConfig);
                      const StatusIcon = statusConfig.icon;

                      return (
                        <TableRow
                          key={payout._id}
                          className="hover:bg-secondary/30 transition-colors"
                        >
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {formatDate(payout.createdAt)}
                          </TableCell>
                          <TableCell>
                            <span className="font-semibold">
                              {formatINR(payout.amount)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-destructive">
                              {formatINR(payout.fee)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="font-bold">
                              {formatINR(payout.totalDeduction)}
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
                            <div className="text-sm font-mono">
                              <p className="font-medium text-primary">
                                {payout.cashfreeReferenceId ||
                                  payout.transferId ||
                                  "N/A"}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">
                                {payout.bankDetails?.accountHolderName || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground font-mono">
                                {payout.bankDetails?.accountNumber
                                  ? `****${payout.bankDetails.accountNumber.slice(
                                      -4
                                    )}`
                                  : "N/A"}
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                      }
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm border rounded disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PayoutHistory;