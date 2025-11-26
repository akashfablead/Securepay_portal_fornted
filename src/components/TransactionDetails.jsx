import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const TransactionDetails = ({ transaction }) => {
  if (!transaction) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusVariant = (status) => {
    const statusMap = {
      RECEIVED: "bg-blue-100 text-blue-800",
      SUCCESS: "bg-green-100 text-green-800",
      PAID: "bg-green-100 text-green-800",
      PENDING: "bg-yellow-100 text-yellow-800",
      FAILED: "bg-red-100 text-red-800",
      PROCESSING: "bg-purple-100 text-purple-800",
    };

    return statusMap[status?.toUpperCase()] || "bg-gray-100 text-gray-800";
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="text-2xl">Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Main Transaction Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Transaction ID
                </h3>
                <p className="font-mono text-lg font-semibold">
                  {transaction.id}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Order ID
                </h3>
                <p className="font-mono">{transaction.orderId}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Type
                </h3>
                <Badge
                  variant="outline"
                  className={
                    transaction.type === "payout"
                      ? "bg-blue-100 text-blue-800 border-blue-200"
                      : "bg-green-100 text-green-800 border-green-200"
                  }
                >
                  {transaction.type === "payout" ? "Payout" : "Payment"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Status
                </h3>
                <Badge
                  variant="outline"
                  className={getStatusVariant(transaction.status)}
                >
                  {transaction.status}
                </Badge>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Amount
                </h3>
                <p
                  className={`text-2xl font-bold ${
                    transaction.type === "payout"
                      ? "text-red-600"
                      : "text-green-600"
                  }`}
                >
                  {transaction.type === "payout" ? "-" : "+"}
                  {formatCurrency(transaction.amount)}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Created At
                </h3>
                <p>{formatDate(transaction.createdAt)}</p>
              </div>
            </div>
          </div>

          {/* Financial Details */}
          {transaction.type === "payout" && (
            <Card className="bg-secondary/30">
              <CardHeader>
                <CardTitle className="text-lg">Payout Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Total Deduction
                    </h3>
                    <p className="font-semibold">
                      {formatCurrency(transaction.totalDeduction)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Processing Fee
                    </h3>
                    <p className="font-semibold text-red-600">
                      -{formatCurrency(transaction.fee)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Net Amount
                    </h3>
                    <p className="font-semibold">
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Details (for payouts) */}
          {transaction.type === "payout" && transaction.bankDetails && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bank Account</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Account Holder
                    </h3>
                    <p>{transaction.bankDetails.accountHolderName}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Account Number
                    </h3>
                    <p className="font-mono">
                      ****{transaction.bankDetails.accountNumber?.slice(-4)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      IFSC Code
                    </h3>
                    <p className="font-mono">{transaction.bankDetails.ifsc}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <div className="pt-4 border-t">
            <h3 className="text-lg font-semibold mb-3">
              Additional Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Currency
                </h4>
                <p>{transaction.currency || "INR"}</p>
              </div>

              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Last Updated
                </h4>
                <p>{formatDate(transaction.updatedAt)}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetails;
