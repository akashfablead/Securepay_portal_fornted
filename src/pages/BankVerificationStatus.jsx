import {
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  ArrowRight,
  Loader2,
  Trash2,
  Search,
  Edit,
  IndianRupee,
  CreditCard,
  User,
  Hash,
  Filter,
  Phone,
  X, // Added X icon for clear button
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  listBankAccounts,
  deactivateBankAccount,
  deleteBankAccount,
  updateBankAccount,
} from "@/services/bankService";
import { createPayoutRequest } from "@/services/payoutService";
import { getDashboard } from "@/services/authService";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BankVerificationStatus = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [filteredAccounts, setFilteredAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [balance, setBalance] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [selectedAccountForPayout, setSelectedAccountForPayout] =
    useState(null);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutRemarks, setPayoutRemarks] = useState("");
  const [payoutProcessing, setPayoutProcessing] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false); // New state for confirmation modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [editForm, setEditForm] = useState({
    accountHolderName: "",
    accountNumber: "",
    ifsc: "",
    phone: "",
  });

  const PAYOUT_FEE = 20; // ₹20 per transaction
  const MIN_PAYOUT = 100; // Minimum payout amount

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await listBankAccounts();
      const items = res?.accounts || [];
      setAccounts(items);
      // Don't set filteredAccounts to all items by default
      // Only show accounts after search
      setFilteredAccounts([]);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to load bank accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadBalance = async () => {
    try {
      const data = await getDashboard();
      setBalance(Number(data?.stats?.availableBalance || 0));
    } catch (error) {
      console.error("Failed to load balance:", error);
    }
  };

  useEffect(() => {
    loadAccounts();
    loadBalance();
  }, []);

  // Filter accounts based on search term and status filter
  const filterAccounts = () => {
    let result = accounts;

    // Only filter and show accounts when there's a search term
    if (searchTerm) {
      // Apply search filter
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (account) =>
          account.accountHolderName?.toLowerCase().includes(term) ||
          account.accountNumber?.toLowerCase().includes(term) ||
          account.ifsc?.toLowerCase().includes(term)
      );

      // Apply status filter
      if (statusFilter !== "all") {
        result = result.filter((account) => {
          let status = account.verificationStatus || account.status;
          if (status === "not_verified") {
            if (
              account.masterStatus === "pending" ||
              account.adminStatus === "pending"
            ) {
              status = "pending";
            } else if (
              account.masterStatus === "rejected" ||
              account.adminStatus === "rejected"
            ) {
              status = "failed";
            }
          }
          return status === statusFilter;
        });
      }
    } else {
      // When no search term, show empty array
      result = [];
    }

    return result;
  };

  // Add useEffect to automatically filter when search term or status filter changes
  useEffect(() => {
    setFilteredAccounts(filterAccounts());
  }, [searchTerm, statusFilter]);

  const getStatusConfig = (status) => {
    const configs = {
      verified: {
        variant: "success",
        icon: CheckCircle,
        text: "Verified",
        bgClass: "bg-success/10 border-success/20",
      },
      pending: {
        variant: "warning",
        icon: Clock,
        text: "Pending Verification",
        bgClass: "bg-warning/10 border-warning/20",
      },
      failed: {
        variant: "destructive",
        icon: XCircle,
        text: "Verification Failed",
        bgClass: "bg-destructive/10 border-destructive/20",
      },
      not_verified: {
        variant: "secondary",
        icon: Clock,
        text: "Not Verified",
        bgClass: "bg-secondary/10 border-secondary/20",
      },
    };
    return configs[status] || configs.pending;
  };

  const showAddCta = !loading;

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
  };

  const handleDeleteConfirm = async () => {
    try {
      setDeletingId(accountToDelete._id);
      await deleteBankAccount(accountToDelete._id);
      toast.success("Bank account deleted successfully");
      // Refresh the accounts list
      await loadAccounts();
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to delete bank account"
      );
    } finally {
      setDeletingId(null);
      setAccountToDelete(null);
    }
  };

  const handlePayoutClick = (account) => {
    setSelectedAccountForPayout(account);
    setShowPayoutModal(true);
  };

  const handlePayoutSubmit = async (e) => {
    e.preventDefault();

    // First, show the confirmation modal instead of directly submitting
    setShowPayoutModal(false);
    setShowConfirmationModal(true);
  };

  // New function to handle the actual payout submission
  const handleConfirmPayout = async () => {
    const amount = Number(payoutAmount);
    if (!amount || amount <= 0) {
      toast.error("Please enter a valid payout amount");
      return;
    }

    if (amount < MIN_PAYOUT) {
      toast.error(`Minimum payout amount is ₹${MIN_PAYOUT}`);
      return;
    }

    const totalAmount = amount + PAYOUT_FEE;
    if (totalAmount > balance) {
      toast.error("Insufficient balance for this payout");
      return;
    }

    try {
      setPayoutProcessing(true);
      await createPayoutRequest({
        amount: totalAmount,
        bankAccountId: selectedAccountForPayout._id,
        remarks: payoutRemarks || "Payout request",
      });

      toast.success("Payout request submitted successfully!");
      setShowConfirmationModal(false);
      setPayoutAmount("");
      setPayoutRemarks("");
      navigate("/payout-history");
      await loadBalance(); // Refresh balance
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to process payout request"
      );
    } finally {
      setPayoutProcessing(false);
    }
  };

  // New function to handle edit from confirmation modal
  const handleEditFromConfirmation = () => {
    setShowConfirmationModal(false);
    setShowPayoutModal(true);
  };

  const formatINR = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 2,
    }).format(amount);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-16 md:pb-6">
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left Section */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payouts</h1>
          <p className="text-muted-foreground mt-1">
            Manage and view your linked bank accounts, search by account
            details, and process payouts
          </p>
        </div>

        {/* Right Section (Button) */}
        <Link to="/add-bank">
          <Button className="gap-2 px-5 py-2 text-sm rounded-xl hover:shadow-md transition">
            Add Bank Account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>

      {/* Search and Filter Section */}
      <Card className="shadow-soft border rounded-lg">
        <CardContent className="pt-6 pb-4">
          <div className="flex flex-col md:flex-row md:items-end gap-4">
            {/* Search Input */}
            <div className="relative">
              <Label htmlFor="search">Search Accounts</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by name, account number, or IFSC"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter")
                      setFilteredAccounts(filterAccounts());
                  }}
                  className="pl-10 h-11 rounded-md focus-visible:ring-1"
                />
              </div>
            </div>

            {/* Clear Button */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setStatusFilter("all");
                  setFilteredAccounts([]);
                }}
                className="h-11 px-5 flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {loading ? (
          <Card className="shadow-medium border-2">
            <CardContent className="pt-6">
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin mr-2" />
                <span>Loading bank accounts...</span>
              </div>
            </CardContent>
          </Card>
        ) : filteredAccounts.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                {searchTerm
                  ? "No bank accounts match your search criteria."
                  : "Please search for a bank account using the search bar above."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAccounts.map((account) => {
            // Determine status based on priority: verificationStatus > masterStatus > adminStatus
            let status = account.verificationStatus || account.status;

            // If verificationStatus is 'not_verified', check masterStatus and adminStatus
            if (status === "not_verified") {
              if (
                account.masterStatus === "pending" ||
                account.adminStatus === "pending"
              ) {
                status = "pending";
              } else if (
                account.masterStatus === "rejected" ||
                account.adminStatus === "rejected"
              ) {
                status = "failed";
              }
            }

            const statusConfig = getStatusConfig(status);
            const StatusIcon = statusConfig.icon;
            const isRejected = account.adminStatus === "rejected";
            const isVerified = status === "verified";

            return (
              <Card
                key={account._id}
                className="shadow-soft hover:shadow-medium transition-all"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                        <Building2 className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">Bank Account</CardTitle>
                        <CardDescription>
                          {account.accountHolderName}
                        </CardDescription>
                        {account.user && (
                          <p className="text-xs text-muted-foreground mt-1">
                            User: {account.user.name} ({account.user.email})
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {/* Status moved to grid layout */}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Account Holder
                        </p>
                        <p className="font-medium">
                          {account.accountHolderName}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Account Number
                        </p>
                        <p className="font-mono font-medium">
                          {account.accountNumber?.replace(/.(?=.{4})/g, "*")}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          IFSC Code
                        </p>
                        <p className="font-mono font-medium">{account.ifsc}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Phone
                        </p>
                        <p className="font-medium">{account.phone || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Status
                        </p>
                        <div className="flex flex-col gap-1">
                          <Badge
                            variant={statusConfig.variant}
                            className="gap-1 w-fit"
                          >
                            <StatusIcon className="h-3 w-3" />
                            {statusConfig.text}
                          </Badge>
                          {isRejected && (
                            <Badge
                              variant="outline"
                              className="border-destructive text-destructive w-fit"
                            >
                              Rejected by Admin
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Account Type
                        </p>
                        <p className="font-medium capitalize">
                          {account.accountType || "savings"}
                        </p>
                      </div>
                    </div>

                    {account.verifiedAt && (
                      <div
                        className={`rounded-lg border p-3 ${statusConfig.bgClass}`}
                      >
                        <p className="text-sm">
                          <span className="font-medium">Verified on:</span>{" "}
                          {new Date(account.verifiedAt).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    {status === "pending" && (
                      <div
                        className={`rounded-lg border p-3 ${statusConfig.bgClass}`}
                      >
                        <p className="text-sm">
                          Verification in progress via Cashfree. This usually
                          takes 2-5 minutes.
                        </p>
                      </div>
                    )}

                    {status === "not_verified" && !isRejected && (
                      <div
                        className={`rounded-lg border p-3 ${statusConfig.bgClass}`}
                      >
                        <p className="text-sm mb-2">
                          This bank account has not been verified yet. Click
                          below to start verification.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={verifyingId === account._id}
                          onClick={async () => {
                            try {
                              setVerifyingId(account._id);
                              toast.success(
                                "Bank account verification requested!"
                              );
                              await loadAccounts();
                            } catch (err) {
                              console.error(err);
                              toast.error("Verification request failed");
                            } finally {
                              setVerifyingId(null);
                            }
                          }}
                        >
                          {verifyingId === account._id
                            ? "Verifying..."
                            : "Verify Now"}
                        </Button>
                      </div>
                    )}

                    {isRejected && (
                      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4 space-y-3">
                        <p className="text-sm text-destructive font-medium">
                          Account Rejected by Admin.
                        </p>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 flex flex-wrap gap-2">
                      {isVerified && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handlePayoutClick(account)}
                          className="gap-2"
                        >
                          <IndianRupee className="h-4 w-4" />
                          Process Payout
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={!!accountToDelete}
        onOpenChange={() => setAccountToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              bank account and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
              disabled={deletingId === accountToDelete?._id}
            >
              {deletingId === accountToDelete?._id ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Payout Modal - Initial form for amount and remarks */}
      <Dialog open={showPayoutModal} onOpenChange={setShowPayoutModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payout</DialogTitle>
            <DialogDescription>
              Enter the amount you want to transfer to this bank account
            </DialogDescription>
          </DialogHeader>

          {selectedAccountForPayout && (
            <form onSubmit={handlePayoutSubmit} className="space-y-4">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Account Holder:
                    </span>
                    <span className="font-semibold">
                      {selectedAccountForPayout.accountHolderName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account:</span>
                    <span className="font-mono">
                      XXXX {selectedAccountForPayout.accountNumber?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IFSC:</span>
                    <span className="font-mono">
                      {selectedAccountForPayout.ifsc}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoutAmount">Payout Amount (₹) *</Label>
                <div className="relative">
                  <IndianRupee className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="payoutAmount"
                    type="number"
                    placeholder="Enter amount"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    className="pl-10"
                    step="0.01"
                    min={MIN_PAYOUT}
                    max={balance - PAYOUT_FEE}
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Minimum: ₹{MIN_PAYOUT} | Processing fee: ₹{PAYOUT_FEE}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="payoutRemarks">Remarks (Optional)</Label>
                <Input
                  id="payoutRemarks"
                  placeholder="Enter remarks for this payout"
                  value={payoutRemarks}
                  onChange={(e) => setPayoutRemarks(e.target.value)}
                />
              </div>

              <div className="bg-secondary/50 p-3 rounded-lg">
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Payout Amount:
                    </span>
                    <span className="font-semibold">
                      {formatINR(Number(payoutAmount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Processing Fee:
                    </span>
                    <span className="font-semibold">₹{PAYOUT_FEE}</span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Deduction:</span>
                    <span>
                      {formatINR((Number(payoutAmount) || 0) + PAYOUT_FEE)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-success">
                    <span>Bank Credit:</span>
                    <span>{formatINR(Number(payoutAmount) || 0)}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowPayoutModal(false)}
                  disabled={payoutProcessing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-gradient-primary"
                  disabled={payoutProcessing}
                >
                  {payoutProcessing ? "Processing..." : "Review & Confirm"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmation Modal - Shows details and options to edit or confirm */}
      <Dialog
        open={showConfirmationModal}
        onOpenChange={setShowConfirmationModal}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Payout Details</DialogTitle>
            <DialogDescription>
              Please review the payout details before confirming
            </DialogDescription>
          </DialogHeader>

          {selectedAccountForPayout && (
            <div className="space-y-6">
              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Bank Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Account Holder:
                    </span>
                    <span className="font-semibold">
                      {selectedAccountForPayout.accountHolderName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Account:</span>
                    <span className="font-mono">
                      XXXX {selectedAccountForPayout.accountNumber?.slice(-4)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IFSC:</span>
                    <span className="font-mono">
                      {selectedAccountForPayout.ifsc}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-secondary/50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2">Payout Details</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Amount:</span>
                    <span className="font-semibold">
                      {formatINR(Number(payoutAmount) || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      Processing Fee:
                    </span>
                    <span className="font-semibold">₹{PAYOUT_FEE}</span>
                  </div>
                  <div className="h-px bg-border my-1" />
                  <div className="flex justify-between font-semibold">
                    <span>Total Deduction:</span>
                    <span>
                      {formatINR((Number(payoutAmount) || 0) + PAYOUT_FEE)}
                    </span>
                  </div>
                  <div className="flex justify-between font-semibold text-success">
                    <span>Bank Credit:</span>
                    <span>{formatINR(Number(payoutAmount) || 0)}</span>
                  </div>
                  {payoutRemarks && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Remarks:</span>
                      <span className="text-right">{payoutRemarks}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={handleEditFromConfirmation}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-gradient-primary"
                  onClick={handleConfirmPayout}
                  disabled={payoutProcessing}
                >
                  {payoutProcessing ? "Processing..." : "Confirm Payout"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Account Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Bank Account</DialogTitle>
            <DialogDescription>
              Update your bank account details
            </DialogDescription>
          </DialogHeader>

          {editingAccount && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                try {
                  await updateBankAccount(editingAccount._id, editForm);
                  toast.success("Bank account details updated successfully!");
                  setShowEditModal(false);
                  await loadAccounts(); // Refresh the accounts list
                } catch (err) {
                  console.error(err);
                  toast.error(
                    err?.response?.data?.message ||
                      "Failed to update bank account"
                  );
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label
                  htmlFor="editAccountHolder"
                  className="flex items-center gap-2"
                >
                  <User className="h-4 w-4" />
                  Account Holder Name *
                </Label>
                <Input
                  id="editAccountHolder"
                  value={editForm.accountHolderName}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      accountHolderName: e.target.value,
                    })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="editAccountNumber"
                  className="flex items-center gap-2"
                >
                  <CreditCard className="h-4 w-4" />
                  Account Number *
                </Label>
                <Input
                  id="editAccountNumber"
                  value={editForm.accountNumber}
                  onChange={(e) =>
                    setEditForm({ ...editForm, accountNumber: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editIfsc" className="flex items-center gap-2">
                  <Hash className="h-4 w-4" />
                  IFSC Code *
                </Label>
                <Input
                  id="editIfsc"
                  value={editForm.ifsc}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      ifsc: e.target.value.toUpperCase(),
                    })
                  }
                  maxLength={11}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="editPhone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number *
                </Label>
                <Input
                  id="editPhone"
                  type="tel"
                  value={editForm.phone}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  maxLength={15}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowEditModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-gradient-primary">
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BankVerificationStatus;
