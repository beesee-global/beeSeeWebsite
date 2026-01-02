import { useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";

interface DropdownItem {
  label: string;
  to: string;
}

interface DropdownMenuProps {
  icon: ReactNode;                // any icon component
  items: DropdownItem[];          // menu items
}

const DropdownMenu = ({ icon, items }: DropdownMenuProps) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger Button */}
      <button className="p-2 rounded-full hover:bg-white/10 transition">
        {icon}
      </button>

      {/* Dropdown (always mounted, but hidden with opacity) */}
      <div
        className={`absolute right-0 mt-2 w-40 bg-white text-black rounded-md shadow-lg z-50 transition-all duration-200
          ${open ? "opacity-100 visible" : "opacity-0 invisible"}`}
      >
        {items.map((item) => (
          <button
            key={item.label}
            onClick={() => navigate(item.to)}
            className="block w-full px-4 py-2 text-left hover:bg-gray-100"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DropdownMenu;
