"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Loader2, Plus, Pencil, Trash2, MapPin } from "lucide-react";

interface Address {
  _id: string;
  name: string;
  mobile: string;
  addressLine1: string;
  addressLine2?: string;
  locality?: string;
  city: string;
  state: string;
  pin: string;
  landmark?: string;
  deliveryInstructions?: string;
  isDefault: boolean;
}

interface AddressesResponse {
  addresses: Address[];
}

const emptyForm = {
  name: "",
  mobile: "",
  addressLine1: "",
  addressLine2: "",
  locality: "",
  city: "",
  state: "",
  pin: "",
  landmark: "",
  deliveryInstructions: "",
  isDefault: false,
};

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const { data, isLoading, isError } = useQuery<AddressesResponse>({
    queryKey: ["addresses"],
    queryFn: async () => {
      const res = await fetch("/api/users/addresses", { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch addresses");
      return res.json();
    },
  });

  const addresses = data?.addresses || [];

  const openAdd = () => {
    setEditing(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditing(address);
    setForm({
      name: address.name,
      mobile: address.mobile,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      locality: address.locality || "",
      city: address.city,
      state: address.state,
      pin: address.pin,
      landmark: address.landmark || "",
      deliveryInstructions: address.deliveryInstructions || "",
      isDefault: address.isDefault,
    });
    setOpen(true);
  };

  const handleSubmit = async () => {
    if (!form.name || !form.mobile || !form.addressLine1 || !form.city || !form.state || !form.pin) {
      toast.error("Please fill in all required fields");
      return;
    }
    setSubmitting(true);
    try {
      if (editing) {
        const res = await fetch(`/api/users/addresses/${editing._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to update address");
        toast.success("Address updated successfully");
      } else {
        const res = await fetch("/api/users/addresses", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error("Failed to add address");
        toast.success("Address added successfully");
      }
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (address: Address) => {
    try {
      const res = await fetch(`/api/users/addresses/${address._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete address");
      toast.success("Address deleted");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete address");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Addresses</h1>
          <p className="text-muted-foreground">Manage your shipping addresses.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger render={<Button onClick={openAdd} />}>
            <Plus className="size-4" /> Add Address
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Address" : "Add Address"}</DialogTitle>
              <DialogDescription>Fill in your shipping address details.</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input
                    id="mobile"
                    value={form.mobile}
                    onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                    placeholder="Phone number"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine1">Address Line 1</Label>
                <Input
                  id="addressLine1"
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                  placeholder="House no, street"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="addressLine2">Address Line 2</Label>
                <Input
                  id="addressLine2"
                  value={form.addressLine2}
                  onChange={(e) => setForm({ ...form, addressLine2: e.target.value })}
                  placeholder="Area, building"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="locality">Locality</Label>
                  <Input
                    id="locality"
                    value={form.locality}
                    onChange={(e) => setForm({ ...form, locality: e.target.value })}
                    placeholder="Locality"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={form.city}
                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                    placeholder="City"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={form.state}
                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin">PIN</Label>
                  <Input
                    id="pin"
                    value={form.pin}
                    onChange={(e) => setForm({ ...form, pin: e.target.value })}
                    placeholder="PIN code"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="landmark">Landmark</Label>
                <Input
                  id="landmark"
                  value={form.landmark}
                  onChange={(e) => setForm({ ...form, landmark: e.target.value })}
                  placeholder="Nearby landmark"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryInstructions">Delivery Instructions</Label>
                <Textarea
                  id="deliveryInstructions"
                  value={form.deliveryInstructions}
                  onChange={(e) => setForm({ ...form, deliveryInstructions: e.target.value })}
                  placeholder="Any delivery notes"
                  rows={2}
                />
              </div>
              <label className="flex items-center gap-2">
                <Checkbox
                  checked={form.isDefault}
                  onCheckedChange={(v) => setForm({ ...form, isDefault: Boolean(v) })}
                />
                <span>Set as default address</span>
              </label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting && <Loader2 className="size-4 animate-spin" />}
                {editing ? "Save Changes" : "Add Address"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : isError ? (
        <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
          Failed to load addresses. Please try again.
        </div>
      ) : addresses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
          <MapPin className="mb-2 h-8 w-8" />
          No addresses saved yet. Add one to start.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {addresses.map((address) => (
            <Card key={address._id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    {address.name}
                  </span>
                  {address.isDefault && <Badge>Default</Badge>}
                </CardTitle>
                <CardDescription>{address.mobile}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-1">
                <p>{address.addressLine1}</p>
                {address.addressLine2 && <p>{address.addressLine2}</p>}
                <p>
                  {address.locality ? `${address.locality}, ` : ""}
                  {address.city}, {address.state} - {address.pin}
                </p>
                {address.landmark && <p className="text-muted-foreground">Near: {address.landmark}</p>}
                {address.deliveryInstructions && (
                  <p className="text-xs text-muted-foreground">Note: {address.deliveryInstructions}</p>
                )}
                <div className="flex gap-2 pt-3">
                  <Button variant="outline" size="sm" onClick={() => openEdit(address)}>
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(address)}
                  >
                    <Trash2 className="size-3.5" /> Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
