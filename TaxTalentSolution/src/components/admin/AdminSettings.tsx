import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Loader2, Shield, CheckCircle2, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { userService } from "../../api/userService";
import { adminUserService } from "../../api/adminUserService";
import { isUuid } from "../../api/userAssessmentService";
import { fetchEntraConfig } from "../../api/entraConfigService";

interface AdminSettingsProps {
  user: {
    id?: string;
    email?: string;
    user_metadata?: { name?: string; phone?: string };
  };
}

const NOTIF_KEY = "tts_admin_notification_prefs";

export function AdminSettings({ user }: AdminSettingsProps) {
  const userId = user?.id;
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adminRole, setAdminRole] = useState("—");
  const [entraEnabled, setEntraEnabled] = useState(false);
  const [form, setForm] = useState({
    name: user?.user_metadata?.name || "",
    phone: user?.user_metadata?.phone || "",
    email: user?.email || "",
  });
  const [notifications, setNotifications] = useState({
    candidateApprovals: true,
    employerSignups: true,
    assessmentUpdates: true,
    systemAlerts: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem(NOTIF_KEY);
    if (stored) {
      try {
        setNotifications(JSON.parse(stored));
      } catch {
        /* ignore */
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const entra = await fetchEntraConfig();
        if (!cancelled) setEntraEnabled(entra.Enabled);

        if (userId && isUuid(userId)) {
          const [dbUser, adminRow] = await Promise.all([
            userService.getUserById(userId).catch(() => null),
            adminUserService.getByUserId(userId),
          ]);
          if (!cancelled && dbUser) {
            setForm({
              name: dbUser.name || "",
              phone: dbUser.phone || "",
              email: dbUser.email || user?.email || "",
            });
          }
          if (!cancelled && adminRow) {
            setAdminRole(adminRow.role);
          }
        }
      } catch (err) {
        console.error("Failed to load admin settings:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId, user?.email]);

  const handleSave = async () => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications));

    if (!userId || !isUuid(userId)) {
      toast.success("Preferences saved locally");
      return;
    }

    setSaving(true);
    try {
      await userService.upsertUser({
        id: userId,
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email,
        status: "active",
      });
      toast.success("Settings saved");
    } catch (err) {
      console.error("Failed to save admin settings:", err);
      toast.error("Failed to save account settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            Administrator account
          </CardTitle>
          <CardDescription>Your platform user profile</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!userId || !isUuid(userId) ? (
            <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Sign in with a database user (e.g. zigocriddoussoi-2038@yopmail.com) to sync profile
              changes to the API.
            </p>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="admin-name">Full name</Label>
              <Input
                id="admin-name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-phone">Phone</Label>
              <Input
                id="admin-phone"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="admin-email">Email</Label>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
                <Input id="admin-email" value={form.email} disabled className="bg-muted/50" />
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Shield className="w-4 h-4 text-red-600" />
            <span className="text-sm text-muted-foreground">Admin role:</span>
            <Badge variant="secondary">{adminRole}</Badge>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification preferences</CardTitle>
          <CardDescription>Stored in your browser for this device</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            [
              ["candidateApprovals", "Candidate approval requests"],
              ["employerSignups", "New employer registrations"],
              ["assessmentUpdates", "Assessment catalog changes"],
              ["systemAlerts", "System alerts"],
            ] as const
          ).map(([key, label]) => (
            <div key={key} className="flex items-center justify-between gap-4">
              <Label htmlFor={key} className="font-normal">
                {label}
              </Label>
              <Switch
                id={key}
                checked={notifications[key]}
                onCheckedChange={(checked) =>
                  setNotifications((n) => ({ ...n, [key]: checked }))
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Platform sign-in</CardTitle>
          <CardDescription>Microsoft Entra configuration from API</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <span className="text-sm">Microsoft Entra (CIAM)</span>
            <Badge variant={entraEnabled ? "default" : "secondary"}>
              {entraEnabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <Button onClick={handleSave} disabled={saving} className="gap-2">
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
        Save settings
      </Button>
    </div>
  );
}
