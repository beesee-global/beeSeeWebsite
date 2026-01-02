import React, { useState, useEffect } from "react"; 
import * as LucideIcons from "lucide-react";

interface CustomIconPickerProps {
  value?: string; // currently selected icon name
  onChange: (iconName: string) => void;
  label?: string;
  error?: string;
}

const iconList = [
  // General / Common
  "Home", "Tag", "Save", "SquarePen", "Star", "Settings", "Bell", "User", "Users",
  "Box", "ShoppingCart", "Package", "ClipboardList", "CheckCircle", "AlertCircle",
  "Search", "Filter", "PlusCircle", "Trash2", "Edit3",

  // 🖥️ Devices / Tech
  "Monitor", "Laptop", "Tablet", "Smartphone", "Watch", "Keyboard", "MousePointer",
  "Cpu", "Server", "PlugZap", "BatteryCharging", "Usb", "HardDrive", "Router", "Radio",
  "Satellite", "Bluetooth", "Wifi", "Camera", "Video", "Tv", "Headphones", "Mic",
  "Speaker", "Gamepad", "Joystick", "Printer", "Projector", "Chip", "Antenna",
  "BatteryFull", "BatteryLow", "BatteryMedium", "BatteryWarning", "SdCard", "SimCard",
  "Cloud", "CloudUpload", "CloudDownload", "CloudOff", "QrCode", "Scan", "Folder",
  "FolderSync", "FileCode", "FileArchive", "FileStack", "Cog", "Power", "PowerOff",
  "Terminal", "Code", "Command", "Binary", "Robot", "Gauge", "SatelliteDish", "Zap",

  // Misc / Business
  "CreditCard", "Globe", "Briefcase", "BarChart3", "LineChart", "Calendar",
  "ClipboardCheck", "FileText", "Wrench", "ShieldCheck", "HelpCircle",
];

const CustomIconPicker: React.FC<CustomIconPickerProps> = ({
  value,
  onChange,
  label = "Select Icon",
  error,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(value || "");

  useEffect(() => {
    if (value !== undefined) {
      setSelectedIcon(value);
    }
  }, [value]);

  const handleSelect = (iconName: string) => {
    setSelectedIcon(iconName);
    onChange(iconName);
  };

  return (
    <div className="flex flex-col">
      {label && <label className="text-sm text-gray-700 dark:text-gray-300 mb-2">{label}</label>}

      {/* Icon Grid */}
      <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-8 gap-3 min-h-[10rem] max-h-64 overflow-y-auto p-2 rounded-md border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700">
        {iconList.map((iconName) => {
          const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons];

          // ✅ Skip invalid icons to prevent runtime crash
          if (!IconComponent) {
            console.warn("❌ Missing Lucide icon:", iconName);
            return null;
          }

          return (
            <div
              key={iconName}
              onClick={() => handleSelect(iconName)}
              className={`p-3 border rounded-lg hover:bg-yellow-100 dark:hover:bg-yellow-900/30 cursor-pointer transition ${
                selectedIcon === iconName
                  ? "border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20"
                  : "border-gray-200 dark:border-gray-600"
              }`}
            >
              <IconComponent className="w-6 h-6 mx-auto text-gray-700 dark:text-gray-300" />
              <p className="text-xs text-center mt-1 truncate text-gray-600 dark:text-gray-400">{iconName}</p>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {error && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{error}</p>}

      {/* Selected Icon Preview */}
      {selectedIcon && (
        <div className="flex items-center gap-2 mt-3">
          <p className="text-sm text-gray-700 dark:text-gray-300">Selected:</p>
          {(() => {
            const IconComponent =
              LucideIcons[selectedIcon as keyof typeof LucideIcons];
            return IconComponent ? <IconComponent size={20} className="text-gray-700 dark:text-gray-300" /> : null;
          })()}
          <span className="text-sm font-semibold text-amber-600 dark:text-amber-500">
            {selectedIcon}
          </span>
        </div>
      )}
    </div>
  );
};

export default CustomIconPicker;