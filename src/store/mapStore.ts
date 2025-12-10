import { create } from "zustand";
import type { Weather, Season, TouristSpot } from "@/types";
import { useBottomSheetStore } from "@/store";
import { attractionApi } from "@/api";

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
  isLoading: boolean;
  searchResults: TouristSpot[];
  isSearchOpen: boolean;
  setKeyword: (keyword: string) => void;
  setPlaces: (places: TouristSpot[]) => void;
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedSpot: (id: string | null) => void;
  setFilters: (filters: Partial<MapStore["filters"]>) => void;
  fetchNearbyPlaces: (lat: number, lng: number) => Promise<void>;
  fetchSearchPlaces: (keyword: string) => Promise<void>;
  fetchSelectPlace: (place: TouristSpot) => void;
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
  isLoading: false,
  searchResults: [],
  isSearchOpen: false,
  setKeyword: (keyword) => set({ keyword }),
  setPlaces: (places) => set({ places }),
  setCenter: (lat, lng) => set({ center: { lat, lng } }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedSpot: (id) => set({ selectedSpotId: id }),
  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  fetchNearbyPlaces: async (lat, lng) => {
    useBottomSheetStore.getState().setMode("nearby");
    useBottomSheetStore.getState().setState("middle");

    set({ isLoading: true });
    try {
      const { data } = await attractionApi.getNearby(lat, lng);
      set({ places: data });
    } catch (error) {
      console.error(error);
    } finally {
      set({ isLoading: false });
    }
  },

  fetchSearchPlaces: async (keyword) => {
    if (!keyword.trim()) return;

    useBottomSheetStore.getState().setMode("search");
    useBottomSheetStore.getState().setState("middle");

    set({ isLoading: true, keyword });
    try {
      // const { data } = await attractionApi.search(keyword);
      // set({ searchResults: data, isSearchOpen: true });

      // 임시 더미
      const mockResults: TouristSpot[] = [
        {
          id: "1",
          name: "감천문화마을",
          latitude: 35.0975,
          longitude: 129.0108,
          address: "부산 사하구 감내2로 203",
          description: "알록달록 벽화마을",
          thumbnailUrl: "",
          tags: ["마을", "사진"],
          shortsCount: 30,
        },
        {
          id: "2",
          name: "해운대해수욕장",
          latitude: 35.1587,
          longitude: 129.1604,
          address: "부산 해운대구 해운대해변로 264",
          description: "부산 대표 해수욕장",
          thumbnailUrl: "",
          tags: ["해변", "여름"],
          shortsCount: 25,
        },
      ];
      set({ searchResults: mockResults, isSearchOpen: true });
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSelectPlace: (place) => {
    set({
      center: { lat: place.latitude, lng: place.longitude },
      places: [place],
      keyword: place.name,
      isSearchOpen: false,
    });
  },
}));
