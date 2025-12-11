import type {
  UploadUrlRequest,
  UploadUrlResponse,
  ShortsCreateRequest,
  ShortsCreateResponse,
  NearbyAttraction,
  Shorts,
} from "@/types";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

// 유저 식별자 (비로그인용)
const getUserIdentifier = (): string => {
  let id = localStorage.getItem("userIdentifier");
  if (!id) {
    id = `user_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("userIdentifier", id);
  }
  return id;
};

export const shortsApi = {
  // 목록 조회
  getList: async (
    params: {
      page?: number;
      size?: number;
      contentId?: number;
      sidoCode?: number;
      gugunCode?: number;
      latitude?: number;
      longitude?: number;
      radius?: number;
      hashtag?: string;
      weather?: string;
      theme?: string;
      season?: string;
    } = {}
  ): Promise<{
    content: Shorts[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  }> => {
    const searchParams = new URLSearchParams();
    searchParams.set("userIdentifier", getUserIdentifier());

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, String(value));
      }
    });

    const res = await fetch(`${API_BASE}/shorts?${searchParams}`);
    if (!res.ok) throw new Error("숏츠 목록 조회 실패");
    return res.json();
  },

  // 상세 조회
  getDetail: async (id: string): Promise<Shorts> => {
    const userIdentifier = getUserIdentifier();
    const res = await fetch(`${API_BASE}/shorts/${id}?userIdentifier=${userIdentifier}`);
    if (!res.ok) throw new Error("숏츠 상세 조회 실패");
    return res.json();
  },

  // 좋아요 토글
  toggleLike: async (id: string): Promise<{ shortsId: number; liked: boolean; good: number }> => {
    const res = await fetch(`${API_BASE}/shorts/${id}/likes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userIdentifier: getUserIdentifier() }),
    });
    if (!res.ok) throw new Error("좋아요 실패");
    return res.json();
  },

  // 조회수 증가
  increaseViews: async (id: string): Promise<{ id: number; readcount: number }> => {
    const res = await fetch(`${API_BASE}/shorts/${id}/views`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("조회수 증가 실패");
    return res.json();
  },

  // Presigned URL 발급
  getUploadUrl: async (req: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const res = await fetch(`${API_BASE}/shorts/upload-url`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("Presigned URL 발급 실패");
    return res.json();
  },

  // S3 업로드
  uploadToS3: async (
    url: string,
    file: Blob,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable && onProgress) {
          onProgress(Math.round((e.loaded / e.total) * 100));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) resolve();
        else reject(new Error("S3 업로드 실패"));
      };

      xhr.onerror = () => reject(new Error("S3 업로드 실패"));
      xhr.send(file);
    });
  },

  // 숏츠 생성
  create: async (req: ShortsCreateRequest): Promise<ShortsCreateResponse> => {
    const res = await fetch(`${API_BASE}/shorts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error("숏츠 생성 실패");
    return res.json();
  },

  // 근처 관광지 조회
  getNearbyAttractions: async (
    lat: number,
    lng: number,
    radius: number = 500
  ): Promise<NearbyAttraction[]> => {
    const res = await fetch(
      `${API_BASE}/attractions/nearby?latitude=${lat}&longitude=${lng}&radius=${radius}`
    );
    if (!res.ok) throw new Error("관광지 조회 실패");
    const data = await res.json();
    return data.attractions;
  },
};
