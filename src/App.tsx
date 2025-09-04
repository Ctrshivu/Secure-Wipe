import React, { useState } from "react";
import { Header } from "./components/Header";
import { DeviceDetection } from "./components/DeviceDetection";
import { ActionButtons } from "./components/ActionButtons";
import { VerificationSection } from "./components/VerificationSection";
import { CertificateSection } from "./components/CertificateSection";
import { StatusFooter } from "./components/StatusFooter";

export interface Device {
  id: string;
  name: string;
  type: "drive" | "android" | "usb" | "pc";
}

export default function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [wipeProgress, setWipeProgress] = useState(0);
  const [isWiping, setIsWiping] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    "Application initialized",
    "Scanning for devices...",
  ]);
  const [devices, setDevices] = useState<Device[]>([]); // ← devices state

  const addLog = (message: string) => {
    setLogs((prev) => [
      ...prev,
      `${new Date().toLocaleTimeString()}: ${message}`,
    ]);
  };

  const simulateWipe = (type: "demo" | "full", deviceId?: string) => {
    if (!deviceId) {
      addLog("No device selected for wipe operation");
      return;
    }

    setIsWiping(true);
    setWipeProgress(0);
    addLog(`Starting ${type} wipe on ${deviceId}`);

    const interval = setInterval(() => {
      setWipeProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsWiping(false);
          addLog(`${type} wipe completed successfully on ${deviceId}`);
          return 100;
        }
        return prev + 10;
      });
    }, 500);
  };

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
            <DeviceDetection setDevices={setDevices} /> {/* ← lift devices */}
            <ActionButtons
              devices={devices} // ← pass devices to ActionButtons
              simulateWipe={simulateWipe}
              isWiping={isWiping}
              wipeProgress={wipeProgress}
              addLog={addLog}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <VerificationSection />
            <CertificateSection />
          </div>

          <StatusFooter logs={logs} />
        </div>
      </div>
    </div>
  );
}
