import { useState, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  XCircle,
  FileCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getKYCStatus } from "@/services/kycService";
import { toast } from "sonner";

const KYCStatus = () => {
  const [kycData, setKycData] = useState(null);
  const [kycStatus, setKycStatus] = useState("not_submitted");
  const [isLoading, setIsLoading] = useState(true);
  const [verificationSteps, setVerificationSteps] = useState([]);
  const [overallProgress, setOverallProgress] = useState(0);

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
        updateVerificationSteps(response.data.status, response.data.kyc);
      }
    } catch (error) {
      console.error("Error loading KYC status:", error);
      toast.error("Failed to load KYC status");
    } finally {
      setIsLoading(false);
    }
  };

  const updateVerificationSteps = (status, kycData) => {
    const steps = [
      {
        id: 1,
        name: "Documents Uploaded",
        status: status !== "not_submitted" ? "completed" : "pending",
        date: kycData?.createdAt
          ? new Date(kycData.createdAt).toLocaleString()
          : "Pending",
      },
      {
        id: 2,
        name: "Initial Review",
        status:
          status === "pending" ||
          status === "approved" ||
          status === "rejected" ||
          status === "failed"
            ? "completed"
            : "pending",
        date: kycData?.createdAt
          ? new Date(kycData.createdAt).toLocaleString()
          : "Pending",
      },
      {
        id: 3,
        name: "Identity Verification",
        status:
          status === "pending"
            ? "in-progress"
            : status === "approved"
            ? "completed"
            : status === "failed"
            ? "failed"
            : "pending",
        date:
          status === "pending"
            ? "In Progress"
            : status === "approved"
            ? kycData?.verifiedAt
              ? new Date(kycData.verifiedAt).toLocaleString()
              : "Completed"
            : status === "failed"
            ? kycData?.failedAt
              ? new Date(kycData.failedAt).toLocaleString()
              : "Failed"
            : "Pending",
      },
      {
        id: 4,
        name: "Final Approval",
        status:
          status === "approved"
            ? "completed"
            : status === "rejected"
            ? "failed"
            : "pending",
        date:
          status === "approved"
            ? kycData?.verifiedAt
              ? new Date(kycData.verifiedAt).toLocaleString()
              : "Completed"
            : status === "rejected"
            ? kycData?.updatedAt
              ? new Date(kycData.updatedAt).toLocaleString()
              : "Rejected"
            : "Pending",
      },
    ];

    setVerificationSteps(steps);

    // Calculate overall progress
    let progress = 0;
    if (status === "not_submitted") progress = 0;
    else if (status === "pending") progress = 60;
    else if (status === "approved") progress = 100;
    else if (status === "failed" || status === "rejected") progress = 50;

    setOverallProgress(progress);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-success" />;
      case "in-progress":
        return <Clock className="h-5 w-5 text-warning" />;
      case "pending":
        return <Clock className="h-5 w-5 text-muted-foreground" />;
      default:
        return <XCircle className="h-5 w-5 text-destructive" />;
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: "success",
      "in-progress": "warning",
      pending: "secondary",
      rejected: "destructive",
    };
    return variants[status] || "secondary";
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16 md:pb-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Identity Review Status</h1>
        <p className="text-muted-foreground">
          Track your KYC verification progress
        </p>
      </div>

      {isLoading ? (
        <Card className="shadow-medium border-2">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mr-3" />
              <span>Loading KYC status...</span>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="shadow-medium border-2">
            <CardHeader>
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-primary">
                  <FileCheck className="h-6 w-6 text-primary-foreground" />
                </div>
                <div>
                  <CardTitle>Overall Progress</CardTitle>
                  <CardDescription>
                    Your verification is {overallProgress}% complete
                  </CardDescription>
                </div>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </CardHeader>
            <CardContent>
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm">
                  <span className="font-medium">Current Status:</span>{" "}
                  {kycStatus === "not_submitted"
                    ? "Not Submitted"
                    : kycStatus === "pending"
                    ? "Under Review"
                    : kycStatus === "approved"
                    ? "Approved"
                    : kycStatus === "failed"
                    ? "Failed"
                    : "Rejected"}
                </p>
                {kycStatus === "pending" && (
                  <p className="text-sm mt-2">
                    <span className="font-medium">Estimated completion:</span>{" "}
                    24-48 hours from submission
                  </p>
                )}
                {kycStatus === "failed" && kycData?.verificationErrors && (
                  <div className="mt-3">
                    <p className="text-sm font-medium">Issues found:</p>
                    <ul className="text-sm mt-1 space-y-1">
                      {kycData.verificationErrors
                        .slice(0, 3)
                        .map((error, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-destructive">•</span>
                            <span>{error.message}</span>
                          </li>
                        ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Verification Steps</CardTitle>
              <CardDescription>
                Detailed status of each verification step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {verificationSteps.map((step, index) => (
                  <div key={step.id} className="relative">
                    {index !== verificationSteps.length - 1 && (
                      <div className="absolute left-[18px] top-10 bottom-0 w-0.5 bg-border" />
                    )}
                    <div className="flex gap-4">
                      <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-card border-2 border-border">
                        {getStatusIcon(step.status)}
                      </div>
                      <div className="flex-1 pb-6">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{step.name}</h3>
                          <Badge variant={getStatusBadge(step.status)}>
                            {step.status === "in-progress"
                              ? "In Progress"
                              : step.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.date}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-secondary/50">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-semibold mb-1">
                    {kycStatus === "not_submitted"
                      ? "Ready to submit KYC?"
                      : kycStatus === "failed"
                      ? "Need to resubmit documents?"
                      : kycStatus === "rejected"
                      ? "Need to update documents?"
                      : "Documents submitted"}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {kycStatus === "not_submitted"
                      ? "Complete your identity verification to access all features"
                      : kycStatus === "failed"
                      ? "You can resubmit documents after fixing the issues"
                      : kycStatus === "rejected"
                      ? "You can resubmit documents if required"
                      : kycStatus === "approved"
                      ? "Your KYC is verified and approved"
                      : "Your documents are under review"}
                  </p>
                </div>
                {(kycStatus === "not_submitted" ||
                  kycStatus === "failed" ||
                  kycStatus === "rejected") && (
                  <Link to="/kyc-verification">
                    <Button variant="outline">
                      {kycStatus === "not_submitted"
                        ? "Start KYC"
                        : "Update Documents"}
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="rounded-lg bg-warning/10 border border-warning/20 p-4">
            <p className="text-sm">
              <span className="font-medium">Note:</span> We'll send you email
              and SMS notifications as your verification progresses through each
              step.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

export default KYCStatus;
