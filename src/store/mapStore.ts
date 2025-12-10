import { create } from "zustand";
import type { Weather, Season, TouristSpot } from "@/types";

interface MapStore {
  center: { lat: number; lng: number };
  zoom: number;
  selectedSpotId: string | null;
  filters: {
    weather: Weather | null;
    season: Season | null;
    time: string | null;
  };
  places: TouristSpot[];
  keyword: string;
  setKeyword: (keyword: string) => void;
  setPlaces: (places: TouristSpot[]) => void;
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedSpot: (id: string | null) => void;
  setFilters: (filters: Partial<MapStore["filters"]>) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  center: { lat: 35.1796, lng: 129.0756 }, // 부산 기본값
  zoom: 9,
  selectedSpotId: null,
  filters: {
    weather: null,
    season: null,
    time: null,
  },
  places: [],
  keyword: "",
  setKeyword: (keyword) => set({ keyword }),
  setPlaces: (places) => set({ places }),
  setCenter: (lat, lng) => set({ center: { lat, lng } }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedSpot: (id) => set({ selectedSpotId: id }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),
}));
