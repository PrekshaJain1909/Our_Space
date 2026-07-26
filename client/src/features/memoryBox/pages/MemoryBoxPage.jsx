import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Camera,
  Heart,
  ImagePlus,
  MapPin,
  PencilLine,
  Plus,
  Search,
  Sparkles,
  Trash2,
  Upload,
  Undo2,
  X,
  ChevronDown,
  Check,
} from "lucide-react";
import "../MemoryBox.css";

import MemoryUploadForm from "../components/MemoryUploadForm";
import MemoryGrid from "../components/MemoryGrid";
import MemoryModal from "../components/MemoryModal";
import useTheme from "../../../hooks/useTheme";
import { showSuccessToast, showThemeAlert } from "../../../utils/swalTheme";
import memoryApi from "../../../api/memoryApi";
import { buildAlbumCatalog, getAlbumMemoryCount, isDeletedWithinRetention } from "../utils/albumState";

const parseBooleanValue = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value !== 0;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    if (["true", "1", "yes", "y", "on"].includes(normalized)) return true;
    if (["false", "0", "no", "n", "off", "", "null", "undefined"].includes(normalized)) return false;
  }
  return Boolean(value);
};

const normalizeMemory = (memory) => ({
  ...memory,
  id: String(memory._id || memory.id || ""),
  title: memory.title || "Untitled memory",
  description: memory.description || "",
  mood: memory.mood || "romantic",
  location: memory.location || "",
  date: memory.date || memory.createdAt || "",
  createdBy: typeof memory.createdBy === "object" && memory.createdBy !== null && memory.createdBy.name
    ? memory.createdBy.name
    : memory.createdBy || "You",
  albumId: typeof memory.albumId === "object" && memory.albumId !== null
    ? String(memory.albumId._id || memory.albumId.id || memory.albumId)
    : memory.albumId || memory.album?.id || null,
  imageUrl: memory.photos?.[0]?.secure_url || memory.imageUrl || null,
  tags: memory.tags || [],
  isFavorite: parseBooleanValue(memory.favorite ?? memory.isFavorite),
  isDeleted: Boolean(memory.deleted || memory.isDeleted),
  rotation: memory.rotation ?? (Math.random() * 2 - 1),
  likes: memory.likes ?? 6,
  funny: memory.funny ?? 1,
  cute: memory.cute ?? 4,
});

const normalizeAlbum = (album, fallbackFolder = "all") => ({
  ...album,
  id: String(album._id || album.id || ""),
  name: album.name || "Untitled album",
  coverImage: album.coverImage || album.image || null,
  creator: typeof album.createdBy === "object" && album.createdBy !== null && album.createdBy.name
    ? album.createdBy.name
    : album.creator || "You",
  createdAt: album.createdAt || album.created_at || new Date().toISOString(),
  folderId: album.folderId || fallbackFolder,
  photoCount: album.photoCount ?? album.memoryCount ?? (Array.isArray(album.memories) ? album.memories.length : 0),
  memoryCount: album.memoryCount ?? album.photoCount ?? (Array.isArray(album.memories) ? album.memories.length : 0),
  memories: Array.isArray(album.memories) ? album.memories.map(normalizeMemory) : [],
});

const isValidAlbumId = (value) => typeof value === "string" && /^[0-9a-fA-F]{24}$/.test(value);

const getStoredUserId = () => {
  if (typeof window === "undefined") return null;

  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    return storedUser?._id || storedUser?.id || null;
  } catch (error) {
    return null;
  }
};

