import * as LucideIcons from "lucide-react";
import { HelpCircle } from "lucide-react";
import type { ElementType } from "react";

type LucideIconName = keyof typeof LucideIcons;

interface IconProps {
  name?: string | null;
  size?: number;
  color?: string;
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}

export function LucideIcon({
  name,
  size = 20,
  color = "currentColor",
  className,
  "aria-hidden": ariaHidden
}: IconProps) {
  if (!name) {
    return <HelpCircle size={size} color={color} className={className} aria-hidden={ariaHidden} />;
  }

  // lucide-react also exports helpers/factories. Cast the selected export to
  // a JSX-capable component after lookup so those union members do not leak
  // into the rendered component type.
  const IconComponent = (LucideIcons[name as LucideIconName] || HelpCircle) as ElementType;

  return <IconComponent size={size} color={color} className={className} aria-hidden={ariaHidden} />;
}
