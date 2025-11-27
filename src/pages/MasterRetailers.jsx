import { useEffect, useMemo, useState } from "react";
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
  Users,
  Plus,
  Search,
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  listManagedUsers,
  createRetailerAccount,
} from "@/services/authService";
import { useVerificationGate } from "@/hooks/useVerificationGate";

const MasterRetailers = () => {
  const navigate = useNavigate();
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRetailer, setNewRetailer] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [creating, setCreating] = useState(false);

  const {
    loading: verificationLoading,
    canTransact,
    kycStatus,
    bankStatus,
    error: verificationError,
  } = useVerificationGate();

  const loadRetailers = async () => {
    try {
      setLoading(true);
      const data = await listManagedUsers({ role: "retailer" });
      setRetailers(data?.users || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load retailers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRetailers();
  }, []);

  const filteredRetailers = retailers.filter(
    (retailer) =>
      retailer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      retailer.phone.includes(searchTerm)
  );

  const handleCreateRetailer = async (e) => {
    e.preventDefault();

    if (!canTransact) {
      toast.error("Complete bank verification to add retailers.");
      return;
    }

    if (
      !newRetailer.name ||
      !newRetailer.email ||
      !newRetailer.phone ||
      !newRetailer.password
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newRetailer.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Basic phone validation (10 digits)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(newRetailer.phone)) {
      toast.error("Please enter a valid 10-digit mobile number");
      return;
    }

    // Password validation (at least 6 characters)
    if (newRetailer.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    try {
      setCreating(true);
      await createRetailerAccount(newRetailer);
      toast.success("Retailer created successfully");
      setNewRetailer({ name: "", email: "", phone: "", password: "" });
      setShowAddForm(false);
      loadRetailers(); // Refresh the list
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create retailer");
    } finally {
      setCreating(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Retailers</h1>
          <p className="text-muted-foreground">
            Manage your retailer accounts and onboarding
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Retailer
        </Button>
      </div>

      {/* Verification Requirement Banner */}
      {!canTransact && (
        <Card className="bg-warning/10 border-warning/20">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-warning mt-0.5" />
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

      {/* Add Retailer Form */}
      {showAddForm && (
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Add New Retailer
            </CardTitle>
            <CardDescription>
              Create a new retailer account under your master account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateRetailer} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={newRetailer.name}
                    onChange={(e) =>
                      setNewRetailer({ ...newRetailer, name: e.target.value })
                    }
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newRetailer.email}
                    onChange={(e) =>
                      setNewRetailer({ ...newRetailer, email: e.target.value })
                    }
                    placeholder="Enter email address"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number *</Label>
                  <Input
                    id="phone"
                    value={newRetailer.phone}
                    onChange={(e) =>
                      setNewRetailer({ ...newRetailer, phone: e.target.value })
                    }
                    placeholder="Enter 10-digit mobile number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newRetailer.password}
                    onChange={(e) =>
                      setNewRetailer({
                        ...newRetailer,
                        password: e.target.value,
                      })
                    }
                    placeholder="Enter password (min. 6 characters)"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creating}>
                  {creating ? "Creating..." : "Create Retailer"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search retailers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Retailers List */}
      <Card className="shadow-soft">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Retailer Accounts
          </CardTitle>
          <CardDescription>
            List of retailers under your master account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="py-8 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-2 text-muted-foreground">Loading retailers...</p>
            </div>
          ) : filteredRetailers.length === 0 ? (
            <div className="py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 font-medium">No retailers found</h3>
              <p className="mt-1 text-muted-foreground">
                {searchTerm
                  ? "No retailers match your search."
                  : "Get started by adding a new retailer."}
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="mt-4"
                disabled={!canTransact}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Retailer
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRetailers.map((retailer) => (
                <div
                  key={retailer._id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{retailer.name}</p>
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {retailer.email}
                        </div>
                        <div className="hidden sm:block">•</div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {retailer.phone}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {formatDate(retailer.createdAt)}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        navigate(`/master/retailers/${retailer._id}`)
                      }
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MasterRetailers;