const formatRequestDate = (value) => {
  if (!value) return "Recently requested";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Recently requested";

  const diffDays = Math.round((Date.now() - parsed.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return `${diffDays} days ago`;
};

const getRequestAlbumName = (request) => {
  const album = request?.albumId;
  if (typeof album === "object" && album !== null) {
    return album.name || album.title || "Shared album";
  }
  if (typeof album === "string" && album.trim()) {
    return album;
  }
  return "Shared album";
};

const getRequestAlbumCover = (request) => {
  const album = request?.albumId;
  if (typeof album === "object" && album !== null) {
    return album.coverImage || album.image || null;
  }
  return null;
};

const getRequestRequesterName = (request) => {
  if (typeof request?.requestedBy === "object" && request.requestedBy !== null) {
    return request.requestedBy.name || "Your partner";
  }
  return request?.requestedBy || "Your partner";
};

const getRequestRequesterInitials = (request) => {
  const name = getRequestRequesterName(request).trim();
  const parts = name.split(/\s+/).filter(Boolean);
  if (!parts.length) return "P";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

const getRequestAlbumId = (request, fallbackAlbumId = null) => {
  if (!request) return fallbackAlbumId || null;
  const album = request.albumId;
  if (typeof album === "object" && album !== null) {
    return album._id?.toString?.() || album.id?.toString?.() || fallbackAlbumId || null;
  }
  if (typeof album === "string" && album.trim()) {
    return album;
  }
  return fallbackAlbumId || null;
};

const initialMemories = [
  {
    id: 1,
    title: "Sunset chai by the lake",
    description: "We stole a little time just for ourselves and watched the sky turn into rose gold.",
    mood: "romantic",
    location: "Lake View Cafe",
    date: "2024-09-12",
    createdBy: "Preksha Jain",
    imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    tags: ["sunset", "chai", "lake"],
    isFavorite: true,
    rotation: -1.4,
    likes: 24,
    funny: 3,
    cute: 12,
    albumId: "goa-trip",
  },
  {
    id: 2,
    title: "Goa trip chaos",
    description: "A scooter ride, a tiny rainstorm and the kind of laughter that feels like home.",
    mood: "happy",
    location: "Goa",
    date: "2023-12-22",
    createdBy: "Abhishek Dubey",
    imageUrl: "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80",
    tags: ["trip", "goa", "rain"],
    isFavorite: false,
    rotation: 1.2,
    likes: 18,
    funny: 9,
    cute: 14,
    albumId: "goa-trip",
  },
  {
    id: 3,
    title: "First winter walk",
    description: "We held hands through the cold and talked like the night would never end.",
    mood: "calm",
    location: "Hillside Park",
    date: "2022-11-08",
    createdBy: "Preksha Jain",
    imageUrl: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=900&q=80",
    tags: ["winter", "walk", "hugs"],
    isFavorite: true,
    rotation: -0.8,
    likes: 16,
    funny: 2,
    cute: 10,
    albumId: "first-date",
  },
];

const initialAlbums = [];

const matchesFolder = (memory, folderId) => {
  switch (folderId) {
    case "favorites":
      return memory.isFavorite;
    case "trips":
      return (memory.tags || []).some((tag) => /trip|travel|vacation|goa|manali|beach/i.test(tag));
    case "dates":
      return memory.mood === "romantic" || (memory.title || "").toLowerCase().includes("date");
    case "birthdays":
      return (memory.tags || []).some((tag) => /birthday|cake|party/i.test(tag));
    case "celebrations":
      return (memory.tags || []).some((tag) => /celebration|anniversary|party/i.test(tag));
    case "rainy-days":
      return (memory.tags || []).some((tag) => /rain|storm|cloud|winter/i.test(tag));
    case "food":
      return (memory.tags || []).some((tag) => /food|chai|coffee|cafe|restaurant/i.test(tag));
    case "recently-deleted":
      return Boolean(memory.isDeleted);
    default:
      return true;
  }
};

function MemorySortDropdown({ value = "newest", onChange = () => { }, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const theme = useTheme();
  const isDark = theme?.palette?.mode === "dark";

  useEffect(() => {
    const onDocClick = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const label = value === "oldest" ? "Oldest First" : "Newest First";

  return (
    <div className={`memory-sort-dropdown ${open ? "is-open" : ""} ${disabled ? "is-disabled" : ""} ${isDark ? "is-dark" : "is-light"}`} ref={ref}>
      <button
        type="button"
        className="memory-sort-btn"
        onClick={() => !disabled && setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        disabled={disabled}
      >
        <span className="memory-sort-label-inline">Sort By</span>
        <span className="memory-sort-current">{label}</span>
        <ChevronDown size={16} />
      </button>

      <ul className={`memory-sort-menu ${open ? "is-open" : ""}`} role="listbox" aria-activedescendant={`sort-${value}`} tabIndex={-1}>
        <li
          id="sort-newest"
          role="option"
          aria-selected={value === "newest"}
          className={`memory-sort-item ${value === "newest" ? "is-active" : ""}`}
          onClick={() => { onChange("newest"); setOpen(false); }}
        >
          <span>Newest First</span>
          {value === "newest" ? <Check size={14} className="memory-sort-check" /> : null}
        </li>
        <li
          id="sort-oldest"
          role="option"
          aria-selected={value === "oldest"}
          className={`memory-sort-item ${value === "oldest" ? "is-active" : ""}`}
          onClick={() => { onChange("oldest"); setOpen(false); }}
        >
          <span>Oldest First</span>
          {value === "oldest" ? <Check size={14} className="memory-sort-check" /> : null}
        </li>
      </ul>
    </div>
  );
}

export default function MemoryBoxPage() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const composerRef = useRef(null);

  const [memories, setMemories] = useState(initialMemories.map(normalizeMemory));
  const [albums, setAlbums] = useState(initialAlbums.map((album) => normalizeAlbum(album)));
  const [folders, setFolders] = useState([]);
  const [stats, setStats] = useState([]);
  const [selectedMemory, setSelectedMemory] = useState(null);
  const [editingMemoryId, setEditingMemoryId] = useState(null);
  const [selectedAlbumId, setSelectedAlbumId] = useState(null);
  const [activeView, setActiveView] = useState("albums");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [albumNameInput, setAlbumNameInput] = useState("");
  const [albumCoverInput, setAlbumCoverInput] = useState("");
  const [albumDescriptionInput, setAlbumDescriptionInput] = useState("");
  const [albumLocationInput, setAlbumLocationInput] = useState("");
  const [albumTripTypeInput, setAlbumTripTypeInput] = useState("Trip");
  const [albumThemeColorInput, setAlbumThemeColorInput] = useState("#ff5ca8");
  const [showCreateAlbumModal, setShowCreateAlbumModal] = useState(false);
  const [showUploadComposer, setShowUploadComposer] = useState(false);
  const [deleteRequests, setDeleteRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [albumSort, setAlbumSort] = useState(() => (typeof window !== "undefined" ? localStorage.getItem("albumSort") || "newest" : "newest"));
  const [albumPhotos, setAlbumPhotos] = useState(() => ({ albumId: null, photos: null }));
  const [isSorting, setIsSorting] = useState(false);

  const normalizeDeleteRequest = (request) => {
    if (!request) return request;

    const albumId = request.albumId && typeof request.albumId === "object" && !Array.isArray(request.albumId)
      ? (request.albumId._id ? request.albumId : { ...request.albumId, _id: request.albumId._id?.toString?.() || request.albumId.toString?.() || request.albumId })
      : request.albumId;

    return {
      ...request,
      albumId,
      _id: request._id?.toString?.() || request._id,
    };
  };

  const isRequestForAlbum = (request, albumId) => {
    const requestAlbumId = request?.albumId?._id || request?.albumId?.id || request?.albumId;
    return String(requestAlbumId) === String(albumId);
  };

  const refreshDeleteRequests = async () => {
    const currentUserId = getStoredUserId();
    console.debug("[MemoryBox] Fetching pending delete requests", { currentUserId });

    try {
      const response = await memoryApi.getAlbumDeleteRequests().catch(() => ({ data: { data: [] } }));
      const nextRequests = (response?.data?.data || []).map(normalizeDeleteRequest);
      console.debug("[MemoryBox] Pending delete requests API response", {
        currentUserId,
        partnerId: nextRequests[0]?.requestedTo?._id || nextRequests[0]?.requestedTo || null,
        count: nextRequests.length,
        payload: nextRequests,
      });
      setDeleteRequests(nextRequests);
      console.debug("[MemoryBox] Pending delete requests state updated", { count: nextRequests.length });
      return nextRequests;
    } catch (error) {
      console.error("Failed to refresh album delete requests", error);
      return [];
    }
  };

  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [activeFolder, setActiveFolder] = useState("all");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [memoriesResponse, albumsResponse, foldersResponse, statsResponse, deleteRequestsResponse] = await Promise.all([
          memoryApi.getMemories({ limit: 100 }),
          memoryApi.getAlbums(),
          memoryApi.getFolders(),
          memoryApi.getStats(),
          memoryApi.getAlbumDeleteRequests().catch(() => ({ data: { data: [] } })),
        ]);

        const nextMemories = (memoriesResponse?.data?.data || []).map(normalizeMemory);
        const nextAlbums = (albumsResponse?.data?.data || []).map((album) => normalizeAlbum(album, activeFolder === "all" ? "trips" : activeFolder));
        const nextFolders = foldersResponse?.data?.data || [];
        const nextStats = [
          {
            label: "Memories",
            value: statsResponse?.data?.data?.totalMemories ?? nextMemories.length,
            subtitle: "Little moments preserved",
            icon: <Heart size={16} />,
          },
          {
            label: "Photos",
            value: statsResponse?.data?.data?.photos ?? nextMemories.filter((memory) => memory.imageUrl).length,
            subtitle: "Soft light and happy frames",
            icon: <Camera size={16} />,
          },
          {
            label: "Favorites",
            value: statsResponse?.data?.data?.favorites ?? nextMemories.filter((memory) => memory.isFavorite).length,
            subtitle: "The ones that matter most",
            icon: <Sparkles size={16} />,
          },
          {
            label: "Albums",
            value: nextAlbums.length,
            subtitle: "Curated keepsakes",
            icon: <MapPin size={16} />,
          },
          {
            label: "Deleted",
            value: statsResponse?.data?.data?.deleted ?? nextMemories.filter((memory) => memory.isDeleted).length,
            subtitle: "Moments tucked away",
            icon: <Heart size={16} />,
          },
        ];

        const resolvedMemories = nextMemories.length ? nextMemories : initialMemories.map(normalizeMemory);
        const resolvedAlbums = nextAlbums.length ? nextAlbums : [];

        setMemories(resolvedMemories);
        setAlbums(buildAlbumCatalog(resolvedAlbums, resolvedMemories));
        setFolders(nextFolders);
        setStats(nextStats);
        setDeleteRequests((deleteRequestsResponse?.data?.data || []).map(normalizeDeleteRequest));
      } catch (error) {
        console.error("Failed to load memory box data", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    if (!selectedAlbumId) return;
    const selectedAlbum = albums.find((album) => album.id === selectedAlbumId);
    if (selectedAlbum) {
      setAlbumNameInput(selectedAlbum.name || "");
      setAlbumCoverInput(selectedAlbum.coverImage || "");
      setAlbumDescriptionInput(selectedAlbum.description || "");
      setAlbumLocationInput(selectedAlbum.location || "");
      setAlbumTripTypeInput(selectedAlbum.tripType || "Trip");
      setAlbumThemeColorInput(selectedAlbum.themeColor || "#ff5ca8");
    }
  }, [albums, selectedAlbumId]);

  const updateAlbumCounts = (nextMemories) => {
    setAlbums((prev) => buildAlbumCatalog(prev, nextMemories));
  };

  const handleAddMemories = async (files, metadata) => {
    if (!files?.length) return;

    const albumId = metadata.albumId || selectedAlbumId || null;
    const formData = new FormData();
    formData.append("title", metadata.title || "Captured moment");
    formData.append("description", metadata.description || "");
    formData.append("location", metadata.location || "");
    formData.append("date", metadata.date || new Date().toISOString());
    formData.append("mood", metadata.mood || "happy");
    formData.append("tags", (metadata.tags || []).join(","));
    formData.append("partner", metadata.createdBy || "You");
    formData.append("favorite", String(parseBooleanValue(metadata.isFavorite)));
    // Only include albumId when it looks like a valid ObjectId to avoid server-side validation errors
    if (isValidAlbumId(albumId)) {
      formData.append("albumId", albumId);
    }
    files.forEach((file) => formData.append("photos", file));

    const previousMemories = memories;
    const previousAlbums = albums;
    const optimisticMemories = files.map((file, index) => ({
      ...normalizeMemory({
        _id: `temp-${Date.now()}-${index}`,
        title: metadata.title || "Captured moment",
        description: metadata.description || "",
        location: metadata.location || "",
        date: metadata.date || new Date().toISOString(),
        mood: metadata.mood || "happy",
        tags: metadata.tags || [],
        favorite: parseBooleanValue(metadata.isFavorite),
        albumId: albumId || null,
        photos: [],
        createdBy: "You",
        createdAt: new Date().toISOString(),
      }),
      imageUrl: null,
      isDeleted: false,
    }));

    setMemories((prev) => {
      const next = [...optimisticMemories, ...prev];
      updateAlbumCounts(next);
      return next;
    });

    try {
      console.debug("[MemoryBox] Uploading photos", { albumId, fileCount: files.length });
      const response = isValidAlbumId(albumId)
        ? await memoryApi.uploadPhotosToAlbum(albumId, formData)
        : await memoryApi.createMemory(formData);

      const createdMemories = Array.isArray(response?.data?.uploadedPhotos || response?.data?.data)
        ? (response.data.uploadedPhotos || response.data.data).map(normalizeMemory)
        : [normalizeMemory(response?.data?.data || response?.data || {})];

      setMemories((prev) => {
        const withoutOptimistic = prev.filter((memory) => !String(memory.id).startsWith("temp-"));
        const uniqueById = new Map();
        const merged = [...createdMemories, ...withoutOptimistic];
        merged.forEach((memory) => uniqueById.set(memory.id, memory));
        const next = Array.from(uniqueById.values());
        updateAlbumCounts(next);
        return next;
      });

      if (response?.data?.updatedAlbum) {
        const updatedAlbum = normalizeAlbum(response.data.updatedAlbum, activeFolder === "all" ? "trips" : activeFolder);
        setAlbums((prev) => buildAlbumCatalog(prev.map((album) => (album.id === updatedAlbum.id ? { ...album, ...updatedAlbum, memoryCount: updatedAlbum.photoCount ?? updatedAlbum.memoryCount ?? album.memoryCount ?? 0, photoCount: updatedAlbum.photoCount ?? updatedAlbum.memoryCount ?? album.photoCount ?? 0 } : album)), memories));
      }

      if (albumId) {
        setSelectedAlbumId(albumId);
        setActiveView("album");
      }
      setSelectedMemory(null);
      setShowUploadComposer(false);
      showSuccessToast(theme, {
        title: "Photos uploaded successfully",
        text: "Your memories are now part of the album.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
      console.debug("[MemoryBox] Upload success", { albumId, uploadedCount: createdMemories.length, response: response?.data });
    } catch (error) {
      setMemories(previousMemories);
      setAlbums(previousAlbums);
      console.error("Failed to create memories", error);
      throw error;
    }
  };

  const handleEditMemory = async (payload) => {
    const previousMemories = memories;
    const optimisticMemory = normalizeMemory({
      ...payload,
      _id: payload.id,
      favorite: parseBooleanValue(payload.favorite ?? payload.isFavorite),
      albumId: payload.albumId,
      createdAt: payload.createdAt || new Date().toISOString(),
    });

    setMemories((prev) => {
      const next = prev.map((item) => (item.id === optimisticMemory.id ? optimisticMemory : item));
      updateAlbumCounts(next);
      return next;
    });

    try {
      const formData = payload instanceof FormData ? payload : undefined;
      const response = await memoryApi.updateMemory(payload.id, formData || {
        title: payload.title,
        description: payload.description,
        location: payload.location,
        date: payload.date,
        mood: payload.mood,
        albumId: payload.albumId,
        tags: payload.tags,
        favorite: parseBooleanValue(payload.favorite ?? payload.isFavorite),
      });

      const updatedMemory = normalizeMemory(response?.data?.data || response?.data || payload);
      setMemories((prev) => {
        const next = prev.map((item) => (item.id === updatedMemory.id ? updatedMemory : item));
        updateAlbumCounts(next);
        return next;
      });
      setEditingMemoryId(null);
      setSelectedMemory(updatedMemory);
    } catch (error) {
      setMemories(previousMemories);
      console.error("Failed to update memory", error);
    }
  };

  const handleDeleteMemory = async (memoryId) => {
    const previousMemories = memories;
    setMemories((prev) => {
      const next = prev.map((memory) => (memory.id === memoryId ? { ...memory, isDeleted: true, deletedAt: new Date().toISOString() } : memory));
      updateAlbumCounts(next);
      return next;
    });

    try {
      await memoryApi.deleteMemory(memoryId);
      setSelectedMemory(null);
      showSuccessToast(theme, {
        title: "Photo deleted successfully",
        text: "The memory was moved to Recently Deleted.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      setMemories(previousMemories);
      console.error("Failed to delete memory", error);
    }
  };

  const handleRestoreMemory = async (memoryId) => {
    try {
      await memoryApi.restoreMemory(memoryId);
      setMemories((prev) => {
        const next = prev.map((memory) => (memory.id === memoryId ? { ...memory, isDeleted: false, deletedAt: null } : memory));
        updateAlbumCounts(next);
        return next;
      });
      setSelectedMemory(null);
    } catch (error) {
      console.error("Failed to restore memory", error);
    }
  };

  const handleDeleteForever = async (memoryId) => {
    try {
      await memoryApi.deleteForever(memoryId);
      setMemories((prev) => prev.filter((memory) => memory.id !== memoryId));
      setSelectedMemory(null);
      showSuccessToast(theme, {
        title: "Photo deleted successfully",
        text: "The memory was permanently removed.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      console.error("Failed to delete memory permanently", error);
    }
  };

  const handleDeleteMemoryRequest = (memory) => {
    showThemeAlert(theme, {
      title: "Move this memory to Recently Deleted?",
      text: `${memory.title} will be moved out of this album and kept safely for 30 days.`,
      icon: "warning",
      confirmText: "Delete",
      cancelText: "Keep it",
      showCancelButton: true,
      reverseButtons: true,
      customClass: {
        popup: "memory-swal-popup",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        handleDeleteMemory(memory.id);
      }
    });
  };

  const handleToggleFavorite = async (memoryId) => {
    const currentMemory = memories.find((memory) => memory.id === memoryId);
    if (!currentMemory) return;

    const optimisticFavorite = !currentMemory.isFavorite;

    setMemories((prev) => {
      const next = prev.map((memory) =>
        memory.id === memoryId ? { ...memory, isFavorite: optimisticFavorite } : memory
      );
      updateAlbumCounts(next);
      return next;
    });

    try {
      const response = await memoryApi.toggleFavorite(memoryId);
      const favorite = response?.data?.data?.favorite ?? response?.data?.favorite;
      const nextValue = parseBooleanValue(favorite ?? optimisticFavorite);
      setMemories((prev) => {
        const next = prev.map((memory) =>
          memory.id === memoryId ? { ...memory, isFavorite: nextValue } : memory
        );
        updateAlbumCounts(next);
        return next;
      });
      setAlbumPhotos((prev) => (prev && prev.photos ? { ...prev, photos: prev.photos.map((m) => (m.id === memoryId ? { ...m, isFavorite: nextValue } : m)) } : prev));
      showSuccessToast(theme, {
        title: nextValue ? "Added to Favorites" : "Removed from Favorites",
        text: nextValue ? "The memory is now in your favorites." : "The memory was removed from favorites.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      setMemories((prev) => {
        const next = prev.map((memory) =>
          memory.id === memoryId ? { ...memory, isFavorite: currentMemory.isFavorite } : memory
        );
        updateAlbumCounts(next);
        return next;
      });
      console.error("Failed to toggle favorite", error);
    }
  };

  const handleShareMemory = async (memory) => {
    const shareText = `${memory.title} · ${memory.location || "a beautiful moment"}`;

    if (navigator.share) {
      try {
        await navigator.share({ title: memory.title, text: shareText });
        return;
      } catch (error) {
        // fall back to clipboard
      }
    }

    if (navigator.clipboard) {
      await navigator.clipboard.writeText(shareText);
    }
  };

  const openComposer = () => {
    composerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCreateAlbum = async (event) => {
    event.preventDefault();
    const trimmedName = albumNameInput.trim();
    if (!trimmedName) return;

    const previousAlbums = albums;
    const previousSelectedAlbumId = selectedAlbumId;
    const optimisticAlbum = normalizeAlbum({
      _id: `temp-${Date.now()}`,
      name: trimmedName,
      description: albumDescriptionInput.trim(),
      coverImage: albumCoverInput.trim(),
      createdAt: new Date().toISOString(),
      creator: "You",
      folderId: activeFolder === "all" ? "trips" : activeFolder,
      photoCount: 0,
      memoryCount: 0,
    }, activeFolder === "all" ? "trips" : activeFolder);

    setAlbums((prev) => buildAlbumCatalog([optimisticAlbum, ...prev], memories));
    setSelectedAlbumId(optimisticAlbum.id);
    setActiveView("album");
    setShowCreateAlbumModal(false);

    try {
      const payload = {
        name: trimmedName,
        description: albumDescriptionInput.trim(),
        coverImage: albumCoverInput.trim(),
        location: albumLocationInput.trim(),
        tripType: albumTripTypeInput.trim(),
        themeColor: albumThemeColorInput.trim(),
      };
      const response = await memoryApi.createAlbum(payload);
      const createdAlbum = normalizeAlbum(response?.data?.data || { ...payload, folderId: activeFolder === "all" ? "trips" : activeFolder }, activeFolder === "all" ? "trips" : activeFolder);
      setAlbums((prev) => buildAlbumCatalog(prev.filter((album) => album.id !== optimisticAlbum.id).concat([createdAlbum]), memories));
      setSelectedAlbumId(createdAlbum.id);
      setAlbumNameInput("");
      setAlbumCoverInput("");
      setAlbumDescriptionInput("");
      setAlbumLocationInput("");
      setAlbumTripTypeInput("Trip");
      setAlbumThemeColorInput("#ff5ca8");
      showSuccessToast(theme, {
        title: "Album created successfully",
        text: "Your new album is ready to fill with memories.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      setAlbums(previousAlbums);
      setSelectedAlbumId(previousSelectedAlbumId);
      setActiveView(previousSelectedAlbumId ? "album" : "albums");
      console.error("Failed to create album", error);
    }
  };

  const handleRenameAlbum = async () => {
    if (!selectedAlbumId) return;
    const trimmedName = albumNameInput.trim();
    if (!trimmedName) return;

    const previousAlbums = albums;
    const optimisticAlbum = {
      ...selectedAlbum,
      id: selectedAlbumId,
      name: trimmedName,
      coverImage: albumCoverInput.trim(),
    };

    setAlbums((prev) => buildAlbumCatalog(prev.map((album) => (album.id === selectedAlbumId ? optimisticAlbum : album)), memories));

    try {
      const response = await memoryApi.updateAlbum(selectedAlbumId, { name: trimmedName, coverImage: albumCoverInput.trim() });
      const updatedAlbum = normalizeAlbum(response?.data?.data || { id: selectedAlbumId, name: trimmedName, coverImage: albumCoverInput.trim() }, activeFolder === "all" ? "trips" : activeFolder);
      setAlbums((prev) => buildAlbumCatalog(prev.map((album) => (album.id === selectedAlbumId ? updatedAlbum : album)), memories));
      showSuccessToast(theme, {
        title: "Album updated successfully",
        text: "Your album details have been saved.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      setAlbums(previousAlbums);
      console.error("Failed to rename album", error);
    }
  };

  const handleDeleteAlbum = async () => {
    if (!selectedAlbumId) return;
    if (selectedAlbum?.isSystem) return;

    const requestExists = deleteRequests.some((request) => isRequestForAlbum(request, selectedAlbumId));
    if (requestExists) {
      await showThemeAlert(theme, {
        title: "Waiting for partner approval",
        text: "A deletion request for this album is already pending.",
        icon: "info",
        confirmButtonText: "Okay",
        customClass: { popup: "memory-swal-popup" },
      });
      return;
    }

    const result = await showThemeAlert(theme, {
      title: "Delete Album?",
      text: "This album contains shared memories. Your partner's approval is required before deleting it.",
      icon: "warning",
      showCancelButton: true,
      confirmText: "Send Delete Request",
      cancelText: "Cancel",
      reverseButtons: true,
      customClass: { popup: "memory-swal-popup" },
    });

    if (!result.isConfirmed) return;

    const previousAlbums = albums;
    const previousSelectedAlbumId = selectedAlbumId;
    setAlbums((prev) => buildAlbumCatalog(prev.filter((album) => album.id !== selectedAlbumId), memories));
    setSelectedAlbumId(null);
    setActiveView("albums");

    try {
      const response = await memoryApi.createAlbumDeleteRequest(selectedAlbumId);
      const request = response?.data?.data;
      if (request) {
        setDeleteRequests((prev) => [normalizeDeleteRequest(request), ...prev]);
      }
      await refreshDeleteRequests();
      showSuccessToast(theme, {
        title: "Delete request sent",
        text: "Your partner will be notified and can approve or reject it.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      setAlbums(previousAlbums);
      setSelectedAlbumId(previousSelectedAlbumId);
      setActiveView(previousSelectedAlbumId ? "album" : "albums");
      console.error("Failed to create album delete request", error);
      await showThemeAlert(theme, {
        title: "Could not send request",
        text: error?.message || "Please try again in a moment.",
        icon: "error",
        confirmButtonText: "Okay",
        customClass: { popup: "memory-swal-popup" },
      });
    }
  };

  const handleApproveDeleteRequest = async (request) => {
    if (!request?._id) return;

    const albumIdToRemove = getRequestAlbumId(request, selectedAlbumId);
    const result = await showThemeAlert(theme, {
      title: "Approve deletion?",
      text: `This will remove “${getRequestAlbumName(request)}” from your shared memory box after mutual confirmation.`,
      icon: "warning",
      showCancelButton: true,
      confirmText: "Approve",
      cancelText: "Keep album",
      reverseButtons: true,
      customClass: { popup: "memory-swal-popup" },
    });

    if (!result.isConfirmed) return;

    try {
      await memoryApi.approveAlbumDeleteRequest(request._id);
      setDeleteRequests((prev) => prev.filter((item) => item._id !== request._id));
      await refreshDeleteRequests();

      const nextMemories = memories.filter((memory) => memory.albumId !== albumIdToRemove);
      setMemories(nextMemories);
      setAlbums((prev) => buildAlbumCatalog(prev.filter((album) => album.id !== albumIdToRemove), nextMemories));

      if (selectedAlbumId === albumIdToRemove) {
        setSelectedAlbumId(null);
        setActiveView("albums");
      }

      showSuccessToast(theme, {
        title: "Album deleted successfully",
        text: "The album has been removed from your memory box.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      console.error("Failed to approve album delete request", error);
    }
  };

  const handleRejectDeleteRequest = async (request) => {
    if (!request?._id) return;

    const result = await showThemeAlert(theme, {
      title: "Reject deletion request?",
      text: `The album “${getRequestAlbumName(request)}” will stay in your memory box for now.`,
      icon: "question",
      showCancelButton: true,
      confirmText: "Reject request",
      cancelText: "Keep it",
      reverseButtons: true,
      customClass: { popup: "memory-swal-popup" },
    });

    if (!result.isConfirmed) return;

    try {
      await memoryApi.rejectAlbumDeleteRequest(request._id);
      setDeleteRequests((prev) => prev.filter((item) => item._id !== request._id));
      await refreshDeleteRequests();
      showSuccessToast(theme, {
        title: "Request rejected",
        text: "The delete request was dismissed.",
        icon: "success",
        timer: 3000,
        position: "top-end",
      });
    } catch (error) {
      console.error("Failed to reject album delete request", error);
    }
  };

  const handleSetAlbumCover = async () => {
    if (!selectedAlbumId) return;

    try {
      const response = await memoryApi.updateAlbum(selectedAlbumId, { coverImage: albumCoverInput.trim() });
      const updatedAlbum = normalizeAlbum(response?.data?.data || { id: selectedAlbumId, coverImage: albumCoverInput.trim() }, activeFolder === "all" ? "trips" : activeFolder);
      setAlbums((prev) => buildAlbumCatalog(prev.map((album) => (album.id === selectedAlbumId ? updatedAlbum : album)), memories));
    } catch (error) {
      console.error("Failed to update album cover", error);
    }
  };

  const years = useMemo(() => {
    const set = new Set();
    memories.forEach((memory) => {
      if (memory.date) set.add(memory.date.slice(0, 4));
    });
    return Array.from(set).sort().reverse();
  }, [memories]);

  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      if (memory.isDeleted) return false;
      const inFolder = activeFolder === "all" ? true : matchesFolder(memory, activeFolder);

      const searchText = search.trim().toLowerCase();
      const bySearch = searchText
        ? memory.title.toLowerCase().includes(searchText) ||
        (memory.description || "").toLowerCase().includes(searchText) ||
        (memory.location || "").toLowerCase().includes(searchText) ||
        (memory.tags || []).some((tag) => tag.toLowerCase().includes(searchText))
        : true;

      const byMood = moodFilter === "all" ? true : memory.mood === moodFilter;
      const byYear = yearFilter === "all" ? true : memory.date?.slice(0, 4) === yearFilter;
      const byPartner = partnerFilter === "all" ? true : memory.createdBy === partnerFilter;

      return inFolder && bySearch && byMood && byYear && byPartner;
    });
  }, [memories, activeFolder, search, moodFilter, yearFilter, partnerFilter]);

  const visibleAlbums = useMemo(() => {
    return albums.filter((album) => {
      if (activeFolder === "all") return true;
      return album.folderId === activeFolder;
    });
  }, [albums, activeFolder]);

  const selectedAlbum = useMemo(() => albums.find((album) => album.id === selectedAlbumId) || null, [albums, selectedAlbumId]);

  useEffect(() => {
    if (!selectedAlbumId) return;

    const fetchPhotos = async () => {
      try {
        setIsSorting(true);
        const response = await memoryApi.getAlbumPhotos(selectedAlbumId, { sort: albumSort }).catch(() => ({ data: { data: [] } }));
        const photos = (response?.data?.data || []).map(normalizeMemory);
        setAlbumPhotos({ albumId: selectedAlbumId, photos });
      } catch (error) {
        console.error("Failed to fetch album photos", error);
      } finally {
        // keep a short animation window
        setTimeout(() => setIsSorting(false), 220);
      }
    };

    // Only fetch for real albums (not system folders like favorites)
    if (selectedAlbum && selectedAlbum.id !== "favorites" && selectedAlbum.id !== "recently-deleted") {
      fetchPhotos();
    } else {
      setAlbumPhotos({ albumId: null, photos: null });
    }
  }, [selectedAlbumId, albumSort]);

  const albumMemories = useMemo(() => {
    if (!selectedAlbum) return [];

    if (selectedAlbum.id === "favorites") {
      return memories.filter((memory) => memory.isFavorite && !memory.isDeleted);
    }

    if (selectedAlbum.id === "recently-deleted") {
      return memories.filter((memory) => memory.isDeleted && (!memory.deletedAt || Date.now() - new Date(memory.deletedAt) < 30 * 24 * 60 * 60 * 1000));
    }

    // If we have fetched album-specific photos for this album (with sort), use them
    if (albumPhotos && albumPhotos.albumId === selectedAlbum.id && Array.isArray(albumPhotos.photos)) {
      return albumPhotos.photos;
    }

    return memories.filter((memory) => memory.albumId === selectedAlbum.id && !memory.isDeleted);
  }, [memories, selectedAlbum]);

  const favoritesAlbum = useMemo(() => albums.find((album) => album.id === "favorites") || null, [albums]);
  const deletedAlbum = useMemo(() => albums.find((album) => album.id === "recently-deleted") || null, [albums]);
  const deletedMemories = useMemo(() => memories.filter((memory) => memory.isDeleted && isDeletedWithinRetention(memory)), [memories]);

  const statsDisplay = useMemo(() => {
    if (stats.length) return stats;

    const favoriteCount = memories.filter((memory) => memory.isFavorite).length;
    const photoCount = memories.filter((memory) => memory.imageUrl && !memory.isDeleted).length;
    const deletedCount = memories.filter((memory) => memory.isDeleted).length;

    return [
      {
        label: "Memories",
        value: memories.filter((memory) => !memory.isDeleted).length,
        subtitle: "Little moments preserved",
        icon: <Heart size={16} />,
      },
      {
        label: "Photos",
        value: photoCount,
        subtitle: "Soft light and happy frames",
        icon: <Camera size={16} />,
      },
      {
        label: "Favorites",
        value: favoriteCount,
        subtitle: "The ones that matter most",
        icon: <Sparkles size={16} />,
      },
      {
        label: "Albums",
        value: albums.length,
        subtitle: "Curated keepsakes",
        icon: <MapPin size={16} />,
      },
      {
        label: "Deleted",
        value: deletedCount,
        subtitle: "Moments tucked away",
        icon: <Heart size={16} />,
      },
    ];
  }, [albums.length, memories, stats]);

  const openMemory = (memory, index) => {
    setSelectedMemory(memory);
    setCurrentIndex(typeof index === "number" ? index : 0);
  };

  const renderDeleteRequestCard = (request) => (
    <div key={request._id} className="memory-request-card">
      <div className="memory-request-cover">
        <img
          src={getRequestAlbumCover(request) || "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80"}
          alt={getRequestAlbumName(request)}
        />
      </div>
      <div className="memory-request-body">
        <div className="memory-request-top">
          <div className="memory-request-user">
            <div className="memory-request-avatar">{getRequestRequesterInitials(request)}</div>
            <div>
              <p className="memory-section-tag">🗑 Album Delete Request</p>
              <h3>{getRequestAlbumName(request)}</h3>
            </div>
          </div>
          <span className="memory-request-pill">Needs mutual approval</span>
        </div>
        <p className="memory-request-copy">Requested by {getRequestRequesterName(request)} • {formatRequestDate(request.createdAt)}</p>
        <p className="memory-request-copy subtle">This album will stay in your shared memory box until both of you confirm removal.</p>
        <div className="memory-request-actions">
          <button type="button" className="memory-secondary-btn" onClick={() => handleRejectDeleteRequest(request)}>
            Reject
          </button>
          <button type="button" className="memory-submit-btn" onClick={() => handleApproveDeleteRequest(request)}>
            Approve
          </button>
        </div>
      </div>
    </div>
  );

  const handlePreviousMemory = () => {
    if (!albumMemories.length) return;
    const nextIndex = currentIndex > 0 ? currentIndex - 1 : albumMemories.length - 1;
    setCurrentIndex(nextIndex);
    setSelectedMemory(albumMemories[nextIndex] || null);
  };

  const handleNextMemory = () => {
    if (!albumMemories.length) return;
    const nextIndex = currentIndex < albumMemories.length - 1 ? currentIndex + 1 : 0;
    setCurrentIndex(nextIndex);
    setSelectedMemory(albumMemories[nextIndex] || null);
  };

  useEffect(() => {
    if (!selectedMemory || !albumMemories.length) return;

    const handler = (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        handlePreviousMemory();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        handleNextMemory();
      } else if (event.key === "Escape") {
        event.preventDefault();
        setSelectedMemory(null);
        setCurrentIndex(0);
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selectedMemory, currentIndex, albumMemories.length]);

  return (
    <div className={`memory-wrapper ${isDark ? "memory-theme-dark" : "memory-theme-light"}`}>
      <div className="memory-floaters" aria-hidden="true">
        <span className="memory-float memory-float-1">💗</span>
        <span className="memory-float memory-float-2">✨</span>
        <span className="memory-float memory-float-3">💖</span>
        <span className="memory-float memory-float-4">⭐</span>
      </div>
      <div className="memory-overlay" />

      <div className="memory-inner">
        <header className="memory-hero">
          <div className="memory-hero-copy">
            <p className="memory-badge">📦 Our Memory Box ❤️</p>
            <h1>A place where every memory lives forever.</h1>
            <p className="memory-subtitle">A scrapbook experience inspired by Google Photos, Apple Photos and Instagram Collections.</p>
          </div>
          <div className="memory-hero-actions">
            <button type="button" className="memory-secondary-btn" onClick={() => setShowCreateAlbumModal(true)}>
              <Plus size={15} /> Create Album
            </button>
            <button type="button" className="memory-hero-action" onClick={() => setShowUploadComposer(true)}>
              <Upload size={16} /> Upload Photos
            </button>
          </div>
        </header>

        <div className="memory-stats-row">
          {statsDisplay.map((stat) => (
            <div className="memory-stat-card" key={stat.label}>
              <div className="memory-stat-icon">{stat.icon}</div>
              <div>
                <p className="memory-stat-value">{stat.value}</p>
                <p className="memory-stat-label">{stat.label}</p>
                <p className="memory-stat-subtitle">{stat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="memory-main-column memory-loading-shell" aria-label="Loading your memories">
            <div className="memory-glass-card memory-section-card memory-skeleton-card">
              <div className="memory-skeleton-block memory-skeleton-line large" />
              <div className="memory-skeleton-block memory-skeleton-line medium" />
              <div className="memory-skeleton-grid">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="memory-skeleton-tile" />
                ))}
              </div>
            </div>
          </div>
        ) : null}
        <div className="memory-main-column" style={{ display: loading ? "none" : undefined }}>
          {console.debug("[MemoryBox] Rendered pending delete requests", { count: deleteRequests.length, requests: deleteRequests })}
          {deleteRequests.length > 0 ? (
            <section className="memory-glass-card memory-section-card">
              <div className="memory-section-heading">
                <div>
                  <p className="memory-section-tag">🗑 Pending Album Requests</p>
                  <h2>These albums need mutual approval before they can be removed</h2>
                </div>
                <span className="memory-badge">{deleteRequests.length} pending</span>
              </div>
              <div className="memory-album-request-list">
                {deleteRequests.map((request) => renderDeleteRequestCard(request))}
              </div>
            </section>
          ) : null}

          {activeView === "albums" ? (
            <section className="memory-glass-card memory-section-card">
              <div className="memory-section-heading">
                <div>
                  <p className="memory-section-tag">🗂 Albums</p>
                  <h2>Open a scrapbook and walk through the story</h2>
                </div>
                <p className="memory-section-copy">Albums keep every chapter together in a cohesive collection.</p>
              </div>

              {visibleAlbums.length === 0 ? (
                <div className="memory-empty-card memory-album-empty-state">
                  <div className="memory-empty-icon">📸</div>
                  <h3 className="memory-empty-title">No albums yet</h3>
                  <p className="memory-empty-copy">Create your first album and start saving your beautiful memories together.</p>
                  <button type="button" className="memory-submit-btn" onClick={() => setShowCreateAlbumModal(true)}>
                    <Plus size={16} /> Create Album
                  </button>
                </div>
              ) : (
                <div className="memory-album-grid">
                  {visibleAlbums.map((album) => (
                    <article key={album.id} className="memory-album-card" onClick={() => { setSelectedAlbumId(album.id); setActiveView("album"); }}>
                      <div className="memory-album-cover-wrap" style={{ background: album.themeColor ? `linear-gradient(135deg, ${album.themeColor}, rgba(255,255,255,0.12))` : undefined }}>
                        <img src={album.coverImage || "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80"} alt={album.name} />
                      </div>
                      <div className="memory-album-info">
                        <h3>{album.name}</h3>
                        <p>{(album.memoryCount ?? album.count ?? 0)} Photos</p>
                        <div className="memory-album-footer">
                          <span>{album.creator}</span>
                          <span>{new Date(album.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          ) : selectedAlbum ? (
            <>
              <section className="memory-glass-card memory-album-page-shell">
                <div className="memory-album-page-header">
                  <div className="memory-album-page-left">
                    <button type="button" className="memory-album-action-btn memory-album-back-btn" onClick={() => { setActiveView("albums"); setSelectedMemory(null); }}>
                      <ArrowLeft size={14} /> Back to Albums
                    </button>
                  </div>

                  <div className="memory-album-page-center">
                    <div className="memory-album-page-title">
                      {/* <p className="memory-section-tag"> Album</p> */}
                      <h2>📁 {selectedAlbum.name}</h2>
                      <span className="memory-album-page-meta">
                        {albumMemories.length} Photos • {new Date(selectedAlbum.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>
                  </div>

                  <div className="memory-album-page-right">
                    <div className="memory-album-page-actions">
                      <div className="memory-sort-wrap">
                        <MemorySortDropdown
                          value={albumSort}
                          onChange={(next) => {
                            setAlbumSort(next);
                            try { localStorage.setItem("albumSort", next); } catch (err) { /* ignore */ }
                          }}
                          disabled={Boolean((selectedAlbum?.photoCount || albumMemories.length) === 0)}
                        />
                      </div>
                      <button type="button" className="memory-album-action-btn memory-album-add-btn" onClick={() => setShowUploadComposer(true)}>
                        <Upload size={14} /> Add Photos
                      </button>
                      <button type="button" className="memory-album-action-btn memory-album-edit-btn" onClick={() => { setAlbumNameInput(selectedAlbum.name || ""); setAlbumCoverInput(selectedAlbum.coverImage || ""); setAlbumDescriptionInput(selectedAlbum.description || ""); setAlbumLocationInput(selectedAlbum.location || ""); setAlbumTripTypeInput(selectedAlbum.tripType || "Trip"); setAlbumThemeColorInput(selectedAlbum.themeColor || "#ff5ca8"); setShowCreateAlbumModal(true); }}>
                        <PencilLine size={14} /> Edit Album
                      </button>
                      {!selectedAlbum.isSystem ? (
                        <button type="button" className="memory-album-action-btn memory-album-delete-btn" onClick={handleDeleteAlbum} disabled={Boolean(deleteRequests.some((request) => isRequestForAlbum(request, selectedAlbumId)))}>
                          <Trash2 size={14} /> {deleteRequests.some((request) => isRequestForAlbum(request, selectedAlbumId)) ? "Waiting for Approval" : "Delete Album"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>

                <div className="memory-album-page-hero">
                  <img src={selectedAlbum.coverImage || "https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=900&q=80"} alt={selectedAlbum.name} />
                  <div className="memory-album-page-hero-content">
                    <p className="memory-section-tag">{selectedAlbum.id === "favorites" ? "❤️ Favorites" : selectedAlbum.id === "recently-deleted" ? "🗑 Recently Deleted" : "📸 Album"}</p>
                    <h3>{selectedAlbum.name}</h3>
                    <p>{selectedAlbum.description || "A beautiful place for this chapter of your story."}</p>
                    <div className="memory-album-banner-meta">
                      <span>{albumMemories.length} photos</span>
                      <span>Created by {selectedAlbum.creator}</span>
                      <span>{new Date(selectedAlbum.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</span>
                    </div>
                  </div>
                </div>
              </section>

              {deleteRequests.filter((request) => isRequestForAlbum(request, selectedAlbumId)).length ? (
                <section className="memory-glass-card memory-section-card">
                  <div className="memory-section-heading">
                    <div>
                      <p className="memory-section-tag">🗑 Approval Needed</p>
                      <h2>Your partner needs to confirm this deletion</h2>
                    </div>
                  </div>
                  <div className="memory-album-request-list">
                    {deleteRequests.filter((request) => isRequestForAlbum(request, selectedAlbumId)).map((request) => renderDeleteRequestCard(request))}
                  </div>
                </section>
              ) : null}

              {albumMemories.length === 0 ? (
                <section className="memory-glass-card memory-empty-state-card memory-album-empty-card">
                  <div className="memory-empty-card">
                    <div className="memory-empty-icon">📷</div>
                    <h3 className="memory-empty-title">This album is empty</h3>
                    <p className="memory-empty-copy">Start building your memories by uploading your first photo.</p>
                    <button type="button" className="memory-submit-btn" onClick={() => setShowUploadComposer(true)}>
                      <Plus size={16} /> Add Photos
                    </button>
                  </div>
                </section>
              ) : (
                <section className="memory-gallery-section">
                  <div className="memory-section-heading memory-gallery-heading">
                    <div>
                      <p className="memory-section-tag">🖼 Gallery</p>
                      <h2>{selectedAlbum.name}</h2>
                    </div>
                    <p className="memory-section-copy">Your memories appear here in a polished photo-library layout, ready to revisit anytime.</p>
                  </div>
                  <div className={`memory-grid-shell ${isSorting ? "is-sorting" : ""}`}>
                    <MemoryGrid
                      memories={albumMemories}
                      onOpenMemory={openMemory}
                      onToggleFavorite={handleToggleFavorite}
                      onShare={handleShareMemory}
                      onDelete={selectedAlbum.id === "recently-deleted" ? (memory) => handleDeleteForever(memory.id) : handleDeleteMemoryRequest}
                      onAddFirstMemory={() => setShowUploadComposer(true)}
                    />
                  </div>

                </section>
              )}
            </>
          ) : (
            <section className="memory-glass-card memory-empty-state-card">
              <div className="memory-empty-card">
                <div className="memory-empty-icon">📸</div>
                <h3 className="memory-empty-title">Choose an album to open its gallery.</h3>
                <p className="memory-empty-copy">The home screen now leads with albums so it feels like a real photo library.</p>
              </div>
            </section>
          )}
        </div>

        {showCreateAlbumModal ? (
          <div className="memory-modal-backdrop" onClick={() => setShowCreateAlbumModal(false)}>
            <div className="memory-modal memory-create-album-modal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="memory-modal-close" onClick={() => setShowCreateAlbumModal(false)}>
                <X size={15} />
              </button>
              <form className="memory-create-album-form" onSubmit={handleCreateAlbum}>
                <div className="memory-upload-header">
                  <div className="memory-upload-title">
                    <p className="memory-section-tag">✨ Create Album</p>
                    <h2>Build a new scrapbook chapter</h2>
                    <p>Give your album a name, story and a gorgeous cover image.</p>
                  </div>
                </div>
                <div className="memory-upload-grid">
                  <div className="memory-upload-field">
                    <label>Album Name</label>
                    <input value={albumNameInput} onChange={(event) => setAlbumNameInput(event.target.value)} placeholder="e.g. Goa Trip" required />
                  </div>
                  <div className="memory-upload-field">
                    <label>Cover Image</label>
                    <input value={albumCoverInput} onChange={(event) => setAlbumCoverInput(event.target.value)} placeholder="Image URL" />
                  </div>
                </div>
                <div className="memory-upload-grid">
                  <div className="memory-upload-field">
                    <label>Location</label>
                    <input value={albumLocationInput} onChange={(event) => setAlbumLocationInput(event.target.value)} placeholder="Where did this happen?" />
                  </div>
                  <div className="memory-upload-field">
                    <label>Trip Type</label>
                    <input value={albumTripTypeInput} onChange={(event) => setAlbumTripTypeInput(event.target.value)} placeholder="Trip / Date / Celebration" />
                  </div>
                </div>
                <div className="memory-upload-field">
                  <label>Description</label>
                  <textarea rows={3} value={albumDescriptionInput} onChange={(event) => setAlbumDescriptionInput(event.target.value)} placeholder="A little story for this album" />
                </div>
                <div className="memory-upload-field">
                  <label>Theme Color</label>
                  <input type="color" value={albumThemeColorInput} onChange={(event) => setAlbumThemeColorInput(event.target.value)} />
                </div>
                <div className="memory-upload-actions">
                  <button type="button" className="memory-secondary-btn" onClick={() => setShowCreateAlbumModal(false)}>Cancel</button>
                  <button type="submit" className="memory-submit-btn"><Plus size={14} /> Save Album</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        {showUploadComposer ? (
          <div className="memory-modal-backdrop" onClick={() => setShowUploadComposer(false)}>
            <div className="memory-modal memory-upload-modal" onClick={(event) => event.stopPropagation()}>
              <button type="button" className="memory-modal-close" onClick={() => setShowUploadComposer(false)}>
                <X size={15} />
              </button>
              <MemoryUploadForm
                onAddMemories={handleAddMemories}
                onEditMemory={handleEditMemory}
                editingMemory={memories.find((memory) => memory.id === editingMemoryId) || null}
                onCancelEdit={() => setEditingMemoryId(null)}
                onClose={() => setShowUploadComposer(false)}
                albums={albums}
                defaultAlbumId={selectedAlbumId || ""}
              />
            </div>
          </div>
        ) : null}

        {selectedMemory && (
          <MemoryModal
            memory={selectedMemory}
            onClose={() => {
              setSelectedMemory(null);
              setCurrentIndex(0);
            }}
            onToggleFavorite={handleToggleFavorite}
            onShare={handleShareMemory}
            onDelete={handleDeleteMemoryRequest}
            onEdit={(memory) => {
              setEditingMemoryId(memory.id);
              setSelectedMemory(null);
              setCurrentIndex(0);
              setShowUploadComposer(true);
            }}
            onPrevious={handlePreviousMemory}
            onNext={handleNextMemory}
            hasPrevious={albumMemories.length > 1}
            hasNext={albumMemories.length > 1}
          />
        )}
      </div>
    </div>
  );
}
