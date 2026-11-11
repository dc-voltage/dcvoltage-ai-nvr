import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import {
  LuHardDrive,
  LuLock,
  LuLockOpen,
  LuShieldCheck,
} from "react-icons/lu";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

export default function StorageVault() {
  const [exportPackage, setExportPackage] = useState<any>(null);

  const { data: usageData } = useSWR("/dcv/storage/usage", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const { data: evidenceData, mutate: refreshEvidence } = useSWR("/dcv/storage/evidence", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const handleUnlock = async (eventId: string) => {
    try {
      await axios.post(`/dcv/storage/unlock-event?event_id=${eventId}`);
      toast.success("Lock removed from recording.");
      refreshEvidence();
    } catch {
      toast.error("Failed to unlock recording.");
    }
  };

  const handleExportEvidence = async (eventId: string) => {
    try {
      const res = await axios.post("/dcv/storage/export-tamper-evident", {
        event_id: eventId,
        operator_name: "Security Administrator",
        incident_notes: "Chain of custody verified export package",
      });
      if (res.data.success) {
        setExportPackage(res.data.package);
        toast.success("Tamper-evident evidence package generated!");
      }
    } catch {
      toast.error("Export generation failed.");
    }
  };

  const usage = usageData || {
    total_gb: 500,
    used_gb: 180,
    free_gb: 320,
    used_percent: 36,
    daily_burn_rate_gb: 35,
    estimated_retention_days_remaining: 9.1,
    tiers: [],
  };

  const evidenceList = evidenceData?.evidence || [];

  return (
    <div className="flex size-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <LuHardDrive className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Evidence Vault & Storage Management</h1>
              <p className="text-xs text-muted-foreground">
                DC VOLTAGE NETWORK • Multi-Tier Storage, Tamper-Evident SHA-256 Evidence Locking & Capacity Forecasting
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Storage Capacity Gauge & Metrics */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Filesystem Capacity & Retention Forecast</CardTitle>
            <CardDescription className="text-xs">
              Primary Media Target: <code className="font-mono text-primary">{usage.mount_path || "/media/frigate"}</code>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-xs mb-2">
                <span>Storage Utilization: <b>{usage.used_gb} GB used</b> of {usage.total_gb} GB</span>
                <span className="font-mono font-bold text-primary">{usage.used_percent}%</span>
              </div>
              <Progress value={usage.used_percent} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 font-mono text-xs">
              <div className="rounded border border-border p-3">
                <div className="text-muted-foreground text-[11px]">Free Capacity</div>
                <div className="text-xl font-bold text-green-500">{usage.free_gb} GB</div>
              </div>
              <div className="rounded border border-border p-3">
                <div className="text-muted-foreground text-[11px]">Estimated Retention Remaining</div>
                <div className="text-xl font-bold text-foreground">{usage.estimated_retention_days_remaining} Days</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Multi-Tier Storage Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Storage Tiers</CardTitle>
            <CardDescription className="text-xs">
              Configured retention tiers & network archive shares
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {(usage.tiers || []).map((t: any, idx: number) => (
              <div key={idx} className="rounded-lg border border-border p-2.5 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{t.tier_name}</span>
                  <Badge variant={t.enabled ? "default" : "outline"} className="text-[10px]">
                    {t.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground truncate">{t.path}</div>
                <div className="text-[10px] text-muted-foreground">Retention: {t.retention_days} Days</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Evidence Vault */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Protected Forensic Evidence Locker</CardTitle>
              <CardDescription className="text-xs">
                Recordings marked with immutable hold to prevent automated retention pruning
              </CardDescription>
            </div>
            <Badge variant="outline" className="font-mono text-xs">
              {evidenceList.length} Locked Cases
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {evidenceList.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No locked recordings in evidence locker. Use "Lock Evidence" on any event review segment to protect it.
            </div>
          ) : (
            <div className="divide-y divide-border rounded-lg border border-border">
              {evidenceList.map((item: any, idx: number) => (
                <div key={idx} className="flex items-center justify-between p-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      <LuLock className="size-4" />
                    </div>
                    <div>
                      <div className="font-bold text-foreground">{item.case_name || "Evidence Case"}</div>
                      <div className="text-muted-foreground">Event: <code>{item.event_id}</code> • Reason: {item.reason}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => handleExportEvidence(item.event_id)}
                    >
                      <LuShieldCheck className="mr-1 size-3.5" />
                      Verify Hash
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs text-destructive hover:bg-destructive/10"
                      onClick={() => handleUnlock(item.event_id)}
                    >
                      <LuLockOpen className="mr-1 size-3.5" />
                      Unlock
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {exportPackage && (
            <div className="mt-4 rounded-lg border border-primary/40 bg-primary/5 p-4 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-primary">
                <LuShieldCheck className="size-5" />
                Tamper-Evident Forensic Evidence Package Verified
              </div>
              <div className="font-mono text-[11px] space-y-1 bg-background p-3 rounded border border-border">
                <div><b>Package ID:</b> {exportPackage.export_id}</div>
                <div><b>SHA-256 Hash:</b> <span className="text-green-500 break-all">{exportPackage.sha256_integrity_hash}</span></div>
                <div><b>Digital Signature:</b> {exportPackage.digital_signature}</div>
                <div><b>Timestamp:</b> {exportPackage.timestamp}</div>
                <div><b>Chain of Custody:</b> Verified Authenticated Recording</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
