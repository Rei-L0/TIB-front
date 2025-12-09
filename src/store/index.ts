import { create } from 'zustand';
import type { BottomSheetState, Weather, Season, TouristSpot, VideoMetadata } from '@/types';

// 지도 상태
interface MapStore {
  center: { lat: number; lng: number };
  zoom: number;
  selectedSpotId: string | null;
  filters: {
    weather: Weather | null;
    season: Season | null;
  };
  places: TouristSpot[]
  setPlaces: (places: TouristSpot[]) => void 
  setCenter: (lat: number, lng: number) => void;
  setZoom: (zoom: number) => void;
  setSelectedSpot: (id: string | null) => void;
  setFilters: (filters: Partial<MapStore['filters']>) => void;
}

export const useMapStore = create<MapStore>((set) => ({
  center: { lat: 35.1796, lng: 129.0756 }, // 부산 기본값
  zoom: 14,
  selectedSpotId: null,
  filters: {
    weather: null,
    season: null,
  },
  places: [],
  setPlaces: (places) => set({ places }),
  setCenter: (lat, lng) => set({ center: { lat, lng } }),
  setZoom: (zoom) => set({ zoom }),
  setSelectedSpot: (id) => set({ selectedSpotId: id }),
  setFilters: (filters) => set((state) => ({ 
    filters: { ...state.filters, ...filters } 
  })),
}));

// 바텀시트 상태
interface BottomSheetStore {
  state: BottomSheetState;
  spot: TouristSpot | null;
  setState: (state: BottomSheetState) => void;
  setSpot: (spot: TouristSpot | null) => void;
  open: (spot: TouristSpot) => void;
  close: () => void;
}

export const useBottomSheetStore = create<BottomSheetStore>((set) => ({
  state: 'min',
  spot: null,
  setState: (state) => set({ state }),
  setSpot: (spot) => set({ spot }),
  open: (spot) => set({ spot, state: 'middle' }),
  close: () => set({ spot: null, state: 'min' }),
}));

// 플레이어 상태
interface PlayerStore {
  currentShortsId: string | null;
  isPlaying: boolean;
  isMuted: boolean;
  setCurrentShorts: (id: string | null) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  toggleMute: () => void;
}

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentShortsId: null,
  isPlaying: false,
  isMuted: true, // 자동재생 정책 때문에 기본 mute
  setCurrentShorts: (id) => set({ currentShortsId: id }),
  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
}));

// 업로드 상태
interface UploadStore {
  step: 1 | 2 | 3;
  file: File | null;
  metadata: VideoMetadata | null;
  spotId: string | null;
  weather: Weather | null;
  season: Season | null;
  title: string;
  isUploading: boolean;
  progress: number;
  setStep: (step: 1 | 2 | 3) => void;
  setFile: (file: File | null) => void;
  setMetadata: (metadata: VideoMetadata | null) => void;
  setSpotId: (id: string | null) => void;
  setWeather: (weather: Weather | null) => void;
  setSeason: (season: Season | null) => void;
  setTitle: (title: string) => void;
  setProgress: (progress: number) => void;
  setIsUploading: (isUploading: boolean) => void;
  reset: () => void;
}

export const useUploadStore = create<UploadStore>((set) => ({
  step: 1,
  file: null,
  metadata: null,
  spotId: null,
  weather: null,
  season: null,
  title: '',
  isUploading: false,
  progress: 0,
  setStep: (step) => set({ step }),
  setFile: (file) => set({ file }),
  setMetadata: (metadata) => set({ metadata }),
  setSpotId: (id) => set({ spotId: id }),
  setWeather: (weather) => set({ weather }),
  setSeason: (season) => set({ season }),
  setTitle: (title) => set({ title }),
  setProgress: (progress) => set({ progress }),
  setIsUploading: (isUploading) => set({ isUploading }),
  reset: () => set({
    step: 1,
    file: null,
    metadata: null,
    spotId: null,
    weather: null,
    season: null,
    title: '',
    isUploading: false,
    progress: 0,
  }),
}));
