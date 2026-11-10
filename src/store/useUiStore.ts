import { create } from 'zustand';

interface UiState {
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  selectedRegionId: string;
  demoBannerDismissed: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebarOpen: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleSidebarCollapsed: () => void;
  setSelectedRegionId: (id: string) => void;
  dismissDemoBanner: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  sidebarCollapsed: false,
  selectedRegionId: '',
  demoBannerDismissed: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebarOpen: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  toggleSidebarCollapsed: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
  setSelectedRegionId: (id) => set({ selectedRegionId: id }),
  dismissDemoBanner: () => set({ demoBannerDismissed: true }),
}));
