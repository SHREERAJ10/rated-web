import {
  ChartNoAxesCombinedIcon,
  ClipboardListIcon,
  LayoutDashboard,
  Lock,
  Mail,
  Settings,
  UserRound,
  UsersIcon,
} from "lucide-react";

type IconName =
  | string
  | "UserRound"
  | "Lock"
  | "Mail"
  | "LayoutDashboard"
  | "UsersIcon"
  | "ClipboardListIcon"
  | "ChartNoAxesCombinedIcon"
  | "Settings";

interface IconConfig {
  size: number | string;
  strokeWidth: number;
  color: string;
}

function getIconFromName(
  icon: IconName,
  className: string = "",
  iconConfig: IconConfig = { size: 20, strokeWidth: 2, color: "#7C7C7C" },
) {
  const { size, strokeWidth, color } = iconConfig;

  switch (icon) {
    case "UserRound":
      return <UserRound size={size} strokeWidth={strokeWidth} color={color} />;
    case "Lock":
      return <Lock size={size} strokeWidth={strokeWidth} color={color} />;
    case "Mail":
      return <Mail size={size} strokeWidth={strokeWidth} color={color} />;
    case "LayoutDashboard":
      return (
        <LayoutDashboard
          size={size}
          strokeWidth={strokeWidth}
          color="#444444"
          className={className}
        />
      );
    case "UsersIcon":
      return (
        <UsersIcon
          size={size}
          strokeWidth={strokeWidth}
          color="#444444"
          className={className}
        />
      );
    case "ClipboardListIcon":
      return (
        <ClipboardListIcon
          size={size}
          strokeWidth={strokeWidth}
          color="#444444"
          className={className}
        />
      );
    case "ChartNoAxesCombinedIcon":
      return (
        <ChartNoAxesCombinedIcon
          size={32}
          strokeWidth={strokeWidth}
          color={color}
          className={className}
        />
      );
    case "Settings":
      return (
        <Settings
          size={size}
          strokeWidth={strokeWidth}
          color={color}
          className={className}
        />
      );
  }
}

export default getIconFromName;
