import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Users,
  ShieldCheck,
  Activity,
  Loader2,
  RefreshCw,
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
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  listManagedUsers,
  createRetailerAccount,
  updateUserStatus,
} from "@/services/authService";
import { toast } from "sonner";
import { useVerificationGate } from "@/hooks/useVerificationGate";

const PAGE_SIZE = 10;

const MasterRetailers = () => {
  const [retailers, setRetailers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [updatingId, setUpdatingId] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const {
    loading: verificationLoading,
    canTransact: canOnboardRetailer,
    error: verificationError,
    refresh: refreshVerification,
  } = useVerificationGate();

  useEffect(() => {
    if (!canOnboardRetailer) {
      setDialogOpen(false);
    }
  }, [canOnboardRetailer]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    fetchRetailers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, searchTerm, refreshKey]);

  const fetchRetailers = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await listManagedUsers({
        page,
        limit: PAGE_SIZE,
        search: searchTerm || undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
        role: "retailer",
      });

      if (!response?.status) {
        throw new Error(response?.message || "Unable to load retailers");
      }

      setRetailers(response.items || []);
      setTotal(response.total || 0);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load retailers";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const activeStats = useMemo(() => {
    const activeCount = retailers.filter((user) => user.isActive).length;
    return {
      activeCount,
      inactiveCount: retailers.length - activeCount,
    };
  }, [retailers]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    if (page !== 1) {
      setPage(1);
    }
    setSearchTerm(searchInput.trim());
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearchTerm("");
    setStatusFilter("all");
    setPage(1);
    setRefreshKey((key) => key + 1);
    refreshVerification();
  };

  const handleManualRefresh = () => {
    setRefreshKey((key) => key + 1);
    refreshVerification();
  };

  const handleCreateRetailer = async (event) => {
    event.preventDefault();
    if (!formData.name || !formData.email || !formData.password) {
      toast.error("All fields are required");
      return;
    }
    if (!canOnboardRetailer) {
      toast.error("Complete KYC and bank verification to add retailers.");
      return;
    }
    try {
      setCreating(true);
      await createRetailerAccount(formData);
      setDialogOpen(false);
      setFormData({ name: "", email: "", password: "" });
      setPage(1);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create retailer";
      toast.error(message);
    } finally {
      setCreating(false);
    }
  };

  const handleToggleActive = async (user, nextValue) => {
    if (user.isActive === nextValue) return;
    try {
      setUpdatingId(user._id);
      await updateUserStatus({ userId: user._id, isActive: nextValue });
      setRetailers((prev) =>
        prev.map((item) =>
          item._id === user._id ? { ...item, isActive: nextValue } : item
        )
      );
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to update status";
      toast.error(message);
    } finally {
      setUpdatingId(null);
    }
  };

  const initials = (name = "") =>
    name
      .split(" ")
      .filter(Boolean)
      .map((chunk) => chunk[0]?.toUpperCase())
      .slice(0, 2)
      .join("");

  const formattedDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div className="space-y-6 pb-16 md:pb-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold">Retailer Management</h1>
        <p className="text-lg text-muted-foreground">
          View, onboard, and control every retailer under your master account.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-soft border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Users className="mr-2 h-4 w-4 text-primary" />
              Total Retailers
            </CardDescription>
            <CardTitle className="text-4xl font-bold">{total}</CardTitle>
            <p className="text-xs text-muted-foreground">Across all pages</p>
          </CardHeader>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="mr-2 h-4 w-4 text-success" />
              Active Retailers (visible page)
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-success">
              {activeStats.activeCount}
            </CardTitle>
          </CardHeader>
        </Card>

        <Card className="shadow-soft border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Activity className="mr-2 h-4 w-4 text-warning" />
              Pending / Suspended (visible page)
            </CardDescription>
            <CardTitle className="text-4xl font-bold text-warning">
              {activeStats.inactiveCount}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="shadow-medium border-2">
        <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="text-2xl">Your Retailers</CardTitle>
            <CardDescription>
              Filter, search, and manage access in seconds.
            </CardDescription>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button
              className="gap-2 bg-gradient-primary shadow-soft hover:shadow-medium"
              onClick={() => {
                if (!canOnboardRetailer) {
                  toast.error(
                    "Account must have approved KYC and verified bank before adding retailers."
                  );
                  return;
                }
                setDialogOpen(true);
              }}
              disabled={verificationLoading || !canOnboardRetailer}
            >
              <Plus className="h-4 w-4" />
              New Retailer
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!verificationLoading && !canOnboardRetailer && (
            <div className="rounded-lg border border-warning/70 bg-warning/10 p-3 text-sm text-warning">
              Complete KYC and bank verification to unlock retailer onboarding.
            </div>
          )}
          {verificationError && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
              {verificationError}
            </div>
          )}
          <form
            onSubmit={handleSearchSubmit}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                className="pl-9"
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setStatusFilter(value);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2">
              <Button type="submit" className="w-full md:w-auto">
                Search
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetFilters}
              >
                Reset
              </Button>
            </div>
          </form>

          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/50">
                    <TableHead className="font-semibold">Retailer</TableHead>
                    <TableHead className="font-semibold">Email</TableHead>
                    <TableHead className="font-semibold">Created On</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="text-right font-semibold">
                      Access
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Loader2 className="h-6 w-6 animate-spin" />
                          <p>Loading retailers...</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : error ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-3 text-muted-foreground">
                          <p className="text-destructive">{error}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={fetchRetailers}
                          >
                            Try Again
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : retailers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-40 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Search className="h-8 w-8 opacity-40" />
                          <p>No retailers found. Try adjusting filters.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    retailers.map((retailer) => (
                      <TableRow
                        key={retailer._id}
                        className="hover:bg-secondary/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary">
                              {initials(retailer.name)}
                            </div>
                            <div>
                              <p className="font-semibold">{retailer.name}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {retailer.role}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {retailer.email}
                        </TableCell>
                        <TableCell>
                          {formattedDate(retailer.createdAt)}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              retailer.isActive ? "success" : "secondary"
                            }
                          >
                            {retailer.isActive ? "Active" : "Suspended"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-3">
                            <span className="text-xs text-muted-foreground">
                              {retailer.isActive ? "Enabled" : "Disabled"}
                            </span>
                            <Switch
                              checked={retailer.isActive}
                              onCheckedChange={(checked) =>
                                handleToggleActive(retailer, checked)
                              }
                              disabled={updatingId === retailer._id}
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground md:flex-row">
            <span>
              Page {page} of {totalPages} · Showing {retailers.length} of{" "}
              {total} retailers
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                disabled={page === 1 || loading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={page >= totalPages || loading}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Onboard New Retailer</DialogTitle>
            <DialogDescription>
              Send instant access by entering their basic details. They can
              update their info later.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateRetailer} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="retailer-name">Full name</Label>
              <Input
                id="retailer-name"
                placeholder="e.g. Rajesh Sharma"
                value={formData.name}
                onChange={(event) =>
                  setFormData((prev) => ({ ...prev, name: event.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailer-email">Email</Label>
              <Input
                id="retailer-email"
                type="email"
                placeholder="retailer@business.com"
                value={formData.email}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    email: event.target.value,
                  }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retailer-password">Temporary password</Label>
              <Input
                id="retailer-password"
                type="text"
                placeholder="Minimum 8 characters"
                value={formData.password}
                onChange={(event) =>
                  setFormData((prev) => ({
                    ...prev,
                    password: event.target.value,
                  }))
                }
                minLength={8}
                required
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={creating}>
                {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Retailer
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MasterRetailers;
