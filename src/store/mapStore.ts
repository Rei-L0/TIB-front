import { create } from "zustand";
import type { Weather, Season, TouristSpot, Shorts } from "@/types";
import { useBottomSheetStore } from "@/store";
import { attractionApi } from "@/api";
import { shortsApi } from "@/api/shorts";

const RADIUS_BY_ZOOM: Record<number, number> = {
  6: 576000,
  7: 288000,
  8: 144000,
  9: 72000,
  10: 36000,
  11: 18000,
  12: 8800,
  13: 4400,
  14: 2200,
  15: 1100,
  16: 600,
  17: 300,
  18: 150,
  19: 70,
  20: 35,
  21: 20,
};

interface MapStore {
  center: { lat: number; lng: number };
  zoom: number;
  selectedSpotId: string | null;
  filters: {
    weather: Weather | null;
    season: Season | null;
    theme: string | null;
  };
  places: TouristSpot[];
  keyword: string;
  isLoading: boolean;
  searchResults: TouristSpot[];
  isSearchOpen: boolean;
  shorts: Shorts[];

  // interface에 추가
  hoveredShorts: Shorts | null;
  hoverPosition: { x: number; y: number } | null;
  language: "ko" | "en" | "ja" | "zh";
  setLanguage: (lang: "ko" | "en" | "ja" | "zh") => void;
  setHoveredShorts: (
    shorts: Shorts | null,
    position?: { x: number; y: number }
  ) => void;

  setShorts: (shorts: Shorts[]) => void;
  fetchShorts: (pageNum?: number) => void;
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
  zoom: 11,
  selectedSpotId: null,
  filters: {
    weather: null,
    season: null,
    theme: null,
  },
  places: [],
  keyword: "",
  isLoading: false,
  searchResults: [],
  isSearchOpen: false,
  shorts: [],
  hoveredShorts: null,
  hoverPosition: null,
  language:
    (import.meta.env.VITE_I18N_LANG as "ko" | "en" | "ja" | "zh") || "ko",
  setLanguage: (lang) => {
    const { pathname, search, hash } = window.location;
    const currentBase = import.meta.env.BASE_URL.replace(/\/$/, ""); // /ko

    // 현재 base 제거
    let newPath = pathname;
    if (currentBase && pathname.startsWith(currentBase)) {
      newPath = pathname.slice(currentBase.length) || "/";
    }

    // 새 언어 경로로 이동
    window.location.href = `/${lang}${newPath}${search}${hash}`;
  },
  setHoveredShorts: (shorts, position) =>
    set({
      hoveredShorts: shorts,
      hoverPosition: position || null,
    }),

  setShorts: (shorts) => set({ shorts }),
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

      console.log("api호출: ", data);

      const places: TouristSpot[] = data.attractions.map((item) => ({
        id: String(item.contentId),
        name: item.title,
        address: `${item.sidoName} ${item.gugunName}`,
        description: item.overview,
        thumbnailUrl: item.firstImage,
        latitude: item.latitude,
        longitude: item.longitude,
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
    useBottomSheetStore.getState().setState("max");

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
        homepage: data.description?.homepage,
        tel: data.tel,
        telname: data.description?.telname,
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
        window.moveMapTo?.(detailSpot.latitude, detailSpot.longitude, 16);
      }, 100);
    } catch (error) {
      console.error("상세 조회 실패:", error);
    } finally {
      set({ isLoading: false });
    }
  },
  fetchShorts: async (pageNum = 0) => {
    const { center, zoom, filters } = get();
    const radius = RADIUS_BY_ZOOM[zoom] || 5000;
    const { mode, spot } = useBottomSheetStore.getState();
    set({ isLoading: true });
    console.log("center", center);
    console.log("radius", radius);
    try {
      const res = await shortsApi.getList({
        page: pageNum,
        size: 1000,
        contentId: mode === "spot" && spot?.id ? Number(spot.id) : undefined,
        latitude: center.lat,
        longitude: center.lng,
        ...(mode === "nearby" && { radius }),
        ...(filters.weather && { weather: filters.weather }),
        ...(filters.season && { season: filters.season }),
        ...(filters.theme && { theme: filters.theme }),
      });

      const mappedShorts: Shorts[] = res.content.map((item: any) => ({
        id: item.id,
        title: item.title,
        video: item.video,
        thumbnailUrl: item.thumbnailUrl,
        readcount: item.readcount,
        good: item.good,
        liked: item.liked,
        createdAt: item.createdAt,
        latitude: item.latitude, // 추가!
        longitude: item.longitude, // 추가!
      }));
      console.log(mappedShorts);

      if (pageNum === 0) {
        set({ shorts: mappedShorts });
      } else {
        set((state) => ({ shorts: [...state.shorts, ...mappedShorts] }));
      }

      // setHasMore(res.page < res.totalPages - 1);
      // setPage(pageNum);
    } catch (err) {
      console.error("숏츠 로드 실패:", err);
    } finally {
      set({ isLoading: false });
    }
  },
}));
