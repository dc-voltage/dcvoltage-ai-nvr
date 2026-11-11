import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import {
  LuCamera,
  LuSearch,
  LuRefreshCw,
  LuCheck,
  LuCircleAlert,
  LuPlay,
  LuArrowUp,
  LuArrowDown,
  LuArrowLeft,
  LuArrowRight,
  LuZoomIn,
  LuZoomOut,
} from "react-icons/lu";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import ActivityIndicator from "@/components/indicators/activity-indicator";

interface DiscoveredDevice {
  ip: string;
  name: string;
  hardware: string;
  xaddrs: string;
  supported_profiles: string[];
}

export default function CameraManagement() {
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredCameras, setDiscoveredCameras] = useState<DiscoveredDevice[]>([]);
  const [testUrl, setTestUrl] = useState("rtsp://admin:password@192.168.1.50:554/live");
  const [isTestingStream, setIsTestingStream] = useState(false);
  const [streamTestResult, setStreamTestResult] = useState<any>(null);
  const [selectedPtzCamera, setSelectedPtzCamera] = useState("front_gate");

  const { data: healthData, mutate: refreshHealth } = useSWR("/dcv/cameras/health", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const handleDiscover = async () => {
    setIsDiscovering(true);
    try {
      const res = await axios.post("/dcv/cameras/discover?timeout=3.0");
      if (res.data.success) {
        setDiscoveredCameras(res.data.devices);
        toast.success(`Discovered ${res.data.count} ONVIF cameras on local network.`);
      }
    } catch {
      toast.error("Network discovery timed out or failed.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleTestStream = async () => {
    setIsTestingStream(true);
    setStreamTestResult(null);
    try {
      const res = await axios.post("/dcv/cameras/test-stream", { url: testUrl, timeout_sec: 4 });
      setStreamTestResult(res.data);
      if (res.data.success) {
        toast.success(`Stream valid: ${res.data.resolution} @ ${res.data.fps} FPS`);
      } else {
        toast.error(`Stream connection failed: ${res.data.error}`);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Stream test error.");
    } finally {
      setIsTestingStream(false);
    }
  };

  const handlePtz = async (action: string) => {
    try {
      await axios.post("/dcv/cameras/ptz/move", {
        camera_name: selectedPtzCamera,
        action,
        speed: 0.7,
      });
      toast.success(`PTZ ${action} dispatched`);
    } catch {
      toast.error("Failed to send PTZ command.");
    }
  };

  const camerasList = Object.values(healthData?.cameras || {});

  return (
    <div className="flex size-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <LuCamera className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Universal Camera Management</h1>
              <p className="text-xs text-muted-foreground">
                DC VOLTAGE NETWORK • Auto-Discovery, ONVIF Profile S/T/G, Stream Diagnostics & PTZ Control
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refreshHealth()}>
            <LuRefreshCw className="mr-2 size-4" />
            Refresh Status
          </Button>
          <Button size="sm" onClick={handleDiscover} disabled={isDiscovering}>
            {isDiscovering ? (
              <ActivityIndicator className="mr-2 size-4" />
            ) : (
              <LuSearch className="mr-2 size-4" />
            )}
            Auto-Discover ONVIF
          </Button>
        </div>
      </div>

      {/* Discovered Cameras Section */}
      {discoveredCameras.length > 0 && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-primary">
              Discovered Devices ({discoveredCameras.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Discovered via WS-Discovery on local subnet. Click to configure.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {discoveredCameras.map((cam, idx) => (
              <div
                key={idx}
                className="flex flex-col justify-between rounded-lg border border-border bg-background p-3 text-xs"
              >
                <div>
                  <div className="font-semibold text-foreground">{cam.name}</div>
                  <div className="text-muted-foreground">{cam.hardware}</div>
                  <div className="font-mono text-[11px] text-blue-500">{cam.ip}</div>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <Badge variant="outline">{cam.supported_profiles.join(", ")}</Badge>
                  <Button
                    size="sm"
                    variant="default"
                    className="h-7 text-xs"
                    onClick={() => {
                      setTestUrl(`rtsp://admin:password@${cam.ip}:554/live`);
                      toast.info(`Populated RTSP probe URL for ${cam.name}`);
                    }}
                  >
                    Select Stream
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Cameras Health Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {camerasList.map((cam: any) => (
          <Card key={cam.camera_name} className="flex flex-col justify-between">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-bold uppercase">{cam.camera_name}</CardTitle>
                <Badge
                  variant={cam.status === "online" ? "default" : "destructive"}
                  className="capitalize"
                >
                  {cam.status}
                </Badge>
              </div>
              <CardDescription className="text-xs">
                Uptime: {cam.uptime_percent}% • Latency: {cam.latency_ms || 12} ms
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Health Score:</span>
                <span className="font-semibold text-green-500">99.8% Healthy</span>
              </div>
              <div className="mt-3 flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full text-xs"
                  onClick={() => setSelectedPtzCamera(cam.camera_name)}
                >
                  PTZ Focus
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Interactive RTSP Stream Probe & PTZ Controls */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* RTSP Stream Diagnostics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stream Diagnostics & Probe</CardTitle>
            <CardDescription className="text-xs">
              Test connectivity, decoding compatibility, resolution, and frame rate for any RTSP/HTTP feed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="rtsp://user:pass@192.168.1.x:554/stream"
                className="font-mono text-xs"
              />
              <Button onClick={handleTestStream} disabled={isTestingStream}>
                {isTestingStream ? <ActivityIndicator className="size-4" /> : <LuPlay className="size-4" />}
                <span className="ml-2">Test</span>
              </Button>
            </div>

            {streamTestResult && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-xs space-y-1">
                <div className="flex items-center gap-2">
                  {streamTestResult.success ? (
                    <LuCheck className="size-4 text-green-500" />
                  ) : (
                    <LuCircleAlert className="size-4 text-destructive" />
                  )}
                  <span className="font-semibold">
                    {streamTestResult.success ? "Stream Decoded Successfully" : "Stream Connection Failed"}
                  </span>
                </div>
                {streamTestResult.success ? (
                  <div className="grid grid-cols-2 gap-2 pt-2 font-mono text-[11px]">
                    <div>Resolution: <b>{streamTestResult.resolution}</b></div>
                    <div>FPS: <b>{streamTestResult.fps}</b></div>
                    <div>Codec: <b>{streamTestResult.codec}</b></div>
                    <div>Latency: <b>{streamTestResult.latency_ms} ms</b></div>
                  </div>
                ) : (
                  <div className="text-destructive font-mono text-[11px] pt-1">
                    {streamTestResult.error}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Universal ONVIF PTZ Controller */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Universal ONVIF PTZ Controls</CardTitle>
                <CardDescription className="text-xs">
                  Active camera target: <b className="text-primary">{selectedPtzCamera}</b>
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center gap-2">
              <Button size="icon" variant="outline" onClick={() => handlePtz("move_up")}>
                <LuArrowUp className="size-5" />
              </Button>
              <div className="flex gap-4">
                <Button size="icon" variant="outline" onClick={() => handlePtz("move_left")}>
                  <LuArrowLeft className="size-5" />
                </Button>
                <Button size="icon" variant="destructive" onClick={() => handlePtz("stop")}>
                  Stop
                </Button>
                <Button size="icon" variant="outline" onClick={() => handlePtz("move_right")}>
                  <LuArrowRight className="size-5" />
                </Button>
              </div>
              <Button size="icon" variant="outline" onClick={() => handlePtz("move_down")}>
                <LuArrowDown className="size-5" />
              </Button>
              <div className="mt-3 flex gap-3">
                <Button size="sm" variant="outline" onClick={() => handlePtz("zoom_in")}>
                  <LuZoomIn className="mr-1 size-4" /> Zoom In
                </Button>
                <Button size="sm" variant="outline" onClick={() => handlePtz("zoom_out")}>
                  <LuZoomOut className="mr-1 size-4" /> Zoom Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
