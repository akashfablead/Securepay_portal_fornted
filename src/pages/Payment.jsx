import { useEffect, useState } from "react";
import { Shield, ArrowRight, Smartphone, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createOrder, verifyPayment } from "@/services/paymentService";
import { useNavigate } from "react-router-dom";
import {
  CASHFREE_CONFIG,
  getCashfreeMode,
  validateCashfreeConfig,
} from "@/config/cashfree";
import { useVerificationGate } from "@/hooks/useVerificationGate";

const Payment = () => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [remarks, setRemarks] = useState("");
  const [customerMobile, setCustomerMobile] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [cashfreeSDKLoaded, setCashfreeSDKLoaded] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);
  const {
    loading: verificationLoading,
    canTransact,
    kycStatus,
    bankStatus,
    error: verificationError,
    refresh: refreshVerification,
  } = useVerificationGate();

  // Fee configuration (per transaction)
  const FEE_FIXED = 0; // INR
  const FEE_PERCENT = 0; // % of base amount
  const GST_PERCENT = 0; // % on fee only
  const MIN_AMOUNT = 100; // Minimum payable base amount
  const PRESET_AMOUNTS = [50000, 100000, 150000, 500000, 100000, 200000];

  const baseAmount = Number(amount) || 0;
  const percentageFee = +(baseAmount * (FEE_PERCENT / 100)).toFixed(2);
  const fixedFee = FEE_FIXED;
  const feeTotal = +(fixedFee + percentageFee).toFixed(2);
  const gstOnFee = +((feeTotal * GST_PERCENT) / 100).toFixed(2);
  const grandTotal = +(baseAmount + feeTotal + gstOnFee).toFixed(2);

  const formatINR = (n) =>
    (Number(n) || 0).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Load Cashfree SDK
  const loadCashfreeSDK = async () => {
    if (cashfreeSDKLoaded || window.Cashfree) {
      setCashfreeSDKLoaded(true);
      return window.Cashfree;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = CASHFREE_CONFIG.sdkUrl;
      script.onload = () => {
        setCashfreeSDKLoaded(true);
        resolve(window.Cashfree);
      };
      script.onerror = () => {
        reject(new Error("Failed to load Cashfree SDK"));
      };
      document.body.appendChild(script);
    });
  };

  useEffect(() => {
    // Check Cashfree configuration
    const configValid = validateCashfreeConfig();
    if (!configValid) {
      toast.warning(
        "Cashfree configuration incomplete. Payments will use fallback mode."
      );
    }

    // Preload Cashfree SDK
    loadCashfreeSDK().catch(() => {
      console.warn("Cashfree SDK preload failed");
    });
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();

    if (!canTransact) {
      toast.error("Complete bank verification before making payments.");
      return;
    }

    if (!amount || Number.isNaN(Number(amount))) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (baseAmount < MIN_AMOUNT) {
      toast.error(`Minimum payment amount is ₹${MIN_AMOUNT}`);
      return;
    }

    if (!customerMobile || customerMobile.trim() === "") {
      toast.error("Please enter customer mobile number");
      return;
    }

    if (!/^[6-9]\d{9}$/.test(customerMobile)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    // Show confirmation modal instead of proceeding directly
    setShowConfirmModal(true);
  };

  const proceedWithPayment = async () => {
    try {
      setSubmitting(true);
      setShowConfirmModal(false);
      toast.info("Creating payment order...");

      // First, create order to get order ID and payment session
      const orderData = {
        // Send both base amount and fee information to backend
        amount: Number(grandTotal),
        baseAmount: Number(baseAmount),
        feeAmount: Number(feeTotal),
        currency: CASHFREE_CONFIG.currency,
        paymentMethod: "upi", // Default to UPI payment method
      };

      const order = await createOrder(orderData);
      const orderId = order?.orderId;
      const paymentSessionId = order?.paymentSessionId;

      console.log("Order response from backend:", {
        order,
        orderId,
        paymentSessionId,
        hasOrderId: !!orderId,
        hasPaymentSessionId: !!paymentSessionId,
      });

      if (!orderId) {
        toast.error("Failed to create order");
        return;
      }

      console.log("Order created:", { orderId, paymentSessionId });

      // Handle mock payments or missing session ID
      if (
        !paymentSessionId ||
        order?.raw?.mock ||
        String(paymentSessionId).startsWith("mock_")
      ) {
        console.log("Using mock payment flow");
        toast.info("Processing payment verification...");
        const result = await verifyPayment({ orderId });
        handlePaymentResult(result);
        return;
      }

      // Validate payment session ID before showing popup
      if (
        !paymentSessionId ||
        paymentSessionId === "undefined" ||
        paymentSessionId === "null"
      ) {
        console.error("Invalid payment session ID:", paymentSessionId);
        toast.error("Invalid payment session. Please try again.");
        return;
      }

      // Now show Cashfree popup with real payment session
      console.log("Proceeding with real Cashfree payment:", {
        paymentSessionId,
        orderId,
      });
      toast.info("Opening payment gateway...");
      await showCashfreeCheckout(paymentSessionId, orderId);
      // Don't reset submitting here - will be reset in callbacks
      return;
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Payment failed to process");
      setSubmitting(false);
    }
  };

  const showCashfreeCheckout = async (paymentSessionId, orderId) => {
    try {
      console.log("Showing Cashfree checkout popup with:", {
        paymentSessionId,
        orderId,
      });

      // Validate Cashfree configuration
      if (!validateCashfreeConfig()) {
        console.warn(
          "Cashfree configuration incomplete, using fallback verification"
        );
        const result = await verifyPayment({ orderId });
        handlePaymentResult(result);
        return;
      }

      // Load Cashfree SDK
      const Cashfree = await loadCashfreeSDK();
      if (!Cashfree) {
        throw new Error("Failed to load Cashfree SDK");
      }

      const mode = getCashfreeMode();
      console.log("Cashfree mode:", mode);

      const cashfree = new Cashfree({ mode });

      // Show checkout popup with real payment session
      console.log("Initializing Cashfree checkout popup...");

      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: "_self", // Redirect to Cashfree page in same window
      };

      console.log("Cashfree checkout options:", checkoutOptions);

      // This will redirect to Cashfree payment page
      cashfree
        .checkout(checkoutOptions)
        .then(() => {
          console.log("Redirecting to Cashfree payment page");
        })
        .catch((error) => {
          console.error("Cashfree checkout error:", error);
          toast.error("Failed to open payment gateway");
          setSubmitting(false);
        });

      console.log("Cashfree checkout initiated");
    } catch (sdkError) {
      console.warn("Cashfree popup error:", sdkError);
      toast.warning(
        "Payment gateway popup failed, verifying payment directly..."
      );

      // Fallback: verify payment directly
      try {
        const result = await verifyPayment({ orderId });
        handlePaymentResult(result);
      } catch (verifyError) {
        console.error("Payment verification failed:", verifyError);
        toast.error("Payment verification failed. Please contact support.");
      }
    }
  };

  const processCashfreePayment = async (paymentSessionId, orderId) => {
    try {
      console.log("Processing Cashfree payment:", {
        paymentSessionId,
        orderId,
      });

      // Validate Cashfree configuration
      if (!validateCashfreeConfig()) {
        console.warn(
          "Cashfree configuration incomplete, using fallback verification"
        );
        const result = await verifyPayment({ orderId });
        handlePaymentResult(result);
        return;
      }

      // Load Cashfree SDK
      const Cashfree = await loadCashfreeSDK();
      if (!Cashfree) {
        throw new Error("Failed to load Cashfree SDK");
      }

      const mode = getCashfreeMode();
      console.log("Cashfree mode:", mode);

      const cashfree = new Cashfree({ mode });

      // Initialize checkout
      console.log("Initializing Cashfree checkout...");

      const checkoutOptions = {
        paymentSessionId,
        redirectTarget: "_modal", // Use modal for better UX
        onSuccess: async (data) => {
          console.log("Payment successful:", data);
          toast.success("Payment completed! Verifying...");
          try {
            const result = await verifyPayment({ orderId });
            handlePaymentResult(result);
          } catch (verifyError) {
            console.error("Payment verification failed:", verifyError);
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        onFailure: (data) => {
          console.log("Payment failed:", data);
          toast.error("Payment was cancelled or failed.");
        },
      };

      await cashfree.checkout(checkoutOptions);
      console.log("Cashfree checkout completed");
    } catch (sdkError) {
      console.error("Cashfree SDK error:", sdkError);
      toast.warning("Payment gateway error, verifying payment status...");

      // Fallback: verify payment directly
      try {
        const result = await verifyPayment({ orderId });
        handlePaymentResult(result);
      } catch (verifyError) {
        console.error("Payment verification failed:", verifyError);
        toast.error("Payment verification failed. Please contact support.");
      }
    }
  };

  const handlePaymentResult = (result) => {
    setSubmitting(false);
    if (result?.status === "PAID") {
      toast.success("Payment successful! Redirecting...");
      setTimeout(() => {
        navigate("/payment-success?order_id=" + result?.transaction?.orderId);
      }, 1500);
    } else if (result?.status === "FAILED") {
      toast.error("Payment failed. Please try again.");
    } else {
      toast.info(result?.message || "Payment is being processed...");
    }
  };

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Make Payment</h1>
        <p className="text-muted-foreground text-lg">
          Process your credit card payment securely
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Payment Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-soft bg-gradient-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8" />
                <div>
                  <p className="font-semibold text-lg mb-1">
                    Secure Payment Gateway
                  </p>
                  <p className="text-sm opacity-90">
                    All transactions are processed through Cashfree's PCI DSS
                    compliant payment gateway
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {verificationLoading ? null : !canTransact ? (
            <Card className="border-warning/60 bg-warning/10 shadow-soft">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 text-warning">
                  <div className="p-3 rounded-full bg-warning/20">
                    <Lock className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="font-semibold text-lg">Payments Locked</p>
                    <p className="text-sm">
                      Bank status: {bankStatus || "pending"}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Once your bank account is verified, payment gateway access
                  will unlock automatically. KYC is now optional.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={refreshVerification}
                  >
                    Re-check status
                  </Button>
                  {verificationError && (
                    <span className="text-sm text-destructive">
                      {verificationError}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : null}

          <form onSubmit={handlePayment} className="space-y-6">
            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-2xl">Payment Amount</CardTitle>
                <CardDescription>
                  Enter the amount you want to pay
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-base">
                    Topup Amount (₹) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-muted-foreground text-2xl">
                      ₹
                    </span>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-12 text-3xl h-16 font-semibold"
                      step="0.01"
                      min={MIN_AMOUNT}
                      required
                      disabled={!canTransact}
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      Minimum amount is ₹{MIN_AMOUNT}
                    </div>
                  </div>

                  <div className="mt-6">
                    <Label htmlFor="customerMobile" className="text-base">
                      Customer Mobile *
                    </Label>
                    <Input
                      id="customerMobile"
                      type="tel"
                      placeholder="Enter 10-digit mobile number"
                      value={customerMobile}
                      onChange={(e) => setCustomerMobile(e.target.value)}
                      className="text-lg h-12 mt-2"
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      required
                      disabled={!canTransact}
                    />
                  </div>

                  <div className="mt-4">
                    <Label htmlFor="remarks" className="text-base">
                      Remarks (Optional)
                    </Label>
                    <Input
                      id="remarks"
                      type="text"
                      placeholder="Enter remarks"
                      value={remarks}
                      onChange={(e) => setRemarks(e.target.value)}
                      className="text-lg h-12 mt-2"
                      disabled={!canTransact}
                    />
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      Quick amounts
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                      {PRESET_AMOUNTS.map((amt) => {
                        const isActive = baseAmount === amt;
                        return (
                          <Button
                            key={amt}
                            type="button"
                            variant={isActive ? "default" : "outline"}
                            className={
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : ""
                            }
                            onClick={() => setAmount(String(amt))}
                            disabled={!canTransact}
                          >
                            ₹{amt.toLocaleString("en-IN")}
                          </Button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-14 text-xl bg-gradient-primary shadow-soft hover:shadow-glow gap-3"
              disabled={
                submitting ||
                baseAmount < MIN_AMOUNT ||
                !canTransact ||
                verificationLoading ||
                !customerMobile
              }
            >
              {submitting
                ? "Processing..."
                : `Continue to Pay ₹${formatINR(grandTotal)}`}
              <ArrowRight className="h-6 w-6" />
            </Button>
          </form>
        </div>

        {/* Right Column - Summary & Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-medium sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl">Payment Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Topup Amount</span>
                  <span className="font-semibold">
                    ₹{formatINR(baseAmount)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold text-success">
                    ₹{formatINR(feeTotal)}
                  </span>
                </div>
                <div className="h-px bg-border my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total Amount</span>
                  <span className="font-bold text-2xl text-primary">
                    ₹{formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              {customerMobile && (
                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    Customer Details:
                  </p>
                  <div className="p-3 rounded-lg bg-secondary/50">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Mobile:</span>
                      <span className="font-medium">{customerMobile}</span>
                    </div>
                    {remarks && (
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-muted-foreground">Remarks:</span>
                        <span className="font-medium">{remarks}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">
                Confirm Payment Details
              </CardTitle>
              <CardDescription>
                Please verify the information before proceeding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 bg-secondary/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Topup Amount:</span>
                  <span className="font-bold text-lg">
                    ₹{formatINR(baseAmount)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Processing Fee:</span>
                  <span className="font-semibold text-success">
                    ₹{formatINR(feeTotal)}
                  </span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Amount:</span>
                  <span className="font-bold text-2xl text-primary">
                    ₹{formatINR(grandTotal)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 bg-secondary/30 p-4 rounded-lg">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">
                    Customer Mobile:
                  </span>
                  <span className="font-semibold">{customerMobile}</span>
                </div>
                {remarks && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Remarks:</span>
                    <span className="font-semibold">{remarks}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gradient-primary"
                  onClick={proceedWithPayment}
                  disabled={submitting}
                >
                  {submitting ? "Processing..." : "Confirm & Pay"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Payment;
