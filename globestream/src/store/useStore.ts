import { create } from "zustand";
import {
  Country,
  ThemeMode,
  Toast,
  MediaItem,
  BrowsingSession,
  Tab,
} from "../types";
import { ConnectionState } from "../utils/proxyService";
import { countries } from "../utils/countries";
interface AppState {
  // ─── Theme ───
  theme: ThemeMode;
  toggleTheme: () => void;

  // ─── Region / Country ───
  selectedCountry: Country | null;
  setSelectedCountry: (country: Country | null) => void;
  recentCountries: Country[];
  addRecentCountry: (country: Country) => void;

  // ─── Proxy Connection ───
  connection: ConnectionState;
  setConnection: (conn: ConnectionState) => void;
  isConnecting: boolean;
  setIsConnecting: (val: boolean) => void;
  // ─── Browser ───
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  browsingHistory: BrowsingSession[];
  addToHistory: (session: BrowsingSession) => void;
  tabs: Tab[];
  addTab: (tab: Tab) => void;
  removeTab: (id: string) => void;
  setActiveTab: (id: string) => void;

  // ─── Media & Subtitles ───
  selectedMedia: MediaItem | null;
  setSelectedMedia: (media: MediaItem | null) => void;
  subtitlesEnabled: boolean;
  setSubtitlesEnabled: (val: boolean) => void;
  subtitleFontSize: "small" | "medium" | "large";
  setSubtitleFontSize: (size: "small" | "medium" | "large") => void;
  favorites: MediaItem[];
  toggleFavorite: (media: MediaItem) => void;
  watchHistory: MediaItem[];
  addToWatchHistory: (media: MediaItem) => void;

  // ─── Toasts ───
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;

  // ─── Sidebar ───
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // ─── Speed Test ───
  isTestingSpeed: boolean;
  setIsTestingSpeed: (val: boolean) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // ─── Theme ───
  theme: (localStorage.getItem("gs-theme") as ThemeMode) || "dark",
  toggleTheme: () => {
    const newTheme = get().theme === "dark" ? "light" : "dark";
    localStorage.setItem("gs-theme", newTheme);
    set({ theme: newTheme });
  },

  // ─── Region / Country ───
  selectedCountry: countries.find((c) => c.code === "US") || null,
  setSelectedCountry: (country) => {
    set({ selectedCountry: country });
    if (country) get().addRecentCountry(country);
  },
  recentCountries: [],
  addRecentCountry: (country) => {
    const recent = get().recentCountries.filter((c) => c.code !== country.code);
    set({ recentCountries: [country, ...recent].slice(0, 8) });
  },

  // ─── Proxy Connection ───
  connection: {
    isConnected: false,
    countryCode: null,
    countryName: null,
    countryFlag: null,
    protocol: null,
    connectedAt: null,
    latency: 0,
    requestCount: 0,
    bytesDown: 0,
  },
  setConnection: (conn) => set({ connection: conn }),
  isConnecting: false,
  setIsConnecting: (val) => set({ isConnecting: val }),
  // ─── Browser ───
  browserUrl: "",
  setBrowserUrl: (url) => set({ browserUrl: url }),
  searchQuery: "",
  setSearchQuery: (query) => set({ searchQuery: query }),
  browsingHistory: [],
  addToHistory: (session) =>
    set({ browsingHistory: [session, ...get().browsingHistory].slice(0, 100) }),
  tabs: [{ id: "tab-1", label: "New Tab", active: true }],
  addTab: (tab) => {
    const tabs = get().tabs.map((t) => ({ ...t, active: false }));
    set({ tabs: [...tabs, { ...tab, active: true }] });
  },
  removeTab: (id) => {
    const tabs = get().tabs.filter((t) => t.id !== id);
    if (tabs.length === 0) {
      tabs.push({ id: `tab-${Date.now()}`, label: "New Tab", active: true });
    } else if (!tabs.some((t) => t.active)) {
      tabs[tabs.length - 1].active = true;
    }
    set({ tabs });
  },
  setActiveTab: (id) =>
    set({ tabs: get().tabs.map((t) => ({ ...t, active: t.id === id })) }),

  // ─── Media & Subtitles ───
  selectedMedia: null,
  setSelectedMedia: (media) => set({ selectedMedia: media }),
  subtitlesEnabled: true, // English subs ON by default
  setSubtitlesEnabled: (val) => set({ subtitlesEnabled: val }),
  subtitleFontSize: "medium",
  setSubtitleFontSize: (size) => set({ subtitleFontSize: size }),
  favorites: [],
  toggleFavorite: (media) => {
    const favs = get().favorites;
    const exists = favs.find((f) => f.id === media.id);
    set({
      favorites: exists
        ? favs.filter((f) => f.id !== media.id)
        : [...favs, media],
    });
  },
  watchHistory: [],
  addToWatchHistory: (media) => {
    const history = get().watchHistory.filter((m) => m.id !== media.id);
    set({ watchHistory: [media, ...history].slice(0, 50) });
  },

  // ─── Toasts ───
  toasts: [],
  addToast: (toast) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    set({ toasts: [...get().toasts, { ...toast, id }] });
    setTimeout(() => get().removeToast(id), toast.duration || 4000);
  },
  removeToast: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),

  // ─── Sidebar ───
  sidebarOpen: true,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  // ─── Speed Test ───
  isTestingSpeed: false,
  setIsTestingSpeed: (val) => set({ isTestingSpeed: val }),
}));
