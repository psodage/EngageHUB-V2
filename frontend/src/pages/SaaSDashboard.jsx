import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Sparkles,
  TrendingUp,
  Check,
  Image as ImageIcon,
  User,
  LayoutGrid,
  Briefcase,
  Layers,
  ChevronDown
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { PLATFORM_BRAND_ICONS, PLATFORM_BRAND_BG } from "../data/platformBrandIcons";
import {
  listScheduledPosts,
  deleteScheduledPost,
  createScheduledPost,
  updateScheduledPost
} from "../services/scheduleApi";
import { listCampaigns } from "../services/campaignApi";

// List of available team members for assignment (mock data)
const TEAM_MEMBERS = [
  { name: "Steven M.", avatarBg: "bg-indigo-500" },
  { name: "Sarah K.", avatarBg: "bg-pink-500" },
  { name: "Alex R.", avatarBg: "bg-emerald-500" },
  { name: "Michael T.", avatarBg: "bg-amber-500" },
];

// List of statuses
const STATUSES = ["draft", "scheduled", "approved", "published", "rejected"];

// Initial mock posts to seed the database and show a rich default planner experience
const SEED_MOCK_POSTS = [
  {
    _id: "mock-seed-1",
    title: "EcoHarmony Launch Campaign 🚀",
    caption: "We are thrilled to announce our partnership with EcoHarmony! Discover sustainable tech products designed with green living in mind.",
    channelKeys: ["instagram", "facebook", "linkedin"],
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString(), // Tomorrow
    status: "approved",
    assignedTeamMember: "Steven M.",
    mediaUrl: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=60",
    engagementRate: "5.4%",
    isMock: true
  },
  {
    _id: "mock-seed-2",
    title: "Weekly Tips: Maximize Instagram Reach 💡",
    caption: "Ever wondered why your post reach dropped? Here are 5 tips to fix your engagement algorithm instantly.",
    channelKeys: ["instagram", "x"],
    scheduledAt: new Date().toISOString(), // Today
    status: "scheduled",
    assignedTeamMember: "Sarah K.",
    mediaUrl: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=60",
    engagementRate: "4.8%",
    isMock: true
  },
  {
    _id: "mock-seed-3",
    title: "Summer Product Drop Announcement ☀️",
    caption: "Get ready for the hottest products of the season. Launching soon in limited quantities.",
    channelKeys: ["facebook", "googleBusiness"],
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 3)).toISOString(), // In 3 days
    status: "draft",
    assignedTeamMember: "Steven M.",
    mediaUrl: "",
    engagementRate: "3.2%",
    isMock: true
  },
  {
    _id: "mock-seed-4",
    title: "API Integration Tutorial ⚡",
    caption: "Connect your workspace in under 2 minutes. Watch this quick dev tutorial to see how.",
    channelKeys: ["linkedin", "youtube"],
    scheduledAt: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(), // Yesterday
    status: "published",
    assignedTeamMember: "Alex R.",
    mediaUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60",
    engagementRate: "6.2%",
    isMock: true
  },
  {
    _id: "mock-seed-5",
    title: "New Brand Colors Feedback Request 🎨",
    caption: "Which logo option do you like best? Tell us in the comments below!",
    channelKeys: ["x", "linkedin"],
    scheduledAt: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(), // In 5 days
    status: "rejected",
    assignedTeamMember: "Sarah K.",
    mediaUrl: "",
    engagementRate: "2.1%",
    isMock: true
  }
];

