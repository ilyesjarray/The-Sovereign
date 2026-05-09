#!/usr/bin/env python3
"""
=====================================================
THE SOVEREIGN — USSD Ooredoo Activation Daemon
=====================================================
A secure, local Python daemon that:
1. Polls Supabase for pending activation requests
2. Executes USSD recharge codes via ADB on a connected Android phone
3. Reads the USSD response from the phone's screen via UI dump
4. Updates the activation status back to Supabase

Requirements:
- Python 3.11+
- Android phone with USB Debugging enabled
- ADB installed and in PATH
- Supabase service_role key (NOT anon key)

Usage:
    python sovereign_daemon.py              # Normal mode
    python sovereign_daemon.py --dry-run    # Simulate without ADB
    python sovereign_daemon.py --once       # Process one task and exit
"""

import os
import sys
import time
import signal
import logging
import subprocess
import xml.etree.ElementTree as ET
from pathlib import Path
from datetime import datetime
from typing import Optional, Dict, Tuple

from dotenv import load_dotenv
from supabase import create_client, Client

# =====================================================
# CONFIGURATION
# =====================================================

# Load environment variables from .env file
load_dotenv(Path(__file__).parent / ".env")

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
ADB_PATH = os.getenv("ADB_PATH", "adb")
POLL_INTERVAL = int(os.getenv("POLL_INTERVAL", "5"))
USSD_WAIT_TIME = int(os.getenv("USSD_WAIT_TIME", "7"))
COOLDOWN_TIME = int(os.getenv("COOLDOWN_TIME", "5"))
USSD_TEMPLATE = os.getenv("USSD_TEMPLATE", "*101*{pin}#")

# USSD response keywords for result detection
SUCCESS_KEYWORDS = [
    "successful", "successfully", "recharged", "recharge successful",
    "تم الشحن", "بنجاح", "تمت العملية", "شحن ناجح",
    "accepted", "completed", "confirmed",
    "your balance", "new balance", "solde",
]

FAILURE_KEYWORDS = [
    "invalid", "incorrect", "wrong", "expired",
    "already used", "used", "error", "failed",
    "غير صالح", "خاطئ", "منتهي", "مستعمل",
    "try again", "not valid", "rejected",
    "connection problem", "service unavailable",
]

# Local temp directory for UI dumps
DUMP_DIR = Path(__file__).parent / "tmp"
DUMP_DIR.mkdir(exist_ok=True)

# =====================================================
# LOGGING SETUP
# =====================================================

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(Path(__file__).parent / "daemon.log", encoding="utf-8"),
    ],
)
logger = logging.getLogger("sovereign_daemon")


# =====================================================
# ADB CONTROLLER
# =====================================================

