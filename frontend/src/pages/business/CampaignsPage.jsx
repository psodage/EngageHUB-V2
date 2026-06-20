import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DashboardPageShell from "../../components/layout/DashboardPageShell";
import {
  Layers,
  Plus,
  Calendar,
  Trash2,
  Edit,
  ChevronRight,
  ChevronLeft,
  Clock,
  FolderOpen,
  Share2,
  ArrowLeft,
  AlertCircle,
  FileText,
  CheckCircle2,
  X,
  Image as ImageIcon,
  Briefcase,
  Search,
  Filter,
  MoreHorizontal,
  Sparkles,
  Zap,
  Target,
  Megaphone,
  Gift,
  Star,
  TrendingUp,
  BarChart3,
  Users,
  Copy,
  Pause,
  Archive,
  Eye
} from "lucide-react";
import {
  listCampaigns,
  createCampaign,
  getCampaign,
  updateCampaign,
  deleteCampaign
} from "../../services/campaignApi";
import {
  createScheduledPost,
  updateScheduledPost,
  deleteScheduledPost
} from "../../services/scheduleApi";
import { PLATFORM_BRAND_ICONS, PLATFORM_BRAND_BG } from "../../data/platformBrandIcons";
import { useApp } from "../../context/AppContext";

// ─── Constants ──────────────────────────────────────────────────────────────────

const TEAM_MEMBERS = [
  { name: "Steven M.", avatarBg: "bg-indigo-500" },
  { name: "Sarah K.", avatarBg: "bg-pink-500" },
  { name: "Alex R.", avatarBg: "bg-emerald-500" },
  { name: "Michael T.", avatarBg: "bg-amber-500" },
];

const POST_STATUSES = ["draft", "scheduled", "approved", "published", "rejected"];

const channelOptions = [
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "x", label: "X" },
  { key: "youtube", label: "YouTube" },
  { key: "googleBusiness", label: "Google" },
];

const CAMPAIGN_TABS = [
  { key: "all", label: "All Campaigns" },
  { key: "active", label: "Active" },
  { key: "scheduled", label: "Scheduled" },
  { key: "completed", label: "Completed" },
  { key: "draft", label: "Drafts" },
];

// ─── Campaign Templates Data ────────────────────────────────────────────────────

const CAMPAIGN_TEMPLATES = [
  { id: "independence", title: "Independence Day Campaign", description: "Celebrate national pride with patriotic content across all platforms.", icon: "🇮🇳", tags: ["Holiday", "National"], platforms: ["facebook", "instagram", "linkedin"] },
  { id: "diwali", title: "Diwali Promotion Campaign", description: "Festival of lights — drive sales with festive offers and wishes.", icon: "🪔", tags: ["Festival", "Sales"], platforms: ["instagram", "facebook", "x"] },
  { id: "product-launch", title: "Product Launch Campaign", description: "Build hype and announce your latest product across channels.", icon: "🚀", tags: ["Product", "Launch"], platforms: ["linkedin", "instagram", "facebook"] },
  { id: "festival-sale", title: "Festival Sale Campaign", description: "Seasonal discounts, flash deals and promotional bundles.", icon: "🛍️", tags: ["Sales", "Seasonal"], platforms: ["instagram", "facebook"] },
  { id: "feedback", title: "Customer Feedback Campaign", description: "Collect reviews, testimonials and valuable user insights.", icon: "💬", tags: ["Engagement", "Feedback"], platforms: ["linkedin", "googleBusiness"] },
  { id: "new-service", title: "New Service Announcement", description: "Announce new services and capabilities to your audience.", icon: "📢", tags: ["Announcement", "Growth"], platforms: ["linkedin", "facebook", "x"] },
  { id: "anniversary", title: "Business Anniversary Campaign", description: "Celebrate your company milestones with engaging stories.", icon: "🎂", tags: ["Milestone", "Brand"], platforms: ["instagram", "facebook", "linkedin"] },
  { id: "lead-gen", title: "Lead Generation Campaign", description: "Drive qualified leads with targeted content and CTAs.", icon: "🎯", tags: ["Lead Gen", "Growth"], platforms: ["linkedin", "facebook", "instagram"] },
];

// ─── AI Suggested Campaigns Data ────────────────────────────────────────────────

