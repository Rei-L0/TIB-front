import { create } from "zustand";
import type {
  BottomSheetState,
  Weather,
  Season,
  TouristSpot,
  VideoMetadata,
} from "@/types";

export { useMapStore } from "./mapStore";

// 바텀시트 상태
interface BottomSheetStore {
  state: BottomSheetState;
  spot: TouristSpot | null;
  mode: "spot" | "nearby" | "search" | "detail";
  setMode: (mode: "spot" | "nearby" | "search" | "detail") => void;
  setState: (state: BottomSheetState) => void;
  setSpot: (spot: TouristSpot | null) => void;
  open: (spot: TouristSpot) => void;
  close: () => void;
}

export const useBottomSheetStore = create<BottomSheetStore>((set) => ({
  state: "min",
  spot: null,
  mode: "spot",
  setMode: (mode) => set({ mode }),
  setState: (state) => set({ state }),
  setSpot: (spot) => set({ spot }),
  open: (spot) => set({ spot, state: "middle" }),
  close: () => set({ spot: null, state: "min" }),
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
  title: "",
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
  reset: () =>
    set({
      step: 1,
      file: null,
      metadata: null,
      spotId: null,
      weather: null,
      season: null,
      title: "",
      isUploading: false,
      progress: 0,
    }),
}));
