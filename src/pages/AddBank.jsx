import { useEffect, useState } from "react";
import { Building2, Shield, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
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
import { Phone } from "lucide-react";

const AddBank = () => {
  const navigate = useNavigate();
  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    phone: "",
  });

  const handleChange = (field, value) => {
    setBankDetails({ ...bankDetails, [field]: value });
  };

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
        // Allow all users to add multiple bank accounts
        // No redirect logic needed
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

  const handleVerify = async (e) => {
    e.preventDefault();

    if (
      !bankDetails.accountHolder ||
      !bankDetails.accountNumber ||
      !bankDetails.ifsc ||
      !bankDetails.phone
    ) {
      toast.error("Please fill all required fields including phone number");
      return;
    }

    // Validate phone number format (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    const cleanPhone = bankDetails.phone.replace(/[\s\-+()]/g, "");
    if (cleanPhone.length < 10 || !phoneRegex.test(cleanPhone.slice(-10))) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      setSubmitting(true);
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
      </div>

      <div className="max-w-2xl">
        <div className="space-y-6">
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
                <div className="space-y-2">
                  <Label htmlFor="accountHolder">Account Holder Name *</Label>
                  <Input
                    id="accountHolder"
                    placeholder="As per bank records"
                    value={bankDetails.accountHolder}
                    onChange={(e) =>
                      handleChange("accountHolder", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number *</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={bankDetails.accountNumber}
                    onChange={(e) =>
                      handleChange("accountNumber", e.target.value)
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code *</Label>
                  <Input
                    id="ifsc"
                    placeholder="e.g., SBIN0001234"
                    value={bankDetails.ifsc}
                    onChange={(e) =>
                      handleChange("ifsc", e.target.value.toUpperCase())
                    }
                    maxLength={11}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="Enter 10-digit phone number"
                      value={bankDetails.phone}
                      onChange={(e) => {
                        // Allow only digits, spaces, dashes, and + for formatting
                        const value = e.target.value.replace(
                          /[^\d+\-()\s]/g,
                          ""
                        );
                        handleChange("phone", value);
                      }}
                      className="pl-10"
                      maxLength={15}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Required for bank verification via Cashfree
                  </p>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-primary shadow-soft hover:shadow-medium gap-2"
              disabled={submitting}
            >
              <CheckCircle className="h-4 w-4" />
              {submitting ? "Submitting..." : "Verify via Cashfree"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBank;
