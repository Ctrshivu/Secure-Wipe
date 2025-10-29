export interface Device {
  id: string;
  name: string;
  type: "drive" | "android" | "usb" | "pc";
  size?: string;
  status?: "ready" | "warning" | "error"; // <-- make optional
  details?: string;
}