export default function SaaSDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, setToast } = useApp();
  const firstName = useMemo(() => (user?.name || "there").split(" ")[0], [user]);

  // Main list of planner posts
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Layout View: 'week' or 'month'
  const [viewMode, setViewMode] = useState("week");
  const [currentDate, setCurrentDate] = useState(new Date());

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [channelFilter, setChannelFilter] = useState("all");

  // Drawer / Editing States
  const [selectedPost, setSelectedPost] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [campaigns, setCampaigns] = useState([]);

  // Right-click / Dropdown Menu Active ID
  const [activeMenuId, setActiveMenuId] = useState(null);
  const menuRef = useRef(null);

  // Native HTML5 Dragging State
  const [draggedPost, setDraggedPost] = useState(null);

  // Load and combine posts
  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const dbPosts = await listScheduledPosts();

      // Merge db posts with seed mock posts that aren't already present in db
      // We match based on title to avoid adding multiple copies of mock seeds
      const merged = [...dbPosts];
      SEED_MOCK_POSTS.forEach((seed) => {
        const exists = dbPosts.some(
          (db) => db.title === seed.title || db._id === seed._id
        );
        if (!exists) {
          merged.push(seed);
        }
      });
      setPosts(merged);
    } catch (err) {
      console.error("Failed to load real posts:", err);
      // Fallback to only mock posts if API is unavailable
      setPosts(SEED_MOCK_POSTS);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const loadCampaigns = async () => {
    try {
      const data = await listCampaigns();
      setCampaigns(data || []);
    } catch (err) {
      console.error("Failed to load campaigns in dashboard:", err);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    if (location.state?.openComposer || location.state?.caption) {
      const statePost = location.state.post || {};
      const isEdit = Boolean(location.state.postId || statePost._id);
      setSelectedPost({
        _id: location.state.postId || statePost._id || `new-${Date.now()}`,
        title: location.state.title || statePost.title || "",
        caption: location.state.caption || statePost.caption || "",
        channelKeys: location.state.channelKeys || statePost.channelKeys || ["instagram"],
        scheduledAt: location.state.scheduledAt || statePost.scheduledAt
          ? (location.state.scheduledAt || statePost.scheduledAt).substring(0, 16)
          : new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16), // Tomorrow same time
        status: location.state.status || statePost.status || "draft",
        assignedTeamMember: location.state.assignedTeamMember || statePost.assignedTeamMember || "Steven M.",
        mediaUrl: location.state.mediaUrl || statePost.mediaUrl || "",
        engagementRate: location.state.engagementRate || statePost.engagementRate || "0.0%",
        campaignId: location.state.campaignId || statePost.campaignId || "",
        isNew: location.state.isNew !== undefined ? location.state.isNew : !isEdit
      });
      setIsDrawerOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter posts based on search and selected channel
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const title = (post.title || "").toLowerCase();
      const caption = (post.caption || "").toLowerCase();
      const matchesSearch = title.includes(searchTerm.toLowerCase()) || caption.includes(searchTerm.toLowerCase());

      const matchesChannel =
        channelFilter === "all" ||
        (post.channelKeys || []).includes(channelFilter);

      return matchesSearch && matchesChannel;
    });
  }, [posts, searchTerm, channelFilter]);

  // Compute analytics dynamically
  const stats = useMemo(() => {
    const total = filteredPosts.length;
    const scheduled = filteredPosts.filter((p) => p.status === "scheduled").length;
    const published = filteredPosts.filter((p) => p.status === "published").length;
    const drafts = filteredPosts.filter((p) => p.status === "draft").length;

    // Engagement rate mock average computation
    const validRates = filteredPosts
      .map((p) => parseFloat(p.engagementRate || "0"))
      .filter((r) => r > 0);
    const avgRate = validRates.length
      ? (validRates.reduce((a, b) => a + b, 0) / validRates.length).toFixed(1) + "%"
      : "4.5%";

    return { total, scheduled, published, drafts, avgRate };
  }, [filteredPosts]);

  // Date Navigation Helper Functions
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handlePrev = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      if (viewMode === "week") {
        nextDate.setDate(prev.getDate() - 7);
      } else {
        nextDate.setMonth(prev.getMonth() - 1);
      }
      return nextDate;
    });
  };

  const handleNext = () => {
    setCurrentDate((prev) => {
      const nextDate = new Date(prev);
      if (viewMode === "week") {
        nextDate.setDate(prev.getDate() + 7);
      } else {
        nextDate.setMonth(prev.getMonth() + 1);
      }
      return nextDate;
    });
  };

  // Helper: check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  // Week Dates bounds calculation (Sunday-Saturday)
  const weekDates = useMemo(() => {
    const dates = [];
    const start = new Date(currentDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day); // Align to Sunday
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      dates.push(d);
    }
    return dates;
  }, [currentDate]);

  // Month Dates grid calculation (35 or 42 cells)
  const monthDates = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDayIndex = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();

    const cells = [];
    // Prev month pad
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      cells.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }
    // Current month
    for (let i = 1; i <= totalDays; i++) {
      cells.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    // Next month pad
    const totalCells = cells.length > 35 ? 42 : 35;
    const remaining = totalCells - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    return cells;
  }, [currentDate]);

  // Filter posts scheduled on a specific day (ignoring hours/minutes)
  const getPostsForDay = useCallback((date) => {
    return filteredPosts.filter((post) => {
      if (!post.scheduledAt) return false;
      const d = new Date(post.scheduledAt);
      return (
        d.getDate() === date.getDate() &&
        d.getMonth() === date.getMonth() &&
        d.getFullYear() === date.getFullYear()
      );
    });
  }, [filteredPosts]);

  // Unscheduled or general list for Left Panel lists
  const draftPosts = useMemo(() => {
    return filteredPosts.filter((p) => p.status === "draft");
  }, [filteredPosts]);

  const approvedPosts = useMemo(() => {
    return filteredPosts.filter((p) => p.status === "approved");
  }, [filteredPosts]);

  // --- Drag & Drop Handlers ---
  const handleDragStart = (e, post) => {
    setDraggedPost(post);
    e.dataTransfer.setData("text/plain", post._id);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, date) => {
    e.preventDefault();
    if (!draggedPost) return;

    const originalDate = draggedPost.scheduledAt ? new Date(draggedPost.scheduledAt) : new Date();

    // Construct new date keeping original hours and minutes
    const newDate = new Date(date);
    newDate.setHours(originalDate.getHours());
    newDate.setMinutes(originalDate.getMinutes());
    newDate.setSeconds(0);

    const updatedIso = newDate.toISOString();

    // Update locally immediately for snappy feedback
    setPosts((prev) =>
      prev.map((p) =>
        p._id === draggedPost._id ? { ...p, scheduledAt: updatedIso } : p
      )
    );

    // Call update API if it's not a mock post
    if (!draggedPost.isMock) {
      try {
        await updateScheduledPost(draggedPost._id, { scheduledAt: updatedIso });
        setToast({ message: "Post rescheduled successfully." });
      } catch (err) {
        setToast({ message: err.message || "Failed to update date on server.", error: true });
        loadPosts(); // Rollback on failure
      }
    } else {
      setToast({ message: "Mock post rescheduled locally." });
    }

    setDraggedPost(null);
  };

  // --- CRUD triggers ---
  const handleOpenEditDrawer = (post) => {
    setSelectedPost({
      ...post,
      assignedTeamMember: post.assignedTeamMember || "Steven M.",
      engagementRate: post.engagementRate || "4.5%",
      scheduledAt: post.scheduledAt ? post.scheduledAt.substring(0, 16) : new Date().toISOString().substring(0, 16)
    });
    setIsDrawerOpen(true);
    setActiveMenuId(null);
  };

  const handleOpenCreateDrawer = () => {
    setSelectedPost({
      _id: `new-${Date.now()}`,
      title: "",
      caption: "",
      channelKeys: ["instagram"],
      scheduledAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000).toISOString().substring(0, 16), // Tomorrow same time
      status: "draft",
      assignedTeamMember: "Steven M.",
      mediaUrl: "",
      engagementRate: "0.0%",
      campaignId: "",
      isNew: true
    });
    setIsDrawerOpen(true);
    setActiveMenuId(null);
  };

  const handleDuplicate = async (post) => {
    setActiveMenuId(null);
    const duplicated = {
      ...post,
      _id: `dup-${Date.now()}`,
      title: `${post.title || "Untitled"} (Copy)`,
      scheduledAt: post.scheduledAt
        ? new Date(new Date(post.scheduledAt).getTime() + 2 * 60 * 60 * 1000).toISOString() // +2 hours
        : new Date().toISOString(),
      status: "draft"
    };

    if (!post.isMock) {
      try {
        const payload = {
          title: duplicated.title,
          caption: duplicated.caption,
          channelKeys: duplicated.channelKeys,
          scheduledAt: duplicated.scheduledAt,
          mediaUrl: duplicated.mediaUrl,
          status: duplicated.status
        };
        const res = await createScheduledPost(payload);
        setPosts((prev) => [res, ...prev]);
        setToast({ message: "Post duplicated successfully." });
      } catch (err) {
        setToast({ message: err.message || "Failed to duplicate post on server.", error: true });
      }
    } else {
      setPosts((prev) => [duplicated, ...prev]);
      setToast({ message: "Mock post duplicated locally." });
    }
  };

  const handleDelete = async (postId) => {
    setActiveMenuId(null);
    const postToDelete = posts.find((p) => p._id === postId);
    if (!postToDelete) return;

    if (!postToDelete.isMock) {
      try {
        await deleteScheduledPost(postId);
        setPosts((prev) => prev.filter((p) => p._id !== postId));
        setToast({ message: "Scheduled post deleted successfully." });
      } catch (err) {
        setToast({ message: err.message || "Failed to delete post on server.", error: true });
      }
    } else {
      setPosts((prev) => prev.filter((p) => p._id !== postId));
      setToast({ message: "Mock post removed locally." });
    }
  };

  const handleSaveDrawer = async (updated) => {
    setIsDrawerOpen(false);
    const isoDate = new Date(updated.scheduledAt).toISOString();

    if (updated.isNew) {
      // Create Post
      const payload = {
        title: updated.title || "Scheduled Post",
        caption: updated.caption,
        channelKeys: updated.channelKeys,
        scheduledAt: isoDate,
        mediaUrl: updated.mediaUrl,
        status: updated.status,
        campaignId: updated.campaignId || null,
      };

      try {
        const res = await createScheduledPost(payload);
        setPosts((prev) => [res, ...prev]);
        setToast({ message: "Post created and scheduled successfully." });
      } catch (err) {
        // Fallback mock create
        const finalMock = {
          ...updated,
          _id: `mock-user-${Date.now()}`,
          scheduledAt: isoDate,
          isMock: true,
          isNew: false
        };
        setPosts((prev) => [finalMock, ...prev]);
        setToast({ message: "Post created locally (mock fallback)." });
      }
    } else {
      // Update Post
      if (!updated.isMock) {
        try {
          const res = await updateScheduledPost(updated._id, {
            title: updated.title,
            caption: updated.caption,
            channelKeys: updated.channelKeys,
            scheduledAt: isoDate,
            mediaUrl: updated.mediaUrl,
            status: updated.status,
            campaignId: updated.campaignId || null,
          });
          setPosts((prev) => prev.map((p) => p._id === updated._id ? res : p));
          setToast({ message: "Post updated successfully." });
        } catch (err) {
          setToast({ message: err.message || "Failed to save updates on server.", error: true });
        }
      } else {
        // Mock edit update
        const finalUpdated = { ...updated, scheduledAt: isoDate };
        setPosts((prev) => prev.map((p) => p._id === updated._id ? finalUpdated : p));
        setToast({ message: "Mock post updated locally." });
      }
    }
  };

  // Channel helper configuration labels
  const channelOptions = [
    { key: "instagram", label: "Instagram" },
    { key: "facebook", label: "Facebook" },
    { key: "linkedin", label: "LinkedIn" },
    { key: "x", label: "X" },
    { key: "youtube", label: "YouTube" },
    { key: "googleBusiness", label: "Google" },
  ];

  return (
    <div className="relative flex flex-col gap-6 p-1 text-slate-800 dark:text-slate-200">
      {/* Dynamic background lighting blur */}
      <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-gradient-to-tr from-[#C8FF00]/10 to-transparent blur-3xl" />

      {/* Greeting Title Header */}
      <header className="flex flex-col gap-1.5 md:flex-row md:items-center md:justify-between">
        <div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Welcome, {firstName}. Draft, organize, and schedule your social media catalog visually.
          </p>
        </div>
      </header>

      {/* A. Statistics row */}
      <section className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "Total Posts", value: stats.total, color: "text-[#82a800] dark:text-[#C8FF00]" },
          { label: "Scheduled", value: stats.scheduled, color: "text-blue-500" },
          { label: "Published", value: stats.published, color: "text-emerald-500" },
          { label: "Drafts", value: stats.drafts, color: "text-slate-500" },
          {
            label: "Engagement Rate",
            value: stats.avgRate,
            color: "text-purple-500",
            extra: (
              <span className="flex items-center gap-0.5 text-[10px] text-emerald-500 font-bold ml-1">
                <TrendingUp size={10} /> +1.2%
              </span>
            )
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="flex flex-col justify-between p-3.5 rounded-xl border border-slate-200/60 bg-white shadow-card dark:border-slate-800/80 dark:bg-slate-900"
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{stat.label}</span>
            <div className="flex items-baseline mt-1">
              <span className={`text-xl font-extrabold tracking-tight ${stat.color}`}>{stat.value}</span>
              {stat.extra}
            </div>
          </div>
        ))}
      </section>

      {/* B. Main Calendar Planner Card */}
      <div className="w-full rounded-2xl border border-slate-200/60 bg-white dark:border-slate-800/80 dark:bg-slate-900 p-5 shadow-sm overflow-hidden flex flex-col gap-6">

        {/* Planner controls row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 dark:border-slate-800/60 pb-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative flex items-center max-w-xs">
              <Search size={14} className="absolute left-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-4 text-xs font-medium text-slate-700 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 transition"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 dark:border-slate-800 dark:bg-slate-950">
              <Filter size={13} className="text-slate-400" />
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="bg-transparent border-none text-xs font-semibold text-slate-700 focus:outline-none dark:text-slate-300 cursor-pointer"
              >
                <option value="all">All Channels</option>
                {channelOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar controls */}
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="flex items-center gap-1 border border-slate-200 rounded-xl p-0.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              <button
                onClick={handlePrev}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                aria-label="Previous"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900 rounded-lg transition"
              >
                Today
              </button>
              <button
                onClick={handleNext}
                className="p-1.5 rounded-lg hover:bg-white dark:hover:bg-slate-900 text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
                aria-label="Next"
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Date Range Title Indicator */}
            <h2 className="text-sm font-bold text-slate-800 dark:text-white shrink-0 font-sans">
              {viewMode === "week" ? (
                <span>
                  {weekDates[0].toLocaleString("default", { month: "short", day: "numeric" })} - {weekDates[6].toLocaleString("default", { month: "short", day: "numeric", year: "numeric" })}
                </span>
              ) : (
                currentDate.toLocaleString("default", { month: "long", year: "numeric" })
              )}
            </h2>

            {/* Week/Month Switcher */}
            <div className="flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
              {["week", "month"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`rounded-lg px-3 py-1 text-xs font-bold capitalize transition duration-150 ${viewMode === mode
                      ? "bg-white text-[#82a800] dark:bg-slate-900 dark:text-[#C8FF00] shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Create Post Button */}
            <button
              onClick={handleOpenCreateDrawer}
              className="hidden md:flex items-center gap-1.5 rounded-xl bg-[#C8FF00] hover:bg-[#a8d600] px-4 py-2 text-xs font-bold text-black shadow-sm transition"
            >
              <Plus size={14} />
              Create Post
            </button>
          </div>
        </div>

        {/* C. Split Panel: Planning Side vs Main Calendar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-0 flex-1">

          {/* Left Planning Panel Column (1/4 Width) */}
          <aside className="lg:col-span-1 flex flex-col gap-4 border-r border-slate-100 dark:border-slate-850/60 lg:pr-5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Planning Queue</span>
                <button
                  onClick={handleOpenCreateDrawer}
                  className="flex items-center gap-0.5 text-[10px] font-bold text-[#82a800] hover:underline dark:text-[#C8FF00]"
                >
                  <Plus size={10} /> Quick Create
                </button>
              </div>
              <p className="text-[11px] text-slate-400">Drag items from queue onto calendar slots</p>
            </div>

            {/* Backlog Tabs / Accordions */}
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[480px] pr-1.5 scrollbar-thin">

              {/* Approved Posts Backlog */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                    <CheckCircle2 size={12} className="text-[#82a800] dark:text-[#C8FF00]" /> Approved Posts
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {approvedPosts.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {approvedPosts.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-slate-400 italic bg-slate-50/50 dark:bg-slate-900/50 rounded-lg">
                      No approved drafts in backlog.
                    </div>
                  ) : (
                    approvedPosts.map((post) => {
                      const campaign = campaigns.find((c) => c._id === post.campaignId);
                      return (
                        <BacklogCard
                          key={post._id}
                          post={post}
                          campaignName={campaign?.name}
                          campaignColor={campaign?.color}
                          onDragStart={(e) => handleDragStart(e, post)}
                          onClick={() => handleOpenEditDrawer(post)}
                        />
                      );
                    })
                  )}
                </div>
              </div>

              {/* Drafts List */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-1">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-350 flex items-center gap-1">
                    <Layers size={12} className="text-slate-400" /> Draft Backlog
                  </span>
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {draftPosts.length}
                  </span>
                </div>

                <div className="flex flex-col gap-2">
                  {draftPosts.length === 0 ? (
                    <div className="py-4 text-center text-[11px] text-slate-400 italic bg-slate-50/50 dark:bg-slate-900/50 rounded-lg">
                      No draft posts in queue.
                    </div>
                  ) : (
                    draftPosts.map((post) => {
                      const campaign = campaigns.find((c) => c._id === post.campaignId);
                      return (
                        <BacklogCard
                          key={post._id}
                          post={post}
                          campaignName={campaign?.name}
                          campaignColor={campaign?.color}
                          onDragStart={(e) => handleDragStart(e, post)}
                          onClick={() => handleOpenEditDrawer(post)}
                        />
                      );
                    })
                  )}
                </div>
              </div>

            </div>
          </aside>

          {/* Right Calendar Section Column (3/4 Width) */}
          <main className="lg:col-span-3 min-h-[500px]">
            {loading ? (
              <div className="flex h-full flex-col items-center justify-center text-sm text-slate-500 py-24 gap-3">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-t-transparent border-[#82a800]" />
                Loading planner grid...
              </div>
            ) : viewMode === "week" ? (

              /* Week View layout */
              <div className="grid grid-cols-7 gap-2 h-full">
                {weekDates.map((date) => {
                  const dayPosts = getPostsForDay(date);
                  const isCurrent = isToday(date);

                  return (
                    <div
                      key={date.toISOString()}
                      className={`flex flex-col rounded-xl border border-dashed min-h-[420px] transition-all relative ${isCurrent
                          ? "bg-[#C8FF00]/5 dark:bg-[#C8FF00]/5 border-[#C8FF00] shadow-sm"
                          : "bg-slate-50/40 border-slate-200 hover:border-slate-300 dark:bg-[#151515] dark:border-slate-800 dark:hover:border-slate-700"
                        }`}
                      onDragOver={handleDragOver}
                      onDrop={(e) => handleDrop(e, date)}
                    >
                      {/* Day Header */}
                      <div className={`p-2.5 text-center sticky top-0 z-10 border-b rounded-t-xl transition ${isCurrent
                          ? "bg-[#C8FF00] text-black border-[#C8FF00]"
                          : "bg-white dark:bg-[#111] border-slate-100 dark:border-slate-800/80 text-slate-500"
                        }`}>
                        <div className="text-[10px] font-bold uppercase tracking-wider">
                          {date.toLocaleString("default", { weekday: "short" })}
                        </div>
                        <div className={`text-sm font-extrabold mt-0.5 ${isCurrent ? "text-black" : "text-slate-800 dark:text-white"}`}>
                          {date.getDate()}
                        </div>
                      </div>

                      {/* Day Cards Stack */}
                      <div className="flex-1 p-2 flex flex-col gap-2 overflow-y-auto max-h-[380px] scrollbar-thin">
                        {dayPosts.length === 0 ? (
                          <div className="h-full flex items-center justify-center py-12 text-[10px] text-slate-400 font-medium italic">
                            Empty
                          </div>
                        ) : (
                          dayPosts.map((post) => {
                            const campaign = campaigns.find((c) => c._id === post.campaignId);
                            return (
                              <CalendarPostCard
                                key={post._id}
                                post={post}
                                campaignName={campaign?.name}
                                campaignColor={campaign?.color}
                                onDragStart={(e) => handleDragStart(e, post)}
                                onClick={() => handleOpenEditDrawer(post)}
                                onMenuToggle={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(activeMenuId === post._id ? null : post._id);
                                }}
                                isActiveMenu={activeMenuId === post._id}
                                onEdit={() => handleOpenEditDrawer(post)}
                                onDuplicate={() => handleDuplicate(post)}
                                onDelete={() => handleDelete(post._id)}
                                menuRef={menuRef}
                              />
                            );
                          })
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (

              /* Month View grid */
              <div className="flex flex-col border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                {/* Headers */}
                <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-[#151515]">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-2 text-center text-[10px] font-extrabold uppercase text-slate-500 tracking-wider">
                      {day}
                    </div>
                  ))}
                </div>

                {/* Cells */}
                <div className="grid grid-cols-7 divide-x divide-y divide-slate-100 dark:divide-slate-800 border-t-0">
                  {monthDates.map(({ date, isCurrentMonth }, idx) => {
                    const dayPosts = getPostsForDay(date);
                    const isCurrent = isToday(date);

                    return (
                      <div
                        key={idx}
                        className={`min-h-[92px] p-1 flex flex-col justify-between transition relative ${isCurrentMonth
                            ? "bg-white dark:bg-[#111]"
                            : "bg-slate-50/50 text-slate-400 dark:bg-slate-950/20"
                          } ${isCurrent
                            ? "bg-[#C8FF00]/5 dark:bg-[#C8FF00]/5"
                            : ""
                          }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, date)}
                      >
                        {/* Day number */}
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-[10px] font-bold flex h-5 w-5 items-center justify-center rounded-full ${isCurrent
                              ? "bg-[#C8FF00] text-black font-extrabold"
                              : isCurrentMonth ? "text-slate-800 dark:text-slate-200" : "text-slate-400"
                            }`}>
                            {date.getDate()}
                          </span>
                          {dayPosts.length > 0 && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                              {dayPosts.length} post{dayPosts.length > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        {/* Month Posts Stack (compact render) */}
                        <div className="flex-1 flex flex-col gap-1 overflow-y-auto max-h-[60px] scrollbar-thin">
                          {dayPosts.slice(0, 3).map((post) => (
                            <div
                              key={post._id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, post)}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenEditDrawer(post);
                              }}
                              className={`text-[9px] font-semibold truncate rounded px-1.5 py-0.5 border cursor-pointer hover:shadow-sm transition-all ${getStatusBorderAndBgClass(post.status)
                                }`}
                            >
                              {post.title || post.caption || "Untitled"}
                            </div>
                          ))}
                          {dayPosts.length > 3 && (
                            <span className="text-[8px] text-slate-400 italic pl-1">
                              + {dayPosts.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* D. Slide-out Post Details Drawer Overlay */}
      <AnimatePresence>
        {isDrawerOpen && selectedPost && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px] flex justify-end"
            onClick={() => setIsDrawerOpen(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-full max-w-lg bg-white dark:bg-[#111] h-full shadow-2xl overflow-y-auto border-l border-slate-200 dark:border-slate-800/80 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 p-5 shrink-0">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {selectedPost.isNew ? "Create Post Entry" : "Post Details & Schedule"}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {selectedPost.isNew ? "Define a brand-new publishing schedule." : `Post ID: ${selectedPost._id}`}
                  </p>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-lg p-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Scrollable Content */}
              <div className="p-5 flex-1 overflow-y-auto flex flex-col gap-5">

                {/* Title Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post Title</label>
                  <input
                    type="text"
                    value={selectedPost.title}
                    onChange={(e) => setSelectedPost({ ...selectedPost, title: e.target.value })}
                    placeholder="Enter post title..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition"
                  />
                </div>

                {/* Caption / Content Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Post Content / Caption</label>
                  <textarea
                    rows={4}
                    value={selectedPost.caption}
                    onChange={(e) => setSelectedPost({ ...selectedPost, caption: e.target.value })}
                    placeholder="Write what you want to publish..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 dark:focus:border-[#C8FF00] outline-none transition resize-none"
                  />
                </div>

                {/* Media Url & Preview */}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Media URL</label>
                  <input
                    type="text"
                    value={selectedPost.mediaUrl || ""}
                    onChange={(e) => setSelectedPost({ ...selectedPost, mediaUrl: e.target.value })}
                    placeholder="Paste image/video URL link..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 outline-none transition"
                  />

                  {/* Media Preview Box */}
                  {selectedPost.mediaUrl ? (
                    <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 max-h-40 flex items-center justify-center relative group">
                      <img
                        src={selectedPost.mediaUrl}
                        alt="Media upload preview"
                        className="w-full h-full object-cover max-h-40"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden flex-col items-center justify-center p-6 text-slate-400 gap-1">
                        <AlertCircle size={20} />
                        <span className="text-[10px] font-bold">Failed to load preview image</span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 py-6 flex flex-col items-center justify-center text-slate-400 gap-1.5">
                      <ImageIcon size={18} />
                      <span className="text-[10px] font-bold">No media attached</span>
                    </div>
                  )}
                </div>

                {/* Grid: Date/Time + Assigned */}
                <div className="grid grid-cols-2 gap-4">

                  {/* Date & Time Picker */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scheduled Date & Time</label>
                    <input
                      type="datetime-local"
                      value={selectedPost.scheduledAt}
                      onChange={(e) => setSelectedPost({ ...selectedPost, scheduledAt: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer"
                    />
                  </div>

                  {/* Assigned Team Member */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Assigned Team Member</label>
                    <select
                      value={selectedPost.assignedTeamMember}
                      onChange={(e) => setSelectedPost({ ...selectedPost, assignedTeamMember: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer"
                    >
                      {TEAM_MEMBERS.map((m) => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Campaign Selection */}
                {campaigns.length > 0 && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Associated Campaign</label>
                    <select
                      value={selectedPost.campaignId || ""}
                      onChange={(e) => setSelectedPost({ ...selectedPost, campaignId: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none focus:border-[#C8FF00] dark:border-slate-800 dark:bg-slate-950 cursor-pointer"
                    >
                      <option value="">-- No Campaign --</option>
                      {campaigns.map((c) => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Platforms selection */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Target Channels</label>
                  <div className="flex flex-wrap gap-2">
                    {channelOptions.map((opt) => {
                      const Icon = PLATFORM_BRAND_ICONS[opt.key] || Briefcase;
                      const isSelected = (selectedPost.channelKeys || []).includes(opt.key);

                      return (
                        <button
                          key={opt.key}
                          type="button"
                          onClick={() => {
                            const current = selectedPost.channelKeys || [];
                            const next = current.includes(opt.key)
                              ? current.filter((k) => k !== opt.key)
                              : [...current, opt.key];
                            setSelectedPost({ ...selectedPost, channelKeys: next });
                          }}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition ${isSelected
                              ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-900"
                              : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-300"
                            }`}
                        >
                          <Icon size={12} className={isSelected ? "text-[#C8FF00] dark:text-slate-900" : "text-slate-400"} />
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Status selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Status Badge</label>
                  <div className="grid grid-cols-5 gap-1.5">
                    {STATUSES.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setSelectedPost({ ...selectedPost, status })}
                        className={`py-1.5 rounded-xl text-[10px] font-bold capitalize border text-center transition ${selectedPost.status === status
                            ? getStatusBorderAndBgClass(status) + " ring-1 ring-offset-1 dark:ring-offset-slate-900"
                            : "bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100 dark:bg-slate-950 dark:border-slate-800"
                          }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Drawer footer buttons */}
              <div className="p-5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/20 flex items-center justify-end gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveDrawer(selectedPost)}
                  className="rounded-xl bg-[#C8FF00] hover:bg-[#a8d600] px-5 py-2 text-xs font-bold text-black shadow-sm transition"
                >
                  {selectedPost.isNew ? "Schedule Post" : "Save Changes"}
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Status Color Match Helpers ---
function getStatusColorClass(status) {
  switch (status) {
    case "draft": return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400";
    case "scheduled": return "bg-blue-50 text-blue-700 dark:bg-blue-950/45 dark:text-blue-400";
    case "approved": return "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/45 dark:text-emerald-400";
    case "published": return "bg-teal-50 text-teal-700 dark:bg-teal-950/45 dark:text-teal-400";
    case "rejected": return "bg-red-50 text-red-700 dark:bg-red-950/45 dark:text-red-400";
    default: return "bg-slate-100 text-slate-700";
  }
}

function getStatusBorderAndBgClass(status) {
  switch (status) {
    case "draft": return "bg-slate-50 border-slate-200 text-slate-700 dark:bg-slate-950 dark:border-slate-800 dark:text-slate-400";
    case "scheduled": return "bg-blue-50/50 border-blue-200 text-blue-700 dark:bg-blue-950/20 dark:border-blue-800 dark:text-blue-400";
    case "approved": return "bg-emerald-50/50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:border-emerald-800 dark:text-emerald-400";
    case "published": return "bg-teal-50/50 border-teal-200 text-teal-700 dark:bg-teal-950/20 dark:border-teal-850 dark:text-teal-450";
    case "rejected": return "bg-red-50/50 border-red-200 text-red-700 dark:bg-red-950/20 dark:border-red-800 dark:text-red-400";
    default: return "bg-slate-50 border-slate-200 text-slate-700";
  }
}

function getStatusLineColor(status) {
  switch (status) {
    case "draft": return "bg-slate-400";
    case "scheduled": return "bg-blue-500";
    case "approved": return "bg-emerald-500";
    case "published": return "bg-teal-500";
    case "rejected": return "bg-red-500";
    default: return "bg-slate-400";
  }
}

// --- Card Render Sub-components ---

// 1. Backlog Queue item rendering on Left Panel
function BacklogCard({ post, campaignName, campaignColor, onDragStart, onClick }) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="p-3 rounded-xl border border-slate-200 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 shadow-sm transition-all cursor-grab active:cursor-grabbing hover:-translate-y-0.5 group"
    >
      {campaignName && (
        <div className="flex items-center gap-1.5 mb-1.5">
          <span
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{ backgroundColor: campaignColor || "#C8FF00" }}
          />
          <span className="text-[9px] font-bold text-[#82a800] dark:text-[#C8FF00] uppercase tracking-wider truncate max-w-full">
            {campaignName}
          </span>
        </div>
      )}
      <div className="flex items-center justify-between mb-1">
        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold capitalize ${getStatusColorClass(post.status)}`}>
          {post.status}
        </span>
        <div className="flex gap-0.5">
          {(post.channelKeys || []).map((k) => {
            const Icon = PLATFORM_BRAND_ICONS[k] || Briefcase;
            return <Icon key={k} size={10} className="text-slate-400 group-hover:text-slate-600" />;
          })}
        </div>
      </div>

      <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate">
        {post.title || "Untitled draft"}
      </h4>
      <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
        {post.caption}
      </p>
    </div>
  );
}