function getAISuggestions() {
  const today = new Date();
  const year = today.getFullYear();

  const events = [
    { name: "Independence Day", emoji: "🇮🇳", date: new Date(year, 7, 15), platforms: ["facebook", "instagram", "linkedin"], postCount: 8 },
    { name: "Diwali Campaign", emoji: "🪔", date: new Date(year, 9, 20), platforms: ["instagram", "facebook", "x"], postCount: 12 },
    { name: "Christmas Campaign", emoji: "🎄", date: new Date(year, 11, 25), platforms: ["instagram", "facebook"], postCount: 6 },
    { name: "New Year Campaign", emoji: "🎊", date: new Date(year + 1, 0, 1), platforms: ["instagram", "facebook", "linkedin", "x"], postCount: 10 },
    { name: "Republic Day", emoji: "🏛️", date: new Date(year + 1, 0, 26), platforms: ["facebook", "linkedin"], postCount: 5 },
    { name: "Valentine's Day", emoji: "❤️", date: new Date(year + 1, 1, 14), platforms: ["instagram", "facebook"], postCount: 7 },
    { name: "Women's Day", emoji: "👩", date: new Date(year + 1, 2, 8), platforms: ["instagram", "linkedin", "facebook"], postCount: 6 },
    { name: "Festival Sale", emoji: "🛍️", date: new Date(year, 9, 15), platforms: ["instagram", "facebook"], postCount: 15 },
  ];

  return events
    .map((e) => {
      let diff = Math.ceil((e.date - today) / (1000 * 60 * 60 * 24));
      if (diff < 0) diff += 365;
      return { ...e, daysRemaining: diff };
    })
    .sort((a, b) => a.daysRemaining - b.daysRemaining)
    .slice(0, 6);
}

// ─── Status Helpers ─────────────────────────────────────────────────────────────

function getCampaignStatusClass(s) {
  switch (s) {
    case "active": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400";
    case "scheduled": return "bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400";
    case "completed": return "bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400";
    case "draft": return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
    case "failed": return "bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400";
    default: return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";
  }
}

function getCampaignStatusDot(s) {
  switch (s) {
    case "active": return "bg-emerald-500";
    case "scheduled": return "bg-blue-500";
    case "completed": return "bg-purple-500";
    case "draft": return "bg-slate-400";
    case "failed": return "bg-red-500";
    default: return "bg-slate-400";
  }
}

function getPostStatusColorClass(status) {
  switch (status) {
    case "draft": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    case "scheduled": return "bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400";
    case "approved": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400";
    case "published": return "bg-teal-50 text-teal-700 dark:bg-teal-950/45 dark:text-teal-400";
    case "rejected": return "bg-red-50 text-red-700 dark:bg-red-950/45 dark:text-red-400";
    default: return "bg-slate-100 text-slate-700";
  }
}

