import React, { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface Option {
  label: string;
  value: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
}

const CustomDropdown: React.FC<Props> = ({ value, onChange, options }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        onClick={() => setOpen(!open)}
        className="
          w-full px-4 py-3
          bg-[#2a2a2a] text-white
          border border-[#FDCC00]/20
          rounded-lg
          flex items-center justify-between
        "
      >
        <span>
          {options.find((opt) => opt.value === value)?.label || "Select..."}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          className="
            absolute left-0 right-0 mt-2
            bg-[#1a1a1a] border border-[#FDCC00]/20
            rounded-lg shadow-lg
            z-50
            max-h-60 overflow-auto
          "
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="
                w-full text-left px-4 py-3
                text-white hover:bg-[#333333]
                border-b border-white/5
              "
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomDropdown;
