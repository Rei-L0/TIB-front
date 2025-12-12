import { useEffect, useRef, useState } from "react";
import { useMapStore, useBottomSheetStore } from "@/store";
import { ShortsPreviewModal } from "@/components/shorts/ShortsPreviewModal";

declare global {
  interface Window {
    kakao: any;
    moveMapTo?: (lat: number, lng: number, zoom?: number) => void;
  }
}

export const MapView = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const clustererRef = useRef<any>(null);
  const shortsMarkersRef = useRef<any[]>([]);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const placeMarkersRef = useRef<any[]>([]);
  const {
    center,
    zoom,
    setCenter,
    setZoom,
    places,
    fetchNearbyPlaces,
    shorts,
    fetchShorts,
    hoveredShorts,
    hoverPosition,
    setHoveredShorts,
  } = useMapStore();

  const { open, mode, setMode } = useBottomSheetStore();

  // 카카오맵 스크립트 로드
  useEffect(() => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        initMap();
      });
      return;
    }

    const script = document.createElement("script");
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${
      import.meta.env.VITE_KAKAO_MAP_KEY
    }&autoload=false&libraries=services,clusterer`;
    script.onload = () => {
      window.kakao.maps.load(() => {
        initMap();
      });
    };
    document.head.appendChild(script);
  }, []);

  // 지도 초기화 함수
  const initMap = () => {
    if (!mapRef.current) return;
    if (mapInstanceRef.current) return;

    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: zoom,
    };

    const map = new window.kakao.maps.Map(mapRef.current, options);
    mapInstanceRef.current = map;
    setIsLoaded(true);

    window.moveMapTo = (lat: number, lng: number, zoomLevel?: number) => {
      setTimeout(() => {
        const newCenter = new window.kakao.maps.LatLng(lat, lng);
        map.setCenter(newCenter);
        if (zoomLevel) {
          map.setLevel(zoomLevel);
        }
      }, 100);
    };

    window.kakao.maps.event.addListener(map, "center_changed", () => {
      const latlng = map.getCenter();
      setCenter(latlng.getLat(), latlng.getLng());
    });

    window.kakao.maps.event.addListener(map, "zoom_changed", () => {
      setZoom(map.getLevel());
    });
  };

  // 타이머 취소 함수
  const cancelHoverTimeout = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
  };

  // 관광지 마커 + 클러스터 표시
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || places.length === 0) return;
    placeMarkersRef.current.forEach((marker) => marker.setMap(null));
    placeMarkersRef.current = [];

    if (mode !== "spot" || places.length === 0) return;

    const markers = places.map((place) => {
      const position = new window.kakao.maps.LatLng(
        place.latitude,
        place.longitude
      );

      const marker = new window.kakao.maps.Marker({
        position,
      });
      marker.setMap(mapInstanceRef.current);
      window.kakao.maps.event.addListener(marker, "click", () => {
        open(place);
        setMode("spot");
      });

      return marker;
    });
    placeMarkersRef.current = markers;
  }, [places, mode]);

  // 숏츠 마커
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return;
    if (clustererRef.current) {
      clustererRef.current.clear();
    }
    // 기존 숏츠 마커 제거
    shortsMarkersRef.current.forEach((marker) => marker.setMap(null));
    shortsMarkersRef.current = [];

    if (shorts.length === 0) return;

    // 숏츠 마커 이미지 (노란 별)
    const markerImage = new window.kakao.maps.MarkerImage(
      "https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png",
      new window.kakao.maps.Size(36, 52)
    );

    const validShorts = shorts.filter((s) => s.latitude && s.longitude);

    const markers = validShorts.map((shortsItem) => {
      const position = new window.kakao.maps.LatLng(
        shortsItem.latitude,
        shortsItem.longitude
      );

      const marker = new window.kakao.maps.Marker({
        position,
        image: markerImage,
        map: mapInstanceRef.current,
      });

      // hover - 마우스 올렸을 때
      window.kakao.maps.event.addListener(marker, "mouseover", () => {
        cancelHoverTimeout();

        const proj = mapInstanceRef.current.getProjection();
        const point = proj.containerPointFromCoords(position);
        setHoveredShorts(shortsItem, { x: point.x, y: point.y });
      });

      // hover - 마우스 벗어났을 때
      window.kakao.maps.event.addListener(marker, "mouseout", () => {
        hoverTimeoutRef.current = setTimeout(() => {
          setHoveredShorts(null);
        }, 300);
      });

      // 클릭 시 뷰어로 이동
      window.kakao.maps.event.addListener(marker, "click", () => {
        window.location.href = `/shorts/viewer?id=${shortsItem.id}`;
      });

      return marker;
    });
    clustererRef.current = new window.kakao.maps.MarkerClusterer({
      map: mapInstanceRef.current,
      averageCenter: true,
      minLevel: 6,
      markers: markers,
    });
    shortsMarkersRef.current = markers;
  }, [isLoaded, shorts, setHoveredShorts]);

  // 데이터 로드
  useEffect(() => {
    if (isLoaded) {
      // fetchNearbyPlaces();
      fetchShorts();
    }
  }, [isLoaded]);

  // 컴포넌트 언마운트 시 타이머 정리
  useEffect(() => {
    return () => {
      cancelHoverTimeout();
    };
  }, []);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="absolute inset-0 w-full h-full">
        {!isLoaded && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            <p>지도 로딩중...</p>
          </div>
        )}
      </div>

      {/* 숏츠 프리뷰 모달 */}
      <ShortsPreviewModal
        shorts={hoveredShorts}
        position={hoverPosition}
        onClose={() => setHoveredShorts(null)}
        onMouseEnter={cancelHoverTimeout}
      />
    </div>
  );
};
