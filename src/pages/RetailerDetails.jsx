import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { toast } from "sonner";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Ban,
  Eye,
  EyeOff,
  FileText,
  Briefcase,
  Building2,
  CreditCard,
  FileImage,
} from "lucide-react";
import {
  getUserDetails,
  updateUserDetails,
  resetUserPassword,
} from "@/services/authService";

const RetailerDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [retailer, setRetailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    country: "",
    pincode: "",
  });
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [updating, setUpdating] = useState(false);

  const loadRetailerDetails = async () => {
    try {
      setLoading(true);
      const data = await getUserDetails(id);
      setRetailer(data);

      setFormData({
        name: data?.user?.name || "",
        email: data?.user?.email || "",
        phone: data?.user?.personalDetails?.mobileNumber || "",
        address: data?.user?.personalDetails?.address || "",
        city: data?.user?.personalDetails?.city || "",
        state: data?.user?.personalDetails?.state || "",
        country: data?.user?.personalDetails?.country || "",
        pincode: data?.user?.personalDetails?.pincode || "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to load retailer details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetailerDetails();
  }, [id]);

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setFormData({
      name: retailer?.user?.name || "",
      email: retailer?.user?.email || "",
      phone: retailer?.user?.personalDetails?.mobileNumber || "",
      address: retailer?.user?.personalDetails?.address || "",
      city: retailer?.user?.personalDetails?.city || "",
      state: retailer?.user?.personalDetails?.state || "",
      country: retailer?.user?.personalDetails?.country || "",
      pincode: retailer?.user?.personalDetails?.pincode || "",
    });
    setEditing(false);
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      const userData = {
        name: formData.name,
        email: formData.email,
        personalDetails: {
          mobileNumber: formData.phone,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          country: formData.country,
          pincode: formData.pincode,
        },
      };

      await updateUserDetails(id, userData);
      toast.success("Retailer details updated successfully");

      await loadRetailerDetails();
      setEditing(false);
    } catch (err) {
      console.error(err);
      toast.error(
        err?.response?.data?.message || "Failed to update retailer details"
      );
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isImageFile = (url) => {
    if (!url) return false;
    const imageExtensions = ["jpg", "jpeg", "png", "gif", "webp", "bmp"];
    const ext = url.split(".").pop().toLowerCase();
    return imageExtensions.includes(ext);
  };

  const personalDetails = retailer?.user?.personalDetails || {};
  const documentUrls = retailer?.user?.documentUrls || {};
  const kycStatus = retailer?.kyc;

  if (loading) {
    return (
      <div className="space-y-6 pb-16 md:pb-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/master/retailers")}
            className="hover:bg-muted"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>

        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
          <p className="mt-2 text-muted-foreground">
            Loading retailer details...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/master/retailers")}
          className="hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Retailer Details</h1>
          <p className="text-muted-foreground">
            View and manage retailer account information
          </p>
        </div>
      </div>

      {retailer?.user?.profileImageUrl && (
        <Card className="shadow-soft">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <img
                src={retailer.user.profileImageUrl}
                alt="Profile"
                className="h-32 w-32 rounded-full object-cover border-4 border-border"
              />
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>Core retailer account information</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Full Name
                </h3>
                <p className="font-medium">{retailer?.user?.name || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Email Address
                </h3>
                <p>{retailer?.user?.email || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Account Status
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {retailer?.user?.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-success" />
                      <span className="text-success">Active</span>
                    </>
                  ) : (
                    <>
                      <Ban className="h-4 w-4 text-destructive" />
                      <span className="text-destructive">Inactive</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Member Since
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span>{formatDate(retailer?.user?.createdAt)}</span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  Role
                </h3>
                <p className="capitalize">{retailer?.user?.role || "N/A"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Personal Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-base mb-4">
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Full Name
                  </h4>
                  <p>{personalDetails?.fullName || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Date of Birth
                  </h4>
                  <p>{formatDate(personalDetails?.dateOfBirth) || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Gender
                  </h4>
                  <p className="capitalize">
                    {personalDetails?.gender || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Marital Status
                  </h4>
                  <p className="capitalize">
                    {personalDetails?.maritalStatus || "N/A"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Father's Name
                  </h4>
                  <p>{personalDetails?.fatherName || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Mother's Name
                  </h4>
                  <p>{personalDetails?.motherName || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-base mb-4">Personal Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Address
                  </h4>
                  <p>{personalDetails?.personalAddress || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    City
                  </h4>
                  <p>{personalDetails?.personalCity || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Pincode
                  </h4>
                  <p>{personalDetails?.personalPincode || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    State
                  </h4>
                  <p>{personalDetails?.personalState || "N/A"}</p>
                </div>
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold text-base mb-4">Office Address</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Address
                  </h4>
                  <p>{personalDetails?.officeAddress || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    City
                  </h4>
                  <p>{personalDetails?.officeCity || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    Pincode
                  </h4>
                  <p>{personalDetails?.officePincode || "N/A"}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">
                    State
                  </h4>
                  <p>{personalDetails?.officeState || "N/A"}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Employment Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Employment Type
              </h4>
              <p className="capitalize">
                {personalDetails?.employmentType || "N/A"}
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Company Name
              </h4>
              <p>{personalDetails?.companyName || "N/A"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Business Name
              </h4>
              <p>{personalDetails?.businessName || "N/A"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Retailer Type
              </h4>
              <p>{personalDetails?.retailerType || "N/A"}</p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-muted-foreground">
                Tenure
              </h4>
              <p>{personalDetails?.tenure || "N/A"}</p>
            </div>

            <div className="md:col-span-2 border-t pt-4">
              <h3 className="font-semibold text-sm mb-4">References</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {personalDetails?.referenceName1 && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Reference 1 Name
                      </h4>
                      <p>{personalDetails.referenceName1}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Reference 1 Mobile
                      </h4>
                      <p>{personalDetails.referenceMobile1}</p>
                    </div>
                  </>
                )}
                {personalDetails?.referenceName2 && (
                  <>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Reference 2 Name
                      </h4>
                      <p>{personalDetails.referenceName2}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">
                        Reference 2 Mobile
                      </h4>
                      <p>{personalDetails.referenceMobile2}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {personalDetails?.bankName && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Banking Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Bank Name
                </h4>
                <p>{personalDetails.bankName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  IFSC Code
                </h4>
                <p>{personalDetails.bankIFSC}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Account Holder Name
                </h4>
                <p>{personalDetails.bankAccountHolderName}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Account Number
                </h4>
                <p className="font-mono">{personalDetails.bankAccountNumber}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">
                  Account Type
                </h4>
                <p className="capitalize">{personalDetails.bankAccountType}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {Object.keys(documentUrls).length > 0 && (
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              Documents
            </CardTitle>
            <CardDescription>
              Uploaded KYC and verification documents
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(documentUrls).map(([key, url]) => {
                if (!url) return null;

                const documentNameMap = {
                  aadharFrontImage: "Aadhar Front",
                  aadharBackImage: "Aadhar Back",
                  bankProof: "Bank Proof",
                  cancelledCheque: "Cancelled Cheque",
                  pancardPhoto: "PAN Card",
                  profilePhoto: "Profile Photo",
                  academicCertificate: "Academic Certificate",
                };

                const documentName = documentNameMap[key] || key;

                return (
                  <div
                    key={key}
                    className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="h-40 bg-muted flex items-center justify-center overflow-hidden relative group">
                      {isImageFile(url) ? (
                        <>
                          <img
                            src={url}
                            alt={documentName}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.nextElementSibling.style.display =
                                "flex";
                            }}
                          />
                          <FileText
                            className="w-12 h-12 text-muted-foreground hidden"
                            style={{ display: "none" }}
                          />
                        </>
                      ) : (
                        <FileText className="w-12 h-12 text-muted-foreground" />
                      )}
                    </div>
                    <div className="p-3">
                      <p className="font-medium text-sm text-foreground truncate">
                        {documentName}
                      </p>
                      <Button
                        asChild
                        variant="link"
                        className="h-auto p-0 text-xs mt-2"
                      >
                        <a href={url} target="_blank" rel="noreferrer">
                          View Document
                        </a>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RetailerDetails;
