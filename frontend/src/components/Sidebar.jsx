import { useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Calendar,
  Share2,
  BarChart3,
  Image,
  Settings,
  HelpCircle,
  Plus,
  LogOut,
  X,
  PenSquare,
  Sun,
  Moon,
  Sparkles,
  TrendingUp,
  Coins,
  Palette,
  MessageSquare,
  Inbox,
  Layers
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PLATFORM_BRAND_ICONS } from "../data/platformBrandIcons";

export default function Sidebar({ open, onClose, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { connectedAccounts, user, toggleTheme, theme } = useApp();

  const userType = user?.userType || "business";
  const ThemeIcon = theme === "dark" ? Sun : Moon;

  const activeConnections = useMemo(() => {
    return connectedAccounts ? connectedAccounts.filter((a) => a.isConnected) : [];
  }, [connectedAccounts]);

  const activeCount = activeConnections.length;

  const navItems = useMemo(() => {
    const items = [
      { key: "dashboard", label: "Content Planner", path: "/dashboard", icon: LayoutDashboard }
    ];

    if (userType === "influencer") {
      items.push(
        { key: "create-post", label: "Create Post", path: "/create-post", icon: PenSquare },
        { key: "ai-writer", label: "AI Scriptwriter", path: "/ai-writer/influencer", icon: Sparkles },
        { key: "trends", label: "Trend Detection", path: "/trends", icon: TrendingUp },
        { key: "monetization", label: "Sponsorships", path: "/monetization", icon: Coins },
        { key: "brand-kit", label: "Brand Kit", path: "/brand-kit", icon: Palette },
        { key: "automation", label: "Automations", path: "/automation", icon: MessageSquare },
        { key: "channels", label: "Social Accounts", path: "/channels", icon: Share2 },
        { key: "analytics", label: "Analytics", path: "/analytics", icon: BarChart3 },
        { key: "media", label: "Media Library", path: "/media", icon: Image }
      );
    } else { // business
      items.push(
        { key: "create-post", label: "Create Post", path: "/create-post", icon: PenSquare },
        { key: "campaigns", label: "Campaigns", path: "/campaigns", icon: Layers },
        { key: "ai-writer", label: "AI Business Writer", path: "/ai-writer/business", icon: Sparkles },
        { key: "leads", label: "Lead Management", path: "/leads", icon: Inbox },
        { key: "channels", label: "Social Accounts", path: "/channels", icon: Share2 },
        { key: "analytics", label: "Analytics", path: "/analytics", icon: BarChart3 }
      );
    }

    return items;
  }, [userType]);

  const checkActive = (item) => {
    const path = location.pathname;
    if (item.key === "dashboard") {
      return path.startsWith("/dashboard");
    }
    if (item.key === "settings") {
      return path.startsWith("/settings");
    }
    return path === item.path || path.startsWith(item.path);
  };

  return (
    <>
      <aside
        className={`dashboard-sidebar ${open ? "dashboard-sidebar--open" : "dashboard-sidebar--closed"}`}
        aria-label="Main navigation"
      >
        {/* Brand Header */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-slate-100 dark:border-[#222] px-4">
          <NavLink
            to="/dashboard"
            onClick={onClose}
            className="flex items-center gap-2.5 rounded-lg outline-none"
            aria-label="EngageHub Home"
          >

            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Engage<span className="text-[#000000] bg-[#C8FF00] px-1">Hub</span>
            </span>
          </NavLink>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 lg:hidden dark:hover:bg-[#1a1a1a]"
            aria-label="Close menu"
          >
            <X size={18} strokeWidth={2} />
          </button>
        </header>

        {/* Main Nav Items */}
        <nav className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-4 py-6" aria-label="Sidebar">
          <ul className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = checkActive(item);
              return (
                <li key={item.key}>
                  <NavLink
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition duration-200 ${active
                      ? "bg-[#C8FF00] text-black font-semibold shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-[#1a1a1a]"
                      }`}
                  >
                    <Icon size={18} strokeWidth={active ? 2.25 : 2} className="shrink-0" aria-hidden />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>

          {/* Bottom Card section (API & Integrations) */}
          <div className="mt-auto">
            {activeCount <= 1 && (
              <div className="rounded-2xl bg-gradient-to-br from-[#C8FF00]/5 via-slate-50 to-[#C8FF00]/10 dark:from-[#C8FF00]/5 dark:via-[#111] dark:to-[#C8FF00]/10 border border-[#C8FF00]/20 dark:border-[#C8FF00]/15 p-4 mb-3">

                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5 leading-relaxed">Connect more accounts to expand your cross-posting reach.</p>
                <button
                  type="button"
                  onClick={() => { navigate("/channels"); onClose?.(); }}
                  className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] text-black py-2 text-xs font-bold shadow-sm hover:shadow-md transition duration-200"
                >
                  <Plus size={13} strokeWidth={2.5} />
                  Add Account
                </button>
              </div>
            )}

            {/* Connected Accounts List */}
            {activeCount > 0 && (
              <div className="mb-4 px-2">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2 flex items-center justify-between">
                  <span>Connected Accounts</span>
                  <span className="rounded-full bg-slate-100 dark:bg-[#1a1a1a] px-1.5 py-0.5 text-[9px] font-semibold text-slate-500 dark:text-slate-400">
                    {activeCount}
                  </span>
                </div>
                <div className="space-y-1">
                  {activeConnections.map((account) => {
                    const Icon = PLATFORM_BRAND_ICONS[account.platform];
                    const displayName = account.accountName || account.username || account.platform;
                    return (
                      <button
                        type="button"
                        key={account._id || account.id}
                        onClick={() => {
                          navigate(`/channels/${account.platform}`);
                          onClose?.();
                        }}
                        className="w-full flex items-center gap-1.5 rounded-lg bg-slate-50/50 dark:bg-[#111] p-1.5 border border-slate-100/50 dark:border-[#222] hover:bg-slate-100/70 dark:hover:bg-[#1a1a1a] transition duration-150 group text-left cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#C8FF00]/50"
                      >
                        {account.profileImage ? (
                          <img
                            src={account.profileImage}
                            alt={displayName}
                            className="h-5 w-5 rounded-full object-cover border border-white dark:border-[#222] shadow-sm shrink-0"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}

                        <div
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-[#1a1a1a] text-slate-600 dark:text-slate-300 ${account.profileImage ? 'hidden' : ''}`}
                        >
                          {Icon ? <Icon size={10} className="group-hover:scale-110 transition duration-200" /> : null}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate leading-tight">
                            {displayName}
                          </p>
                          <p className="text-[8.5px] text-slate-400 dark:text-slate-500 capitalize leading-none mt-0.5">
                            {account.platform}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {activeCount > 1 && (
                  <button
                    type="button"
                    onClick={() => { navigate("/channels"); onClose?.(); }}
                    className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-[#C8FF00]/30 hover:border-[#C8FF00]/60 dark:border-[#C8FF00]/20 dark:hover:border-[#C8FF00]/40 bg-[#C8FF00]/5 hover:bg-[#C8FF00]/10 dark:bg-[#C8FF00]/5 dark:hover:bg-[#C8FF00]/10 text-[#4a6100] dark:text-[#C8FF00] py-1.5 text-xs font-semibold shadow-sm transition duration-200"
                  >
                    <Plus size={12} strokeWidth={2.5} />
                    Add Account
                  </button>
                )}
              </div>
            )}

            {/* Help & Support & Logout */}
            <div className="border-t border-slate-100 dark:border-[#222] pt-3 space-y-1">
              <a
                href="#support"
                onClick={(e) => { e.preventDefault(); alert("Help & Support center is being loaded!"); }}
                className="flex items-center gap-3 rounded-xl px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-[#1a1a1a] dark:hover:text-slate-200 transition"
              >
                <HelpCircle size={16} className="text-slate-400" />
                <span>Help & Support</span>
              </a>

              {/* Settings Menu Item (Moved here) */}
              <NavLink
                to="/settings/account"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-2 text-xs font-medium transition ${isActive
                    ? "bg-[#C8FF00] text-black font-semibold shadow-sm"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-[#1a1a1a] dark:hover:text-slate-200"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Settings size={16} className={isActive ? "text-black" : "text-slate-400"} />
                    <span>Settings</span>
                  </>
                )}
              </NavLink>

              <button
                type="button"
                onClick={toggleTheme}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-[#1a1a1a] dark:hover:text-slate-200 transition text-left"
              >
                <ThemeIcon size={16} className="text-slate-400" />
                <span>{theme === "dark" ? "Light Mode" : "Dark Mode"}</span>
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-2 text-xs font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/10 dark:hover:text-red-400 transition text-left"
              >
                <LogOut size={16} className="text-slate-400" />
                <span>Log out</span>
              </button>
            </div>
          </div>
        </nav>
      </aside>

      {/* Backdrop for mobile */}
      {open ? (
        <button
          type="button"
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-sm lg:hidden"
          aria-label="Close menu"
        />
      ) : null}
    </>
  );
}
