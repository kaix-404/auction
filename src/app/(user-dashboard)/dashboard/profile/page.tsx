"use client";

import { useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { User, Mail, Phone, ShieldCheck, Pencil, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState(user?.profile?.firstName || "");
  const [lastName, setLastName] = useState(user?.profile?.lastName || "");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const startEdit = () => {
    setFirstName(user?.profile?.firstName || "");
    setLastName(user?.profile?.lastName || "");
    setDateOfBirth((user?.profile as { dateOfBirth?: string })?.dateOfBirth
      ? String((user?.profile as { dateOfBirth?: string })?.dateOfBirth).slice(0, 10)
      : "");
    setGender(((user?.profile as { gender?: string })?.gender as string) || "");
    setEditing(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/auth/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, lastName, dateOfBirth, gender }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      toast.success("Profile updated successfully");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const profile = user?.profile;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information.</p>
        </div>
        {!editing && (
          <Button variant="outline" onClick={startEdit}>
            <Pencil className="size-4" /> Edit Profile
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                <User className="h-7 w-7 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold">
                  {profile?.firstName} {profile?.lastName}
                </p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{user?.mobile}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <Badge variant={user?.status === "active" ? "default" : "secondary"}>
                  {user?.status || "inactive"}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {editing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <Select value={gender} onValueChange={(v) => setGender(v || "")}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleSave} disabled={saving}>
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Save Changes
                </Button>
                <Button variant="outline" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
