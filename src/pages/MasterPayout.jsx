import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Wallet,
  ArrowDownToLine,
  IndianRupee,
  CreditCard,
  AlertCircle,
  Building2,
  Hash,
  RefreshCw,
} from "lucide-react";
import { getDashboard } from "../services/authService";
import { listBankAccounts } from "../services/bankService";
import {
  createPayoutRequest,
  checkCashfreeTransferStatus,
} from "../services/payoutService";

const MasterPayout = () => {
  const [balance, setBalance] = useState(0);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [selectedBankId, setSelectedBankId] = useState("");
  const [checkingStatus, setCheckingStatus] = useState(false);

  const PAYOUT_FEE = 20; // ₹20 per transaction
  const MIN_PAYOUT = 100; // Minimum payout amount

  const payoutAmountNum = Number(payoutAmount) || 0;
  const totalDeduction = payoutAmountNum + PAYOUT_FEE;
  const finalAmount = payoutAmountNum; // Amount credited to bank

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const selectedBankAccount = bankAccounts.find(
    (account) => account._id === selectedBankId
  );

  useEffect(() => {
    loadBalance();
    loadBankDetails();
  }, []);

  const loadBankDetails = async () => {
    try {
      const response = await listBankAccounts();

      console.log("Bank accounts response:", response);

      // Filter for verified accounts
      if (response?.accounts && Array.isArray(response.accounts)) {
        const verifiedAccounts = response.accounts.filter((account) => {
          // Check multiple possible status fields
          const isVerified =
            account.status === "verified" ||
            account.masterStatus === "verified" ||
            account.verificationStatus === "verified" ||
            account.adminStatus === "approved";

          const isActive = account.isActive !== false;

          return isVerified && isActive;
        });

        console.log("Verified accounts:", verifiedAccounts);

        setBankAccounts(verifiedAccounts);

        // Set the first verified account as default selection if none selected
        if (verifiedAccounts.length > 0 && !selectedBankId) {
          setSelectedBankId(verifiedAccounts[0]._id);
        }
      }
    } catch (error) {
      console.error("Failed to load bank details:", error);
    }
  };

  const loadBalance = async () => {
    try {
      setLoading(true);
      const data = await getDashboard();
      setBalance(Number(data?.stats?.availableBalance || 0));
    } catch (error) {
      console.error("Failed to load balance:", error);
      toast.error("Failed to load wallet balance");
    } finally {
      setLoading(false);
    }
  };

  const handlePayoutRequest = (e) => {
    e.preventDefault();

    if (!selectedBankAccount) {
      toast.error("Please select a verified bank account");
      return;
    }

    if (!payoutAmount || payoutAmountNum <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }

    if (payoutAmountNum < MIN_PAYOUT) {
      toast.error(`Minimum payout amount is ${formatINR(MIN_PAYOUT)}`);
      return;
    }

    if (totalDeduction > balance) {
      toast.error("Insufficient balance for this payout");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmPayout = async () => {
    try {
      setProcessing(true);
      setShowConfirmModal(false);

      // Create payout request via API
      await createPayoutRequest({
        amount: totalDeduction,
        bankAccountId: selectedBankId,
        remarks: "Payout request",
      });

      toast.success("Payout request submitted successfully!");

      // Reset form and reload balance
      setPayoutAmount("");
      await loadBalance();
    } catch (error) {
      console.error("Payout failed:", error);
      toast.error(error?.response?.data?.message || "Failed to process payout");
    } finally {
      setProcessing(false);
    }
  };

  // Function to check Cashfree transfer status
  const checkTransferStatus = async () => {
    try {
      setCheckingStatus(true);
      // In a real implementation, you would check the status of specific payouts
      // For now, we'll just refresh the balance as a placeholder
      // But we should also check actual payout statuses

      // Example of how to check a specific payout status:
      // const payoutId = "some-payout-id"; // This would come from user's payout history
      // const result = await checkCashfreeTransferStatus(payoutId);
      // Handle the result as needed

      await loadBalance();
      toast.success("Balance refreshed successfully!");
    } catch (error) {
      console.error("Failed to check transfer status:", error);

      // Handle specific error messages
      let errorMessage = "Failed to refresh balance";
      if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Payout</h1>
        <p className="text-muted-foreground text-lg">
          Transfer your wallet balance to your bank account
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Payout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Available Balance Card */}
          <Card className="shadow-soft bg-gradient-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary-foreground/20">
                    <Wallet className="h-8 w-8" />
                  </div>
                  <div>
                    <p className="text-sm opacity-90">Available Balance</p>
                    <p className="text-3xl font-bold">
                      {loading ? "..." : formatINR(balance)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={checkTransferStatus}
                  disabled={checkingStatus || loading}
                >
                  {checkingStatus ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payout Form */}
          <form onSubmit={handlePayoutRequest} className="space-y-6">
            {/* Bank Selection */}
            {bankAccounts.length > 0 && (
              <Card className="shadow-medium">
                <CardHeader>
                  <CardTitle className="text-xl flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Select Bank Account
                  </CardTitle>
                  <CardDescription>
                    Choose which verified account to transfer funds to
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="bankAccount">Bank Account</Label>
                      <Select
                        value={selectedBankId}
                        onValueChange={setSelectedBankId}
                      >
                        <SelectTrigger id="bankAccount">
                          <SelectValue placeholder="Select a bank account" />
                        </SelectTrigger>
                        <SelectContent>
                          {bankAccounts.map((account) => (
                            <SelectItem key={account._id} value={account._id}>
                              {account.bankName || "Bank Account"} - XXXX{" "}
                              {account.accountNumber?.slice(-4) || "****"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedBankAccount && (
                      <div className="bg-secondary/50 p-4 rounded-lg border">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-muted-foreground">
                              Account Holder
                            </p>
                            <p className="font-semibold">
                              {selectedBankAccount.accountHolderName}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Bank Name</p>
                            <p className="font-semibold">
                              {selectedBankAccount.bankName || "N/A"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">
                              Account Number
                            </p>
                            <p className="font-mono font-semibold">
                              XXXX XXXX{" "}
                              {selectedBankAccount.accountNumber?.slice(-4) ||
                                "****"}
                            </p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">IFSC Code</p>
                            <p className="font-mono font-semibold">
                              {selectedBankAccount.ifsc}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {!bankAccounts.length && (
              <Card className="border-warning/60 bg-warning/10">
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                    <div className="text-sm">
                      <p className="font-semibold text-warning mb-1">
                        No Verified Bank Accounts
                      </p>
                      <p className="text-muted-foreground">
                        Please add and verify your bank accounts before
                        requesting a payout.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="shadow-medium">
              <CardHeader>
                <CardTitle className="text-2xl">Request Payout</CardTitle>
                <CardDescription>
                  Enter the amount you want to transfer to your bank account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="payoutAmount" className="text-base">
                    Payout Amount (₹) *
                  </Label>
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-muted-foreground text-2xl">
                      ₹
                    </span>
                    <Input
                      id="payoutAmount"
                      type="number"
                      placeholder="0.00"
                      value={payoutAmount}
                      onChange={(e) => setPayoutAmount(e.target.value)}
                      className="pl-12 text-3xl h-16 font-semibold"
                      step="0.01"
                      min={MIN_PAYOUT}
                      max={balance - PAYOUT_FEE}
                      required
                      disabled={loading || balance <= MIN_PAYOUT}
                    />
                    <div className="mt-2 text-sm text-muted-foreground">
                      Minimum amount: {formatINR(MIN_PAYOUT)} | Available:{" "}
                      {formatINR(balance)}
                    </div>
                  </div>
                </div>

                {/* Quick Amount Buttons */}
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Quick amounts</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {[500, 1000, 2000, 5000].map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={
                          payoutAmountNum === amt ? "default" : "outline"
                        }
                        onClick={() => setPayoutAmount(String(amt))}
                        disabled={loading || balance < amt + PAYOUT_FEE}
                      >
                        ₹{amt.toLocaleString("en-IN")}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Info Alert */}
                <Card className="border-warning/60 bg-warning/10">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                      <div className="text-sm">
                        <p className="font-semibold text-warning mb-1">
                          Important Information:
                        </p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          <li>Processing fee: ₹{PAYOUT_FEE} per transaction</li>
                          <li>Amount will be credited within 1-2 hours</li>
                          <li>Ensure your bank account is verified</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-14 text-xl bg-gradient-primary shadow-soft hover:shadow-glow gap-3"
              disabled={
                loading ||
                processing ||
                !selectedBankAccount ||
                payoutAmountNum < MIN_PAYOUT ||
                totalDeduction > balance
              }
            >
              {processing ? "Processing..." : `Request Payout`}
              <ArrowDownToLine className="h-6 w-6" />
            </Button>
          </form>
        </div>

        {/* Right Column - Payout Summary */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="shadow-medium sticky top-20">
            <CardHeader>
              <CardTitle className="text-xl">Payout Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Payout Amount</span>
                  <span className="font-semibold">
                    {formatINR(payoutAmountNum)}
                  </span>
                </div>
                <div className="flex justify-between text-base">
                  <span className="text-muted-foreground">Processing Fee</span>
                  <span className="font-semibold text-destructive">
                    - {formatINR(PAYOUT_FEE)}
                  </span>
                </div>
                <div className="h-px bg-border my-3" />
                <div className="flex justify-between items-center">
                  <span className="font-bold text-lg">Total Deduction</span>
                  <span className="font-bold text-2xl text-primary">
                    {formatINR(totalDeduction)}
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-success/10 border border-success/30">
                  <CreditCard className="h-5 w-5 text-success" />
                  <div>
                    <p className="text-sm font-medium text-success">
                      Bank Credit
                    </p>
                    <p className="text-lg font-bold">
                      {formatINR(finalAmount)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  After payout, your remaining balance will be:{" "}
                  <span className="font-semibold">
                    {formatINR(Math.max(0, balance - totalDeduction))}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl">Confirm Payout Request</CardTitle>
              <CardDescription>
                Please verify the payout details before confirming
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3 bg-secondary/50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Payout Amount:</span>
                  <span className="font-bold text-lg">
                    {formatINR(payoutAmountNum)}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Processing Fee:</span>
                  <span className="font-semibold text-destructive">
                    - {formatINR(PAYOUT_FEE)}
                  </span>
                </div>
                <div className="h-px bg-border my-2" />
                <div className="flex justify-between items-center">
                  <span className="font-bold">Total Deduction:</span>
                  <span className="font-bold text-xl text-primary">
                    {formatINR(totalDeduction)}
                  </span>
                </div>
              </div>

              <div className="bg-success/10 p-4 rounded-lg border border-success/30">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">Bank Credit:</span>
                  <span className="font-bold text-xl text-success">
                    {formatINR(finalAmount)}
                  </span>
                </div>
              </div>

              {/* Bank Account Details */}
              {selectedBankAccount && (
                <div className="bg-secondary/50 p-4 rounded-lg border">
                  <div className="flex items-center gap-2 mb-3">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold text-sm">Payout To:</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Account Holder:
                      </span>
                      <span className="font-semibold">
                        {selectedBankAccount.accountHolderName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bank:</span>
                      <span className="font-semibold">
                        {selectedBankAccount.bankName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Account:</span>
                      <span className="font-mono font-semibold">
                        XXXX{" "}
                        {selectedBankAccount.accountNumber?.slice(-4) || "****"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">IFSC:</span>
                      <span className="font-mono font-semibold">
                        {selectedBankAccount.ifsc}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowConfirmModal(false)}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gradient-primary"
                  onClick={confirmPayout}
                  disabled={processing}
                >
                  {processing ? "Processing..." : "Confirm Payout"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default MasterPayout;