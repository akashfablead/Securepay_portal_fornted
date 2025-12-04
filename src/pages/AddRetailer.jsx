import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
  ArrowLeft,
  User,
  Mail,
  Phone,
  Building,
  FileText,
  MapPin,
  Camera,
  Upload,
  Briefcase,
} from "lucide-react";
import { createRetailerAccount } from "@/services/authService";
import { useVerificationGate } from "@/hooks/useVerificationGate";
import { INDIAN_STATES, RETAILER_TYPES } from "@/utils/indianStates";

const AddRetailer = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // Multi-step form (now 5 steps)
  const [formData, setFormData] = useState({
    // Step 1 - Personal Details
    fullName: "",
    email: "",
    mobileNumber: "",
    alternativeMobile: "",
    dateOfBirth: "",
    gender: "",
    fatherName: "",
    motherName: "",
    maritalStatus: "",
    spouseName: "",
    personalCity: "",
    personalPincode: "",
    personalState: "",
    personalAddress: "",

    // Step 2 - Office Address
    officeAddress: "",
    officeCity: "",
    officePincode: "",
    officeState: "",

    // Step 3 - Banking Details
    bankName: "",
    bankIFSC: "",
    bankAccountType: "",
    bankAccountNumber: "",
    bankAccountHolderName: "",

    // Step 4 - Uploads
    aadharFrontImage: null,
    aadharBackImage: null,
    bankProof: null,
    cancelledCheque: null,
    pancardPhoto: null,
    profilePhoto: null,
    academicCertificate: null,

    // Step 5 - Employment/Borrower Details
    employmentType: "",
    companyName: "",
    referenceName1: "",
    referenceMobile1: "",
    referenceName2: "",
    referenceMobile2: "",
    tenure: "",
    password: "",
    confirmPassword: "",
    businessName: "",
    retailerType: "",
  });

  const [creating, setCreating] = useState(false);

  const {
    loading: verificationLoading,
    canTransact,
    kycStatus,
    bankStatus,
    error: verificationError,
  } = useVerificationGate();

  // Auto-fill city and state based on pincode
  const autoFillLocationDetails = async (pincode, type) => {
    try {
      const response = await fetch(
        `https://api.postalpincode.in/pincode/${pincode}`
      );
      const data = await response.json();

      if (
        data &&
        data[0] &&
        data[0].Status === "Success" &&
        data[0].PostOffice &&
        data[0].PostOffice.length > 0
      ) {
        const postOffice = data[0].PostOffice[0];
        const city = postOffice.District || postOffice.Block || "";
        const state = postOffice.State || "";

        setFormData((prev) => ({
          ...prev,
          [`${type}City`]: city,
          [`${type}State`]: state,
        }));
      }
    } catch (error) {
      console.log("Could not fetch location details for pincode:", pincode);
    }
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-fill city and state based on pincode
    if (name === "personalPincode" && value.length === 6) {
      autoFillLocationDetails(value, "personal");
    }

    if (name === "officePincode" && value.length === 6) {
      autoFillLocationDetails(value, "office");
    }

    // Auto-fill bank name based on IFSC code
    if (name === "bankIFSC" && value.length === 11) {
      try {
        fetch(`https://ifsc.razorpay.com/${value}`)
          .then((res) => res.json())
          .then((data) => {
            if (data && data.BANK) {
              setFormData((prev) => ({
                ...prev,
                bankName: data.BANK,
              }));
            }
          })
          .catch((err) => console.log("Could not fetch bank details:", err));
      } catch (error) {
        console.log("Could not fetch bank details for IFSC:", value);
      }
    }
  };

  // Handle file uploads
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setFormData((prev) => ({
      ...prev,
      [fieldName]: file,
    }));
  };

  // Handle select changes
  const handleSelectChange = (value, fieldName) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  // Navigation between steps
  const nextStep = () => {
    // Validation for current step before moving to next
    if (step === 1) {
      if (
        !formData.fullName ||
        !formData.email ||
        !formData.mobileNumber ||
        !formData.personalCity ||
        !formData.personalPincode ||
        !formData.personalState
      ) {
        toast.error("Please fill all required fields in Personal Details");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        toast.error("Please enter a valid email address");
        return;
      }

      // Mobile number validation
      const phoneRegex = /^[6-9]\d{9}$/;
      if (!phoneRegex.test(formData.mobileNumber)) {
        toast.error("Please enter a valid 10-digit mobile number");
        return;
      }

      if (
        formData.alternativeMobile &&
        !phoneRegex.test(formData.alternativeMobile)
      ) {
        toast.error("Please enter a valid 10-digit alternative mobile number");
        return;
      }

      // Pincode validation (6 digits)
      if (!/^\d{6}$/.test(formData.personalPincode)) {
        toast.error("Personal Pincode must be 6 digits");
        return;
      }
    }

    if (step === 2) {
      if (
        !formData.officeAddress ||
        !formData.officeCity ||
        !formData.officePincode ||
        !formData.officeState
      ) {
        toast.error("Please fill all required fields in Office Address");
        return;
      }

      // Pincode validation (6 digits)
      if (!/^\d{6}$/.test(formData.officePincode)) {
        toast.error("Office Pincode must be 6 digits");
        return;
      }
    }

    if (step === 3) {
      if (
        !formData.bankName ||
        !formData.bankIFSC ||
        !formData.bankAccountType ||
        !formData.bankAccountNumber ||
        !formData.bankAccountHolderName
      ) {
        toast.error("Please fill all required fields in Banking Details");
        return;
      }

      // Bank account number validation
      if (formData.bankAccountNumber.length < 9) {
        toast.error("Bank Account Number must be at least 9 digits");
        return;
      }
    }

    if (step === 4) {
      if (
        !formData.aadharFrontImage ||
        !formData.aadharBackImage ||
        !formData.cancelledCheque ||
        !formData.pancardPhoto
      ) {
        toast.error("Please upload all required documents");
        return;
      }
    }

    if (step === 5) {
      if (
        !formData.employmentType ||
        !formData.companyName ||
        !formData.referenceName1 ||
        !formData.tenure ||
        !formData.password ||
        !formData.confirmPassword ||
        !formData.businessName ||
        !formData.retailerType
      ) {
        toast.error("Please fill all required fields in Employment Details");
        return;
      }

      // Password validation
      if (formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      if (formData.password.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
      }

      // If we're on step 5 and all validation passes, we should submit the form
      handleCreateRetailer();
      return;
    }

    if (step < 5) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleCreateRetailer = async (e) => {
    if (e) e.preventDefault();

    if (!canTransact) {
      toast.error("Complete bank verification to add retailers.");
      return;
    }

    try {
      setCreating(true);

      // Debug log to verify form data
      console.log("Submitting form data:", formData);

      // Prepare form data for submission
      const submissionData = new FormData();

      // Step 1 - Personal Details
      submissionData.append("fullName", formData.fullName);
      submissionData.append("email", formData.email);
      submissionData.append("phone", formData.mobileNumber);
      submissionData.append("alternativeMobile", formData.alternativeMobile);
      submissionData.append("dateOfBirth", formData.dateOfBirth);
      submissionData.append("gender", formData.gender);
      submissionData.append("fatherName", formData.fatherName);
      submissionData.append("motherName", formData.motherName);
      submissionData.append("maritalStatus", formData.maritalStatus);
      submissionData.append("spouseName", formData.spouseName);
      submissionData.append("personalCity", formData.personalCity);
      submissionData.append("personalPincode", formData.personalPincode);
      submissionData.append("personalState", formData.personalState);
      submissionData.append("personalAddress", formData.personalAddress);

      // Step 2 - Office Address
      submissionData.append("officeAddress", formData.officeAddress);
      submissionData.append("officeCity", formData.officeCity);
      submissionData.append("officePincode", formData.officePincode);
      submissionData.append("officeState", formData.officeState);

      // Step 3 - Banking Details
      submissionData.append("bankName", formData.bankName);
      submissionData.append("bankIFSC", formData.bankIFSC);
      submissionData.append("bankAccountType", formData.bankAccountType);
      submissionData.append("bankAccountNumber", formData.bankAccountNumber);
      submissionData.append(
        "bankAccountHolderName",
        formData.bankAccountHolderName
      );

      // Step 4 - Uploads
      if (formData.aadharFrontImage) {
        submissionData.append("aadharFrontImage", formData.aadharFrontImage);
      }
      if (formData.aadharBackImage) {
        submissionData.append("aadharBackImage", formData.aadharBackImage);
      }
      if (formData.bankProof) {
        submissionData.append("bankProof", formData.bankProof);
      }
      if (formData.cancelledCheque) {
        submissionData.append("cancelledCheque", formData.cancelledCheque);
      }
      if (formData.pancardPhoto) {
        submissionData.append("pancardPhoto", formData.pancardPhoto);
      }
      if (formData.profilePhoto) {
        submissionData.append("profilePhoto", formData.profilePhoto);
      }
      if (formData.academicCertificate) {
        submissionData.append(
          "academicCertificate",
          formData.academicCertificate
        );
      }

      // Step 5 - Employment/Borrower Details
      submissionData.append("employmentType", formData.employmentType);
      submissionData.append("companyName", formData.companyName);
      submissionData.append("referenceName1", formData.referenceName1);
      submissionData.append("referenceMobile1", formData.referenceMobile1);
      submissionData.append("referenceName2", formData.referenceName2);
      submissionData.append("referenceMobile2", formData.referenceMobile2);
      submissionData.append("tenure", formData.tenure);
      submissionData.append("password", formData.password);
      submissionData.append("businessName", formData.businessName);
      submissionData.append("retailerType", formData.retailerType);

      // Debug log to verify submission data
      console.log("Submission data entries:");
      for (let [key, value] of submissionData.entries()) {
        console.log(key, value);
      }

      await createRetailerAccount(submissionData);
      toast.success("Retailer created successfully");

      // Navigate back to retailers list
      navigate("/master/retailers");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create retailer");
    } finally {
      setCreating(false);
    }
  };

  // Render step indicators
  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3, 4, 5].map((stepNum) => (
        <div key={stepNum} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step === stepNum
                ? "bg-primary text-primary-foreground"
                : step > stepNum
                ? "bg-green-500 text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {stepNum}
          </div>
          {stepNum < 5 && (
            <div
              className={`w-16 h-1 mx-2 ${
                step > stepNum ? "bg-green-500" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );

  // Render step titles
  const renderStepTitle = () => {
    switch (step) {
      case 1:
        return "Personal Details";
      case 2:
        return "Office Address";
      case 3:
        return "Banking Details";
      case 4:
        return "Document Uploads";
      case 5:
        return "Employment Details";
      default:
        return "";
    }
  };

  // Render step content
  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleInputChange}
                  placeholder="Enter 10-digit mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="alternativeMobile">Alternative Mobile</Label>
                <Input
                  id="alternativeMobile"
                  name="alternativeMobile"
                  value={formData.alternativeMobile}
                  onChange={handleInputChange}
                  placeholder="Enter alternative mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleSelectChange(value, "gender")}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="fatherName">Father's Name</Label>
                <Input
                  id="fatherName"
                  name="fatherName"
                  value={formData.fatherName}
                  onChange={handleInputChange}
                  placeholder="Enter father's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="motherName">Mother's Name</Label>
                <Input
                  id="motherName"
                  name="motherName"
                  value={formData.motherName}
                  onChange={handleInputChange}
                  placeholder="Enter mother's name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maritalStatus">Marital Status</Label>
                <Select
                  value={formData.maritalStatus}
                  onValueChange={(value) =>
                    handleSelectChange(value, "maritalStatus")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select marital status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouseName">Spouse Name</Label>
                <Input
                  id="spouseName"
                  name="spouseName"
                  value={formData.spouseName}
                  onChange={handleInputChange}
                  placeholder="Enter spouse name (if applicable)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalAddress">Personal Address *</Label>
                <Input
                  id="personalAddress"
                  name="personalAddress"
                  value={formData.personalAddress}
                  onChange={handleInputChange}
                  placeholder="Enter personal address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalPincode">Pincode *</Label>
                <Input
                  id="personalPincode"
                  name="personalPincode"
                  value={formData.personalPincode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit pincode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="personalCity">City *</Label>
                <Input
                  id="personalCity"
                  name="personalCity"
                  value={formData.personalCity}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from pincode"
                  readOnly
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="personalState">State *</Label>
                <Input
                  id="personalState"
                  name="personalState"
                  value={formData.personalState}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from pincode"
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="officeAddress">Office Address *</Label>
                <Input
                  id="officeAddress"
                  name="officeAddress"
                  value={formData.officeAddress}
                  onChange={handleInputChange}
                  placeholder="Enter office address"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officePincode">Pincode *</Label>
                <Input
                  id="officePincode"
                  name="officePincode"
                  value={formData.officePincode}
                  onChange={handleInputChange}
                  placeholder="Enter 6-digit pincode"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="officeCity">City *</Label>
                <Input
                  id="officeCity"
                  name="officeCity"
                  value={formData.officeCity}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from pincode"
                  readOnly
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="officeState">State *</Label>
                <Input
                  id="officeState"
                  name="officeState"
                  value={formData.officeState}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from pincode"
                  readOnly
                  disabled
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bankIFSC">Bank IFSC *</Label>
                <Input
                  id="bankIFSC"
                  name="bankIFSC"
                  value={formData.bankIFSC}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name *</Label>
                <Input
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  placeholder="auto-filled from IFSC"
                  readOnly
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountType">Bank Account Type *</Label>
                <Select
                  value={formData.bankAccountType}
                  onValueChange={(value) =>
                    handleSelectChange(value, "bankAccountType")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="savings">Savings</SelectItem>
                    <SelectItem value="current">Current</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bankAccountNumber">Bank Account Number *</Label>
                <Input
                  id="bankAccountNumber"
                  name="bankAccountNumber"
                  value={formData.bankAccountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter account number"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="bankAccountHolderName">
                  Bank Account Holder Name *
                </Label>
                <Input
                  id="bankAccountHolderName"
                  name="bankAccountHolderName"
                  value={formData.bankAccountHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter account holder name"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Document Uploads</h3>
              <p className="text-sm text-muted-foreground">
                Please upload clear images of the following documents
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="aadharFrontImage">Aadhar Front Image *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="aadharFrontImage"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "aadharFrontImage")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("aadharFrontImage").click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  {formData.aadharFrontImage && (
                    <span className="text-sm text-muted-foreground">
                      {formData.aadharFrontImage.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="aadharBackImage">Aadhar Back Image *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="aadharBackImage"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "aadharBackImage")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("aadharBackImage").click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  {formData.aadharBackImage && (
                    <span className="text-sm text-muted-foreground">
                      {formData.aadharBackImage.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cancelledCheque">
                  Cancelled Cheque Photo *
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="cancelledCheque"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "cancelledCheque")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("cancelledCheque").click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  {formData.cancelledCheque && (
                    <span className="text-sm text-muted-foreground">
                      {formData.cancelledCheque.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pancardPhoto">PAN Card Photo *</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="pancardPhoto"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "pancardPhoto")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("pancardPhoto").click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  {formData.pancardPhoto && (
                    <span className="text-sm text-muted-foreground">
                      {formData.pancardPhoto.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankProof">Bank Proof</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="bankProof"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "bankProof")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById("bankProof").click()}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  {formData.bankProof && (
                    <span className="text-sm text-muted-foreground">
                      {formData.bankProof.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="profilePhoto">Profile Photo</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="profilePhoto"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, "profilePhoto")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("profilePhoto").click()
                    }
                  >
                    <Camera className="w-4 h-4 mr-2" />
                    Upload Photo
                  </Button>
                  {formData.profilePhoto && (
                    <span className="text-sm text-muted-foreground">
                      {formData.profilePhoto.name}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="academicCertificate">
                  Academic Certificate
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="academicCertificate"
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileChange(e, "academicCertificate")}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      document.getElementById("academicCertificate").click()
                    }
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Document
                  </Button>
                  {formData.academicCertificate && (
                    <span className="text-sm text-muted-foreground">
                      {formData.academicCertificate.name}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="employmentType">Employment Type *</Label>
                <Select
                  value={formData.employmentType}
                  onValueChange={(value) =>
                    handleSelectChange(value, "employmentType")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select employment type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="salaried">Salaried</SelectItem>
                    <SelectItem value="self-employed">Self Employed</SelectItem>
                    <SelectItem value="business-owner">
                      Business Owner
                    </SelectItem>
                    <SelectItem value="freelancer">Freelancer</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                    <SelectItem value="homemaker">Homemaker</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="companyName">Company Name *</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                  placeholder="Enter company name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenceName1">Reference Name 1 *</Label>
                <Input
                  id="referenceName1"
                  name="referenceName1"
                  value={formData.referenceName1}
                  onChange={handleInputChange}
                  placeholder="Enter reference name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenceMobile1">Reference Mobile 1</Label>
                <Input
                  id="referenceMobile1"
                  name="referenceMobile1"
                  value={formData.referenceMobile1}
                  onChange={handleInputChange}
                  placeholder="Enter reference mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenceName2">Reference Name 2</Label>
                <Input
                  id="referenceName2"
                  name="referenceName2"
                  value={formData.referenceName2}
                  onChange={handleInputChange}
                  placeholder="Enter reference name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenceMobile2">Reference Mobile 2</Label>
                <Input
                  id="referenceMobile2"
                  name="referenceMobile2"
                  value={formData.referenceMobile2}
                  onChange={handleInputChange}
                  placeholder="Enter reference mobile number"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tenure">Tenure *</Label>
                <Input
                  id="tenure"
                  name="tenure"
                  value={formData.tenure}
                  onChange={handleInputChange}
                  placeholder="Enter tenure"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name *</Label>
                <Input
                  id="businessName"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleInputChange}
                  placeholder="Enter business name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="retailerType">Retailer Type *</Label>
                <Select
                  value={formData.retailerType}
                  onValueChange={(value) =>
                    handleSelectChange(value, "retailerType")
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select retailer type" />
                  </SelectTrigger>
                  <SelectContent>
                    {RETAILER_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password *</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min. 6 characters)"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password *</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm password"
                />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/master/retailers")}
          className="hover:bg-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add New Retailer</h1>
          <p className="text-muted-foreground">
            Create a new retailer account under your master account
          </p>
        </div>
      </div>

      {/* Verification Requirement Banner */}
      {!canTransact && (
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                <Phone className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="font-medium text-warning">Action Required</p>
                <p className="text-sm text-warning-foreground">
                  Complete bank verification to unlock retailer onboarding.
                </p>
                <Button
                  onClick={() => navigate("/bank-status")}
                  variant="outline"
                  size="sm"
                  className="mt-2 bg-white border-warning text-warning hover:bg-warning/10"
                >
                  Verify Bank Account
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Multi-step Form */}
      <Card className="shadow-medium">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {step === 1 && <User className="h-5 w-5" />}
            {step === 2 && <Building className="h-5 w-5" />}
            {step === 3 && <Briefcase className="h-5 w-5" />}
            {step === 4 && <FileText className="h-5 w-5" />}
            {step === 5 && <Briefcase className="h-5 w-5" />}
            {renderStepTitle()}
          </CardTitle>
          <CardDescription>
            Step {step} of 5 - {renderStepTitle()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderStepIndicator()}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              nextStep();
            }}
            className="space-y-6"
          >
            {renderStepContent()}

            <div className="flex justify-between pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={step === 1 || creating}
              >
                Previous
              </Button>

              <Button
                type="button"
                onClick={nextStep}
                disabled={creating || !canTransact}
              >
                {step < 5
                  ? "Next"
                  : creating
                  ? "Creating..."
                  : "Create Retailer"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default AddRetailer;
