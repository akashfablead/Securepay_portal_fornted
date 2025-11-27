import {
  CheckCircle,
  Clock,
  XCircle,
  Building2,
  ArrowRight,
  Loader2,
  Trash2,
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
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  listBankAccounts,
  deactivateBankAccount,
  deleteBankAccount,
} from "@/services/bankService";
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

const BankStatus = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [verifyingId, setVerifyingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [accountToDelete, setAccountToDelete] = useState(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await listBankAccounts();
      const items = res?.accounts || [];
      setAccounts(items);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to load bank accounts"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

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

  // Always show "Add Bank Account" section to allow multiple accounts for all users
  const showAddCta = !loading;

  const handleDeleteClick = (account) => {
    setAccountToDelete(account);
  };

  const handleDeleteConfirm = async () => {
    console.log(
      "Deleting account:",
      accountToDelete._id,
      "Beneficiary ID:",
      accountToDelete.cashfreeBeneficiaryId || "N/A"
    );

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

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Bank Verification Status</h1>
        <p className="text-muted-foreground">
          Manage and view your linked bank accounts
        </p>
      </div>
      {showAddCta && (
        <Card className="bg-secondary/50">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="font-semibold mb-1">Add Bank Account</h3>
                <p className="text-sm text-muted-foreground">
                  Add a new bank account for transactions
                </p>
              </div>
              <Link to="/add-bank">
                <Button className="gap-2">
                  Add Bank Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
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
        ) : accounts.length === 0 ? (
          <Card className="shadow-soft">
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground">
                No bank accounts linked yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          accounts.map((account) => {
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
                      <Badge variant={statusConfig.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {statusConfig.text}
                      </Badge>
                      {isRejected && (
                        <Badge
                          variant="outline"
                          className="border-destructive text-destructive"
                        >
                          Rejected by Admin
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Bank Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Account Holder Name
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
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Phone Number
                        </p>
                        <p className="font-medium">
                          {account.phone || "Not provided"}
                        </p>
                      </div>
                    </div>

                    {/* Account Type and Created Date */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Account Type
                        </p>
                        <p className="font-medium capitalize">
                          {account.accountType || "savings"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Added On
                        </p>
                        <p className="font-medium">
                          {account.createdAt
                            ? new Date(account.createdAt).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Verification Status Details */}
                    {account.verifiedAt && (
                      <div
                        className={`rounded-lg border p-3 ${statusConfig.bgClass}`}
                      >
                        <div className="flex justify-between items-center">
                          <p className="text-sm">
                            <span className="font-medium">Verified on:</span>{" "}
                            {new Date(account.verifiedAt).toLocaleDateString()}
                          </p>
                          {account.verifiedBy && (
                            <Badge variant="secondary" className="text-xs">
                              Verified by {account.verifiedBy}
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}

                    {status === "pending" && (
                      <div
                        className={`rounded-lg border p-3 ${statusConfig.bgClass}`}
                      >
                        <p className="text-sm">
                          <span className="font-medium">
                            Verification Status:
                          </span>{" "}
                          Verification in progress via Cashfree. This usually
                          takes 2-5 minutes.
                        </p>
                        {account.lastVerificationAttempt && (
                          <p className="text-xs mt-1">
                            Last attempt:{" "}
                            {new Date(
                              account.lastVerificationAttempt
                            ).toLocaleString()}
                          </p>
                        )}
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
                        <div className="flex justify-between items-start">
                          <p className="text-sm text-destructive font-medium">
                            Account Rejected by Admin.
                          </p>
                          {account.rejectedAt && (
                            <Badge variant="destructive" className="text-xs">
                              {new Date(
                                account.rejectedAt
                              ).toLocaleDateString()}
                            </Badge>
                          )}
                        </div>
                        {account.rejectionReason && (
                          <p className="text-sm">
                            <span className="font-medium">Reason:</span>{" "}
                            {account.rejectionReason}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Delete button for all accounts */}
                    <div className="pt-2 flex justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        disabled={deletingId === account._id}
                        onClick={() => handleDeleteClick(account)}
                      >
                        {deletingId === account._id ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Deleting...
                          </>
                        ) : (
                          <>
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </>
                        )}
                      </Button>
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
    </div>
  );
};

export default BankStatus;