class ADBController:
    """
    Controls an Android phone via ADB (Android Debug Bridge).
    Handles USSD execution, screen reading, and dialog dismissal.
    """

    def __init__(self, adb_path: str = "adb", dry_run: bool = False):
        self.adb = adb_path
        self.dry_run = dry_run

    def _run_adb(self, args: list[str], timeout: int = 15) -> Tuple[bool, str]:
        """Execute an ADB command and return (success, output)."""
        cmd = [self.adb] + args
        logger.debug(f"ADB CMD: {' '.join(cmd)}")

        if self.dry_run:
            logger.info(f"[DRY RUN] Would execute: {' '.join(cmd)}")
            return True, "[DRY RUN] Simulated success"

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding="utf-8",
                errors="replace",
            )
            output = result.stdout.strip()
            if result.returncode != 0:
                error_msg = result.stderr.strip() or output
                logger.warning(f"ADB error (rc={result.returncode}): {error_msg}")
                return False, error_msg
            return True, output
        except subprocess.TimeoutExpired:
            logger.error(f"ADB command timed out after {timeout}s: {' '.join(cmd)}")
            return False, "ADB command timed out"
        except FileNotFoundError:
            logger.error(f"ADB binary not found at: {self.adb}")
            return False, "ADB binary not found"
        except Exception as e:
            logger.error(f"ADB unexpected error: {e}")
            return False, str(e)

    def is_device_connected(self) -> bool:
        """Check if an Android device is connected and online."""
        success, output = self._run_adb(["devices"])
        if not success:
            return False

        # Parse 'adb devices' output: skip header line, look for 'device' status
        lines = output.strip().split("\n")
        for line in lines[1:]:  # Skip "List of devices attached"
            parts = line.strip().split("\t")
            if len(parts) >= 2 and parts[1] == "device":
                logger.info(f"Device connected: {parts[0]}")
                return True

        # Check for common issues
        for line in lines[1:]:
            parts = line.strip().split("\t")
            if len(parts) >= 2:
                if parts[1] == "offline":
                    logger.warning(f"Device {parts[0]} is OFFLINE — reconnect USB")
                elif parts[1] == "unauthorized":
                    logger.warning(f"Device {parts[0]} is UNAUTHORIZED — accept USB debugging prompt on phone")

        return False

    def is_screen_on(self) -> bool:
        """Check if the phone screen is currently on."""
        success, output = self._run_adb(["shell", "dumpsys", "power"])
        if not success:
            return False
        # Android 13 uses mWakefulness=Awake
        return "mWakefulness=Awake" in output

    def wake_screen(self) -> bool:
        """Wake the phone screen and unlock (swipe up)."""
        if self.is_screen_on():
            logger.debug("Screen already on")
            return True

        logger.info("Waking screen...")
        # Send WAKEUP keyevent
        self._run_adb(["shell", "input", "keyevent", "KEYCODE_WAKEUP"])
        time.sleep(0.5)

        # Swipe up to dismiss lock screen (basic swipe unlock)
        self._run_adb(["shell", "input", "swipe", "500", "1500", "500", "500", "300"])
        time.sleep(1)

        if self.is_screen_on():
            logger.info("Screen woken successfully")
            return True
        else:
            logger.warning("Failed to wake screen — phone may have a PIN/pattern lock")
            return False

    def execute_ussd(self, pin_code: str) -> bool:
        """
        Execute a USSD recharge code via Intent.
        Dials: *101*{pin_code}#
        """
        # Build the USSD URI — '#' must be encoded as %23 for tel: URIs
        ussd_code = USSD_TEMPLATE.replace("{pin}", pin_code)
        tel_uri = f"tel:{ussd_code.replace('#', '%23')}"

        logger.info(f"Executing USSD: *101*{'*' * 10}{pin_code[-4:]}#")  # Mask PIN in logs

        success, output = self._run_adb([
            "shell", "am", "start",
            "-a", "android.intent.action.CALL",
            "-d", tel_uri,
        ])

        if not success:
            logger.error(f"Failed to execute USSD: {output}")
            return False

        logger.info("USSD Intent sent successfully")
        return True

    def dump_ui(self) -> Optional[str]:
        """
        Dump the current UI hierarchy via uiautomator.
        Returns the local path to the XML file, or None on failure.
        """
        remote_path = "/sdcard/sovereign_ui_dump.xml"
        local_path = str(DUMP_DIR / "ui_dump.xml")

        # Clean up any old dump on the phone
        self._run_adb(["shell", "rm", "-f", remote_path])

        # Execute UI dump
        success, output = self._run_adb(["shell", "uiautomator", "dump", remote_path], timeout=20)
        if not success:
            logger.error(f"UI dump failed: {output}")
            return None

        # Verify dump was created
        check_success, check_output = self._run_adb(["shell", "ls", remote_path])
        if not check_success or "No such file" in check_output:
            logger.error("UI dump file was not created on device")
            return None

        # Pull the XML to local machine
        success, output = self._run_adb(["pull", remote_path, local_path])
        if not success:
            logger.error(f"Failed to pull UI dump: {output}")
            return None

        # Clean up remote file
        self._run_adb(["shell", "rm", "-f", remote_path])

        logger.info("UI dump pulled successfully")
        return local_path

    def parse_ussd_response(self, xml_path: str) -> Tuple[Optional[str], str]:
        """
        Parse the UI dump XML to find the USSD response text.
        Returns: (status, message)
          - status: 'active' if success keywords found, 'failed' if failure keywords, None if unclear
          - message: the extracted text from the USSD dialog
        """
        if self.dry_run:
            return "active", "[DRY RUN] Simulated successful recharge"

        try:
            tree = ET.parse(xml_path)
            root = tree.getroot()
        except ET.ParseError as e:
            logger.error(f"Failed to parse UI dump XML: {e}")
            return None, f"XML parse error: {e}"

        # Extract all text content from the UI hierarchy
        all_texts: list[str] = []
        for node in root.iter("node"):
            text = node.get("text", "").strip()
            content_desc = node.get("content-desc", "").strip()
            if text:
                all_texts.append(text)
            if content_desc:
                all_texts.append(content_desc)

        if not all_texts:
            logger.warning("No text found in UI dump — USSD dialog may not have appeared")
            return None, "No text content found in UI dump"

        # Combine all text for keyword matching
        combined_text = " ".join(all_texts).lower()
        logger.info(f"UI text extracted ({len(all_texts)} nodes): {combined_text[:200]}...")

        # Check for success keywords first
        for keyword in SUCCESS_KEYWORDS:
            if keyword.lower() in combined_text:
                logger.info(f"SUCCESS keyword matched: '{keyword}'")
                return "active", " | ".join(all_texts[:5])  # Return first 5 text nodes

        # Check for failure keywords
        for keyword in FAILURE_KEYWORDS:
            if keyword.lower() in combined_text:
                logger.info(f"FAILURE keyword matched: '{keyword}'")
                return "failed", " | ".join(all_texts[:5])

        # Ambiguous — no clear match
        logger.warning("No definitive success/failure keywords found in USSD response")
        return None, " | ".join(all_texts[:5])

    def dismiss_dialog(self) -> bool:
        """Dismiss the USSD response dialog by pressing BACK."""
        logger.info("Dismissing USSD dialog (BACK key)...")
        success, _ = self._run_adb(["shell", "input", "keyevent", "4"])  # KEYCODE_BACK
        time.sleep(0.5)

        # Press BACK again to ensure we're fully dismissed
        self._run_adb(["shell", "input", "keyevent", "4"])
        time.sleep(0.3)

        # Also press HOME to return to a clean state
        self._run_adb(["shell", "input", "keyevent", "3"])  # KEYCODE_HOME

        return success

    def cleanup(self):
        """Remove old UI dump files to avoid false positives."""
        local_dump = DUMP_DIR / "ui_dump.xml"
        if local_dump.exists():
            local_dump.unlink()
            logger.debug("Cleaned up local UI dump file")

        # Also clean remote
        self._run_adb(["shell", "rm", "-f", "/sdcard/sovereign_ui_dump.xml"])


