"""DC VOLTAGE AI NVR - Automated API & Analytics Test Suite
Verifies all DC VOLTAGE endpoints, 30 tracking capabilities, AI Assistant (English & Malayalam),
Telegram alerts, Storage Vault, and Security RBAC.
"""

import unittest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from frigate.api import dcv


class TestDcvApi(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.app = FastAPI(title="DC VOLTAGE AI NVR Test App")
        cls.app.include_router(dcv.router)
        cls.client = TestClient(cls.app)

    # 1. Universal Camera Tests
    def test_camera_health(self):
        res = self.client.get("/dcv/cameras/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertIn("cameras", data)

    def test_camera_stream_probe(self):
        # Test stream endpoint format check
        res = self.client.post("/dcv/cameras/test-stream", json={"url": "rtsp://127.0.0.1:8554/live", "timeout_sec": 1})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("success", data)

    def test_camera_ptz(self):
        res = self.client.post("/dcv/cameras/ptz/move", json={"camera_name": "front_gate", "action": "move_up", "speed": 0.8})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["action"], "move_up")

    # 2. 30 Advanced AI Tracking Capabilities
    def test_tracking_rules_count_30(self):
        res = self.client.get("/dcv/tracking/rules")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["total_rules"], 30)
        # Verify presence of key analytics
        rules = data["rules"]
        self.assertIn("person_tracking", rules)
        self.assertIn("vehicle_tracking", rules)
        self.assertIn("face_recognition", rules)
        self.assertIn("alpr", rules)
        self.assertIn("loitering", rules)
        self.assertIn("intrusion", rules)
        self.assertIn("smoke_and_fire", rules)
        self.assertIn("camera_tampering", rules)
        self.assertIn("package_detection", rules)

    def test_rule_update(self):
        res = self.client.post("/dcv/tracking/rules/update", json={"rule_key": "loitering", "dwell_sec": 120, "enabled": True})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["updated_rule"]["dwell_sec"], 120)

    def test_face_enrollment_with_consent(self):
        res = self.client.post("/dcv/tracking/faces/enroll", json={"name": "Alice Resident", "consent_given": True, "notes": "Authorized Entry"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        face_id = data["enrolled_face"]["id"]

        # Verify face is in list
        list_res = self.client.get("/dcv/tracking/faces/enrolled")
        self.assertEqual(list_res.status_code, 200)
        faces = list_res.json()["faces"]
        self.assertTrue(any(f["id"] == face_id for f in faces))

        # Cleanup
        del_res = self.client.delete(f"/dcv/tracking/faces/enrolled/{face_id}")
        self.assertEqual(del_res.status_code, 200)

    def test_alpr_plate_registry(self):
        res = self.client.post("/dcv/tracking/alpr/plates", json={"plate_number": "KL-07-ZZ-9999", "list_type": "allow", "description": "Director Vehicle"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])

        list_res = self.client.get("/dcv/tracking/alpr/plates")
        self.assertEqual(list_res.status_code, 200)
        plates = [p["plate_number"] for p in list_res.json()["plates"]]
        self.assertIn("KL-07-ZZ-9999", plates)

    # 3. Intelligent AI Assistant (English & Malayalam)
    def test_assistant_query_english(self):
        res = self.client.post("/dcv/assistant/query", json={"query": "What happened at the front gate today?", "language": "en"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["language_detected"], "en")
        self.assertIn("DC VOLTAGE", data["answer"])

    def test_assistant_query_malayalam(self):
        res = self.client.post("/dcv/assistant/query", json={"query": "ഇന്ന് ഏതൊക്കെ ആളുകൾ വന്നു?", "language": "ml"})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        self.assertEqual(data["language_detected"], "ml")
        self.assertIn("ഡിസി വോൾട്ടേജ്", data["answer"])

    def test_assistant_daily_briefing(self):
        res = self.client.get("/dcv/assistant/daily-briefing?language=en")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])

    # 4. Telegram Alerts
    def test_telegram_config(self):
        res = self.client.get("/dcv/telegram/config")
        self.assertEqual(res.status_code, 200)
        self.assertTrue(res.json()["success"])

        update_res = self.client.post("/dcv/telegram/config", json={
            "enabled": True,
            "bot_token": "123456789:ABCdefGHIjklMNOpqrsTUVwxyz",
            "chat_ids": ["-1001234567890"],
            "send_snapshots": True,
            "send_clips": True,
            "min_confidence": 0.80,
        })
        self.assertEqual(update_res.status_code, 200)
        self.assertTrue(update_res.json()["success"])

    # 5. Security Analytics & Trends
    def test_analytics_endpoints(self):
        summary = self.client.get("/dcv/analytics/summary")
        self.assertEqual(summary.status_code, 200)
        self.assertIn("label_distribution", summary.json())

        heatmap = self.client.get("/dcv/analytics/heatmap")
        self.assertEqual(heatmap.status_code, 200)
        self.assertEqual(len(heatmap.json()["matrix"]), 7)

        uptime = self.client.get("/dcv/analytics/uptime")
        self.assertEqual(uptime.status_code, 200)
        self.assertGreater(uptime.json()["overall_uptime"], 90.0)

    # 6. Storage Vault & Evidence Locker
    def test_storage_usage_and_locking(self):
        usage = self.client.get("/dcv/storage/usage")
        self.assertEqual(usage.status_code, 200)
        self.assertIn("total_gb", usage.json())

        lock = self.client.post("/dcv/storage/lock-event", json={"event_id": "test_evt_101", "reason": "Incident investigation"})
        self.assertEqual(lock.status_code, 200)
        self.assertTrue(lock.json()["success"])

        unlock = self.client.post("/dcv/storage/unlock-event?event_id=test_evt_101")
        self.assertEqual(unlock.status_code, 200)
        self.assertTrue(unlock.json()["success"])

    def test_tamper_evident_export(self):
        res = self.client.post("/dcv/storage/export-tamper-evident", json={"event_id": "test_evt_202", "operator_name": "SecurityOfficer1"})
        self.assertEqual(res.status_code, 200)
        data = res.json()["package"]
        self.assertIn("sha256_integrity_hash", data)
        self.assertEqual(len(data["sha256_integrity_hash"]), 64)
        self.assertTrue(data["chain_of_custody_verified"])

    # 7. Security RBAC & Audit
    def test_audit_logs(self):
        log_res = self.client.post("/dcv/security/audit-logs", json={
            "action": "CONFIG_UPDATE",
            "user": "admin",
            "ip_address": "192.168.1.100",
            "details": "Modified camera detection settings",
            "severity": "info",
        })
        self.assertEqual(log_res.status_code, 200)

        get_res = self.client.get("/dcv/security/audit-logs")
        self.assertEqual(get_res.status_code, 200)
        logs = get_res.json()["logs"]
        self.assertTrue(any(l["action"] == "CONFIG_UPDATE" for l in logs))

    # 8. System Profile & Guided Setup Wizard
    def test_system_profile(self):
        res = self.client.get("/dcv/system/profile")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["success"])
        profile_data = data["data"]
        self.assertIn("recommended_profile", profile_data)
        self.assertIn(profile_data["recommended_profile"], ["A", "B", "C", "D"])
        self.assertEqual(profile_data["branding"]["developer"], "DC VOLTAGE NETWORK")

    def test_wizard_apply_and_status(self):
        apply_res = self.client.post("/dcv/system/wizard/apply", json={
            "language": "en",
            "profile": "B",
            "admin_username": "admin",
            "telegram_token": "test_token_123",
            "storage_path": "/media/frigate/recordings",
            "retention_days": 14,
            "enable_vault": True
        })
        self.assertEqual(apply_res.status_code, 200)
        self.assertTrue(apply_res.json()["success"])

        status_res = self.client.get("/dcv/system/wizard/status")
        self.assertEqual(status_res.status_code, 200)
        self.assertTrue(status_res.json()["completed"])
        self.assertEqual(status_res.json()["configuration"]["language"], "en")


if __name__ == "__main__":
    unittest.main()
