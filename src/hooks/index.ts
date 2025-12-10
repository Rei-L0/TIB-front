import { useState, useEffect, useRef, useCallback } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { shortsApi } from "@/api";
import type { BottomSheetState, VideoMetadata } from "@/types";

// 바텀시트 드래그 훅
export const useBottomSheet = (initialState: BottomSheetState = "middle") => {
  const [state, setState] = useState<BottomSheetState>(initialState);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [currentY, setCurrentY] = useState(0);

  // src/hooks/index.ts
  const heights: Record<BottomSheetState, number> = {
    min: 50,
    middle: 280, // 320 → 280으로 줄임
    max: 560,
  };

  const handleDragStart = useCallback((clientY: number) => {
    setDragStart(clientY);
  }, []);

  const handleDragMove = useCallback(
    (clientY: number) => {
      if (dragStart === null) return;
      setCurrentY(dragStart - clientY);
    },
    [dragStart]
  );

  const handleDragEnd = useCallback(() => {
    if (dragStart === null) return;

    const threshold = 50;

    if (currentY > threshold) {
      if (state === "min") setState("middle");
      else if (state === "middle") setState("max");
    } else if (currentY < -threshold) {
      if (state === "max") setState("middle");
      else if (state === "middle") setState("min");
    }

    setDragStart(null);
    setCurrentY(0);
  }, [dragStart, currentY, state]);

  const currentHeight = Math.max(heights.min, Math.min(560, heights[state] + currentY));

  return {
    state,
    setState,
    currentHeight,
    isDragging: dragStart !== null,
    handlers: {
      onMouseDown: (e: React.MouseEvent) => handleDragStart(e.clientY),
      onMouseMove: (e: React.MouseEvent) => handleDragMove(e.clientY),
      onMouseUp: handleDragEnd,
      onMouseLeave: handleDragEnd,
      onTouchStart: (e: React.TouchEvent) => handleDragStart(e.touches[0].clientY),
      onTouchMove: (e: React.TouchEvent) => handleDragMove(e.touches[0].clientY),
      onTouchEnd: handleDragEnd,
    },
  };
};

