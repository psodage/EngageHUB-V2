import {
  CalendarDays,
  Home,
  PenSquare,
  Radio,
  Settings,
  User,
  Link2,
  Palette,
} from "lucide-react";
import { SOCIAL_PLATFORM_CONFIGS } from "./socialPlatforms";

/** Hosted Express API on Render (OAuth callbacks and VITE_API_URL must use this host). */
export const DEPLOYED_API_BASE_URL = "https://engagehub.onrender.com";

export const STORAGE_KEYS = {
  theme: "engagehub-theme",
  auth: "engagehub-auth",
  authToken: "engagehub-auth-token",
  email: "engagehub-email",
  profileName: "engagehub-profile-name",
  onboardingCompleted: "engagehub-onboarding-completed",
  socialConnections: "engagehub-social-connections",
  draftSignupSession: "engagehub-draft-signup-session",
  userType: "engagehub-user-type",
  selectedUserType: "engagehub-selected-user-type",
  profileSetupCompleted: "engagehub-profile-setup-completed",
  profileCompleted: "engagehub-profile-completed",
  accountsLinked: "engagehub-accounts-linked",
  profileImage: "engagehub-profile-image",
};

/** Buffer-style primary navigation */
export const MAIN_NAV = [
  { key: "dashboard", label: "Content Planner", path: "/dashboard", icon: Home },
  { key: "schedule", label: "Schedule", path: "/schedule", icon: CalendarDays },
  { key: "channels", label: "Connect channels", path: "/channels", icon: Radio },
];

export const SETTINGS_NAV = [
  { key: "account", label: "Account", path: "/settings/account", icon: User, description: "Profile and password" },
  { key: "channels", label: "Channels & connections", path: "/settings/channels", icon: Link2, description: "Social accounts and OAuth" },
  { key: "preferences", label: "Preferences", path: "/settings/preferences", icon: Palette, description: "Appearance and defaults" },
];

/** @deprecated Use MAIN_NAV — kept for Topbar title lookup */
export const ROUTES = [
  ...MAIN_NAV,
  { key: "settings", label: "Settings", path: "/settings", icon: Settings },
];

export function getPageTitle(pathname) {
  const all = [...MAIN_NAV, ...SETTINGS_NAV, { label: "Settings", path: "/settings" }];
  const exact = all.find((r) => r.path === pathname);
  if (exact) return exact.label;

  // Exact path matches for pages without nav entries
  const PAGE_TITLES = {
    "/": "Content Planner",
    "/dashboard": "Content Planner",
    "/schedule": "Content Calendar",
    "/schedule/new": "Schedule Post",
    "/content-calendar": "Content Calendar",
    "/channels": "Social Accounts",
    "/analytics": "Analytics",
    "/media": "Media Library",
    "/settings": "Settings",
    "/settings/account": "Account Settings",
    "/settings/channels": "Channels & Connections",
    "/settings/preferences": "Preferences",
  };

  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];

  if (pathname.startsWith("/settings/")) {
    const section = SETTINGS_NAV.find((r) => r.path === pathname);
    return section ? section.label : "Settings";
  }
  if (pathname.startsWith("/channels/")) {
    const platformKey = pathname.split("/")[2];
    const platform = SOCIAL_PLATFORM_CONFIGS?.find?.((p) => p.key === platformKey);
    if (platform) return platform.label;
    return "Channel Details";
  }
  if (pathname.startsWith("/settings")) return "Settings";
  if (pathname.startsWith("/channels")) return "Social Accounts";
  if (pathname.startsWith("/schedule/new")) return "Schedule Post";
  if (/^\/schedule\/[^/]+$/.test(pathname)) return "Scheduled Post";
  if (pathname.startsWith("/schedule")) return "Content Calendar";
  if (pathname.startsWith("/content-calendar")) return "Content Calendar";
  if (pathname.startsWith("/analytics")) return "Analytics";
  if (pathname.startsWith("/media")) return "Media Library";
  if (pathname === "/" || pathname === "/dashboard") return "Content Planner";
  return "Content Planner";
}
