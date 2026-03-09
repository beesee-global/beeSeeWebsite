import React, { useState, useEffect } from "react"; 
import * as LucideIcons from "lucide-react";

interface CustomIconPickerProps {
  value?: string; // currently selected icon name
  onChange: (iconName: string) => void;
  label?: string;
  error?: string;
} 

const iconList = [
  // ⭐ General / Common
  "Home", "Tag", "Save", "SquarePen", "Star", "Settings", "Bell", "User", "Users",
  "Box", "ShoppingCart", "Package", "ClipboardList", "CheckCircle", "AlertCircle",
  "Search", "Filter", "PlusCircle", "Trash2", "Edit3", "HeartPulse",

  // 🖥️ Devices / Tech
  "Monitor", "Laptop", "Tablet", "Smartphone", "Watch", "Keyboard", "MousePointer",
  "Cpu", "Server", "PlugZap", "BatteryCharging", "Usb", "HardDrive", "Router",
  "Bluetooth", "Wifi", "Camera", "Video", "Tv", "Headphones", "Mic",
  "Speaker", "Gamepad", "Printer", "Projector", "Chip",
  "BatteryFull", "BatteryLow", "BatteryMedium", "BatteryWarning",
  "SdCard", "SimCard", "Microchip",

  // ☁️ Cloud / Network / Dev
  "Cloud", "CloudUpload", "CloudDownload", "CloudOff",
  "CloudRain", "CloudSnow", "CloudLightning",
  "Database", "Network", "Activity", "Radar",
  "GitBranch", "GitCommit", "GitMerge", "GitPullRequest",
  "Bug", "BugOff", "Webhook", "Workflow",

  // 🧾 Files / Folders / Media
  "File", "FileText", "FileImage", "FileVideo", "FileAudio",
  "FilePlus", "FileMinus", "FileX", "FileCheck",
  "FileCode", "FileArchive", "FileStack",
  "Folder", "FolderOpen", "FolderPlus", "FolderMinus", "FolderSync",
  "Image", "Images", "Music", "Film",

  // ▶️ Media Controls
  "Play", "Pause", "Stop", "SkipForward", "SkipBack",
  "Volume", "Volume1", "Volume2", "VolumeX",
  "PlayCircle", "PauseCircle", "StopCircle",

  // 🧭 Navigation / Direction
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "ArrowUpRight", "ArrowUpLeft", "ArrowDownRight", "ArrowDownLeft",
  "ChevronUp", "ChevronDown", "ChevronLeft", "ChevronRight",
  "ChevronsUp", "ChevronsDown", "ChevronsLeft", "ChevronsRight",
  "CornerUpLeft", "CornerUpRight", "CornerDownLeft", "CornerDownRight",
  "Move", "MoveDiagonal", "MoveHorizontal", "MoveVertical",
  "Expand", "Shrink", "Maximize", "Minimize",

  // 🏗️ Layout / UI
  "Layout", "LayoutGrid", "LayoutList", "LayoutDashboard",
  "Columns", "Rows", "Sidebar",
  "PanelLeft", "PanelRight", "PanelTop", "PanelBottom",
  "AlignLeft", "AlignCenter", "AlignRight", "AlignJustify",
  "Grid", "List", "ListOrdered", "ListChecks",

  // 🧰 Tools / Actions
  "Wrench", "Hammer", "Screwdriver",
  "RefreshCcw", "RotateCcw", "RotateCw",
  "Download", "Upload", "Share2", "ExternalLink", "Link",

  // 📊 Business / Finance
  "CreditCard", "Globe", "Briefcase",
  "BarChart3", "LineChart", "PieChart",
  "TrendingUp", "TrendingDown",
  "DollarSign", "Percent",
  "Calendar", "Clock", "Timer",
  "Receipt", "Wallet", "Banknote",

  // 🔐 Security / Status
  "Shield", "ShieldCheck", "Lock", "Unlock", "Key",
  "Eye", "EyeOff",
  "AlertTriangle", "AlertOctagon", "Info",
  "Check", "X", "Minus", "Plus",
  "Circle", "Square", "Octagon",
  "Loader", "Loader2", "LoaderCircle",
  "HelpCircle",

  // 🚚 Ecommerce / Logistics
  "Truck", "Store", "Warehouse",
  "PackageCheck", "PackageOpen",
  "MapPin", "MapPinOff", "Map",
  "Navigation", "Navigation2", "Compass",
  "Barcode", "QrCode", "ShoppingBag", "ShoppingBasket",

  // 🧠 Education / Science / AI
  "Brain", "FlaskConical", "GraduationCap",
  "Book", "BookOpen", "Library",
  "Lightbulb", "Atom", "Beaker", "Microscope",
  "Sigma", "FunctionSquare", "Infinity", "Calculator",

  // 🌍 Travel / Time / Weather
  "Plane", "Car", "Bus", "Train", "Ship",
  "Hotel", "Bed", "Coffee",
  "Sun", "Moon", "Sunrise", "Sunset",
  "CloudSun", "CloudMoon",
  "Clock3", "Clock12",

  // 🎉 UX / Fun / Extras
  "Sparkles", "Flame", "Rocket",
  "Gift", "PartyPopper",
  "Medal", "Trophy", "Crown",
  "Puzzle", "Feather",
  "Palette", "Paintbrush",
  "Smile", "Frown", "Meh",
  "ThumbsUp", "ThumbsDown",
  "MessageCircle", "MessagesSquare",
  "Mail", "Send", "Phone", "PhoneCall",

  "Server",
  "LaptopMinimal",
  "Cpu",
  "Monitor",
  "SmartphoneCharging",
  "TabletSmartphone",
  "Watch",
  "Tv",
  "Camera",
  "Speaker",
  "Headphones",
  "Gamepad2",
  "Printer",
  "Keyboard",
  "Mouse",
  "BatteryCharging",
  "Router",
  "HardDrive",
];

const CustomIconPicker: React.FC<CustomIconPickerProps> = ({
  value,
  onChange,
  label = "Select Icon",
  error,
}) => {
  const [selectedIcon, setSelectedIcon] = useState<string>(value || "");
""
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