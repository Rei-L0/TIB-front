// api/attractionApi.ts
import axios from "axios";
import type { TouristSpot } from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const attractionApi = {
  // 주변 관광지 조회
  getNearby: (lat: number, lng: number) =>
    axios.get<TouristSpot[]>(`${BASE_URL}/attractions/nearby`, {
      params: { lat, lng },
    }),

  // 검색
  search: (keyword: string) =>
    axios.get<TouristSpot[]>(`${BASE_URL}/attractions/search`, {
      params: { keyword },
    }),

  // 관광지 리스트 조회
  getList: (page: number = 1, limit: number = 20) =>
    axios.get<TouristSpot[]>(`${BASE_URL}/attractions`, {
      params: { page, limit },
    }),
};
