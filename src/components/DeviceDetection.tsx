import React, { useState, useEffect } from "react";
import {
  HardDrive,
  Smartphone,
  Usb,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Device } from "../types/Device"; // ✅ Correct import path

export function DeviceDetection({
  setDevices,
}: {
  setDevices: (devices: Device[]) => void;
}) {
  const [devices, setLocalDevices] = useState<Device[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(
    {}
  );

  // ---------------- FETCH DEVICES ----------------
  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/devices");
        const data = await res.json();
        let deviceList: Device[] = [];

        // Android devices
        if (data.phones && data.phones.length > 0) {
          deviceList = data.phones.map((phone: any) => ({
            id: phone.serial,
            name: `Phone: ${phone.name}`,
            type: "android",
            status: "ready",
            details: phone.details || "USB Debugging enabled and authorized",
          }));
        }

        // Windows drives
        let driveDevices: Device[] = [];
        if (data.drives && data.drives.length > 0) {
          driveDevices = data.drives.map((drive: any) => {
            const cleanId = drive.device.endsWith("\\")
              ? drive.device
              : drive.device + "\\";
            const isSystem = cleanId.startsWith("C:");
            return {
              id: cleanId,
              name: cleanId,
              type: "drive",
              status: isSystem ? "warning" : "ready",
              details: isSystem
                ? "Contains system files - use with caution"
                : "Safe for wiping",
              size: "N/A",
            };
          });
        }

        // PC name
        if (data.pc_name) {
          deviceList.unshift({
            id: "pc_name",
            name: data.pc_name,
            type: "pc",
            status: "ready",
            details: "This is the current Windows PC",
          });
        }

        const combined = [...deviceList, ...driveDevices];
        setLocalDevices(combined);
        setDevices(combined);
      } catch (err) {
        console.error("Error fetching devices:", err);
      }
    };

    fetchDevices();
    const interval = setInterval(fetchDevices, 5000);
    return () => clearInterval(interval);
  }, [setDevices]);

  // ---------------- HELPERS ----------------
  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "drive":
        return <HardDrive className="w-5 h-5" />;
      case "android":
        return <Smartphone className="w-5 h-5" />;
      case "usb":
        return <Usb className="w-5 h-5" />;
      case "pc":
        return <HardDrive className="w-5 h-5 text-gray-600" />;
      default:
        return <HardDrive className="w-5 h-5" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "warning":
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case "error":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ready":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    }
  };

  // ---------------- FILTERS ----------------
  const pc = devices.find((d) => d.type === "pc");
  const drives = devices.filter((d) => d.type === "drive");
  const phones = devices.filter((d) => d.type === "android");

  const topLevelCount = (pc ? 1 : 0) + phones.length;

  // ---------------- RENDER ----------------
  return (
    <Card className="border-0 bg-white dark:bg-gray-800 shadow-xl rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-semibold">
          <HardDrive className="w-5 h-5 text-blue-600" />
          Detected Devices
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* PC Section */}
        {pc && (
          <div
            className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900 cursor-pointer hover:shadow-md transition-all"
            onClick={() => toggleGroup(pc.id)}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getIcon(pc.type)}
                <span className="font-medium">{pc.name}</span>
                {getStatusIcon(pc.status || "ready")}
              </div>
              {expandedGroups[pc.id] ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>

            <AnimatePresence>
              {expandedGroups[pc.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-3 pl-6 space-y-2"
                >
                  {drives.map((drive) => (
                    <div
                      key={drive.id}
                      className="p-2 border rounded-md bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span>{drive.name}</span>
                        <Badge
                          className={`text-xs ${getStatusColor(
                            drive.status || "ready"
                          )}`}
                        >
                          {drive.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {drive.details}
                      </p>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Android Phones */}
        {phones.map((phone) => (
          <div
            key={phone.id}
            className="p-3 border rounded-md bg-gray-50 dark:bg-gray-900 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2">
              {getIcon(phone.type)}
              <span className="font-medium">{phone.name}</span>
              {getStatusIcon(phone.status || "ready")}
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              {phone.details}
            </p>
          </div>
        ))}

        <div className="pt-3 mt-4 border-t text-center text-sm text-gray-500 dark:text-gray-400">
          Total: {topLevelCount} device{topLevelCount !== 1 ? "s" : ""} detected
        </div>
      </CardContent>
    </Card>
  );
}
