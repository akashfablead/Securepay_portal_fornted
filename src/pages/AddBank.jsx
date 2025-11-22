import { useEffect, useState } from "react";
import {
  Building2,
  Shield,
  CheckCircle,
  AlertCircle,
  Eye,
  EyeOff,
  Phone,
  CreditCard,
  User,
  Building,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
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
import { addBankAccount, verifyBankAccount } from "@/services/bankService";
import { listBankAccounts } from "@/services/bankService";
import { getProfile } from "@/services/authService";

const AddBank = () => {
  const navigate = useNavigate();
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    phone: "",
  });

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load accounts and user profile for phone number
  useEffect(() => {
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

    // Load user profile to pre-fill phone number
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        if (profile?.personalDetails?.mobileNumber) {
          setBankDetails((prev) => ({
            ...prev,
            phone: profile.personalDetails.mobileNumber,
          }));
        }
      } catch (err) {
        // Non-blocking, user can enter manually
      }
    };

    loadAccounts();
    loadProfile();
  }, []);

  const validateForm = () => {
    const newErrors = {};

    // Account holder name validation
    if (!bankDetails.accountHolder.trim()) {
      newErrors.accountHolder = "Account holder name is required";
    } else if (bankDetails.accountHolder.trim().length < 3) {
      newErrors.accountHolder =
        "Account holder name must be at least 3 characters";
    }

    // Account number validation
    if (!bankDetails.accountNumber.trim()) {
      newErrors.accountNumber = "Account number is required";
    } else if (bankDetails.accountNumber.trim().length < 9) {
      newErrors.accountNumber = "Account number must be at least 9 digits";
    } else if (!/^\d+$/.test(bankDetails.accountNumber.trim())) {
      newErrors.accountNumber = "Account number must contain only digits";
    }

    // Confirm account number validation
    if (!bankDetails.confirmAccountNumber.trim()) {
      newErrors.confirmAccountNumber = "Please confirm your account number";
    } else if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber) {
      newErrors.confirmAccountNumber = "Account numbers do not match";
    }

    // IFSC validation
    if (!bankDetails.ifsc.trim()) {
      newErrors.ifsc = "IFSC code is required";
    } else if (!/^[A-Za-z]{4}\d{7}$/.test(bankDetails.ifsc.trim())) {
      newErrors.ifsc = "IFSC code must be 11 characters (4 letters + 7 digits)";
    }

    // Phone validation
    if (!bankDetails.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else {
      const cleanPhone = bankDetails.phone.replace(/[\s\-+()]/g, "");
      const phoneRegex = /^[6-9]\d{9}$/;
      if (cleanPhone.length < 10 || !phoneRegex.test(cleanPhone.slice(-10))) {
        newErrors.phone = "Please enter a valid 10-digit phone number";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setBankDetails({ ...bankDetails, [field]: value });

    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    try {
      setSubmitting(true);
      const cleanPhone = bankDetails.phone.replace(/[\s\-+()]/g, "");

      const addRes = await addBankAccount({
        accountHolderName: bankDetails.accountHolder,
        accountNumber: bankDetails.accountNumber,
        ifsc: bankDetails.ifsc,
        phone: cleanPhone,
      });

      const created = addRes?.bankAccount;
      if (!created?._id) {
        toast.success(addRes?.message || "Bank account added");
        navigate("/bank-status", { replace: true });
        return;
      }

      // Trigger verification
      const verifyRes = await verifyBankAccount(created._id);
      console.log(verifyRes);

      if (verifyRes?.success) {
        const status = verifyRes?.verificationStatus || "pending";
        if (status === "verified") {
          toast.success("Bank account verified successfully!");
        } else if (status === "pending") {
          toast.info("Verification in progress. Please check status page.");
        } else {
          toast.warning("Verification status: " + status);
        }
      } else {
        const errorMsg =
          verifyRes?.verificationResult?.message ||
          verifyRes?.message ||
          "Verification failed";
        const errorCode = verifyRes?.verificationResult?.code;

        // Show more helpful messages based on error type
        if (errorCode === "auth_error" || errorCode === "config_missing") {
          toast.error(
            "Verification service configuration error. Please contact support."
          );
        } else if (errorCode === "timeout" || errorCode === "network_error") {
          toast.error(
            "Network error. Please check your connection and try again."
          );
        } else if (errorCode === "rate_limited") {
          toast.error("Too many requests. Please wait a moment and try again.");
        } else {
          toast.error(errorMsg);
        }
      }

      // Navigate to status page after add/verify so form is not shown
      navigate("/bank-status", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to add/verify bank account"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">Add Bank Details</h1>
        <p className="text-muted-foreground text-lg">
          Link your bank account for seamless transactions
        </p>
        <div className="mt-2">
          <Link
            to="/bank-status"
            className="text-sm text-primary hover:underline"
          >
            ← Back to Bank Accounts
          </Link>
        </div>
      </div>

      <div className="max-w-2xl">
        <div className="space-y-6">
          {/* Security Notice */}
          <Card className="shadow-medium border-2 border-success/20">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-success mt-0.5" />
                <div>
                  <p className="font-semibold text-success mb-1 text-lg">
                    Secure Bank Verification
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your bank details are encrypted and verified through
                    Cashfree's secure payment gateway
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Existing Accounts Info */}
          {!loading && accounts.length > 0 && (
            <Card className="shadow-soft border-warning/20">
              <CardContent className="pt-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
                  <div>
                    <p className="font-medium text-warning mb-1">
                      You already have {accounts.length} bank account(s) linked
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Adding a new account will not affect your existing
                      accounts. You can manage all accounts in the Bank Status
                      section.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Bank Account Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Enter your bank account details accurately
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Account Holder Name */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accountHolder"
                    className="flex items-center gap-2"
                  >
                    <User className="h-4 w-4" />
                    Account Holder Name *
                  </Label>
                  <Input
                    id="accountHolder"
                    placeholder="As per bank records"
                    value={bankDetails.accountHolder}
                    onChange={(e) =>
                      handleChange("accountHolder", e.target.value)
                    }
                    className={errors.accountHolder ? "border-red-500" : ""}
                  />
                  {errors.accountHolder && (
                    <p className="text-sm text-red-500">
                      {errors.accountHolder}
                    </p>
                  )}
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="accountNumber"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Account Number *
                  </Label>
                  <div className="relative">
                    <Input
                      id="accountNumber"
                      type={showAccountNumber ? "text" : "password"}
                      placeholder="Enter account number"
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        handleChange("accountNumber", e.target.value)
                      }
                      className={
                        errors.accountNumber ? "pr-10 border-red-500" : "pr-10"
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showAccountNumber ? (
                        <EyeOff className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Eye className="h-4 w-4 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                  {errors.accountNumber && (
                    <p className="text-sm text-red-500">
                      {errors.accountNumber}
                    </p>
                  )}
                </div>

                {/* Confirm Account Number */}
                <div className="space-y-2">
                  <Label
                    htmlFor="confirmAccountNumber"
                    className="flex items-center gap-2"
                  >
                    <CreditCard className="h-4 w-4" />
                    Confirm Account Number *
                  </Label>
                  <Input
                    id="confirmAccountNumber"
                    type="password"
                    placeholder="Re-enter account number"
                    value={bankDetails.confirmAccountNumber}
                    onChange={(e) =>
                      handleChange("confirmAccountNumber", e.target.value)
                    }
                    className={
                      errors.confirmAccountNumber ? "border-red-500" : ""
                    }
                  />
                  {errors.confirmAccountNumber && (
                    <p className="text-sm text-red-500">
                      {errors.confirmAccountNumber}
                    </p>
                  )}
                </div>

                {/* IFSC Code */}
                <div className="space-y-2">
                  <Label htmlFor="ifsc" className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    IFSC Code *
                  </Label>
                  <Input
                    id="ifsc"
                    placeholder="e.g., SBIN0001234"
                    value={bankDetails.ifsc}
                    onChange={(e) =>
                      handleChange("ifsc", e.target.value.toUpperCase())
                    }
                    maxLength={11}
                    className={errors.ifsc ? "border-red-500" : ""}
                  />
                  {errors.ifsc && (
                    <p className="text-sm text-red-500">{errors.ifsc}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    11-character code (4 letters + 7 digits)
                  </p>
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                  <Label htmlFor="phone" className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter 10-digit phone number"
                    value={bankDetails.phone}
                    onChange={(e) => {
                      // Allow only digits, spaces, dashes, and + for formatting
                      const value = e.target.value.replace(/[^\d+\-()\s]/g, "");
                      handleChange("phone", value);
                    }}
                    maxLength={15}
                    className={errors.phone ? "border-red-500" : ""}
                  />
                  {errors.phone && (
                    <p className="text-sm text-red-500">{errors.phone}</p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Required for bank verification via Cashfree
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-primary shadow-soft hover:shadow-medium gap-2"
              disabled={submitting}
            >
              <CheckCircle className="h-4 w-4" />
              {submitting ? "Submitting..." : "Verify via Cashfree"}
            </Button>
          </form>

          {/* Help Section */}
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <p>
                  <span className="font-medium">
                    Where to find your IFSC code?
                  </span>
                  <br />
                  Check your bank passbook, cheque book, or bank's website. It's
                  usually printed with your account details.
                </p>
                <p>
                  <span className="font-medium">
                    Why do we need your phone number?
                  </span>
                  <br />
                  Cashfree requires it for bank verification. We'll never share
                  it with third parties.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddBank;