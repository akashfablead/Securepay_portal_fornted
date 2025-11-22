import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { CheckCircle, ArrowLeft, Download, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { verifyPayment } from "@/services/paymentService";
import jsPDF from "jspdf";

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [paymentStatus, setPaymentStatus] = useState("verifying");
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get("order_id");

  useEffect(() => {
    const verifyPaymentStatus = async () => {
      if (!orderId) {
        toast.error("No order ID found");
        navigate("/");
        return;
      }

      try {
        setLoading(true);
        const result = await verifyPayment({ orderId });

        if (result?.status === "PAID") {
          setPaymentStatus("success");
          setOrderDetails(result);
          toast.success("Payment verified successfully!");
        } else if (result?.status === "FAILED") {
          setPaymentStatus("failed");
          setOrderDetails(result);
          toast.error("Payment failed");
        } else {
          setPaymentStatus("pending");
          setOrderDetails(result);
          toast.info("Payment is still being processed");
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setPaymentStatus("error");
        toast.error("Failed to verify payment status");
      } finally {
        setLoading(false);
      }
    };

    verifyPaymentStatus();
  }, [orderId, navigate]);

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate("/payment");
  };

  const handleDownloadReceipt = () => {
    if (!orderDetails) {
      toast.error("Payment details not available");
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Get payment details
      const amount =
        orderDetails?.transaction?.amount ||
        orderDetails?.raw?.order?.order_amount ||
        "N/A";

      // Format amount properly
      const formattedAmount =
        amount !== "N/A" ? Number(amount).toLocaleString("en-IN") : "N/A";
      const paymentId =
        orderDetails?.providerPaymentId ||
        orderDetails?.transaction?.providerReferenceId ||
        orderDetails?.raw?.payment?.cf_payment_id ||
        "N/A";
      const paymentMethod =
        orderDetails?.raw?.payment?.payment_method?.card?.card_type
          ?.replace("_", " ")
          .toUpperCase() ||
        orderDetails?.raw?.payment?.payment_group
          ?.replace("_", " ")
          .toUpperCase() ||
        "UPI";
      const bankName =
        orderDetails?.raw?.payment?.payment_method?.card?.card_bank_name ||
        "N/A";
      const paymentTime =
        orderDetails?.raw?.payment?.payment_completion_time ||
        new Date().toISOString();

      // Format date
      const formatDate = (dateString) => {
        try {
          const date = new Date(dateString);
          return date.toLocaleDateString("en-IN", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });
        } catch {
          return new Date().toLocaleDateString("en-IN");
        }
      };

      // Set font
      doc.setFont("helvetica");

      // === HEADER SECTION ===
      // Company Logo Area (placeholder)
      doc.setFillColor(0, 100, 0);
      doc.rect(0, 0, 210, 40, "F");

      // Company Name
      doc.setFontSize(28);
      doc.setTextColor(255, 255, 255);
      doc.text("SecurePay", 20, 25);

      // Tagline
      doc.setFontSize(12);
      doc.text("Secure Payment Solutions", 20, 32);

      // Receipt Title
      doc.setFontSize(20);
      doc.setTextColor(0, 0, 0);
      doc.text("PAYMENT RECEIPT", 105, 50, { align: "center" });

      // Receipt Number
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Receipt #: ${orderId}`, 105, 58, { align: "center" });

      // Date
      doc.text(`Date: ${formatDate(paymentTime)}`, 105, 65, {
        align: "center",
      });

      // === STATUS SECTION ===
      doc.setFontSize(16);
      if (paymentStatus === "success") {
        doc.setTextColor(0, 150, 0);
        doc.text("PAYMENT SUCCESSFUL", 105, 80, { align: "center" });
      } else if (paymentStatus === "failed") {
        doc.setTextColor(200, 0, 0);
        doc.text("PAYMENT FAILED", 105, 80, { align: "center" });
      } else if (paymentStatus === "pending") {
        doc.setTextColor(200, 150, 0);
        doc.text("PAYMENT PROCESSING", 105, 80, { align: "center" });
      } else {
        doc.setTextColor(100, 100, 100);
        doc.text("VERIFICATION ERROR", 105, 80, { align: "center" });
      }

      // === AMOUNT HIGHLIGHT SECTION ===
      doc.setFillColor(240, 248, 255);
      doc.rect(170, 170, 170, 170, "F");

      doc.setFontSize(14);
      doc.setTextColor(100, 100, 100);
      doc.text("Transaction Amount", 25, 105);

      doc.setFontSize(24);
      doc.setTextColor(0, 100, 0);
      doc.text(`INR ${formattedAmount}`, 25, 120);

      // === TRANSACTION DETAILS SECTION ===
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text("Transaction Details", 20, 140);

      // Details background
      doc.setFillColor(250, 250, 250);
      doc.rect(15, 145, 180, 80, "F");

      let yPos = 155;
      const lineHeight = 12;

      // Order ID
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text("Order ID", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(orderId, 100, yPos);
      yPos += lineHeight;

      // Payment ID
      doc.setTextColor(100, 100, 100);
      doc.text("Payment ID", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(paymentId, 100, yPos);
      yPos += lineHeight;

      // Payment Method
      doc.setTextColor(100, 100, 100);
      doc.text("Payment Method", 25, yPos);
      doc.setTextColor(0, 0, 0);
      doc.text(paymentMethod, 100, yPos);
      yPos += lineHeight;

      // Bank (if available)
      if (bankName !== "N/A") {
        doc.setTextColor(100, 100, 100);
        doc.text("Bank", 25, yPos);
        doc.setTextColor(0, 0, 0);
        doc.text(bankName, 100, yPos);
        yPos += lineHeight;
      }

      // Status
      doc.setTextColor(100, 100, 100);
      doc.text("Status", 25, yPos);
      if (paymentStatus === "success") {
        doc.setTextColor(0, 150, 0);
        doc.text("PAID", 100, yPos);
      } else if (paymentStatus === "failed") {
        doc.setTextColor(200, 0, 0);
        doc.text("FAILED", 100, yPos);
      } else if (paymentStatus === "pending") {
        doc.setTextColor(200, 150, 0);
        doc.text("PENDING", 100, yPos);
      } else {
        doc.setTextColor(100, 100, 100);
        doc.text("ERROR", 100, yPos);
      }

      // === FOOTER SECTION ===
      doc.setFillColor(245, 245, 245);
      doc.rect(0, 240, 210, 50, "F");

      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text("Thank you for choosing SecurePay Portal", 105, 255, {
        align: "center",
      });
      doc.text("Your payment is processed securely", 105, 262, {
        align: "center",
      });
      doc.text("This is a computer generated receipt", 105, 269, {
        align: "center",
      });

      // Contact Info
      doc.text(
        "For support: support@securepay.com | +91-1234567890",
        105,
        276,
        { align: "center" }
      );

      // === DECORATIVE ELEMENTS ===
      // Top border
      doc.setDrawColor(0, 100, 0);
      doc.setLineWidth(3);
      doc.line(0, 0, 210, 0);

      // Bottom border
      doc.line(0, 290, 210, 290);

      // Side borders
      doc.setLineWidth(1);
      doc.line(0, 0, 0, 290);
      doc.line(210, 0, 210, 290);

      // Save the PDF
      const fileName = `receipt_${orderId}_${new Date().getTime()}.pdf`;
      doc.save(fileName);

      toast.success("Receipt downloaded successfully!");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate receipt");
    }
  };

  if (loading) {
    return (
      <div className="w-full pb-16 md:pb-6">
        <div className="max-w-2xl mx-auto">
          <Card className="shadow-medium">
            <CardContent className="pt-6 text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h2 className="text-xl font-semibold mb-2">
                Verifying Payment...
              </h2>
              <p className="text-muted-foreground">
                Please wait while we verify your payment status
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="max-w-2xl mx-auto">
        {/* Success State */}
        {paymentStatus === "success" && (
          <Card className="shadow-medium border-success">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-success" />
              </div>
              <CardTitle className="text-3xl text-success">
                Payment Successful!
              </CardTitle>
              <CardDescription className="text-lg">
                Your payment has been processed successfully
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-success/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      ₹
                      {orderDetails?.transaction?.amount ||
                        orderDetails?.raw?.order?.order_amount ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-success font-semibold">PAID</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment ID:</span>
                    <span className="font-mono text-xs">
                      {orderDetails?.providerPaymentId ||
                        orderDetails?.transaction?.providerReferenceId ||
                        orderDetails?.raw?.payment?.cf_payment_id ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Payment Method:
                    </span>
                    <span className="font-semibold">
                      {orderDetails?.raw?.payment?.payment_method?.card?.card_type
                        ?.replace("_", " ")
                        .toUpperCase() ||
                        orderDetails?.raw?.payment?.payment_group
                          ?.replace("_", " ")
                          .toUpperCase() ||
                        "UPI"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleDownloadReceipt}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex-1 gap-2 bg-gradient-primary"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Failed State */}
        {paymentStatus === "failed" && (
          <Card className="shadow-medium border-destructive">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive text-2xl font-bold">✕</span>
                </div>
              </div>
              <CardTitle className="text-3xl text-destructive">
                Payment Failed
              </CardTitle>
              <CardDescription className="text-lg">
                Your payment could not be processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-destructive/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      ₹
                      {orderDetails?.transaction?.amount ||
                        orderDetails?.raw?.order?.order_amount ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-destructive font-semibold">
                      FAILED
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex-1 gap-2 bg-gradient-primary"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pending State */}
        {paymentStatus === "pending" && (
          <Card className="shadow-medium border-warning">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-warning/10 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-warning"></div>
                </div>
              </div>
              <CardTitle className="text-3xl text-warning">
                Payment Processing
              </CardTitle>
              <CardDescription className="text-lg">
                Your payment is being processed
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-warning/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Transaction Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Order ID:</span>
                    <span className="font-mono">{orderId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      ₹
                      {orderDetails?.transaction?.amount ||
                        orderDetails?.raw?.order?.order_amount ||
                        "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="text-warning font-semibold">PENDING</span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                Please wait while we process your payment. You can check back
                later or contact support if needed.
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Payment
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex-1 gap-2 bg-gradient-primary"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error State */}
        {paymentStatus === "error" && (
          <Card className="shadow-medium border-destructive">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
                  <span className="text-destructive text-2xl font-bold">⚠</span>
                </div>
              </div>
              <CardTitle className="text-3xl text-destructive">
                Verification Error
              </CardTitle>
              <CardDescription className="text-lg">
                Unable to verify payment status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-destructive/10 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Order ID</h3>
                <p className="font-mono text-sm">{orderId}</p>
              </div>

              <p className="text-sm text-muted-foreground text-center">
                There was an error verifying your payment. Please contact
                support with your order ID.
              </p>

              <div className="flex gap-3">
                <Button
                  onClick={handleGoBack}
                  variant="outline"
                  className="flex-1 gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={handleGoHome}
                  className="flex-1 gap-2 bg-gradient-primary"
                >
                  <Home className="h-4 w-4" />
                  Go to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
