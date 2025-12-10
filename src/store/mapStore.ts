import { create } from "zustand";
import type { Weather, Season, TouristSpot } from "@/types";
import { useBottomSheetStore } from "@/store";
import { attractionApi } from "@/api";

const RADIUS_BY_ZOOM: Record<number, number> = {
  1: 1000,
  2: 2000,
  3: 5000,
  4: 10000,
  5: 20000,
  6: 30000,
  7: 50000,
  8: 100000,
  9: 200000,
  10: 300000,
  11: 500000,
  12: 700000,
  13: 1000000,
  14: 1500000,
};

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
  fetchNearbyPlaces: () => Promise<void>;
  fetchSearchPlaces: (keyword: string) => Promise<void>;
  fetchSelectPlace: (place: TouristSpot) => void;
}

export const useMapStore = create<MapStore>((set, get) => ({
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

  fetchNearbyPlaces: async () => {
    const { center, zoom } = get();
    const radius = RADIUS_BY_ZOOM[zoom] || 5000;
    useBottomSheetStore.getState().setMode("nearby");
    useBottomSheetStore.getState().setState("middle");

    set({ isLoading: true });
    try {
      const { data } = await attractionApi.getNearby({
        latitude: center.lat,
        longitude: center.lng,
        radius,
      });

      console.log("api호출: " + data);

      const places: TouristSpot[] = data.attractions.map((item) => ({
        id: String(item.contentId),
        name: item.title,
        address: `${item.sidoName} ${item.gugunName}`,
        description: item.overview,
        thumbnailUrl: item.firstImage,
        latitude: data.center.latitude,
        longitude: data.center.longitude,
        shortsCount: item.shortsCount,
        category: item.contentTypeName,
      }));

      console.log("places변환:", places);
      set({ places });
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
      const { data } = await attractionApi.getList(keyword);
      console.log("검색 응답:", data);

      const searchResults: TouristSpot[] = data.attractions.content.map(
        (item) => ({
          id: String(item.contentId),
          name: item.title,
          address: item.addr1 + (item.addr2 ? ` ${item.addr2}` : ""),
          latitude: item.latitude,
          longitude: item.longitude,
          thumbnailUrl: item.firstImage,
          shortsCount: item.shortsCount,
          category: `${item.sidoName} ${item.gugunName}`,
        })
      );
      set({ searchResults });
    } catch (error) {
      console.error("검색 실패:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchSelectPlace: async (place) => {
    set({ isLoading: true });

    try {
      // 상세 조회 API 호출
      const { data } = await attractionApi.getDetail(Number(place.id));
      console.log("상세 응답:", data);

      // API 응답 → TouristSpot 변환
      const detailSpot: TouristSpot = {
        id: String(data.contentId),
        name: data.title,
        address: data.addr1 + (data.addr2 ? ` ${data.addr2}` : ""),
        description: data.description?.overview,
        latitude: data.latitude,
        longitude: data.longitude,
        thumbnailUrl: data.firstImage,
        shortsCount: data.shortsCount,
        category: `${data.sidoName} ${data.gugunName}`,
      };

      set({
        places: [detailSpot],
        keyword: detailSpot.name,
        isSearchOpen: false,
      });

      useBottomSheetStore.getState().setSpot(detailSpot);
      useBottomSheetStore.getState().setMode("spot");
      useBottomSheetStore.getState().setState("middle");

      setTimeout(() => {
        window.moveMapTo?.(detailSpot.latitude, detailSpot.longitude, 4);
      }, 100);
    } catch (error) {
      console.error("상세 조회 실패:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
