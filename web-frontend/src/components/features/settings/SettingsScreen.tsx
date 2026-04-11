import { Bell, Eye, Globe, Lock, Moon, Palette, Shield, Sun, User } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAppDispatch, useAppSelector } from "@/src/hooks/redux";
import { useAuth } from "@/src/hooks/useAuth";
import { setTheme } from "@/src/store/uiSlice";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const SettingsScreen: React.FC = () => {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const theme = useAppSelector((state) => state.ui.theme);

  const [notifications, setNotifications] = useState({
    transactions: true,
    security: true,
    marketing: false,
    weeklyReport: true,
  });

  const [privacy, setPrivacy] = useState({
    twoFactor: false,
    loginAlerts: true,
    showBalance: true,
  });

  const handleSaveProfile = () => toast.success("Profile updated successfully");
  const handleSaveNotifications = () => toast.success("Notification preferences saved");
  const handleSavePrivacy = () => toast.success("Security settings updated");

  const displayName = user?.fullName || `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || "User";

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account preferences and security</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="h-9 flex-wrap">
          <TabsTrigger value="profile" className="text-xs gap-1.5">
            <User className="h-3 w-3" />Profile
          </TabsTrigger>
          <TabsTrigger value="appearance" className="text-xs gap-1.5">
            <Palette className="h-3 w-3" />Appearance
          </TabsTrigger>
          <TabsTrigger value="notifications" className="text-xs gap-1.5">
            <Bell className="h-3 w-3" />Notifications
          </TabsTrigger>
          <TabsTrigger value="security" className="text-xs gap-1.5">
            <Shield className="h-3 w-3" />Security
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Profile Information</CardTitle>
              <CardDescription className="text-xs">Update your personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <Badge variant="secondary" className="text-xs mt-1 capitalize">{user?.role ?? "customer"}</Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>First Name</Label>
                  <Input defaultValue={user?.firstName ?? ""} />
                </div>
                <div className="space-y-1.5">
                  <Label>Last Name</Label>
                  <Input defaultValue={user?.lastName ?? ""} />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Email Address</Label>
                <Input type="email" defaultValue={user?.email ?? ""} />
              </div>

              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input type="tel" placeholder="+1 (555) 000-0000" defaultValue={user?.phoneNumber ?? ""} />
              </div>

              <div className="space-y-1.5">
                <Label>Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger>
                    <Globe className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English (US)</SelectItem>
                    <SelectItem value="en-gb">English (UK)</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSaveProfile}>Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Appearance</CardTitle>
              <CardDescription className="text-xs">Customize how Flowlet looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label className="text-sm font-medium mb-3 block">Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", label: "Light", icon: Sun },
                    { value: "dark", label: "Dark", icon: Moon },
                    { value: "system", label: "System", icon: Eye },
                  ].map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => dispatch(setTheme(value as "light" | "dark" | "system"))}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                        theme === value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/40"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${theme === value ? "text-primary" : "text-muted-foreground"}`} />
                      <span className={`text-xs font-medium ${theme === value ? "text-primary" : "text-muted-foreground"}`}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Currency Display</Label>
                <Select defaultValue="USD">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD — US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR — Euro</SelectItem>
                    <SelectItem value="GBP">GBP — British Pound</SelectItem>
                    <SelectItem value="AED">AED — UAE Dirham</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Notification Preferences</CardTitle>
              <CardDescription className="text-xs">Choose what you want to be notified about</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              {[
                { key: "transactions" as const, label: "Transaction Alerts", description: "Get notified for every transaction" },
                { key: "security" as const, label: "Security Alerts", description: "Login attempts and security events" },
                { key: "weeklyReport" as const, label: "Weekly Report", description: "Summary of your weekly spending" },
                { key: "marketing" as const, label: "Product Updates", description: "New features and announcements" },
              ].map(({ key, label, description }) => (
                <div key={key} className="flex items-center justify-between py-1">
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                  </div>
                  <Switch
                    checked={notifications[key]}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
              <div className="flex justify-end pt-2 border-t border-border">
                <Button onClick={handleSaveNotifications}>Save Preferences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Security Settings</CardTitle>
                <CardDescription className="text-xs">Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                {[
                  { key: "twoFactor" as const, label: "Two-Factor Authentication", description: "Require a code when signing in", icon: Lock },
                  { key: "loginAlerts" as const, label: "Login Alerts", description: "Email me when a new device signs in", icon: Bell },
                  { key: "showBalance" as const, label: "Show Balance on Dashboard", description: "Display your balance by default", icon: Eye },
                ].map(({ key, label, description, icon: Icon }) => (
                  <div key={key} className="flex items-center justify-between py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                        <Icon className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={privacy[key]}
                      onCheckedChange={(checked) =>
                        setPrivacy((prev) => ({ ...prev, [key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Change Password</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Current Password</Label>
                  <Input type="password" placeholder="Enter current password" />
                </div>
                <div className="space-y-1.5">
                  <Label>New Password</Label>
                  <Input type="password" placeholder="Enter new password" />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm New Password</Label>
                  <Input type="password" placeholder="Repeat new password" />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleSavePrivacy}>Update Password</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-destructive/30">
              <CardHeader>
                <CardTitle className="text-base text-destructive">Danger Zone</CardTitle>
                <CardDescription className="text-xs">Irreversible actions — proceed with caution</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" size="sm">
                  Close Account
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsScreen;
