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
  Hash,
  Building,
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
import { addBankAccount, listBankAccounts } from "@/services/bankService";
import { getProfile } from "@/services/authService";

const AddBank = () => {
  const navigate = useNavigate();

  const [bankDetails, setBankDetails] = useState({
    accountHolder: "",
    accountNumber: "",
    confirmAccountNumber: "",
    ifsc: "",
    phone: "",
    bankName: "",
  });

  const [showAccountNumber, setShowAccountNumber] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [loadingIFSC, setLoadingIFSC] = useState(false);

  // Load phone number from profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();
        const mobile = profile?.personalDetails?.mobileNumber;

        if (mobile) {
          setBankDetails((prev) => ({ ...prev, phone: mobile }));
        }
      } catch {}
    };
    loadProfile();
  }, []);

  // Auto fetch bank details via IFSC
  const fetchBankName = async (ifsc) => {
    if (ifsc.length !== 11) return;

    try {
      setLoadingIFSC(true);
      const res = await fetch(`https://ifsc.razorpay.com/${ifsc}`);
      if (!res.ok) throw new Error("Invalid IFSC");
      const data = await res.json();

      setBankDetails((prev) => ({
        ...prev,
        bankName: data?.BANK || "",
      }));
    } catch (err) {
      setBankDetails((prev) => ({ ...prev, bankName: "" }));
      toast.error("Invalid IFSC code");
    } finally {
      setLoadingIFSC(false);
    }
  };

  const handleChange = (field, value) => {
    setBankDetails((prev) => ({ ...prev, [field]: value }));

    if (field === "ifsc") {
      const val = value.toUpperCase();
      setBankDetails((prev) => ({ ...prev, ifsc: val }));
      if (val.length === 11) fetchBankName(val);
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErr = { ...prev };
        delete newErr[field];
        return newErr;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!bankDetails.accountHolder.trim())
      newErrors.accountHolder = "Account holder name is required";

    if (!bankDetails.accountNumber.trim())
      newErrors.accountNumber = "Account number required";

    if (bankDetails.accountNumber !== bankDetails.confirmAccountNumber)
      newErrors.confirmAccountNumber = "Account number does not match";

    if (!bankDetails.ifsc.trim() || bankDetails.ifsc.length !== 11)
      newErrors.ifsc = "Enter valid IFSC";

    if (!bankDetails.phone.trim()) newErrors.phone = "Phone number required";

    if (!bankDetails.bankName.trim())
      newErrors.bankName = "Invalid IFSC / Bank not found";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Fix the errors above");
      return;
    }

    try {
      setSubmitting(true);

      const cleanPhone = bankDetails.phone.replace(/[^\d]/g, "");

      await addBankAccount({
        accountHolderName: bankDetails.accountHolder,
        accountNumber: bankDetails.accountNumber,
        ifsc: bankDetails.ifsc,
        phone: cleanPhone,
        bankName: bankDetails.bankName, // 👈 auto-pass bank name
      });

      toast.success("Bank account added successfully!");
      navigate("/bank-verification-status", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to add bank");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full pb-16 md:pb-6">
      {/* Page Heading */}
      <div className="mb-6">
        <Link
          to="/bank-status"
          className="text-sm text-primary hover:underline"
        >
          ← Back to Bank Accounts
        </Link>
        <h1 className="text-4xl font-bold mb-2">Add Bank Details</h1>
        <p className="text-muted-foreground text-lg">
          Link your bank account for seamless transactions
        </p>
      </div>

      <div className="max-w-1xl ">
        <div className="space-y-6">
          {/* Security Notice */}
          <Card className="shadow-medium border-2 border-green-400/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Shield className="h-6 w-6 text-green-500 mt-0.5" />
                <div>
                  <p className="font-semibold text-green-600 mb-1 text-lg">
                    Secure Bank Verification
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your bank details are encrypted and verified through
                    Cashfree’s secure payment gateway
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form */}
          <form onSubmit={handleVerify} className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <Building2 className="h-5 w-5" />
                  Account Information
                </CardTitle>
                <CardDescription>
                  Enter your bank details accurately
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Account Holder */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Account Holder Name *
                  </Label>
                  <Input
                    value={bankDetails.accountHolder}
                    placeholder="As per bank records"
                    onChange={(e) =>
                      handleChange("accountHolder", e.target.value)
                    }
                  />
                </div>

                {/* Account Number */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4" />
                    Account Number *
                  </Label>
                  <div className="relative">
                    <Input
                      type={showAccountNumber ? "text" : "password"}
                      placeholder="Enter account number"
                      value={bankDetails.accountNumber}
                      onChange={(e) =>
                        handleChange("accountNumber", e.target.value)
                      }
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAccountNumber(!showAccountNumber)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showAccountNumber ? <EyeOff /> : <Eye />}
                    </button>
                  </div>
                </div>

                {/* Confirm Account */}
                <div className="space-y-2">
                  <Label>Confirm Account Number *</Label>
                  <Input
                    type="password"
                    value={bankDetails.confirmAccountNumber}
                    placeholder="Re-enter account number"
                    onChange={(e) =>
                      handleChange("confirmAccountNumber", e.target.value)
                    }
                  />
                </div>

                {/* IFSC */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Hash className="h-4 w-4" />
                    IFSC Code *
                  </Label>
                  <Input
                    value={bankDetails.ifsc}
                    maxLength={11}
                    placeholder="e.g., SBIN0001234"
                    onChange={(e) => handleChange("ifsc", e.target.value)}
                  />
                </div>

                {/* Bank Name Auto-Filled */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Bank Name *
                  </Label>
                  <Input value={bankDetails.bankName} disabled />
                  {loadingIFSC && (
                    <p className="text-xs text-blue-500">Fetching bank name…</p>
                  )}
                  {errors.bankName && (
                    <p className="text-sm text-red-500">{errors.bankName}</p>
                  )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    Phone Number *
                  </Label>
                  <Input
                    value={bankDetails.phone}
                    onChange={(e) =>
                      handleChange(
                        "phone",
                        e.target.value.replace(/[^\d]/g, "")
                      )
                    }
                    maxLength={10}
                    placeholder="10-digit mobile"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white"
            >
              <CheckCircle className="h-4 w-4" />
              {submitting ? "Processing…" : "Verify via Cashfree"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddBank;