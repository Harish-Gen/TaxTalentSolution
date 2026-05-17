import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Loader2, AlertCircle, Building2, Mail, Phone, Save } from "lucide-react";
import { useEmployerPortal } from "../../hooks/useEmployerPortal";
import { useEmployer } from "../../database";
import { employerService } from "../../api/employerService";
import { isUuid } from "../../api/userAssessmentService";
import { toast } from "sonner";

interface EmployerSettingsProps {
  userId?: string;
  userEmail?: string;
  onEmployerUpdated?: (companyName: string) => void;
}

export function EmployerSettings({
  userId,
  userEmail,
  onEmployerUpdated,
}: EmployerSettingsProps) {
  const {
    employerId,
    employerName,
    loading: portalLoading,
    hasEmployer,
    profileError,
  } = useEmployerPortal(userId, userEmail);
  const { employer, loading: employerLoading, refresh } = useEmployer(employerId);

  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (employer) {
      setCompanyName(employer.company_name || employerName || "");
      setPhone(employer.phone || "");
    } else if (employerName) {
      setCompanyName(employerName);
    }
  }, [employer, employerName]);

  const loading = portalLoading || employerLoading;

  const handleSave = async () => {
    if (!employerId) return;
    const trimmedName = companyName.trim();
    if (!trimmedName) {
      toast.error("Company name is required.");
      return;
    }

    setSaving(true);
    try {
      await employerService.upsertEmployer({
        id: employerId,
        user_id: employer?.user_id || userId,
        company_name: trimmedName,
        phone: phone.trim() || undefined,
        contact_person: employer?.contact_person,
        email: employer?.email || userEmail,
        status: employer?.status,
      });
      await refresh();
      onEmployerUpdated?.(trimmedName);
      toast.success("Company profile updated.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Could not update company profile."
      );
    } finally {
      setSaving(false);
    }
  };

  if (!userId || !isUuid(userId)) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Sign in with a platform account to manage settings.
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasEmployer) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <AlertCircle className="w-10 h-10 mx-auto mb-3 text-amber-600" />
          <p className="font-medium">No employer linked</p>
          <p className="text-sm text-muted-foreground mt-2">{profileError}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Company profile
          </CardTitle>
          <CardDescription>
            Update your company name and phone number
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company name</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Your company name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                className="pl-10"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 000 0000"
              />
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">Contact person</p>
            <p className="font-medium">{employer?.contact_person || "—"}</p>
          </div>

          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm">{employer?.email || userEmail || "—"}</span>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-1">Status</p>
            <Badge variant={employer?.status === "active" ? "default" : "secondary"}>
              {employer?.status || "active"}
            </Badge>
          </div>

          <Button
            className="w-full sm:w-auto"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save changes
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Signed-in recruiter user</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-medium">{userEmail || "—"}</p>
        </CardContent>
      </Card>
    </div>
  );
}
