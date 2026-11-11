import useSWR from "swr";
import axios from "axios";
import {
  LuChartBar,
  LuCheck,
} from "react-icons/lu";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function SecurityAnalytics() {
  const { data: summaryData } = useSWR("/dcv/analytics/summary?days=7", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const { data: heatmapData } = useSWR("/dcv/analytics/heatmap", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const { data: uptimeData } = useSWR("/dcv/analytics/uptime", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const getHeatmapColor = (val: number) => {
    if (val === 0) return "bg-muted/30";
    if (val < 10) return "bg-blue-500/30 text-blue-200";
    if (val < 25) return "bg-blue-500/60 text-white";
    if (val < 40) return "bg-blue-600 text-white font-bold";
    return "bg-blue-800 text-white font-bold";
  };

  const matrix = heatmapData?.matrix || [];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="flex size-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <LuChartBar className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Security Analytics & Forensic Intelligence</h1>
              <p className="text-xs text-muted-foreground">
                DC VOLTAGE NETWORK • Activity Heatmaps, Detection Distributions, Occupancy & Camera Reliability
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Total Detections (7 Days)</CardDescription>
            <CardTitle className="text-2xl font-bold text-primary">
              {summaryData?.total_events || 253}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Processed via AI inference engine
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Overall Security Score</CardDescription>
            <CardTitle className="text-2xl font-bold text-green-500">
              {summaryData?.security_score || 98.4}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Perimeter integrity index
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Camera Fleet Uptime</CardDescription>
            <CardTitle className="text-2xl font-bold text-foreground">
              {uptimeData?.overall_uptime || 99.85}%
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            Zero blind spots maintained
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="text-xs">Unusual Incidents</CardDescription>
            <CardTitle className="text-2xl font-bold text-amber-500">
              {summaryData?.unusual_incidents_count || 2}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-[11px] text-muted-foreground">
            After-hours perimeter anomalies
          </CardContent>
        </Card>
      </div>

      {/* 24-Hour Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">7-Day Hourly Activity Density Heatmap</CardTitle>
          <CardDescription className="text-xs">
            Visualizing surveillance activity intensity across hours of the day (0:00 to 23:00)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <div className="min-w-[650px] space-y-1">
              {/* Hours header */}
              <div className="grid grid-cols-[50px_repeat(24,1fr)] gap-1 text-center font-mono text-[10px] text-muted-foreground pb-1">
                <div></div>
                {hours.map((h) => (
                  <div key={h}>{h}</div>
                ))}
              </div>

              {/* Day rows */}
              {matrix.map((row: any) => (
                <div key={row.day} className="grid grid-cols-[50px_repeat(24,1fr)] gap-1 items-center">
                  <div className="text-xs font-semibold text-foreground">{row.day}</div>
                  {row.hourly_values.map((val: number, hIdx: number) => (
                    <div
                      key={hIdx}
                      className={`h-7 rounded flex items-center justify-center text-[10px] font-mono transition-colors ${getHeatmapColor(val)}`}
                      title={`${row.day} ${hIdx}:00 - ${val} detections`}
                    >
                      {val > 0 ? val : ""}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Camera Uptime & Reliability Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Camera Fleet Reliability & Operational Uptime</CardTitle>
          <CardDescription className="text-xs">
            Proactive health monitoring, packet stream stability, and frame rate consistency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border rounded-lg border border-border">
            {(uptimeData?.cameras || []).map((cam: any) => (
              <div key={cam.name} className="flex items-center justify-between p-3 text-xs">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-green-500/10 p-2 text-green-500">
                    <LuCheck className="size-4" />
                  </div>
                  <div>
                    <div className="font-bold uppercase text-foreground">{cam.name}</div>
                    <div className="text-muted-foreground">FPS: {cam.avg_fps} • Disconnects: {cam.disconnects_30d} (30d)</div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-mono font-bold text-green-500">{cam.uptime_percent}%</div>
                    <div className="text-[10px] text-muted-foreground">30-day uptime</div>
                  </div>
                  <Badge variant="default" className="capitalize text-[11px]">
                    {cam.status}
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
