import React, { useState } from "react";
import { Header } from "./components/Header";
import { DeviceDetection } from "./components/DeviceDetection";
import { ActionButtons } from "./components/ActionButtons";
import { Device } from "./types/Device";
import {
  VerificationSection,
  VerificationResult,
} from "./components/VerificationSection";
import { CertificateSection } from "./components/CertificateSection";
import { StatusFooter } from "./components/StatusFooter";

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [wipeProgress, setWipeProgress] = useState(0);
  const [isWiping, setIsWiping] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Application initialized",
    "Scanning for devices...",
  ]);
  const [devices, setDevices] = useState<Device[]>([]);

  // ---- Verification results ----
  const [verificationResults, setVerificationResults] = useState<
    VerificationResult[]
  >([
    {
      id: "1",
      test: "Surface Scan",
      status: "pending",
      details: "No recoverable data detected on surface",
      progress: 0,
    },
    {
      id: "2",
      test: "Deep Sector Analysis",
      status: "pending",
      details: "All sectors properly overwritten",
      progress: 0,
    },
    {
      id: "3",
      test: "Challenge-Write Test",
      status: "pending",
      details: "Writing test patterns",
      progress: 0,
    },
    {
      id: "4",
      test: "Magnetic Residue Check",
      status: "pending",
      details: "Awaiting completion",
      progress: 0,
    },
  ]);

  // ---- Helper: log messages ----
  const addLog = (message: string): void => {
    setLogs((prev: string[]) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  // ---- Helper: update verification step ----
  const updateVerification = (
    id: string,
    status: VerificationResult["status"],
    progress?: number
  ): void => {
    setVerificationResults((prev: VerificationResult[]) =>
      prev.map((r) =>
        r.id === id ? { ...r, status, progress: progress ?? r.progress } : r
      )
    );
  };

  // ---- Wipe handler ----
  const simulateWipe = async (type: "demo" | "full", deviceId?: string) => {
    if (!deviceId) {
      addLog("No device selected for wipe operation");
      return;
    }

    setIsWiping(true);
    setWipeProgress(0);
    addLog(
      `Starting ${
        type === "demo" ? "Safe" : "Full Destructive"
      } wipe on ${deviceId}`
    );

    // Reset verification
    setVerificationResults((prev: VerificationResult[]) =>
      prev.map((r) => ({ ...r, status: "running", progress: 0 }))
    );

    const endpoint =
      type === "demo"
        ? `http://127.0.0.1:8000/wipe/safe/${encodeURIComponent(deviceId)}`
        : `http://127.0.0.1:8000/wipe/full/${encodeURIComponent(deviceId)}`;

    try {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 90) clearInterval(interval);
        setWipeProgress(progress);

        updateVerification("1", "running", progress);
        updateVerification(
          "2",
          progress < 70 ? "running" : "passed",
          progress < 70 ? progress : 100
        );
        updateVerification(
          "3",
          progress < 50 ? "running" : "passed",
          progress < 50 ? progress * 2 : 100
        );
      }, 300);

      const res = await fetch(endpoint, { method: "POST" });
      const data = await res.json();

      clearInterval(interval);
      setWipeProgress(100);

      setVerificationResults((prev: VerificationResult[]) =>
        prev.map((r) => ({ ...r, status: "passed", progress: 100 }))
      );

      addLog(data.message || `${type} wipe completed successfully`);

      // ✅ NEW FIX: Properly log deleted files for CertificateSection
      if (data.deleted_files && data.deleted_files.length > 0) {
        data.deleted_files.forEach((file: string) => addLog(`🗑️ ${file}`));
      }
    } catch (err) {
      console.error(err);
      addLog(`Error during ${type} wipe`);
    } finally {
      setTimeout(() => {
        setIsWiping(false);
        setWipeProgress(0);
      }, 1000);
    }
  };

  // ---- UI ----
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? "dark" : ""
      }`}
    >
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-6 max-w-6xl">
          <Header darkMode={darkMode} setDarkMode={setDarkMode} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DeviceDetection setDevices={setDevices} />
            <ActionButtons
              devices={devices}
              simulateWipe={simulateWipe}
              isWiping={isWiping}
              wipeProgress={wipeProgress}
              addLog={addLog}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <VerificationSection results={verificationResults} />
            <CertificateSection
              devices={devices}
              verificationResults={verificationResults}
              logs={logs} // ✅ Passes log updates to show deleted files in certificate
            />
          </div>

          <StatusFooter logs={logs} />
        </div>
      </div>
    </div>
  );
}
