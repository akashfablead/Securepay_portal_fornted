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

      // Initialize form data with retailer details
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
    // Reset form data to original values
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

      // Prepare user data for update
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

      // Reload retailer details
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
        {/* {!editing && <Button onClick={handleEdit}>Edit Details</Button>} */}
      </div>

      {/* Retailer Info Card */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Retailer Information
          </CardTitle>
          <CardDescription>
            Basic information about the retailer account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="Enter full name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="Enter email address"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="Enter mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    placeholder="Enter address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    placeholder="Enter city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                    placeholder="Enter state"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) =>
                      setFormData({ ...formData, country: e.target.value })
                    }
                    placeholder="Enter country"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pincode">Pincode</Label>
                  <Input
                    id="pincode"
                    value={formData.pincode}
                    onChange={(e) =>
                      setFormData({ ...formData, pincode: e.target.value })
                    }
                    placeholder="Enter pincode"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updating}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updating}>
                  {updating ? "Updating..." : "Save Changes"}
                </Button>
              </div>
            </form>
          ) : (
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
                    Mobile Number
                  </h3>
                  <p>
                    {retailer?.user?.personalDetails?.mobileNumber || "N/A"}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Account Status
                  </h3>
                  <div className="flex items-center gap-2">
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
                    Address
                  </h3>
                  <p>{retailer?.user?.personalDetails?.address || "N/A"}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      City
                    </h3>
                    <p>{retailer?.user?.personalDetails?.city || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      State
                    </h3>
                    <p>{retailer?.user?.personalDetails?.state || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Country
                    </h3>
                    <p>{retailer?.user?.personalDetails?.country || "N/A"}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">
                      Pincode
                    </h3>
                    <p>{retailer?.user?.personalDetails?.pincode || "N/A"}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">
                    Member Since
                  </h3>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(retailer?.user?.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
};

export default RetailerDetails;
