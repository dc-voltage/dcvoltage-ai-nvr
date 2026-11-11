import { useState, useEffect } from "react";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  LuSparkles,
  LuLanguages,
  LuCpu,
  LuShieldCheck,
  LuCamera,
  LuScan,
  LuSend,
  LuHardDrive,
  LuCheck,
  LuChevronRight,
  LuChevronLeft,
  LuRefreshCw,
  LuPlay,
} from "react-icons/lu";

import Logo from "@/components/Logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import ActivityIndicator from "@/components/indicators/activity-indicator";

export default function SetupWizard() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const totalSteps = 7;

  // Form states
  const [selectedLanguage, setSelectedLanguage] = useState(i18n.language.startsWith("ml") ? "ml" : "en");
  const [selectedProfile, setSelectedProfile] = useState("B");
  const [adminUsername, setAdminUsername] = useState("admin");
  const [adminPassword, setAdminPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [telegramToken, setTelegramToken] = useState("");
  const [telegramChatId, setTelegramChatId] = useState("");
  const [isTestingTelegram, setIsTestingTelegram] = useState(false);
  const [storagePath, setStoragePath] = useState("/media/frigate/recordings");
  const [retentionDays, setRetentionDays] = useState(14);
  const [enableVault, setEnableVault] = useState(true);

  // Tracking toggles
  const [enabledFeatures, setEnabledFeatures] = useState<Record<string, boolean>>({
    person_tracking: true,
    vehicle_tracking: true,
    face_recognition: true,
    alpr: true,
    loitering: true,
    intrusion: true,
    camera_tampering: true,
    smoke_and_fire: true,
    fall_detection: false,
    package_detection: true,
  });

  // Camera test state
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [testRtspUrl, setTestRtspUrl] = useState("rtsp://admin:password@192.168.1.100:554/live");
  const [isTestingRtsp, setIsTestingRtsp] = useState(false);
  const [rtspResult, setRtspResult] = useState<any>(null);

  // Submitting
  const [isSaving, setIsSaving] = useState(false);

  // Fetch detected profile from backend
  const { data: profileResponse, isLoading: isLoadingProfile } = useSWR("/dcv/system/profile", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const hwData = profileResponse?.data;

  useEffect(() => {
    if (hwData?.recommended_profile) {
      setSelectedProfile(hwData.recommended_profile);
    }
  }, [hwData]);

  const changeLang = (lang: string) => {
    setSelectedLanguage(lang);
    i18n.changeLanguage(lang);
    toast.success(lang === "ml" ? "ഭാഷ മലയാളത്തിലേക്ക് മാറ്റി" : "Language switched to English");
  };

  const handleTestRtsp = async () => {
    setIsTestingRtsp(true);
    setRtspResult(null);
    try {
      const res = await axios.post("/dcv/cameras/test-stream", { url: testRtspUrl, timeout_sec: 4 });
      setRtspResult(res.data);
      if (res.data.success) {
        toast.success("RTSP stream connected successfully!");
      } else {
        toast.error(res.data.error || "Failed to connect to RTSP stream.");
      }
    } catch {
      toast.error("RTSP probe request failed.");
    } finally {
      setIsTestingRtsp(false);
    }
  };

  const handleDiscoverCameras = async () => {
    setIsDiscovering(true);
    try {
      const res = await axios.post("/dcv/cameras/discover?timeout=3.0");
      if (res.data.success) {
        setDiscoveredDevices(res.data.devices);
        toast.success(`Discovered ${res.data.count} ONVIF cameras.`);
      }
    } catch {
      toast.error("Camera discovery timed out.");
    } finally {
      setIsDiscovering(false);
    }
  };

  const handleTestTelegram = async () => {
    if (!telegramToken || !telegramChatId) {
      toast.error("Please enter both Bot Token and Chat ID.");
      return;
    }
    setIsTestingTelegram(true);
    try {
      await axios.post("/dcv/telegram/configure", {
        bot_token: telegramToken,
        chat_id: telegramChatId,
        enabled: true,
      });
      const res = await axios.post("/dcv/telegram/test");
      if (res.data.success) {
        toast.success("Telegram test alert sent successfully!");
      } else {
        toast.error("Failed to send Telegram test message.");
      }
    } catch {
      toast.error("Telegram API connection error.");
    } finally {
      setIsTestingTelegram(false);
    }
  };

  const handleCompleteSetup = async () => {
    if (adminPassword && adminPassword !== confirmPassword) {
      toast.error("Admin passwords do not match!");
      setStep(3);
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        language: selectedLanguage,
        profile: selectedProfile,
        admin_username: adminUsername,
        admin_password: adminPassword || undefined,
        telegram_token: telegramToken,
        telegram_chat_id: telegramChatId,
        storage_path: storagePath,
        retention_days: retentionDays,
        enable_vault: enableVault,
      };

      await axios.post("/dcv/system/wizard/apply", payload);
      toast.success("DC VOLTAGE AI NVR configuration completed!");
      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch {
      toast.error("Failed to apply initial configuration.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 md:p-8">
      {/* Top Branding Header */}
      <div className="flex flex-col items-center text-center mb-8">
        <Logo className="size-16 mb-3" />
        <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 bg-clip-text text-transparent">
          DC VOLTAGE AI NVR
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-400 mt-1 font-semibold">
          Intelligent Surveillance. Zero Blind Spots.
        </p>
        <div className="mt-2 text-xs text-slate-500">
          Guided Setup Wizard &amp; Hardware Provisioner • Step {step} of {totalSteps}
        </div>
      </div>

      {/* Main Wizard Card */}
      <Card className="w-full max-w-3xl bg-slate-900/90 border-slate-800 shadow-2xl backdrop-blur">
        {/* Progress Bar */}
        <div className="w-full bg-slate-800 h-1.5 rounded-t-lg overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-blue-600 h-full transition-all duration-300"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        {/* Step 1: Language Selection */}
        {step === 1 && (
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-cyan-400">
                <LuLanguages className="size-5" />
                <CardTitle className="text-xl">Language Selection / ഭാഷ തിരഞ്ഞെടുക്കുക</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Choose your preferred operating language. DC VOLTAGE AI NVR fully supports English and മലയാളം (Malayalam).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => changeLang("en")}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    selectedLanguage === "en"
                      ? "border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-2 ring-cyan-500/30"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">English</span>
                    {selectedLanguage === "en" && <LuCheck className="size-5 text-cyan-400" />}
                  </div>
                  <p className="text-xs text-slate-400">
                    Default international operational language for surveillance, alarms, and analytics.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => changeLang("ml")}
                  className={`p-6 rounded-xl border text-left transition-all ${
                    selectedLanguage === "ml"
                      ? "border-cyan-500 bg-cyan-950/40 text-cyan-200 ring-2 ring-cyan-500/30"
                      : "border-slate-800 bg-slate-900 hover:border-slate-700"
                  }`}
                >
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-lg">മലയാളം (Malayalam)</span>
                    {selectedLanguage === "ml" && <LuCheck className="size-5 text-cyan-400" />}
                  </div>
                  <p className="text-xs text-slate-400">
                    പൂർണ്ണ മലയാളം ഇന്റർഫേസ്, സുരക്ഷാ വിശകലനങ്ങൾ, തത്സമയ മുന്നറിയിപ്പുകൾ.
                  </p>
                </button>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 text-xs text-slate-400">
                <strong className="text-slate-200">Tip:</strong> You can also switch languages at any time from the top navigation bar or settings menu.
              </div>
            </CardContent>
          </div>
        )}

        {/* Step 2: Hardware Profile Detection */}
        {step === 2 && (
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-blue-400">
                <LuCpu className="size-5" />
                <CardTitle className="text-xl">Hardware Architecture &amp; Profile Selection</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Automated inspection of CPU, GPU, accelerators, and memory optimization tier.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isLoadingProfile ? (
                <div className="flex flex-col items-center justify-center p-8">
                  <ActivityIndicator />
                  <p className="text-xs text-slate-400 mt-2">Analyzing system hardware...</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase">Architecture</div>
                      <div className="font-semibold text-slate-200">{hwData?.architecture || "x86_64"}</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase">CPU Cores</div>
                      <div className="font-semibold text-slate-200">{hwData?.cpu_cores || 4} Threads</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase">Physical RAM</div>
                      <div className="font-semibold text-slate-200">{hwData?.total_ram_gb || 8} GB</div>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                      <div className="text-[11px] text-slate-400 uppercase">Free Storage</div>
                      <div className="font-semibold text-slate-200">{hwData?.free_disk_gb || 100} GB</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-300">Choose Deployment Profile:</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        {
                          id: "A",
                          name: "Profile A — Older PC / Laptop",
                          desc: "CPU-only inference, 256MB SHM, 3-5 FPS detection. Optimized for 2-4 cameras.",
                          badge: "Low Memory",
                        },
                        {
                          id: "B",
                          name: "Profile B — Standard Desktop",
                          desc: "VAAPI / Coral TPU, 512MB SHM, 5-10 FPS detection. Optimized for 4-8 cameras.",
                          badge: "Recommended",
                        },
                        {
                          id: "C",
                          name: "Profile C — High-Performance Server",
                          desc: "NVIDIA CUDA / TensorRT, 1024MB SHM, 15-30 FPS detection. For 8-16 cameras.",
                          badge: "GPU Accelerated",
                        },
                        {
                          id: "D",
                          name: "Profile D — Enterprise AI Cluster",
                          desc: "High VRAM NVIDIA GPUs + Ollama sidecar, 2048MB SHM, unlimited concurrent models.",
                          badge: "Enterprise",
                        },
                      ].map((p) => (
                        <div
                          key={p.id}
                          onClick={() => setSelectedProfile(p.id)}
                          className={`p-4 rounded-lg border cursor-pointer transition-all ${
                            selectedProfile === p.id
                              ? "border-blue-500 bg-blue-950/40 text-blue-200 ring-2 ring-blue-500/30"
                              : "border-slate-800 bg-slate-950/60 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-semibold text-sm">{p.name}</span>
                            <Badge variant="outline" className="text-[10px] border-blue-500/40 text-blue-400">
                              {p.badge}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </div>
        )}

        {/* Step 3: Admin & Security Setup */}
        {step === 3 && (
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-indigo-400">
                <LuShieldCheck className="size-5" />
                <CardTitle className="text-xl">Administrator &amp; Role-Based Access Control</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Configure primary administrative credentials and review security access policies.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Admin Username</label>
                <Input
                  value={adminUsername}
                  onChange={(e) => setAdminUsername(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                  placeholder="admin"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Admin Password</label>
                  <Input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                    placeholder="••••••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-300">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-slate-950 border-slate-800 text-slate-100"
                    placeholder="••••••••••••"
                  />
                </div>
              </div>

              <div className="p-4 rounded-lg bg-slate-950/60 border border-slate-800 space-y-2">
                <div className="text-xs font-semibold text-slate-200">Security Policies (RBAC)</div>
                <div className="text-xs text-slate-400 leading-relaxed">
                  • <strong>Admin:</strong> Full control over cameras, AI detectors, configs, storage vault, and users.
                  <br />• <strong>Operator:</strong> PTZ control, event review, AI tracking status, and live monitoring.
                  <br />• <strong>Viewer:</strong> Read-only access to authorized live streams and past events.
                </div>
              </div>
            </CardContent>
          </div>
        )}

        {/* Step 4: Camera Discovery & Stream Setup */}
        {step === 4 && (
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-cyan-400">
                <LuCamera className="size-5" />
                <CardTitle className="text-xl">Universal Camera Discovery &amp; Stream Test</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Auto-discover ONVIF Profile S/T cameras or test RTSP streaming from any IP camera manufacturer.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={handleDiscoverCameras}
                  disabled={isDiscovering}
                  className="bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-2"
                >
                  {isDiscovering ? <ActivityIndicator /> : <LuRefreshCw className="size-4" />}
                  Scan Local Subnet (ONVIF Probe)
                </Button>
                <div className="text-xs text-slate-400 flex items-center">
                  Supports Hikvision, Dahua, CP Plus, Tapo, Reolink, Axis, Imou, and generic RTSP.
                </div>
              </div>

              {discoveredDevices.length > 0 && (
                <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                  <div className="text-xs font-semibold text-cyan-400">Discovered Cameras ({discoveredDevices.length})</div>
                  {discoveredDevices.map((dev, idx) => (
                    <div key={idx} className="flex justify-between items-center text-xs p-2 bg-slate-900 rounded">
                      <span className="font-semibold text-slate-200">{dev.name || "IP Camera"} ({dev.ip})</span>
                      <Badge variant="outline" className="text-[10px] text-cyan-400 border-cyan-500/40">
                        {dev.hardware || "ONVIF"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-slate-300">Quick RTSP Stream Tester</label>
                <div className="flex gap-2">
                  <Input
                    value={testRtspUrl}
                    onChange={(e) => setTestRtspUrl(e.target.value)}
                    placeholder="rtsp://user:pass@192.168.1.50:554/stream"
                    className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
                  />
                  <Button
                    onClick={handleTestRtsp}
                    disabled={isTestingRtsp}
                    variant="outline"
                    className="border-slate-700 text-slate-200 hover:bg-slate-800"
                  >
                    {isTestingRtsp ? <ActivityIndicator /> : <LuPlay className="size-4" />}
                  </Button>
                </div>
              </div>

              {rtspResult && (
                <div className="p-3 rounded bg-slate-950 border border-slate-800 text-xs">
                  {rtspResult.success ? (
                    <div className="text-emerald-400 flex items-center gap-2">
                      <LuCheck className="size-4" /> Stream Active: {rtspResult.resolution} @ {rtspResult.fps} FPS ({rtspResult.codec})
                    </div>
                  ) : (
                    <div className="text-rose-400">Error: {rtspResult.error || "Connection failed"}</div>
                  )}
                </div>
              )}
            </CardContent>
          </div>
        )}

        {/* Step 5: Advanced AI Tracking Capabilities */}
        {step === 5 && (
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-emerald-400">
                <LuScan className="size-5" />
                <CardTitle className="text-xl">30 Advanced AI Tracking Capabilities</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Enable or fine-tune multi-object tracking, ALPR, facial recognition, and behavioral analytics.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
                {[
                  { key: "person_tracking", label: "Person Detection & Tracking", desc: "Stable track IDs and bounding boxes" },
                  { key: "vehicle_tracking", label: "Vehicle Detection & Tracking", desc: "Cars, trucks, buses, motorcycles" },
                  { key: "face_recognition", label: "Face Recognition (Consent-Enrolled)", desc: "1:N biometric gallery match" },
                  { key: "alpr", label: "Automatic License Plate Recognition", desc: "ALPR plate OCR and allow/deny lists" },
                  { key: "loitering", label: "Loitering Detection", desc: "Dwell time threshold monitoring" },
                  { key: "intrusion", label: "Restricted Zone Intrusion", desc: "Polygonal fence breach alarms" },
                  { key: "camera_tampering", label: "Camera Tampering / Occlusion", desc: "Spray paint, redirection, defocus" },
                  { key: "smoke_and_fire", label: "Smoke & Fire Hazard Detection", desc: "Visual combustion event alerts" },
                  { key: "package_detection", label: "Delivery Person & Package Tracking", desc: "Porch parcel drop-off verification" },
                  { key: "fall_detection", label: "Fall & Rapid Downward Motion", desc: "Elderly safety and emergency triggers" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <div className="pr-2">
                      <div className="text-xs font-semibold text-slate-200">{item.label}</div>
                      <div className="text-[11px] text-slate-500">{item.desc}</div>
                    </div>
                    <Switch
                      checked={enabledFeatures[item.key] ?? false}
                      onCheckedChange={(checked) =>
                        setEnabledFeatures((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </div>
        )}

        {/* Step 6: Telegram Bot & Notification Alerts */}
        {step === 6 && (
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-sky-400">
                <LuSend className="size-5" />
                <CardTitle className="text-xl">Telegram Bot &amp; Instant Notifications</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Deliver real-time security snapshots and MP4 event clips directly to your smartphone or security team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Telegram Bot Token (from @BotFather)</label>
                <Input
                  value={telegramToken}
                  onChange={(e) => setTelegramToken(e.target.value)}
                  placeholder="123456789:ABCdefGHIjklMNOpqrSTUvwxYZ"
                  className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Telegram Chat ID / Channel ID</label>
                <Input
                  value={telegramChatId}
                  onChange={(e) => setTelegramChatId(e.target.value)}
                  placeholder="-1001234567890 or 987654321"
                  className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
                />
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleTestTelegram}
                  disabled={isTestingTelegram || !telegramToken}
                  variant="outline"
                  className="border-sky-600/40 text-sky-300 hover:bg-sky-950 flex items-center gap-2"
                >
                  {isTestingTelegram ? <ActivityIndicator /> : <LuSend className="size-4" />}
                  Send Test Alert to Telegram
                </Button>
              </div>

              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs text-slate-400">
                <strong className="text-slate-200">Format:</strong> Notifications include Camera name, Detection Type, Confidence percentage, timestamp, and attached high-resolution snapshot.
              </div>
            </CardContent>
          </div>
        )}

        {/* Step 7: Storage Vault & Final Activation */}
        {step === 7 && (
          <div>
            <CardHeader>
              <div className="flex items-center gap-2 text-amber-400">
                <LuHardDrive className="size-5" />
                <CardTitle className="text-xl">Storage Vault &amp; Tamper-Evident Security</CardTitle>
              </div>
              <CardDescription className="text-slate-400">
                Configure primary video recording retention and SHA-256 evidence protection.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Primary Storage Directory</label>
                <Input
                  value={storagePath}
                  onChange={(e) => setStoragePath(e.target.value)}
                  className="bg-slate-950 border-slate-800 text-slate-100 font-mono text-xs"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">Continuous Retention Policy (Days)</label>
                <Input
                  type="number"
                  min={1}
                  max={365}
                  value={retentionDays}
                  onChange={(e) => setRetentionDays(parseInt(e.target.value) || 14)}
                  className="bg-slate-950 border-slate-800 text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Tamper-Evident SHA-256 Evidence Vault</div>
                  <div className="text-[11px] text-slate-500">
                    Generates verifiable cryptographic checksums for chain-of-custody court exports.
                  </div>
                </div>
                <Switch checked={enableVault} onCheckedChange={setEnableVault} />
              </div>

              <div className="p-4 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-3">
                <LuSparkles className="size-6 text-emerald-400 shrink-0" />
                <div>
                  <strong>Ready to Launch:</strong> All settings will be saved to DC VOLTAGE AI NVR. You can modify any setting later via the Settings dashboard.
                </div>
              </div>
            </CardContent>
          </div>
        )}

        {/* Navigation Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-800 bg-slate-950/40 rounded-b-lg">
          <Button
            variant="outline"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1 || isSaving}
            className="border-slate-800 text-slate-300 hover:bg-slate-800 flex items-center gap-1"
          >
            <LuChevronLeft className="size-4" /> Back
          </Button>

          {step < totalSteps ? (
            <Button
              onClick={() => setStep((s) => Math.min(totalSteps, s + 1))}
              className="bg-cyan-600 hover:bg-cyan-500 text-white flex items-center gap-1"
            >
              Next Step <LuChevronRight className="size-4" />
            </Button>
          ) : (
            <Button
              onClick={handleCompleteSetup}
              disabled={isSaving}
              className="bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-2 font-semibold"
            >
              {isSaving ? <ActivityIndicator /> : <LuCheck className="size-5" />}
              Save &amp; Launch DC VOLTAGE NVR
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
