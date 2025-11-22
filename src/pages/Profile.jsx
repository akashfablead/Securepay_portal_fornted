import { useEffect, useState } from "react";
import { User, Mail, Phone, Camera, Save, Eye, EyeOff } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  getProfile,
  updateUserProfile,
  changePassword,
  deactivateAccount,
  deleteAccount,
} from "@/services/authService";

const Profile = () => {
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    mobileNumber: "",
    avatar: "",
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    next: false,
    confirm: false,
  });
  const [changing, setChanging] = useState(false);
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const [deactivateConfirmText, setDeactivateConfirmText] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const updated = await updateUserProfile({
        mobileNumber: profile.mobileNumber,
        profileImage: profile.profileImage,
      });
      toast.success("Profile updated successfully!");
      setProfile((p) => ({
        ...p,
        mobileNumber: updated?.personalDetails?.mobileNumber || p.mobileNumber,
        avatar: updated?.profileImageUrl
          ? updated.profileImageUrl.startsWith("http")
            ? updated.profileImageUrl
            : `${updated.profileImageUrl}`
          : p.avatar,
      }));
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Update failed"
      );
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfile((p) => ({
        ...p,
        profileImage: file,
        avatar: URL.createObjectURL(file),
      }));
      toast.success("Photo selected. Click Save to upload.");
    }
  };

  const handlePasswordChange = (field, value) => {
    setPasswordForm({ ...passwordForm, [field]: value });
  };

  const validateNewPassword = (pwd) => {
    // Minimum 8 chars, at least one letter and one number
    const lengthOk = pwd.length >= 8;
    const hasLetter = /[A-Za-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    return lengthOk && hasLetter && hasNumber;
  };

  const submitChangePassword = async (e) => {
    e.preventDefault();
    if (!passwordForm.currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!validateNewPassword(passwordForm.newPassword)) {
      toast.error("New password must be 8+ chars with letters and numbers");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Confirm password does not match");
      return;
    }
    try {
      setChanging(true);
      await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      toast.success("Password changed successfully");
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Something went wrong"
      );
    } finally {
      setChanging(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    (async () => {
      try {
        const u = await getProfile();
        setProfile({
          name: u?.name || "",
          email: u?.email || "",
          mobileNumber: u?.personalDetails?.mobileNumber || "",
          avatar: u?.profileImageUrl
            ? u.profileImageUrl.startsWith("http")
              ? u.profileImageUrl
              : `${u.profileImageUrl}`
            : "",
        });
      } catch (err) {
        // handled globally by interceptor
      }
    })();
  }, []);

  const handleDeactivate = () => {
    setDeactivateConfirmText("");
    setShowDeactivate(true);
  };

  const confirmDeactivate = async () => {
    const expected = `DEACTIVATE ${profile.email}`.trim();
    if (deactivateConfirmText.trim() !== expected) {
      toast.error(`Type: "${expected}" to confirm`);
      return;
    }
    try {
      setActionLoading(true);
      await deactivateAccount();
      toast.success("Account deactivated");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to deactivate"
      );
    } finally {
      setActionLoading(false);
      setShowDeactivate(false);
    }
  };

  const handleDelete = () => {
    setDeleteConfirmText("");
    setShowDelete(true);
  };

  const confirmDelete = async () => {
    const expected = `DELETE ${profile.email}`.trim();
    if (deleteConfirmText.trim() !== expected) {
      toast.error(`Type: "${expected}" to confirm`);
      return;
    }
    try {
      setActionLoading(true);
      await deleteAccount();
      toast.success("Account deleted");
      localStorage.removeItem("token");
      window.location.href = "/login";
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Failed to delete"
      );
    } finally {
      setActionLoading(false);
      setShowDelete(false);
    }
  };

  return (
    <div className="w-full pb-16 md:pb-6">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Profile Settings</h1>
          <p className="text-muted-foreground text-lg">
            Manage your personal information and security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Profile Info */}
          <div className="space-y-6">
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Profile Photo</CardTitle>
                <CardDescription>Update your profile picture</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl bg-gradient-primary text-primary-foreground">
                      {profile.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-2">
                    <Label htmlFor="photo" className="cursor-pointer">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-secondary hover:bg-secondary/80 transition-colors">
                        <Camera className="h-4 w-4" />
                        <span className="text-sm font-medium">
                          Change Photo
                        </span>
                      </div>
                      <Input
                        id="photo"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      JPG, PNG or GIF. Max size 2MB.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form onSubmit={handleSave} className="space-y-6">
              <Card className="shadow-soft">
                <CardHeader>
                  <CardTitle className="text-xl">
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your account details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="name"
                        value={profile.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={profile.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="pl-10"
                        required
                        disabled
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        type="tel"
                        value={profile.mobileNumber}
                        onChange={(e) =>
                          handleChange("mobileNumber", e.target.value)
                        }
                        className="pl-10"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Button
                type="submit"
                className="w-full h-12 text-lg bg-gradient-primary shadow-soft hover:shadow-medium gap-2"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </Button>
            </form>
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-6">
            {/* Change Password */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitChangePassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="currentPassword"
                        type={showPassword.current ? "text" : "password"}
                        value={passwordForm.currentPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "currentPassword",
                            e.target.value
                          )
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted-foreground"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            current: !showPassword.current,
                          })
                        }
                        aria-label={
                          showPassword.current
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword.current ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword.next ? "text" : "password"}
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          handlePasswordChange("newPassword", e.target.value)
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted-foreground"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            next: !showPassword.next,
                          })
                        }
                        aria-label={
                          showPassword.next ? "Hide password" : "Show password"
                        }
                      >
                        {showPassword.next ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Use at least 8 characters with letters and numbers.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">
                      Confirm New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showPassword.confirm ? "text" : "password"}
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          handlePasswordChange(
                            "confirmPassword",
                            e.target.value
                          )
                        }
                        className="pr-10"
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-2.5 text-muted-foreground"
                        onClick={() =>
                          setShowPassword({
                            ...showPassword,
                            confirm: !showPassword.confirm,
                          })
                        }
                        aria-label={
                          showPassword.confirm
                            ? "Hide password"
                            : "Show password"
                        }
                      >
                        {showPassword.confirm ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-10"
                    disabled={changing}
                  >
                    {changing ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="shadow-soft">
              <CardHeader>
                <CardTitle className="text-xl">Need Help?</CardTitle>
                <CardDescription>
                  Contact our support team for assistance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => (window.location.href = "/support")}
                >
                  Contact Support
                </Button>
              </CardContent>
            </Card>

            {/* <Card className="shadow-soft bg-destructive/10 border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive text-lg">
                  Danger Zone
                </CardTitle>
                <CardDescription>Irreversible account actions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start border-destructive/30 hover:bg-destructive/10"
                  onClick={handleDeactivate}
                >
                  Deactivate Account
                </Button>
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={handleDelete}
                >
                  Delete Account Permanently
                </Button>
              </CardContent>
            </Card> */}

            {/* Deactivate Modal */}
            <Dialog open={showDeactivate} onOpenChange={setShowDeactivate}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Confirm Deactivation</DialogTitle>
                  <DialogDescription>
                    This will disable your account and sign you out.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="deactivateConfirm">Type to confirm</Label>
                  <p className="text-sm text-muted-foreground">
                    Type{" "}
                    <span className="font-semibold">
                      DEACTIVATE {profile.email}
                    </span>
                  </p>
                  <Input
                    id="deactivateConfirm"
                    value={deactivateConfirmText}
                    onChange={(e) => setDeactivateConfirmText(e.target.value)}
                    placeholder={`DEACTIVATE ${profile.email}`}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDeactivate(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDeactivate}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Deactivating..." : "Confirm Deactivate"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Delete Modal */}
            <Dialog open={showDelete} onOpenChange={setShowDelete}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete Account Permanently</DialogTitle>
                  <DialogDescription>
                    This action is irreversible and will remove all your data.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm">Type to confirm</Label>
                  <p className="text-sm text-muted-foreground">
                    Type{" "}
                    <span className="font-semibold">
                      DELETE {profile.email}
                    </span>
                  </p>
                  <Input
                    id="deleteConfirm"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder={`DELETE ${profile.email}`}
                  />
                </div>
                <DialogFooter>
                  <Button
                    variant="ghost"
                    onClick={() => setShowDelete(false)}
                    disabled={actionLoading}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={confirmDelete}
                    disabled={actionLoading}
                  >
                    {actionLoading ? "Deleting..." : "Yes, delete permanently"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