# =====================================================
# SUPABASE MANAGER
# =====================================================

class SupabaseManager:
    """
    Manages all Supabase interactions using the service_role key.
    The service_role key bypasses RLS, allowing the daemon to
    read and update any activation record.
    """

    def __init__(self, url: str, service_key: str):
        if not url or not service_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.\n"
                "Get your service_role key from: Supabase Dashboard → Settings → API"
            )
        self.client: Client = create_client(url, service_key)
        logger.info(f"Supabase client initialized: {url[:40]}...")

    def fetch_pending_task(self) -> Optional[Dict]:
        """
        Atomically fetch the next pending activation task.
        Calls the fetch_pending_activation() Postgres function which:
        1. Selects the oldest 'pending' record
        2. Updates it to 'processing' (atomic lock)
        3. Returns the record details
        """
        try:
            result = self.client.rpc("fetch_pending_activation").execute()

            if result.data and len(result.data) > 0:
                task = result.data[0]
                logger.info(
                    f"Fetched task: id={task['activation_id']}, "
                    f"pin=****{task['activation_pin_code'][-4:]}"
                )
                return task
            return None

        except Exception as e:
            logger.error(f"Failed to fetch pending task: {e}")
            return None

    def update_status(
        self,
        activation_id: str,
        status: str,
        failure_reason: Optional[str] = None,
    ) -> bool:
        """
        Update the activation record status.
        Called after USSD processing to mark as 'active' or 'failed'.
        """
        try:
            update_data: Dict = {
                "status": status,
                "processed_at": datetime.now(tz=__import__('datetime').timezone.utc).isoformat(),
            }
            if failure_reason:
                update_data["failure_reason"] = failure_reason

            result = (
                self.client.table("users_activation")
                .update(update_data)
                .eq("id", activation_id)
                .execute()
            )

            logger.info(f"Updated activation {activation_id[:8]}... → {status}")
            return True

        except Exception as e:
            logger.error(f"Failed to update activation status: {e}")
            return False