function getPostStatusBorderAndBgClass(status) {
  switch (status) {
    case "draft": return "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400";
    case "scheduled": return "bg-blue-50/50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400";
    case "approved": return "bg-emerald-50/50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400";
    case "published": return "bg-teal-50/50 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-850 dark:text-teal-450";
    case "rejected": return "bg-red-50/50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400";
    default: return "bg-slate-50 border-slate-200 text-slate-700";
  }
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function CampaignsPage() {
  const { setToast } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  // Post Drawer State
  const [isPostDrawerOpen, setIsPostDrawerOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);

  // Detail Drawer State
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [campaignDetail, setCampaignDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false);

  // Campaign Create/Edit Drawer State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [color, setColor] = useState("#C8FF00");
  const [status, setStatus] = useState("active");

  // Filters / Tabs
  const [activeTab, setActiveTab] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  // Actions menu
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // AI Suggestions
  const aiSuggestions = useMemo(() => getAISuggestions(), []);

  const colors = [
    { value: "#C8FF00", label: "Neon Lime" },
    { value: "#3B82F6", label: "Blue" },
    { value: "#EC4899", label: "Pink" },
    { value: "#8B5CF6", label: "Purple" },
    { value: "#10B981", label: "Emerald" },
    { value: "#F59E0B", label: "Amber" }
  ];

  // ─── Data Fetching ──────────────────────────────────────────────────────────

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const data = await listCampaigns();
      setCampaigns(data);
    } catch (err) {
      setToast({ message: err.message || "Failed to load campaigns.", error: true });
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (id) => {
    try {
      setDetailLoading(true);
      const data = await getCampaign(id);
      setCampaignDetail(data);
    } catch (err) {
      setToast({ message: err.message || "Failed to load campaign details.", error: true });
      setSelectedCampaignId(null);
      setIsDetailDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  useEffect(() => { fetchCampaigns(); }, []);

  useEffect(() => {
    if (selectedCampaignId) {
      fetchDetail(selectedCampaignId);
    } else {
      setCampaignDetail(null);
    }
  }, [selectedCampaignId]);

  // Close actions menu on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ─── Post Drawer Handlers ──────────────────────────────────────────────────

  const handleOpenCreatePostDrawer = () => {
    setSelectedPost({
      _id: `new-${Date.now()}`,
      title: "",
      caption: "",
      channelKeys: ["instagram"],
      scheduledAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16),
      status: "draft",
      assignedTeamMember: "Steven M.",
      mediaUrl: "",
      engagementRate: "0.0%",
      campaignId: selectedCampaignId || "",
      isNew: true
    });
    setIsPostDrawerOpen(true);
  };

  const handleOpenEditPostDrawer = (post) => {
    setSelectedPost({
      ...post,
      assignedTeamMember: post.assignedTeamMember || "Steven M.",
      engagementRate: post.engagementRate || "0.0%",
      scheduledAt: post.scheduledAt ? post.scheduledAt.substring(0, 16) : new Date().toISOString().substring(0, 16),
      isNew: false
    });
    setIsPostDrawerOpen(true);
  };

  const handleSavePostDrawer = async (updated) => {
    setIsPostDrawerOpen(false);
    const isoDate = new Date(updated.scheduledAt).toISOString();
    if (updated.isNew) {
      const payload = { title: updated.title || "Scheduled Post", caption: updated.caption, channelKeys: updated.channelKeys, scheduledAt: isoDate, mediaUrl: updated.mediaUrl, status: updated.status, campaignId: updated.campaignId || null };
      try {
        await createScheduledPost(payload);
        setToast({ message: "Post created and scheduled successfully." });
        if (selectedCampaignId) fetchDetail(selectedCampaignId);
      } catch (err) {
        setToast({ message: err.message || "Failed to create post.", error: true });
      }
    } else {
      try {
        await updateScheduledPost(updated._id, { title: updated.title, caption: updated.caption, channelKeys: updated.channelKeys, scheduledAt: isoDate, mediaUrl: updated.mediaUrl, status: updated.status, campaignId: updated.campaignId || null });
        setToast({ message: "Post updated successfully." });
        if (selectedCampaignId) fetchDetail(selectedCampaignId);
      } catch (err) {
        setToast({ message: err.message || "Failed to update post.", error: true });
      }
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this scheduled post?")) return;
    try {
      await deleteScheduledPost(postId);
      setToast({ message: "Post deleted successfully." });
      setIsPostDrawerOpen(false);
      if (selectedCampaignId) fetchDetail(selectedCampaignId);
    } catch (err) {
      setToast({ message: err.message || "Failed to delete post.", error: true });
    }
  };

  useEffect(() => {
    if (location.state?.openComposer) {
      handleOpenCreatePostDrawer();
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // ─── Campaign Handlers ────────────────────────────────────────────────────

  const handleOpenCreateModal = (prefill = {}) => {
    setEditingCampaign(null);
    setName(prefill.name || "");
    setDescription(prefill.description || "");
    setStartDate(prefill.startDate || "");
    setEndDate(prefill.endDate || "");
    setColor(prefill.color || "#C8FF00");
    setStatus("active");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (camp) => {
    setEditingCampaign(camp);
    setName(camp.name);
    setDescription(camp.description || "");
    setStartDate(camp.startDate ? new Date(camp.startDate).toISOString().split("T")[0] : "");
    setEndDate(camp.endDate ? new Date(camp.endDate).toISOString().split("T")[0] : "");
    setColor(camp.color || "#C8FF00");
    setStatus(camp.status || "active");
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name || !startDate || !endDate) {
      setToast({ message: "Please fill in all required fields.", error: true });
      return;
    }
    try {
      const payload = { name, description, startDate, endDate, color, status };
      if (editingCampaign) {
        await updateCampaign(editingCampaign._id, payload);
        setToast({ message: "Campaign updated successfully." });
        if (selectedCampaignId === editingCampaign._id) fetchDetail(selectedCampaignId);
      } else {
        await createCampaign(payload);
        setToast({ message: "Campaign created successfully." });
      }
      setIsModalOpen(false);
      fetchCampaigns();
    } catch (err) {
      setToast({ message: err.message || "Failed to save campaign.", error: true });
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    try {
      await deleteCampaign(id);
      setToast({ message: "Campaign deleted successfully." });
      if (selectedCampaignId === id) {
        setSelectedCampaignId(null);
        setIsDetailDrawerOpen(false);
      }
      setActiveMenuId(null);
      fetchCampaigns();
    } catch (err) {
      setToast({ message: err.message || "Failed to delete campaign.", error: true });
    }
  };

  const handleViewCampaign = (camp) => {
    setSelectedCampaignId(camp._id);
    setIsDetailDrawerOpen(true);
    setActiveMenuId(null);
  };

  const handleDuplicateCampaign = (camp) => {
    handleOpenCreateModal({
      name: `${camp.name} (Copy)`,
      description: camp.description,
      startDate: camp.startDate ? new Date(camp.startDate).toISOString().split("T")[0] : "",
      endDate: camp.endDate ? new Date(camp.endDate).toISOString().split("T")[0] : "",
      color: camp.color,
    });
    setActiveMenuId(null);
  };

  // ─── Filtered Campaigns ───────────────────────────────────────────────────

  const filteredCampaigns = useMemo(() => {
    let list = [...campaigns];
    // Tab filter
    if (activeTab !== "all") {
      list = list.filter((c) => {
        if (activeTab === "scheduled") return c.status === "scheduled" || c.status === "active";
        return c.status === activeTab;
      });
    }
    // Status filter
    if (statusFilter !== "all") {
      list = list.filter((c) => c.status === statusFilter);
    }
    // Search
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      list = list.filter((c) => (c.name || "").toLowerCase().includes(q) || (c.description || "").toLowerCase().includes(q));
    }
    // Sort
    if (sortBy === "newest") list.sort((a, b) => new Date(b.createdAt || b.startDate) - new Date(a.createdAt || a.startDate));
    else if (sortBy === "oldest") list.sort((a, b) => new Date(a.createdAt || a.startDate) - new Date(b.createdAt || b.startDate));
    else if (sortBy === "name") list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    return list;
  }, [campaigns, activeTab, statusFilter, searchTerm, sortBy]);

  const tabCounts = useMemo(() => ({
    all: campaigns.length,
    active: campaigns.filter((c) => c.status === "active").length,
    scheduled: campaigns.filter((c) => c.status === "scheduled" || c.status === "active").length,
    completed: campaigns.filter((c) => c.status === "completed").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
  }), [campaigns]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────

  return (
    <DashboardPageShell
      title="Campaign Management"
      description="Plan, launch, and manage your marketing campaigns with AI-powered suggestions."
      actions={
        <button
          type="button"
          onClick={() => handleOpenCreateModal()}
          className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8FF00] px-4 py-2 text-xs font-bold text-black hover:bg-[#d4ff33] transition shadow-sm"
        >
          <Plus size={14} />
          Create Campaign
        </button>
      }
    >
      {/* ==================== AI SUGGESTED CAMPAIGNS ==================== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-[#C8FF00]/20 to-[#82a800]/10 dark:from-[#C8FF00]/10 dark:to-[#82a800]/5 flex items-center justify-center">
              <Sparkles size={16} className="text-[#82a800] dark:text-[#C8FF00]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Suggested Campaigns</h3>
              <p className="text-[10px] text-slate-400">Auto-generated based on upcoming events and trends</p>
            </div>
          </div>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
          {aiSuggestions.map((s) => (
            <div key={s.name} className="shrink-0 w-64 rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/80 dark:bg-slate-900 p-4 hover:shadow-card hover:-translate-y-0.5 transition duration-200 flex flex-col gap-3 group">
              <div className="flex items-start justify-between">
                <span className="text-2xl">{s.emoji}</span>
                <span className="text-[10px] font-bold text-[#82a800] dark:text-[#C8FF00] bg-[#C8FF00]/10 dark:bg-[#C8FF00]/5 px-2 py-0.5 rounded-full">
                  {s.daysRemaining}d away
                </span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-[#82a800] dark:group-hover:text-[#C8FF00] transition">{s.name}</h4>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="flex -space-x-1">
                    {s.platforms.slice(0, 3).map((p) => {
                      const Icon = PLATFORM_BRAND_ICONS[p] || Briefcase;
                      return <div key={p} className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-white dark:border-slate-900"><Icon size={9} className="text-slate-500" /></div>;
                    })}
                  </div>
                  <span className="text-[9px] text-slate-400 font-semibold">{s.postCount} posts suggested</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleOpenCreateModal({ name: s.name, description: `AI-generated campaign for ${s.name}. Recommended: ${s.postCount} posts across ${s.platforms.join(", ")}.` })}
                className="w-full mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#C8FF00]/10 hover:bg-[#C8FF00] dark:bg-[#C8FF00]/5 dark:hover:bg-[#C8FF00] px-3 py-1.5 text-[10px] font-bold text-[#82a800] dark:text-[#C8FF00] hover:text-black dark:hover:text-black transition"
              >
                <Zap size={10} />
                AI Generate Campaign
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== CAMPAIGN TEMPLATES ==================== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={16} className="text-[#82a800] dark:text-[#C8FF00]" />
            Campaign Templates
          </h3>
          <button type="button" className="text-[11px] font-bold text-[#82a800] dark:text-[#C8FF00] hover:underline flex items-center gap-0.5">
            View All <ChevronRight size={12} />
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {CAMPAIGN_TEMPLATES.map((t) => (
            <div key={t.id} className="rounded-xl border border-slate-200/60 bg-white dark:border-slate-800/80 dark:bg-slate-900 p-3.5 hover:shadow-card hover:-translate-y-0.5 transition duration-200 flex flex-col gap-2.5 group cursor-pointer" onClick={() => handleOpenCreateModal({ name: t.title, description: t.description })}>
              <div className="flex items-center justify-between">
                <span className="text-lg">{t.icon}</span>
                <ChevronRight size={14} className="text-slate-300 group-hover:text-[#82a800] dark:group-hover:text-[#C8FF00] transition" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#82a800] dark:group-hover:text-[#C8FF00] transition">{t.title}</h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">{t.description}</p>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                {t.tags.map((tag) => (
                  <span key={tag} className="text-[8px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider">{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== TABS + FILTERS + LIST ==================== */}
      <section className="flex flex-col gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-1 border-b border-slate-200/60 dark:border-slate-800/60 overflow-x-auto scrollbar-thin">
          {CAMPAIGN_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`shrink-0 px-4 py-2.5 text-xs font-bold transition border-b-2 ${activeTab === tab.key
                ? "border-[#C8FF00] text-[#82a800] dark:text-[#C8FF00]"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {tab.label}
              <span className={`ml-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? "bg-[#C8FF00]/20 text-[#82a800] dark:text-[#C8FF00]" : "bg-slate-100 dark:bg-slate-800 text-slate-400"}`}>
                {tabCounts[tab.key] || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Filters Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search campaigns..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition"
            />
          </div>
          {/* Right Filters */}
          <div className="flex items-center gap-2 flex-wrap">
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 cursor-pointer">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Name A-Z</option>
            </select>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-xl border border-slate-200 bg-slate-50/50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 cursor-pointer">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="scheduled">Scheduled</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
            <button type="button" onClick={() => handleOpenCreateModal()} className="hidden sm:inline-flex items-center gap-1.5 rounded-xl bg-[#C8FF00] px-4 py-1.5 text-xs font-bold text-black hover:bg-[#d4ff33] transition shadow-sm">
              <Plus size={13} /> Create Campaign
            </button>
          </div>
        </div>

        {/* Campaign List */}
        {loading ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-400 gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-[#82a800]" />
            <span className="text-xs">Loading campaigns...</span>
          </div>
        ) : filteredCampaigns.length === 0 && campaigns.length === 0 ? (
          /* Empty State */
          <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-16 flex flex-col items-center justify-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-[#C8FF00]/20 to-[#82a800]/10 dark:from-[#C8FF00]/10 dark:to-[#82a800]/5 flex items-center justify-center">
              <Megaphone size={28} strokeWidth={1.5} className="text-[#82a800] dark:text-[#C8FF00]" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">📢 No Campaigns Yet</h3>
              <p className="text-xs text-slate-400 max-w-sm mt-1.5 leading-relaxed">Create your first campaign or use AI-generated campaign templates to start growing your audience.</p>
            </div>
            <div className="flex items-center gap-3 mt-2">
              <button type="button" onClick={() => handleOpenCreateModal()} className="inline-flex items-center gap-1.5 rounded-xl bg-[#C8FF00] px-5 py-2 text-xs font-bold text-black hover:bg-[#d4ff33] transition shadow-sm">
                <Plus size={13} /> Create Campaign
              </button>
              <button type="button" onClick={() => handleOpenCreateModal({ name: aiSuggestions[0]?.name || "AI Campaign", description: "AI-generated campaign suggestion." })} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-5 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition">
                <Sparkles size={13} /> Generate AI Campaign
              </button>
            </div>
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">No campaigns match your search or filters.</div>
        ) : (
          /* Campaign Rows */
          <div className="flex flex-col gap-2">
            {filteredCampaigns.map((camp) => (
              <div
                key={camp._id}
                className="rounded-xl border border-slate-200/60 bg-white dark:border-slate-800/80 dark:bg-slate-900 p-4 hover:shadow-card transition duration-200 flex flex-col md:flex-row md:items-center gap-4 relative group cursor-pointer"
                onClick={() => handleViewCampaign(camp)}
              >
                {/* Left: Color strip + Info */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className="h-10 w-10 rounded-xl shrink-0 flex items-center justify-center" style={{ backgroundColor: (camp.color || "#C8FF00") + "20" }}>
                    <Layers size={18} style={{ color: camp.color || "#C8FF00" }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-[#82a800] dark:group-hover:text-[#C8FF00] transition">{camp.name}</h4>
                    <p className="text-[10px] text-slate-400 truncate leading-relaxed">{camp.description || "No description"}</p>
                    <p className="text-[9px] text-slate-400 mt-0.5 flex items-center gap-1">
                      <Calendar size={9} /> {formatDate(camp.startDate)} — {formatDate(camp.endDate)}
                    </p>
                  </div>
                </div>

                {/* Middle: Platforms */}
                <div className="flex items-center gap-1.5 shrink-0">
                  {["facebook", "instagram", "linkedin", "x", "googleBusiness"].slice(0, 3).map((p) => {
                    const Icon = PLATFORM_BRAND_ICONS[p] || Briefcase;
                    return (
                      <div key={p} className="h-6 w-6 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center" title={p}>
                        <Icon size={11} className="text-slate-500 dark:text-slate-400" />
                      </div>
                    );
                  })}
                  <span className="text-[9px] font-semibold text-slate-400 ml-0.5">{camp.postCount || 0} posts</span>
                </div>

                {/* Right: Status + Actions */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full capitalize flex items-center gap-1 ${getCampaignStatusClass(camp.status)}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${getCampaignStatusDot(camp.status)}`} />
                    {camp.status}
                  </span>

                  {/* Actions Menu */}
                  <div className="relative" ref={activeMenuId === camp._id ? menuRef : null}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setActiveMenuId(activeMenuId === camp._id ? null : camp._id); }}
                      className="p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
                    >
                      <MoreHorizontal size={14} />
                    </button>

                    {activeMenuId === camp._id && (
                      <div className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 dark:bg-[#111] dark:border-slate-800 rounded-xl shadow-xl p-1 z-30 flex flex-col">
                        {[
                          { label: "View Campaign", icon: Eye, onClick: () => handleViewCampaign(camp) },
                          { label: "Edit Campaign", icon: Edit, onClick: () => { handleOpenEditModal(camp); setActiveMenuId(null); } },
                          { label: "Duplicate", icon: Copy, onClick: () => handleDuplicateCampaign(camp) },
                          { label: "Create Post", icon: Plus, onClick: () => { setSelectedCampaignId(camp._id); handleOpenCreatePostDrawer(); setActiveMenuId(null); } },
                        ].map((action) => (
                          <button key={action.label} type="button" onClick={(e) => { e.stopPropagation(); action.onClick(); }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 text-left transition w-full">
                            <action.icon size={11} /> {action.label}
                          </button>
                        ))}
                        <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />
                        <button type="button" onClick={(e) => { e.stopPropagation(); handleDeleteCampaign(camp._id); }} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left transition w-full">
                          <Trash2 size={11} /> Delete Campaign
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ==================== CAMPAIGN DETAIL DRAWER ==================== */}
      <AnimatePresence>
        {isDetailDrawerOpen && selectedCampaignId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/45 backdrop-blur-[2px] flex justify-end"
            onClick={() => { setIsDetailDrawerOpen(false); setSelectedCampaignId(null); }}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-xl bg-white dark:bg-[#111] h-full shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800/80 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {detailLoading || !campaignDetail ? (
                <div className="flex-1 flex items-center justify-center text-slate-400 text-xs">Loading campaign details...</div>
              ) : (
                <>
                  {/* Drawer Header */}
                  <div className="border-b border-slate-100 dark:border-slate-800/80 p-5 shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: (campaignDetail.campaign.color || "#C8FF00") + "20" }}>
                          <Layers size={20} style={{ color: campaignDetail.campaign.color || "#C8FF00" }} />
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-slate-900 dark:text-white">{campaignDetail.campaign.name}</h3>
                          <p className="text-[10px] text-slate-400 mt-0.5">{campaignDetail.campaign.description || "No description"}</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => { setIsDetailDrawerOpen(false); setSelectedCampaignId(null); }} className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 transition">
                        <X size={16} />
                      </button>
                    </div>

                    {/* Quick stats */}
                    <div className="flex items-center gap-4 mt-4">
                      <span className={`text-[9px] font-bold px-2.5 py-1 rounded-full capitalize flex items-center gap-1 ${getCampaignStatusClass(campaignDetail.campaign.status)}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${getCampaignStatusDot(campaignDetail.campaign.status)}`} />
                        {campaignDetail.campaign.status}
                      </span>
                      <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10} /> {formatDate(campaignDetail.campaign.startDate)} — {formatDate(campaignDetail.campaign.endDate)}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 mt-4">
                      <button type="button" onClick={() => handleOpenEditModal(campaignDetail.campaign)} className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:bg-slate-800 px-3 py-1.5 text-[10px] font-bold text-slate-600 dark:text-slate-300 transition">
                        <Edit size={11} /> Edit
                      </button>
                      <button type="button" onClick={handleOpenCreatePostDrawer} className="inline-flex items-center gap-1 rounded-xl bg-[#C8FF00] hover:bg-[#d4ff33] px-3 py-1.5 text-[10px] font-bold text-black transition">
                        <Plus size={11} /> Create Post
                      </button>
                      <button type="button" onClick={() => handleDeleteCampaign(campaignDetail.campaign._id)} className="inline-flex items-center gap-1 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 dark:border-red-950/20 dark:bg-red-950/10 px-3 py-1.5 text-[10px] font-bold text-red-500 dark:text-red-400 transition ml-auto">
                        <Trash2 size={11} /> Delete
                      </button>
                    </div>
                  </div>

                  {/* Drawer Content: Posts Timeline */}
                  <div className="p-5 flex-1 overflow-y-auto">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                        <FolderOpen size={13} className="text-[#82a800] dark:text-[#C8FF00]" /> Scheduled Posts
                      </h4>
                      <span className="text-[10px] font-bold text-slate-400">{campaignDetail.posts.length} post{campaignDetail.posts.length !== 1 ? "s" : ""}</span>
                    </div>

                    {campaignDetail.posts.length === 0 ? (
                      <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl py-12 flex flex-col items-center justify-center text-slate-400 gap-3">
                        <FileText size={28} strokeWidth={1.5} className="text-slate-300 dark:text-slate-650" />
                        <span className="text-xs font-semibold">No posts in this campaign</span>
                        <button type="button" onClick={handleOpenCreatePostDrawer} className="inline-flex items-center gap-1 px-4 py-1.5 rounded-xl bg-[#C8FF00] text-[10px] font-bold text-black hover:bg-[#d4ff33] transition">
                          <Plus size={11} /> Create Post
                        </button>
                      </div>
                    ) : (
                      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 pl-5 space-y-4">
                        {campaignDetail.posts.map((post, idx) => (
                          <div key={post._id} className="relative group">
                            <div className="absolute -left-[25px] top-2 h-3 w-3 rounded-full border-2 border-white bg-slate-300 dark:border-[#111] dark:bg-slate-700 group-hover:bg-[#C8FF00] transition" />
                            <div
                              onClick={() => handleOpenEditPostDrawer(post)}
                              className="cursor-pointer p-3 rounded-xl border border-slate-100 bg-slate-50/50 dark:border-slate-800 dark:bg-slate-950/30 hover:shadow-card hover:border-slate-300 dark:hover:border-slate-700 transition duration-150"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <span className="text-[8px] font-extrabold text-[#82a800] dark:text-[#C8FF00] uppercase tracking-wider">Step {idx + 1}</span>
                                  <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded uppercase ${post.status === "published" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400" : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400"}`}>
                                    {post.status}
                                  </span>
                                </div>
                                <div className="flex gap-0.5">
                                  {(post.channelKeys || []).slice(0, 3).map((k) => {
                                    const Ic = PLATFORM_BRAND_ICONS[k] || Briefcase;
                                    return <Ic key={k} size={9} className="text-slate-400" />;
                                  })}
                                </div>
                              </div>
                              <h5 className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate mt-1">{post.title || post.caption || "Untitled Post"}</h5>
                              <p className="text-[9px] text-slate-400 flex items-center gap-1 mt-0.5">
                                <Clock size={9} />
                                {new Date(post.scheduledAt).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Mock Analytics Preview */}
                    <div className="mt-6 rounded-xl border border-slate-200/60 bg-slate-50/50 dark:border-slate-800/60 dark:bg-slate-950/20 p-4">
                      <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-3">
                        <BarChart3 size={13} className="text-[#82a800] dark:text-[#C8FF00]" /> Analytics Preview
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { label: "Est. Reach", value: "2.4K", icon: Users },
                          { label: "Engagement", value: "5.8%", icon: TrendingUp },
                          { label: "Posts", value: campaignDetail.posts.length, icon: FileText },
                        ].map((stat) => (
                          <div key={stat.label} className="text-center">
                            <stat.icon size={14} className="mx-auto text-slate-400 mb-1" />
                            <div className="text-sm font-bold text-slate-800 dark:text-white">{stat.value}</div>
                            <div className="text-[9px] text-slate-400 font-semibold">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== CREATE / EDIT CAMPAIGN DRAWER ==================== */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex justify-end"
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-white dark:bg-[#111] h-full shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800/80 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <form onSubmit={handleSave} className="flex flex-col h-full">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 p-5 shrink-0">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{editingCampaign ? "Edit Campaign" : "Create New Campaign"}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">{editingCampaign ? "Update campaign timeline or details." : "Define a new sequential campaign catalog."}</p>
                  </div>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
                    <X size={16} />
                  </button>
                </div>

                <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Name *</label>
                    <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g., Summer Sneakers Launch 2026" className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Goals, targets, or links for this campaign series..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition resize-none" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Start Date *</label>
                      <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">End Date *</label>
                      <input type="date" required value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaign Tag Color</label>
                    <div className="flex gap-2.5">
                      {colors.map((c) => (
                        <button key={c.value} type="button" onClick={() => setColor(c.value)} className={`h-7 w-7 rounded-full border transition flex items-center justify-center shrink-0 ${color === c.value ? "border-slate-600 dark:border-white scale-110 shadow-sm" : "border-transparent opacity-70 hover:opacity-100"}`} style={{ backgroundColor: c.value }} title={c.label}>
                          {color === c.value && <span className="h-1.5 w-1.5 rounded-full bg-slate-900" />}
                        </button>
                      ))}
                    </div>
                  </div>
                  {editingCampaign && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status</label>
                      <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer">
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="draft">Draft</option>
                      </select>
                    </div>
                  )}
                </div>

                <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/20 flex items-center justify-end gap-2 shrink-0">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition">Cancel</button>
                  <button type="submit" className="rounded-xl bg-[#C8FF00] hover:bg-[#a8d600] px-5 py-2 text-xs font-bold text-black shadow-sm transition">{editingCampaign ? "Save Changes" : "Create"}</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================== CREATE / EDIT POST DRAWER ==================== */}
      <AnimatePresence>
        {isPostDrawerOpen && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex justify-end"
            onClick={() => setIsPostDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-white dark:bg-[#111] h-full shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800/80 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 p-5 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{selectedPost.isNew ? "Create Post Entry" : "Post Details & Schedule"}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{selectedPost.isNew ? "Define a brand-new publishing schedule." : `Post ID: ${selectedPost._id}`}</p>
                </div>
                <button type="button" onClick={() => setIsPostDrawerOpen(false)} className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition">
                  <X size={16} />
                </button>
              </div>

              <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post Title</label>
                  <input type="text" value={selectedPost.title} onChange={(e) => setSelectedPost({ ...selectedPost, title: e.target.value })} placeholder="Enter post title..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post Content / Caption</label>
                  <textarea rows={4} value={selectedPost.caption} onChange={(e) => setSelectedPost({ ...selectedPost, caption: e.target.value })} placeholder="Write what you want to publish..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition resize-none" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Media URL</label>
                  <input type="text" value={selectedPost.mediaUrl || ""} onChange={(e) => setSelectedPost({ ...selectedPost, mediaUrl: e.target.value })} placeholder="Paste image/video URL link..." className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition" />
                  {selectedPost.mediaUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-40 flex items-center justify-center relative">
                      <img src={selectedPost.mediaUrl} alt="Media preview" className="w-full h-full object-cover max-h-40" onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }} />
                      <div className="hidden flex-col items-center justify-center p-6 text-slate-400 gap-1">
                        <AlertCircle size={20} />
                        <span className="text-[10px] font-bold">Failed to load preview</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-6 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <ImageIcon size={18} />
                      <span className="text-[10px] font-bold">No media attached</span>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Date & Time</label>
                    <input type="datetime-local" value={selectedPost.scheduledAt} onChange={(e) => setSelectedPost({ ...selectedPost, scheduledAt: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Team Member</label>
                    <select value={selectedPost.assignedTeamMember} onChange={(e) => setSelectedPost({ ...selectedPost, assignedTeamMember: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer">
                      {TEAM_MEMBERS.map((m) => (<option key={m.name} value={m.name}>{m.name}</option>))}
                    </select>
                  </div>
                </div>
                {campaigns.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Campaign</label>
                    <select value={selectedPost.campaignId || ""} onChange={(e) => setSelectedPost({ ...selectedPost, campaignId: e.target.value })} className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer">
                      <option value="">-- No Campaign --</option>
                      {campaigns.map((c) => (<option key={c._id} value={c._id}>{c.name}</option>))}
                    </select>
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Channels</label>
                  <div className="flex flex-wrap gap-2">
                    {channelOptions.map((opt) => {
                      const Icon = PLATFORM_BRAND_ICONS[opt.key] || Briefcase;
                      const isSelected = (selectedPost.channelKeys || []).includes(opt.key);
                      return (
                        <button key={opt.key} type="button" onClick={() => { const current = selectedPost.channelKeys || []; const next = current.includes(opt.key) ? current.filter((k) => k !== opt.key) : [...current, opt.key]; setSelectedPost({ ...selectedPost, channelKeys: next }); }} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${isSelected ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"}`}>
                          <Icon size={12} className={isSelected ? "text-[#C8FF00] dark:text-slate-900" : "text-slate-400"} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Badge</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {POST_STATUSES.map((s) => (
                      <button key={s} type="button" onClick={() => setSelectedPost({ ...selectedPost, status: s })} className={`py-1.5 rounded-xl text-[10px] font-bold capitalize border text-center transition ${selectedPost.status === s ? getPostStatusBorderAndBgClass(s) + " ring-1 ring-offset-1 dark:ring-offset-slate-900" : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800"}`}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/20 flex items-center justify-end gap-2 shrink-0">
                {!selectedPost.isNew && (
                  <button type="button" onClick={() => handleDeletePost(selectedPost._id)} className="mr-auto rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-4 py-2 text-xs font-bold text-red-600 dark:border-red-950/20 dark:bg-red-950/10 dark:text-red-400 transition">Delete Post</button>
                )}
                <button type="button" onClick={() => setIsPostDrawerOpen(false)} className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition">Cancel</button>
                <button type="button" onClick={() => handleSavePostDrawer(selectedPost)} className="rounded-xl bg-[#C8FF00] hover:bg-[#a8d600] px-5 py-2 text-xs font-bold text-black shadow-sm transition">{selectedPost.isNew ? "Schedule Post" : "Save Changes"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardPageShell>
  );
}
