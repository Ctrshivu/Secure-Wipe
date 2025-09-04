// ...other imports remain the same
import React, { useState } from "react";
import { Play, Trash2, CheckCircle, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";

interface Device {
  id: string;
  name: string;
  type: "drive" | "android" | "usb" | "pc";
}

interface ActionButtonsProps {
  devices: Device[];
  simulateWipe: (type: "demo" | "full", deviceId: string) => void;
  isWiping: boolean;
  wipeProgress: number;
  addLog: (message: string) => void;
}

export function ActionButtons({
  devices,
  simulateWipe,
  isWiping,
  wipeProgress,
  addLog,
}: ActionButtonsProps) {
  const [selectedDevice, setSelectedDevice] = useState<string>("");
  const [confirmationText, setConfirmationText] = useState("");
  const [showFullWipeDialog, setShowFullWipeDialog] = useState(false);
  const [verificationProgress, setVerificationProgress] = useState(0);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleDemoWipe = () => {
    if (!selectedDevice) {
      addLog("Please select a drive before performing a demo wipe");
      return;
    }
    addLog(`Demo wipe initiated on ${selectedDevice}`);
    simulateWipe("demo", selectedDevice);
  };

  const handleFullWipe = () => {
    if (!selectedDevice) {
      addLog("Please select a drive before performing a full wipe");
      return;
    }
    if (confirmationText === "WIPE OK") {
      addLog(`Full wipe initiated on ${selectedDevice} - DESTRUCTIVE MODE`);
      simulateWipe("full", selectedDevice);
      setShowFullWipeDialog(false);
      setConfirmationText("");
    }
  };

  const handleVerifyWipe = () => {
    if (!selectedDevice) {
      addLog("Please select a drive before verification");
      return;
    }
    setIsVerifying(true);
    setVerificationProgress(0);
    addLog(`Starting wipe verification on ${selectedDevice}`);

    const interval = setInterval(() => {
      setVerificationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsVerifying(false);
          addLog(
            `Verification completed on ${selectedDevice} - all data securely erased`
          );
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  const selectableDevices = devices.filter((d) => d.type !== "pc");

  return (
    <Card className="border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-green-600" />
          Wipe Operations
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Device Selector */}
        <div className="flex flex-col sm:flex-row gap-3 items-start">
          <select
            className="p-2 border rounded-md flex-1"
            value={selectedDevice}
            onChange={(e) => setSelectedDevice(e.target.value)}
          >
            <option value="" disabled>
              Select Drive
            </option>{" "}
            {/* <-- Changed placeholder */}
            {selectableDevices.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Demo Wipe Button */}
        <div className="space-y-2">
          <Button
            onClick={handleDemoWipe}
            disabled={isWiping || isVerifying}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg transition-all"
            size="lg"
          >
            <Play className="w-4 h-4 mr-2" />
            Safe Demo Wipe
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Simulates wipe process without touching actual data
          </p>
        </div>

        {/* Full Wipe Button with Dialog */}
        <div className="space-y-2">
          <Dialog
            open={showFullWipeDialog}
            onOpenChange={setShowFullWipeDialog}
          >
            <DialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={isWiping || isVerifying || !selectedDevice}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg transition-all"
                size="lg"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Full Destructive Wipe
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="w-5 h-5" />
                  Confirm Destructive Operation
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800 dark:text-red-200">
                    This will permanently destroy ALL data on the selected
                    drive. This action cannot be undone.
                  </AlertDescription>
                </Alert>

                <div className="space-y-2">
                  <Label htmlFor="confirmation">
                    Type "WIPE OK" to confirm:
                  </Label>
                  <Input
                    id="confirmation"
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder="Type WIPE OK here"
                    className="font-mono"
                  />
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowFullWipeDialog(false);
                      setConfirmationText("");
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleFullWipe}
                    disabled={confirmationText !== "WIPE OK"}
                    className="flex-1"
                  >
                    Confirm Wipe
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          <p className="text-xs text-muted-foreground text-center">
            Permanently destroys all data - requires confirmation
          </p>
        </div>

        {/* Verify Wipe Button */}
        <div className="space-y-2">
          <Button
            onClick={handleVerifyWipe}
            disabled={isWiping || isVerifying || !selectedDevice}
            variant="outline"
            className="w-full border-green-200 text-green-700 hover:bg-green-50 dark:border-green-800 dark:text-green-300 dark:hover:bg-green-900"
            size="lg"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            Verify Wipe Completion
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Confirms all data has been securely erased
          </p>
        </div>

        {/* Progress Indicators */}
        {isWiping && (
          <div className="space-y-2 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Wipe in progress... {wipeProgress}%
              </span>
            </div>
            <Progress value={wipeProgress} className="w-full" />
          </div>
        )}

        {isVerifying && (
          <div className="space-y-2 p-4 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">
                Verifying... {verificationProgress}%
              </span>
            </div>
            <Progress value={verificationProgress} className="w-full" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
