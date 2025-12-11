import { useEffect, useRef, useState } from "react";
import { useMapStore, useBottomSheetStore } from "@/store";
import type { TouristSpot } from "@/types";

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
  const [isLoaded, setIsLoaded] = useState(false);
  const { center, zoom, setCenter, setZoom } = useMapStore();
  const { open } = useBottomSheetStore();

  const { places, fetchNearbyPlaces } = useMapStore();
  const { setMode } = useBottomSheetStore();

  useEffect(() => {
    // 이미 로드
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

  // 마커 + 클러스터 표시
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded || places.length === 0) return;

    // 기존 클러스터러 제거
    if (clustererRef.current) {
      clustererRef.current.clear();
    }

    // 마커 생성
    const markers = places.map((place) => {
      const position = new window.kakao.maps.LatLng(
        place.latitude,
        place.longitude
      );

      const marker = new window.kakao.maps.Marker({
        position,
      });

      window.kakao.maps.event.addListener(marker, "click", () => {
        open(place);
        setMode("spot");
      });

      return marker;
    });

    // 클러스터러 생성
    clustererRef.current = new window.kakao.maps.MarkerClusterer({
      map: mapInstanceRef.current,
      averageCenter: true,
      minLevel: 6,
      markers: markers,
    });
  }, [isLoaded, places]);

  // 관광지 데이터 가져오기
  useEffect(() => {
    if (isLoaded) {
      fetchNearbyPlaces();
    }
  }, [isLoaded]);

  return (
    <div ref={mapRef} className="absolute inset-0 w-full h-full">
      {!isLoaded && (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
          <p>지도 로딩중...</p>
        </div>
      )}
    </div>
  );
};
