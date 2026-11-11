import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import { LuScan } from "react-icons/lu";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function AITracking() {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const { data: rulesData, mutate: refreshRules } = useSWR("/dcv/tracking/rules", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const { data: statsData } = useSWR("/dcv/tracking/stats", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const handleToggleRule = async (ruleKey: string, currentEnabled: boolean) => {
    try {
      await axios.post("/dcv/tracking/rules/update", {
        rule_key: ruleKey,
        enabled: !currentEnabled,
      });
      refreshRules();
      toast.success(`Rule '${ruleKey}' ${!currentEnabled ? "enabled" : "disabled"}`);
    } catch {
      toast.error("Failed to update tracking rule.");
    }
  };

  const handleThresholdChange = async (ruleKey: string, newThreshold: number) => {
    try {
      await axios.post("/dcv/tracking/rules/update", {
        rule_key: ruleKey,
        threshold: newThreshold,
      });
      refreshRules();
    } catch {
      toast.error("Failed to save threshold.");
    }
  };

  const rulesList = Object.entries(rulesData?.rules || {}).map(([key, val]: [string, any]) => ({
    key,
    ...val,
  }));

  const filteredRules = selectedCategory === "all"
    ? rulesList
    : rulesList.filter((r) => r.category === selectedCategory);

  return (
    <div className="flex size-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <LuScan className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">30 Advanced AI Tracking Capabilities</h1>
              <p className="text-xs text-muted-foreground">
                DC VOLTAGE AI NVR • Real-Time Computer Vision Analytics, Behavior Analysis & False-Positive Suppression
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Real-Time Analytics Highlights */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Active Vision Tracks</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {statsData?.active_tracks_count || 4}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Kalman-filtered persistent IDs
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Occupancy Head-Count</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {statsData?.people_inside || 6} Persons
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Live doorway in/out cross counters
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Vehicles Monitored</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {statsData?.vehicles_present || 2} Present
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            ALPR & dwell-time tracked
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Security Incidents Today</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-500">
              {statsData?.alerts_today || 3} Triggered
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Verified high-severity events
          </CardContent>
        </Card>
      </div>

      {/* Category Tabs */}
      <Tabs defaultValue="all" onValueChange={setSelectedCategory} className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-1 bg-background_alt p-1">
          <TabsTrigger value="all">All 30 Rules</TabsTrigger>
          <TabsTrigger value="security">Security & Perimeter</TabsTrigger>
          <TabsTrigger value="biometric">Biometrics & Faces</TabsTrigger>
          <TabsTrigger value="vehicle">Vehicles & ALPR</TabsTrigger>
          <TabsTrigger value="behavior">Behavior & Loitering</TabsTrigger>
          <TabsTrigger value="occupancy">Occupancy & Counting</TabsTrigger>
          <TabsTrigger value="safety">Smoke, Fire & Falls</TabsTrigger>
          <TabsTrigger value="courier">Delivery & Packages</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* 30 Rules Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredRules.map((rule) => (
          <Card key={rule.key} className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <Badge variant="outline" className="mb-1 text-[10px] uppercase font-mono">
                    #{rule.id} • {rule.category}
                  </Badge>
                  <CardTitle className="text-sm font-bold">{rule.name}</CardTitle>
                </div>
                <Switch
                  checked={rule.enabled}
                  onCheckedChange={() => handleToggleRule(rule.key, rule.enabled)}
                />
              </div>
            </CardHeader>

            <CardContent className="pt-2 text-xs space-y-3">
              {rule.threshold !== undefined && (
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-muted-foreground">
                    <span>Confidence Threshold:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {Math.round(rule.threshold * 100)}%
                    </span>
                  </div>
                  <Slider
                    defaultValue={[rule.threshold * 100]}
                    max={95}
                    min={50}
                    step={1}
                    onValueCommit={(val) => handleThresholdChange(rule.key, val[0] / 100)}
                    disabled={!rule.enabled}
                  />
                </div>
              )}

              {rule.dwell_sec !== undefined && (
                <div className="flex justify-between text-[11px] text-muted-foreground">
                  <span>Dwell Time Trigger:</span>
                  <span className="font-mono font-semibold text-foreground">
                    {rule.dwell_sec} Seconds
                  </span>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                <span className="text-muted-foreground">State:</span>
                <span className={rule.enabled ? "text-green-500 font-medium" : "text-muted-foreground"}>
                  {rule.enabled ? "Active & Monitoring" : "Disabled"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