// 2. Calendar stack post cell card render
function CalendarPostCard({
  post,
  campaignName,
  campaignColor,
  onDragStart,
  onClick,
  onMenuToggle,
  isActiveMenu,
  onEdit,
  onDuplicate,
  onDelete,
  menuRef
}) {
  const timeStr = useMemo(() => {
    if (!post.scheduledAt) return "Draft";
    const d = new Date(post.scheduledAt);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, [post.scheduledAt]);

  const member = TEAM_MEMBERS.find((m) => m.name === post.assignedTeamMember) || TEAM_MEMBERS[0];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="rounded-xl border border-slate-200/80 bg-white dark:border-slate-800 dark:bg-[#1a1a1a] shadow-sm hover:shadow-md transition-all duration-200 cursor-grab active:cursor-grabbing hover:-translate-y-0.5 relative group overflow-hidden"
    >
      {/* Top Status Border line */}
      <div className={`h-1 w-full ${getStatusLineColor(post.status)}`} />

      <div className="p-2.5 flex flex-col gap-1.5">

        {/* Header time and dots actions */}
        <div className="flex items-center justify-between gap-1">
          <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
            <Clock size={9} />
            {timeStr}
          </span>

          {/* Options Dots context menu */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={onMenuToggle}
              className="p-1 rounded hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition"
              aria-label="Actions"
            >
              <MoreHorizontal size={12} />
            </button>

            {isActiveMenu && (
              <div className="absolute right-0 mt-1 w-28 bg-white border border-slate-200 dark:bg-[#202020] dark:border-slate-800 rounded-xl shadow-lg p-1 z-30 flex flex-col">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 text-left"
                >
                  <Edit size={10} />
                  Edit Post
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-900 text-left"
                >
                  <Copy size={10} />
                  Duplicate
                </button>
                <div className="h-px bg-slate-100 dark:bg-slate-800 my-0.5" />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[10px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                >
                  <Trash2 size={10} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Campaign association */}
        {campaignName && (
          <div className="flex items-center gap-1.5 mt-0.5">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: campaignColor || "#C8FF00" }}
            />
            <span className="text-[9px] font-bold text-[#82a800] dark:text-[#C8FF00] uppercase tracking-wider truncate">
              {campaignName}
            </span>
          </div>
        )}

        {/* Post text */}
        <div>
          <h4 className="text-[11px] font-extrabold text-slate-800 dark:text-white leading-tight truncate">
            {post.title || "Untitled Post"}
          </h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mt-0.5">
            {post.caption}
          </p>
        </div>

        {/* Platform logo attachments & Preview image */}
        {post.mediaUrl && (
          <div className="w-full h-14 rounded-lg overflow-hidden border border-slate-100 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950">
            <img
              src={post.mediaUrl}
              alt="Media card attachment"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Footer info: assignee avatar & channel icons */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 pt-2 mt-0.5">
          {/* Member Name */}
          <div className="flex items-center gap-1">
            <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center text-[8px] font-black text-white ${member.avatarBg}`}>
              {member.name.substring(0, 1)}
            </div>
            <span className="text-[9px] text-slate-500 font-bold">{member.name}</span>
          </div>

          {/* Platform icons */}
          <div className="flex items-center gap-0.5">
            {(post.channelKeys || []).map((k) => {
              const Icon = PLATFORM_BRAND_ICONS[k] || Briefcase;
              return (
                <div key={k} className="p-0.5 rounded-md hover:bg-slate-50 dark:hover:bg-slate-900" title={k}>
                  <Icon size={10} className="text-slate-400 group-hover:text-slate-600" />
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
