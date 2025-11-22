import { useState, useEffect } from "react";
import {
  Upload,
  CheckCircle,
  FileText,
  Camera,
  User,
  Shield,
  AlertCircle,
  Loader2,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  submitKYC,
  getKYCStatus,
  retryKYCVerification,
} from "@/services/kycService";

const KYCVerification = () => {
  const [files, setFiles] = useState({
    pan: null,
    aadhaar: null,
    selfie: null,
  });
  const [kycStatus, setKycStatus] = useState("not_submitted");
  const [kycData, setKycData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationErrors, setVerificationErrors] = useState([]);

  // Load KYC status on component mount
  useEffect(() => {
    loadKYCStatus();
  }, []);

  const loadKYCStatus = async () => {
    try {
      setIsLoading(true);
      const response = await getKYCStatus();
      if (response.status) {
        setKycStatus(response.data.status);
        setKycData(response.data.kyc);
        if (response.data.kyc?.verificationErrors) {
          setVerificationErrors(response.data.kyc.verificationErrors);
        }
      }
    } catch (error) {
      console.error("Error loading KYC status:", error);
      toast.error("Failed to load KYC status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (type, e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should not exceed 5MB");
        return;
      }

      // Validate file type
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and PDF files are allowed");
        return;
      }

      setFiles({ ...files, [type]: file });
      toast.success(`${type.toUpperCase()} uploaded successfully`);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!files.pan || !files.aadhaar || !files.selfie) {
      toast.error("Please upload all required documents");
      return;
    }

    try {
      setIsSubmitting(true);
      const documents = {
        panCard: files.pan,
        aadhaarCard: files.aadhaar,
        selfie: files.selfie,
      };

      const response = await submitKYC(documents);

      if (response.status) {
        toast.success(response.message);
        setKycStatus(response.data.kyc.status);
        setKycData(response.data.kyc);

        // Show verification results if available
        if (response.data.verificationResult) {
          const result = response.data.verificationResult;
          if (!result.overallVerification && result.errors.length > 0) {
            setVerificationErrors(result.errors);
            toast.error("Verification failed. Please check the errors below.");
          }
        }

        // Clear files after successful submission
        setFiles({ pan: null, aadhaar: null, selfie: null });
      }
    } catch (error) {
      console.error("KYC submission error:", error);
      toast.error("Failed to submit KYC documents. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetryVerification = async () => {
    try {
      setIsSubmitting(true);
      const response = await retryKYCVerification();

      if (response.status) {
        toast.success(response.message);
        setKycStatus(response.data.kyc.status);
        setKycData(response.data.kyc);

        if (response.data.verificationResult) {
          const result = response.data.verificationResult;
          if (!result.overallVerification && result.errors.length > 0) {
            setVerificationErrors(result.errors);
          } else {
            setVerificationErrors([]);
          }
        }
      }
    } catch (error) {
      console.error("KYC retry error:", error);
      toast.error("Failed to retry verification. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusConfig = (status) => {
    const configs = {
      approved: { color: "success", text: "Verified", icon: CheckCircle },
      pending: { color: "warning", text: "Under Review", icon: AlertCircle },
      rejected: { color: "destructive", text: "Rejected", icon: AlertCircle },
      failed: { color: "destructive", text: "Failed", icon: AlertCircle },
      not_submitted: {
        color: "secondary",
        text: "Not Submitted",
        icon: AlertCircle,
      },
    };
    return configs[status] || configs.not_submitted;
  };

  const statusConfig = getStatusConfig(kycStatus);
  const StatusIcon = statusConfig.icon;

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="mb-6">
        <h1 className="text-4xl font-bold mb-2">KYC Verification</h1>
        <p className="text-muted-foreground text-lg">
          Complete your identity verification to access all features
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Upload Forms */}
        <div className="space-y-6">
          <Card className="shadow-medium border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <StatusIcon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">
                      Verification Status
                    </CardTitle>
                    <CardDescription>
                      Current status of your KYC
                    </CardDescription>
                  </div>
                </div>
                <Badge
                  variant={statusConfig.color}
                  className="text-sm px-3 py-1"
                >
                  {statusConfig.text}
                </Badge>
              </div>
            </CardHeader>
            {kycStatus === "pending" && (
              <CardContent>
                <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
                  <p className="text-sm text-black-foreground font-bold">
                    Your documents are under review. This usually takes 24-48
                    hours. We'll notify you once verified.
                  </p>
                </div>
              </CardContent>
            )}

            {kycStatus === "failed" && (
              <CardContent>
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4 space-y-3">
                  <p className="text-sm text-destructive-foreground font-medium">
                    Verification failed. Please check the errors below and
                    resubmit your documents.
                  </p>
                  {verificationErrors.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-destructive-foreground">
                        Issues found:
                      </p>
                      <ul className="space-y-1">
                        {verificationErrors.map((error, index) => (
                          <li
                            key={index}
                            className="text-sm text-destructive-foreground flex items-start gap-2"
                          >
                            <span className="text-destructive">•</span>
                            <span>{error.message}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <Button
                    onClick={handleRetryVerification}
                    disabled={isSubmitting}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      "Retry Verification"
                    )}
                  </Button>
                </div>
              </CardContent>
            )}

            {kycStatus === "rejected" && (
              <CardContent>
                <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                  <p className="text-sm text-black-foreground font-bold font-semibold">
                    Your KYC has been rejected. Please contact support for more
                    information.
                  </p>
                  {kycData?.remarks && (
                    <p className="text-sm text-black-foreground mt-2 font-bold font-semibold">
                      <strong>Reason:</strong> {kycData.remarks}
                    </p>
                  )}
                </div>
              </CardContent>
            )}

            {kycStatus === "approved" && (
              <CardContent>
                <div className="rounded-lg  bg-success/10 border border-success/20 p-4">
                  <p className="text-sm  text-black-foreground font-bold">
                    Congratulations! Your KYC has been successfully verified.
                  </p>
                  {kycData?.verifiedAt && (
                    <p className="text-sm text-black-foreground mt-2 font-bold">
                      <strong>Verified on:</strong>{" "}
                      {new Date(kycData.verifiedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>

          <form onSubmit={handleSubmit} className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  PAN Card
                </CardTitle>
                <CardDescription>
                  Upload a clear image of your PAN card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="pan">PAN Card Image</Label>
                  <div className="flex gap-3">
                    <Input
                      id="pan"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("pan", e)}
                      className="flex-1"
                    />
                    {files.pan && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Uploaded
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Aadhaar Card
                </CardTitle>
                <CardDescription>
                  Upload front and back of your Aadhaar card
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="aadhaar">Aadhaar Card Image</Label>
                  <div className="flex gap-3">
                    <Input
                      id="aadhaar"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => handleFileUpload("aadhaar", e)}
                      className="flex-1"
                    />
                    {files.aadhaar && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Uploaded
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Camera className="h-5 w-5" />
                  Selfie Verification
                </CardTitle>
                <CardDescription>
                  Upload a clear selfie for identity verification
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Label htmlFor="selfie">Selfie Photo</Label>
                  <div className="flex gap-3">
                    <Input
                      id="selfie"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload("selfie", e)}
                      className="flex-1"
                    />
                    {files.selfie && (
                      <Badge variant="success" className="gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Uploaded
                      </Badge>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Button
              type="submit"
              className="w-full h-12 text-lg bg-gradient-primary shadow-soft hover:shadow-medium"
              disabled={
                isSubmitting ||
                kycStatus === "approved" ||
                kycStatus === "pending"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : kycStatus === "approved" ? (
                "Already Verified"
              ) : kycStatus === "pending" ? (
                "Under Review"
              ) : (
                "Submit for Verification"
              )}
            </Button>
          </form>
        </div>

        {/* Right Column - Guidelines & Info */}
        <div className="space-y-6">
          <Card className="shadow-medium bg-gradient-primary text-primary-foreground ">
            <CardHeader>
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-6 w-6" />
                Secure Verification Process
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm opacity-90">
                Your documents are encrypted and processed securely through our
                verified KYC platform.
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">256-bit Encryption</p>
                    <p className="text-sm opacity-90">
                      All documents are encrypted during transmission
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Fast Processing</p>
                    <p className="text-sm opacity-90">
                      Verification completed within 24-48 hours
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-semibold mb-1">Data Privacy</p>
                    <p className="text-sm opacity-90">
                      Documents deleted after verification
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft bg-secondary/50 border-dashed">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5" />
                Important Guidelines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Ensure all documents are clear and readable</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>File size should not exceed 5MB per document</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Supported formats: JPG, PNG, PDF</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>All information must match across documents</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>
                    Selfie should be taken in good lighting without glasses
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                  <span>Documents should not be expired</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {kycStatus !== "pending" && (
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-lg">Verification Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      files.pan ? "bg-success/20" : "bg-secondary"
                    }`}
                  >
                    {files.pan ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-sm font-medium">1</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">PAN Card Upload</p>
                    <p className="text-sm text-muted-foreground">
                      {files.pan ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      files.aadhaar ? "bg-success/20" : "bg-secondary"
                    }`}
                  >
                    {files.aadhaar ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-sm font-medium">2</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Aadhaar Card Upload</p>
                    <p className="text-sm text-muted-foreground">
                      {files.aadhaar ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      files.selfie ? "bg-success/20" : "bg-secondary"
                    }`}
                  >
                    {files.selfie ? (
                      <CheckCircle className="h-4 w-4 text-success" />
                    ) : (
                      <span className="text-sm font-medium">3</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Selfie Verification</p>
                    <p className="text-sm text-muted-foreground">
                      {files.selfie ? "Completed" : "Pending"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default KYCVerification;