# =====================================================
# SOVEREIGN DAEMON (Main Controller)
# =====================================================

class SovereignDaemon:
    """
    Main daemon controller that orchestrates the entire activation flow:
    1. Poll Supabase for pending tasks
    2. Wake the Android phone
    3. Execute the USSD code
    4. Wait for the telecom response
    5. Dump and parse the screen
    6. Update the result back to Supabase
    7. Dismiss the dialog and cool down
    """

    def __init__(self, dry_run: bool = False, once: bool = False):
        self.dry_run = dry_run
        self.once = once
        self.running = True

        # Initialize components
        self.adb = ADBController(adb_path=ADB_PATH, dry_run=dry_run)
        self.supabase = SupabaseManager(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

        # Register signal handlers for graceful shutdown
        signal.signal(signal.SIGINT, self._handle_shutdown)
        signal.signal(signal.SIGTERM, self._handle_shutdown)

    def _handle_shutdown(self, signum, frame):
        """Handle SIGINT/SIGTERM for graceful shutdown."""
        logger.info("Shutdown signal received — finishing current task...")
        self.running = False

    def _process_task(self, task: Dict) -> bool:
        """
        Process a single activation task end-to-end.
        Returns True if successfully processed, False otherwise.
        """
        activation_id = task["activation_id"]
        pin_code = task["activation_pin_code"]
        user_name = task.get("activation_user_name", "Unknown")
        user_email = task.get("activation_user_email", "Unknown")
        masked_pin = f"{'*' * 10}{pin_code[-4:]}"

        logger.info(f"{'=' * 60}")
        logger.info(f"PROCESSING ACTIVATION: {activation_id[:8]}...")
        logger.info(f"USER: {user_name} ({user_email})")
        logger.info(f"PIN: {masked_pin}")
        logger.info(f"{'=' * 60}")

        # Step 1: Verify device is connected
        if not self.dry_run and not self.adb.is_device_connected():
            logger.error("No device connected — marking task as failed")
            self.supabase.update_status(
                activation_id, "failed",
                "Android device not connected or offline"
            )
            return False

        # Step 2: Wake the screen
        if not self.dry_run:
            if not self.adb.wake_screen():
                logger.error("Could not wake screen — marking task as failed")
                self.supabase.update_status(
                    activation_id, "failed",
                    "Could not wake phone screen (PIN/pattern lock?)"
                )
                return False

        # Step 3: Clean up old UI dumps before executing
        self.adb.cleanup()

        # Step 4: Execute USSD
        if not self.adb.execute_ussd(pin_code):
            logger.error("USSD execution failed")
            self.supabase.update_status(
                activation_id, "failed",
                "Failed to execute USSD code on phone"
            )
            return False

        # Step 5: Wait for USSD response
        logger.info(f"Waiting {USSD_WAIT_TIME}s for Ooredoo USSD response...")
        time.sleep(USSD_WAIT_TIME)

        # Step 6: Dump and parse screen
        if self.dry_run:
            status, message = "active", "[DRY RUN] Simulated success"
        else:
            xml_path = self.adb.dump_ui()
            if not xml_path:
                # Retry once after additional wait
                logger.warning("UI dump failed — retrying after 3s...")
                time.sleep(3)
                xml_path = self.adb.dump_ui()

            if not xml_path:
                logger.error("UI dump failed after retry — marking as failed")
                self.supabase.update_status(
                    activation_id, "failed",
                    "Could not read phone screen (UI dump failed)"
                )
                self.adb.dismiss_dialog()
                return False

            status, message = self.adb.parse_ussd_response(xml_path)

        # Step 7: Handle ambiguous results
        if status is None:
            logger.warning(f"Ambiguous USSD response: {message}")
            # Default to 'failed' for safety — user can retry
            status = "failed"
            message = f"Ambiguous USSD response — please retry. Screen text: {message}"

        # Step 8: Update Supabase with final result
        failure_reason = message if status == "failed" else None
        self.supabase.update_status(activation_id, status, failure_reason)

        # Step 9: Dismiss the USSD dialog
        if not self.dry_run:
            self.adb.dismiss_dialog()

        # Step 10: Clean up
        self.adb.cleanup()

        logger.info(f"Task {activation_id[:8]}... completed: {status.upper()} | {user_name} ({user_email})")
        return status == "active"

    def run(self):
        """Main daemon loop."""
        logger.info("=" * 60)
        logger.info("  THE SOVEREIGN — USSD Activation Daemon")
        logger.info(f"  Mode: {'DRY RUN' if self.dry_run else 'LIVE'}")
        logger.info(f"  Poll Interval: {POLL_INTERVAL}s")
        logger.info(f"  USSD Wait Time: {USSD_WAIT_TIME}s")
        logger.info(f"  Cooldown: {COOLDOWN_TIME}s")
        logger.info("=" * 60)

        # Startup device check (skip in dry run)
        if not self.dry_run:
            if self.adb.is_device_connected():
                logger.info("✓ Android device detected and online")
            else:
                logger.warning("⚠ No Android device detected — daemon will retry on each task")

        cycle_count = 0
        tasks_processed = 0
        tasks_succeeded = 0

        while self.running:
            cycle_count += 1

            try:
                # Fetch next pending task
                task = self.supabase.fetch_pending_task()

                if task:
                    success = self._process_task(task)
                    tasks_processed += 1
                    if success:
                        tasks_succeeded += 1

                    logger.info(
                        f"Stats: {tasks_succeeded}/{tasks_processed} succeeded "
                        f"({cycle_count} cycles)"
                    )

                    # Exit if --once mode
                    if self.once:
                        logger.info("--once mode: exiting after single task")
                        break

                    # Anti-spam cooldown between USSD executions
                    logger.info(f"Cooldown: waiting {COOLDOWN_TIME}s before next task...")
                    time.sleep(COOLDOWN_TIME)
                else:
                    # No pending tasks — wait and poll again
                    if cycle_count % 12 == 1:  # Log every ~60s (12 * 5s)
                        logger.info(f"No pending tasks (cycle {cycle_count}) — polling...")
                    time.sleep(POLL_INTERVAL)

            except KeyboardInterrupt:
                break
            except Exception as e:
                logger.error(f"Unexpected error in daemon loop: {e}", exc_info=True)
                time.sleep(POLL_INTERVAL * 2)  # Back off on errors

        # Shutdown
        logger.info("=" * 60)
        logger.info("  Daemon shutting down gracefully")
        logger.info(f"  Total cycles: {cycle_count}")
        logger.info(f"  Tasks processed: {tasks_processed}")
        logger.info(f"  Tasks succeeded: {tasks_succeeded}")
        logger.info("=" * 60)


# =====================================================
# ENTRY POINT
# =====================================================

if __name__ == "__main__":
    dry_run = "--dry-run" in sys.argv
    once = "--once" in sys.argv

    if "--help" in sys.argv or "-h" in sys.argv:
        print(__doc__)
        print("\nOptions:")
        print("  --dry-run    Simulate without ADB (for testing)")
        print("  --once       Process one task and exit")
        print("  --help       Show this help message")
        sys.exit(0)

    try:
        daemon = SovereignDaemon(dry_run=dry_run, once=once)
        daemon.run()
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Fatal error: {e}", exc_info=True)
        sys.exit(1)
