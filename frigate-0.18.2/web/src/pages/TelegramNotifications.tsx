import { useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { toast } from "sonner";
import {
  LuSend,
  LuBot,
  LuPlus,
  LuEye,
  LuEyeOff,
} from "react-icons/lu";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import ActivityIndicator from "@/components/indicators/activity-indicator";

export default function TelegramNotifications() {
  const [showToken, setShowToken] = useState(false);
  const [newChatId, setNewChatId] = useState("");
  const [isSendingTest, setIsSendingTest] = useState(false);

  const { data: telegramData, mutate: refreshConfig } = useSWR("/dcv/telegram/config", (url) =>
    axios.get(url).then((res) => res.data)
  );

  const config = telegramData?.config || {};

  const handleUpdate = async (updates: Record<string, any>) => {
    try {
      await axios.post("/dcv/telegram/config", {
        ...config,
        ...updates,
      });
      refreshConfig();
      toast.success("Telegram settings updated.");
    } catch {
      toast.error("Failed to update Telegram settings.");
    }
  };

  const handleAddChatId = () => {
    if (!newChatId.trim()) return;
    const current = config.chat_ids || [];
    if (!current.includes(newChatId.trim())) {
      handleUpdate({ chat_ids: [...current, newChatId.trim()] });
    }
    setNewChatId("");
  };

  const handleRemoveChatId = (cid: string) => {
    const current = config.chat_ids || [];
    handleUpdate({ chat_ids: current.filter((id: string) => id !== cid) });
  };

  const handleSendTest = async () => {
    setIsSendingTest(true);
    try {
      const res = await axios.post("/dcv/telegram/test", {});
      if (res.data.success) {
        toast.success("Test alert delivered to Telegram!");
      } else {
        toast.error("Telegram delivery failed.");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Telegram test error.");
    } finally {
      setIsSendingTest(false);
    }
  };

  return (
    <div className="flex size-full flex-col gap-6 overflow-y-auto p-6">
      {/* Header Banner */}
      <div className="flex flex-col justify-between gap-4 border-b border-border pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2 text-primary">
              <LuBot className="size-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Telegram Bot & Mobile Alerts</h1>
              <p className="text-xs text-muted-foreground">
                DC VOLTAGE NETWORK • First-Class Real-Time Snapshot & Video Clip Alerts Delivered to Telegram
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSendTest} disabled={isSendingTest}>
            {isSendingTest ? <ActivityIndicator className="mr-2 size-4" /> : <LuSend className="mr-2 size-4" />}
            Send Test Alert
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Telegram Configuration */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Telegram Bot Credentials</CardTitle>
                  <CardDescription className="text-xs">
                    Configure your official Telegram Bot Token generated from @BotFather
                  </CardDescription>
                </div>
                <Switch
                  checked={config.enabled}
                  onCheckedChange={(val) => handleUpdate({ enabled: val })}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold">Bot API Token</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    type={showToken ? "text" : "password"}
                    value={config.bot_token || ""}
                    onChange={(e) => handleUpdate({ bot_token: e.target.value })}
                    placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowToken(!showToken)}
                  >
                    {showToken ? <LuEyeOff className="size-4" /> : <LuEye className="size-4" />}
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold">Recipient Chat IDs / Groups</label>
                <div className="flex gap-2 mt-1">
                  <Input
                    value={newChatId}
                    onChange={(e) => setNewChatId(e.target.value)}
                    placeholder="e.g. -1001234567890 or @username"
                    className="font-mono text-xs"
                  />
                  <Button size="sm" onClick={handleAddChatId}>
                    <LuPlus className="mr-1 size-4" /> Add
                  </Button>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {(config.chat_ids || []).map((cid: string) => (
                    <Badge key={cid} variant="secondary" className="flex items-center gap-1 font-mono text-xs">
                      {cid}
                      <button onClick={() => handleRemoveChatId(cid)} className="ml-1 text-destructive hover:opacity-80">
                        ×
                      </button>
                    </Badge>
                  ))}
                  {(!config.chat_ids || config.chat_ids.length === 0) && (
                    <span className="text-xs text-muted-foreground">No chat recipients registered yet.</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Media Delivery & Filtering</CardTitle>
              <CardDescription className="text-xs">
                Control image snapshots, video clip attachments, and sensitivity thresholds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Attach Event Snapshots (JPEG)</div>
                  <div className="text-[11px] text-muted-foreground">Sends high-resolution image with bounding box</div>
                </div>
                <Switch
                  checked={config.send_snapshots}
                  onCheckedChange={(val) => handleUpdate({ send_snapshots: val })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold">Attach Video Clips (MP4)</div>
                  <div className="text-[11px] text-muted-foreground">Transfers short 10-second video clip of event</div>
                </div>
                <Switch
                  checked={config.send_clips}
                  onCheckedChange={(val) => handleUpdate({ send_clips: val })}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold">Minimum Confidence:</span>
                  <span className="font-mono font-bold text-primary">
                    {Math.round((config.min_confidence || 0.75) * 100)}%
                  </span>
                </div>
                <Slider
                  defaultValue={[(config.min_confidence || 0.75) * 100]}
                  max={95}
                  min={50}
                  step={5}
                  onValueCommit={(val) => handleUpdate({ min_confidence: val[0] / 100 })}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Live Message Preview */}
        <div className="space-y-6">
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base text-primary">Live Telegram Message Preview</CardTitle>
              <CardDescription className="text-xs">
                How notifications will appear on operators' mobile devices and desktop Telegram clients
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-border bg-background p-4 shadow-sm font-sans space-y-3">
                <div className="flex items-center gap-2 border-b border-border pb-2">
                  <div className="rounded-full bg-blue-500 p-1 text-white">
                    <LuBot className="size-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold">DC VOLTAGE AI NVR Bot</div>
                    <div className="text-[10px] text-muted-foreground">Telegram Notification Service</div>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="font-bold text-foreground">🚨 PERSON DETECTED at FRONT GATE</div>
                  <div className="rounded bg-muted/50 p-2 font-mono text-[11px] space-y-1">
                    <div><b>Product:</b> DC VOLTAGE AI NVR</div>
                    <div><b>Camera:</b> Front Gate</div>
                    <div><b>Object:</b> Person (Delivery Courier)</div>
                    <div><b>Time:</b> 10:45:12 PM</div>
                    <div><b>Confidence:</b> 96.2%</div>
                  </div>
                  <div className="text-[10px] italic text-muted-foreground">
                    Attached: 1x high-resolution snapshot • 1x authorized video clip (10s)
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
