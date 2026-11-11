import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import {
  LuCar,
  LuPlus,
  LuShieldAlert,
  LuShieldCheck,
  LuStar,
} from "react-icons/lu";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function VehicleAnalytics() {
  const [searchQuery, setSearchQuery] = useState("");
  const [newPlate, setNewPlate] = useState("");
  const [newListType, setNewListType] = useState("allow");
  const [newDescription, setNewDescription] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: platesData, mutate: refreshPlates } = useSWR("/dcv/tracking/alpr/plates", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const handleAddPlate = async () => {
    if (!newPlate.trim()) {
      toast.error("Plate number is required.");
      return;
    }
    try {
      await axios.post("/dcv/tracking/alpr/plates", {
        plate_number: newPlate,
        list_type: newListType,
        description: newDescription,
      });
      toast.success(`Plate '${newPlate.toUpperCase()}' registered.`);
      setNewPlate("");
      setNewDescription("");
      setDialogOpen(false);
      refreshPlates();
    } catch {
      toast.error("Failed to register plate.");
    }
  };

  const plates = platesData?.plates || [];
  const filteredPlates = plates.filter((p: any) =>
    p.plate_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="flex size-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <LuCar className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Vehicle Analytics & ALPR Registry</h1>
              <p className="text-xs text-muted-foreground">
                DC VOLTAGE AI NVR • License Plate Recognition, Make/Model/Color Classification & Access Control
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <LuPlus className="mr-2 size-4" />
                Register License Plate
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register License Plate</DialogTitle>
                <DialogDescription className="text-xs">
                  Assign plate to Allow (Whitelist), Deny (Blacklist/Alert), or VIP status.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-2">
                <div>
                  <label className="text-xs font-semibold">Plate Number</label>
                  <Input
                    value={newPlate}
                    onChange={(e) => setNewPlate(e.target.value)}
                    placeholder="e.g. KL-07-CD-1234"
                    className="font-mono uppercase text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold">Classification List</label>
                  <Select value={newListType} onValueChange={setNewListType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="allow">Allow List (Authorized Access)</SelectItem>
                      <SelectItem value="deny">Deny List (Security Alarm / Blacklist)</SelectItem>
                      <SelectItem value="vip">VIP List (Priority Visitor)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-semibold">Description / Notes</label>
                  <Input
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    placeholder="e.g. Executive Director Sedan"
                    className="text-xs"
                  />
                </div>
                <Button className="w-full" onClick={handleAddPlate}>
                  Register Plate
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Registered Authorized Plates</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-500">
              {plates.filter((p: any) => p.list_type === "allow").length} Vehicles
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Whitelisted for automated barrier gates
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Flagged Security Blacklist</CardDescription>
            <CardTitle className="text-2xl font-bold text-destructive">
              {plates.filter((p: any) => p.list_type === "deny").length} Flagged
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Triggers high-priority security alerts
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">ALPR Detection Accuracy</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              98.6%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Multi-frame OCR confidence validation
          </CardContent>
        </Card>
      </div>

      {/* Plate Directory */}
      <Card>
        <CardHeader>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <CardTitle className="text-base">Registered License Plates</CardTitle>
              <CardDescription className="text-xs">
                Active access control database for cameras with ALPR enabled
              </CardDescription>
            </div>
            <div className="w-full sm:w-64">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search plates..."
                className="text-xs"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border">
            {filteredPlates.map((plate: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-3 text-xs">
                <div className="flex items-center gap-3">
                  {plate.list_type === "allow" && (
                    <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                      <LuShieldCheck className="size-4" />
                    </div>
                  )}
                  {plate.list_type === "deny" && (
                    <div className="rounded-full bg-destructive/10 p-2 text-destructive">
                      <LuShieldAlert className="size-4" />
                    </div>
                  )}
                  {plate.list_type === "vip" && (
                    <div className="rounded-full bg-amber-500/10 p-2 text-amber-500">
                      <LuStar className="size-4" />
                    </div>
                  )}
                  <div>
                    <div className="font-mono text-sm font-bold text-foreground">
                      {plate.plate_number}
                    </div>
                    <div className="text-muted-foreground">{plate.description || "No description"}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      plate.list_type === "allow"
                        ? "default"
                        : plate.list_type === "deny"
                        ? "destructive"
                        : "secondary"
                    }
                    className="capitalize text-[11px]"
                  >
                    {plate.list_type}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
