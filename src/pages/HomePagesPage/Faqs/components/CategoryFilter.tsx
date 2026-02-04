import React from "react";
import {
  Server,
  LaptopMinimal,
  Cpu,
  Monitor,
  SmartphoneCharging,
  TabletSmartphone,
  Watch,
  Tv,
  Camera,
  Speaker,
  Headphones,
  Gamepad2,
  Printer,
  Keyboard,
  Mouse,
  BatteryCharging,
  Router,
  HardDrive,
} from "lucide-react";

interface Props {
  devices: string[];
  selectedDevice: string;
  onDeviceChange: (device: string) => void;
}

const CategoryFilter: React.FC<Props> = ({
  devices,
  selectedDevice,
  onDeviceChange,
}) => {
  // 🔥 SAME ICON LOGIC STYLE AS PRODUCT HUB
  const getCategoryIcon = (deviceName: string) => {
    const name = deviceName.toLowerCase();

    // Kiosk / Terminal
    if (name.includes("kiosk") || name.includes("atm") || name.includes("terminal")) {
      return <Monitor className="w-4 h-4" />;
    }

    // Server / Network
    if (name.includes("server") || name.includes("cloud") || name.includes("data center")) {
      return <Server className="w-4 h-4" />;
    }
    if (name.includes("network") || name.includes("router") || name.includes("switch")) {
      return <Router className="w-4 h-4" />;
    }
    if (name.includes("storage") || name.includes("hard drive") || name.includes("nas")) {
      return <HardDrive className="w-4 h-4" />;
    }

    // Computers
    if (name.includes("laptop") || name.includes("notebook") || name.includes("macbook")) {
      return <LaptopMinimal className="w-4 h-4" />;
    }
    if (name.includes("desktop") || name.includes("pc") || name.includes("computer")) {
      return <Cpu className="w-4 h-4" />;
    }
    if (name.includes("monitor") || name.includes("display") || name.includes("screen")) {
      return <Monitor className="w-4 h-4" />;
    }

    // Mobile
    if (name.includes("phone") || name.includes("smartphone") || name.includes("iphone") || name.includes("android")) {
      return <SmartphoneCharging className="w-4 h-4" />;
    }
    if (name.includes("tablet") || name.includes("ipad")) {
      return <TabletSmartphone className="w-4 h-4" />;
    }
    if (name.includes("watch") || name.includes("wearable")) {
      return <Watch className="w-4 h-4" />;
    }

    // Entertainment
    if (name.includes("tv") || name.includes("television")) {
      return <Tv className="w-4 h-4" />;
    }
    if (name.includes("camera") || name.includes("security")) {
      return <Camera className="w-4 h-4" />;
    }
    if (name.includes("speaker") || name.includes("audio")) {
      return <Speaker className="w-4 h-4" />;
    }
    if (name.includes("headphone") || name.includes("headset")) {
      return <Headphones className="w-4 h-4" />;
    }
    if (name.includes("game") || name.includes("console")) {
      return <Gamepad2 className="w-4 h-4" />;
    }

    // Peripherals
    if (name.includes("printer") || name.includes("scanner") || name.includes("copier")) {
      return <Printer className="w-4 h-4" />;
    }
    if (name.includes("keyboard")) {
      return <Keyboard className="w-4 h-4" />;
    }
    if (name.includes("mouse") || name.includes("trackpad")) {
      return <Mouse className="w-4 h-4" />;
    }

    // Power
    if (name.includes("battery") || name.includes("charger") || name.includes("power")) {
      return <BatteryCharging className="w-4 h-4" />;
    }

    // Default / All
    return <Server className="w-4 h-4" />;
  };

  return (
    <div className="w-full">
      {/* DESKTOP */}
      <div className="hidden md:flex justify-center gap-4 flex-wrap">
        {devices.map((device) => {
          const isActive = selectedDevice === device;

          return (
            <button
              key={device}
              onClick={() => onDeviceChange(device)}
              className={`category-pill-advanced ${isActive ? "active" : ""}`}
            >
              <div className="category-pill-icon-advanced">
                {getCategoryIcon(device)}
              </div>

              <span className="category-pill-name-advanced">
                {device}
              </span>
            </button>
          );
        })}
      </div>

      {/* MOBILE */}
      <div className="grid grid-cols-2 gap-3 md:hidden mt-4">
        {devices.map((device) => {
          const isActive = selectedDevice === device;

          return (
            <button
              key={device}
              onClick={() => onDeviceChange(device)}
              className={`category-pill-advanced ${isActive ? "active" : ""}`}
            >
              <div className="category-pill-icon-advanced">
                {getCategoryIcon(device)}
              </div>

              <span className="category-pill-name-advanced">
                {device}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default CategoryFilter;
