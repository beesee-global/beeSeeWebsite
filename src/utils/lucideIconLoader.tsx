import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";

type LucideIconName = keyof typeof LucideIcons;

interface IconProps {
  name?: string | null;
  size?: number;
  color?: string;
  className?: string;
}

export function LucideIcon({
  name,
  size = 20,
  color = "currentColor",
  className
}: IconProps) {
  if (!name) {
    return <HelpCircle size={size} color={color} className={className} />;
  }

  const IconComponent =
    LucideIcons[name as LucideIconName] || HelpCircle;

  return <IconComponent size={size} color={color} className={className} />;
}