// 개인화 추천 피드 훅
export const useShortsFeed = (params?: {
  userId?: string;
  latitude?: number;
  longitude?: number;
  preferredSeasons?: string[];
  preferredWeather?: string;
}) => {
  return useInfiniteQuery({
    queryKey: ["shorts", "feed", params],
    queryFn: ({ pageParam }) => shortsApi.getFeed({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
  });
};

// 관련 영상 피드 훅
export const useShortsRelated = (params?: {
  spotId?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) => {
  return useInfiniteQuery({
    queryKey: ["shorts", "related", params],
    queryFn: ({ pageParam }) => shortsApi.getRelated({ ...params, cursor: pageParam }),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!(params?.spotId || params?.district || params?.latitude),
  });
};

// 관광지별 숏츠 훅
export const useSpotShorts = (spotId: string | null) => {
  return useInfiniteQuery({
    queryKey: ["shorts", "spot", spotId],
    queryFn: ({ pageParam }) => shortsApi.getBySpotId(spotId!, pageParam),
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialPageParam: undefined as string | undefined,
    enabled: !!spotId,
  });
};

// iOS mdta 메타데이터에서 creationdate 추출
function extractCreationDateFromMdta(bytes: Uint8Array): Date | null {
  const view = new DataView(bytes.buffer);

  // keys, ilst atom 위치 찾기
  let keysOffset = -1;
  let ilstOffset = -1;

  for (let i = 0; i < bytes.length - 8; i++) {
    if (
      bytes[i] === 0x6b &&
      bytes[i + 1] === 0x65 &&
      bytes[i + 2] === 0x79 &&
      bytes[i + 3] === 0x73
    ) {
      keysOffset = i - 4;
    }
    if (
      bytes[i] === 0x69 &&
      bytes[i + 1] === 0x6c &&
      bytes[i + 2] === 0x73 &&
      bytes[i + 3] === 0x74
    ) {
      ilstOffset = i - 4;
    }
  }

  if (keysOffset === -1 || ilstOffset === -1) return null;

  // keys atom 파싱
  const keysSize = view.getUint32(keysOffset, false);
  const entryCount = view.getUint32(keysOffset + 12, false);

  let creationDateIndex = -1;
  let offset = keysOffset + 16;

  for (let i = 0; i < entryCount && offset < keysOffset + keysSize; i++) {
    const keySize = view.getUint32(offset, false);

    let keyName = "";
    for (let j = 8; j < keySize && offset + j < bytes.length; j++) {
      keyName += String.fromCharCode(bytes[offset + j]);
    }

    if (keyName.includes("creationdate")) {
      creationDateIndex = i + 1;
      break;
    }

    offset += keySize;
  }

  if (creationDateIndex === -1) return null;

  // ilst atom에서 값 추출
  const ilstSize = view.getUint32(ilstOffset, false);
  offset = ilstOffset + 8;

  while (offset < ilstOffset + ilstSize - 8) {
    const itemSize = view.getUint32(offset, false);
    if (itemSize === 0 || itemSize > ilstSize) break;

    const itemIndex = view.getUint32(offset + 4, false);

    if (itemIndex === creationDateIndex) {
      let dataOffset = offset + 8;

      while (dataOffset < offset + itemSize - 8) {
        const dataSize = view.getUint32(dataOffset, false);
        const dataType = view.getUint32(dataOffset + 4, false);

        if (dataType === 0x64617461) {
          const valueOffset = dataOffset + 16;
          const valueLength = dataSize - 16;

          let dateStr = "";
          for (let j = 0; j < valueLength && valueOffset + j < bytes.length; j++) {
            const char = bytes[valueOffset + j];
            if (char >= 32 && char < 127) {
              dateStr += String.fromCharCode(char);
            }
          }

          const date = new Date(dateStr.trim());
          if (!isNaN(date.getTime())) return date;
        }

        dataOffset += dataSize;
      }
    }

    offset += itemSize;
  }

  return null;
}

// mvhd atom에서 생성 시간 추출
function extractCreationTimeFromMvhd(bytes: Uint8Array): Date | null {
  const view = new DataView(bytes.buffer);
  const MP4_EPOCH_OFFSET = 2082844800;

  for (let i = 0; i < bytes.length - 30; i++) {
    if (
      bytes[i] === 0x6d &&
      bytes[i + 1] === 0x76 &&
      bytes[i + 2] === 0x68 &&
      bytes[i + 3] === 0x64
    ) {
      const version = bytes[i + 4];
      const creationTime =
        version === 1
          ? view.getUint32(i + 8, false) * 0x100000000 + view.getUint32(i + 12, false)
          : view.getUint32(i + 8, false);

      if (creationTime > MP4_EPOCH_OFFSET) {
        const date = new Date((creationTime - MP4_EPOCH_OFFSET) * 1000);
        if (date.getFullYear() >= 2000 && date.getFullYear() <= 2100) {
          return date;
        }
      }
      break;
    }
  }

  return null;
}

// GPS 추출
function extractGPS(bytes: Uint8Array): { latitude: number; longitude: number } | null {
  const searchSize = Math.min(bytes.length, 500000);

  let fileString = "";
  for (let i = 0; i < searchSize; i++) {
    fileString += String.fromCharCode(bytes[i]);
  }

  const match = fileString.match(/([+-]\d{1,3}\.\d{2,6})([+-]\d{1,3}\.\d{2,6})/);

  if (match) {
    return {
      latitude: parseFloat(match[1]),
      longitude: parseFloat(match[2]),
    };
  }

  return null;
}

// 영상 메타데이터 추출 훅
export const useVideoMetadata = () => {
  const extractMetadata = useCallback(async (file: File): Promise<VideoMetadata> => {
    // 기본 메타데이터 (duration, width, height)
    const basicMetadata = await new Promise<{
      duration: number;
      width: number;
      height: number;
    }>((resolve, reject) => {
      const video = document.createElement("video");
      video.preload = "metadata";

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src);
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Failed to load video metadata"));
      };

      video.src = URL.createObjectURL(file);
    });

    let latitude: number | undefined;
    let longitude: number | undefined;
    let createdAt: string | undefined;

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);

      // 생성 시간: mdta 우선, 없으면 mvhd
      const creationDate = extractCreationDateFromMdta(bytes) ?? extractCreationTimeFromMvhd(bytes);

      if (creationDate) {
        createdAt = creationDate.toISOString();
      }

      // GPS 추출
      const gpsData = extractGPS(bytes);
      if (gpsData) {
        latitude = gpsData.latitude;
        longitude = gpsData.longitude;
      }
    } catch {
      // 메타데이터 추출 실패 시 무시
    }

    // 폴백: 파일 수정 시간
    if (!createdAt && file.lastModified) {
      createdAt = new Date(file.lastModified).toISOString();
    }

    return {
      ...basicMetadata,
      latitude,
      longitude,
      createdAt,
    };
  }, []);

  const extractThumbnail = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      video.preload = "metadata";
      video.muted = true;
      video.playsInline = true;

      video.onloadeddata = () => {
        video.currentTime = Math.min(1, video.duration / 2);
      };

      video.onseeked = () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx?.drawImage(video, 0, 0);
        URL.revokeObjectURL(video.src);
        resolve(canvas.toDataURL("image/jpeg", 0.8));
      };

      video.onerror = () => {
        URL.revokeObjectURL(video.src);
        reject(new Error("Failed to extract thumbnail"));
      };

      video.src = URL.createObjectURL(file);
    });
  }, []);

  return { extractMetadata, extractThumbnail };
};

// Intersection Observer 훅
export const useIntersectionObserver = (
  callback: () => void,
  options?: IntersectionObserverInit
) => {
  const targetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        callback();
      }
    }, options);

    observer.observe(target);

    return () => observer.disconnect();
  }, [callback, options]);

  return targetRef;
};

// 현재 위치 훅
export const useGeolocation = () => {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported");
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      }
    );
  }, []);

  return { location, error, loading, getCurrentLocation };
};
