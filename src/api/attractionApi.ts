// api/attractionApi.ts
import axios from "axios";
import type {
  NearbyResponse,
  SearchResponse,
  AttractionDetailResponse,
} from "@/types";

const BASE_URL = import.meta.env.VITE_API_URL;

export const attractionApi = {
  // 주변 관광지 조회
  getNearby: (params: {
    latitude: number;
    longitude: number;
    radius?: number;
    contentTypeId?: string;
    limit?: number;
  }) =>
    axios.get<NearbyResponse>(`${BASE_URL}/attractions/nearby`, {
      params,
    }),

  // 검색
  getDetail: (contentId: number) =>
    axios.get<AttractionDetailResponse>(`${BASE_URL}/attractions/${contentId}`),

  // 관광지 리스트 조회
  getList: (keyword: string) =>
    axios.get<SearchResponse>(`${BASE_URL}/attractions/search`, {
      params: { keyword },
    }),
};
