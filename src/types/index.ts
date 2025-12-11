// 숏츠
// 숏츠
export interface Shorts {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  viewCount: number;
  likeCount: number;
  duration: number;
  touristSpot?: TouristSpot; // optional로 변경
  weather?: Weather; // optional로 변경
  season?: Season; // optional로 변경
  createdAt: string;
  liked?: boolean; // 추가
}

// 관광지
export interface TouristSpot {
  id: string;
  name: string;
  category?: string;
  address: string;
  description?: string;
  latitude: number;
  longitude: number;
  thumbnailUrl?: string;
  shortsCount?: number;
  tags?: string[];
  homepage?: string;
  tel?: string;
  telname?: string;
}

// 날씨/계절/테마
export type Weather = "sunny" | "cloudy" | "rainy" | "snowy";
export type Season = "spring" | "summer" | "fall" | "winter";
export type Theme = "night_view" | "ocean" | "mountain" | "cafe" | "food" | "festival" | "walk";

// 지도
export interface MapBounds {
  northEastLat: number;
  northEastLng: number;
  southWestLat: number;
  southWestLng: number;
}

export interface MapMarker {
  id: string;
  type: "spot" | "shorts" | "cluster";
  latitude: number;
  longitude: number;
  count?: number;
}

// 바텀시트 상태
export type BottomSheetState = "min" | "middle" | "max";

// 업로드
export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  latitude?: number;
  longitude?: number;
  createdAt?: string;
}

export interface UploadData {
  file: File | null;
  metadata: VideoMetadata | null;
  spotId: string | null;
  weather: Weather | null;
  season: Season | null;
  title: string;
}

// 피드 타입
export type FeedType = "feed" | "related";

// 관련 영상 파라미터
export interface RelatedParams {
  spotId?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}

// ========================
// 업로드 API 관련 타입
// ========================

export interface UploadUrlRequest {
  videoFileName: string;
  videoContentType: string;
  videoFileSize: number;
  thumbnailFileName: string;
  thumbnailContentType: string;
  thumbnailFileSize: number;
}

export interface UploadUrlResponse {
  videoUploadUrl: string;
  videoKey: string;
  thumbnailUploadUrl: string;
  thumbnailKey: string;
  expiresIn: number;
}

export interface ShortsCreateRequest {
  videoKey: string;
  thumbnailKey: string;
  name: string;
  title: string;
  contentId?: number;
  weather?: Weather;
  theme?: Theme;
  season?: Season;
  latitude?: number;
  longitude?: number;
  hashtags?: string[];
}

export interface ShortsCreateResponse {
  id: number;
  title: string;
  status: string;
  createdAt: string;
}

export interface NearbyAttraction {
  contentId: number;
  title: string;
  distance: number;
}

export * from "./attraction";
