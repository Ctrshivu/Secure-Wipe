import React, { useState, useEffect } from "react";
import {
  Monitor,
  Smartphone,
  Usb,
  CheckCircle2,
  AlertTriangle,
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
        return <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-200" />;
      case "android":
        return <Smartphone className="w-5 h-5 text-gray-700 dark:text-gray-200" />;
      case "usb":
        return <Usb className="w-5 h-5 text-gray-700 dark:text-gray-200" />;
      case "pc":
        return <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-200" />;
      default:
        return <Monitor className="w-5 h-5 text-gray-700 dark:text-gray-200" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ready":
        return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 group-hover:text-yellow-700 dark:group-hover:text-yellow-300 transition-colors" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-600 dark:text-red-400 group-hover:text-red-700 dark:group-hover:text-red-300 transition-colors" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400 group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors" />;
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
    <Card className="border-0 bg-gradient-to-br from-white/95 to-gray-50/95 dark:from-gray-800/95 dark:to-gray-900/95 backdrop-blur-xl shadow-2xl shadow-blue-500/10 dark:shadow-blue-500/5 rounded-3xl overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/5 dark:to-purple-500/5 border-b border-blue-200/20 dark:border-blue-800/20">
        <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
          <div className="p-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg">
            <Monitor className="w-6 h-6 text-white dark:text-gray-100" />
          </div>
          Detected Devices
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* PC Section */}
        {pc && (
          <motion.div
            className="p-4 border border-blue-200/50 dark:border-blue-800/50 rounded-xl bg-gradient-to-r from-blue-50/90 to-indigo-50/90 dark:from-blue-900/20 dark:to-indigo-900/20 backdrop-blur-sm cursor-pointer hover:shadow-lg hover:shadow-blue-500/20 dark:hover:shadow-blue-500/10 transition-all duration-300 hover:scale-[1.01] group"
            onClick={() => toggleGroup(pc.id)}
            whileHover={{ y: -1 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-800/60 group-hover:bg-blue-200 dark:group-hover:bg-blue-700/70 transition-colors">
                  <Monitor className="w-5 h-5 text-blue-700 dark:text-blue-200" />
                </div>
                <div>
                  <span className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-700 dark:group-hover:text-blue-300 transition-colors">
                    {pc.name}
                  </span>
                  <p className="text-xs text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                    {pc.details}
                  </p>
                </div>
                {getStatusIcon(pc.status || "ready")}
              </div>
              <motion.div
                animate={{ rotate: expandedGroups[pc.id] ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              </motion.div>
            </div>

            <AnimatePresence>
              {expandedGroups[pc.id] && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="mt-4 pl-6 space-y-3"
                >
                  {drives.map((drive, index) => (
                    <motion.div
                      key={drive.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      className="p-3 border border-gray-200/50 dark:border-gray-700/50 rounded-lg bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm hover:bg-gradient-to-r hover:from-green-50/80 hover:to-blue-50/80 dark:hover:from-green-900/20 dark:hover:to-blue-900/20 hover:shadow-md hover:shadow-green-500/10 dark:hover:shadow-green-500/5 transition-all duration-300 hover:scale-[1.01] group/drive"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 rounded-md bg-gray-100 dark:bg-gray-700 group-hover/drive:bg-green-100 dark:group-hover/drive:bg-green-800/60 transition-colors">
                            <Monitor className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                          </div>
                          <span className="text-foreground font-medium group-hover/drive:text-green-700 dark:group-hover/drive:text-green-300 transition-colors">
                            {drive.name}
                          </span>
                        </div>
                        <Badge
                          className={`text-xs font-medium px-2 py-1 ${getStatusColor(
                            drive.status || "ready"
                          )} group-hover/drive:scale-105 transition-transform`}
                        >
                          {drive.status}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 ml-9 group-hover/drive:text-gray-600 dark:group-hover/drive:text-gray-300 transition-colors">
                        {drive.details}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Android Phones */}
        {phones.map((phone, index) => (
          <motion.div
            key={phone.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.3 }}
            className="p-4 border border-green-200/50 dark:border-green-800/50 rounded-xl bg-gradient-to-r from-green-50/90 to-emerald-50/90 dark:from-green-900/20 dark:to-emerald-900/20 backdrop-blur-sm hover:shadow-lg hover:shadow-green-500/20 dark:hover:shadow-green-500/10 transition-all duration-300 hover:scale-[1.01] group"
            whileHover={{ y: -1 }}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100 dark:bg-green-800/60 group-hover:bg-green-200 dark:group-hover:bg-green-700/70 transition-colors">
                <Smartphone className="w-5 h-5 text-green-700 dark:text-green-200" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-300 transition-colors">
                  {phone.name}
                </span>
                <p className="text-sm text-muted-foreground group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
                  {phone.details}
                </p>
              </div>
              {getStatusIcon(phone.status || "ready")}
            </div>
          </motion.div>
        ))}

        <div className="pt-4 mt-6 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 shadow-sm">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Total: {topLevelCount} device{topLevelCount !== 1 ? "s" : ""} detected
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
