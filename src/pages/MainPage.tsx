import { useEffect } from "react";
import {
  BottomNav,
  DraggableBottomSheet,
  SpotInfo,
  ShortsGrid,
} from "@/components/common";
import { Layers, Compass, MapPin } from "lucide-react";
import { MapView } from "@/components/map/MapView";
import { useBottomSheetStore } from "@/store";
import { SearchBar } from "@/components/map/SearchBar";
import { FilterButtons } from "@/components/map/FilterButtons";
import { useNavigate } from "react-router-dom";
import { dummyShorts, getShortsBySpotId } from "@/data/dummyData";
import { MapControls } from "@/components/map/MapControls";

// 더미 데이터
const dummySpot = {
  id: "1",
  name: "해운대 해수욕장",
  category: "해수욕장",
  address: "부산광역시 해운대구 해운대해변로 264",
  description: "부산의 대표 해변, 일출이 아름다운 곳",
  latitude: 35.1587,
  longitude: 129.1604,
  thumbnailUrl: "",
  shortsCount: 12,
  tags: ["해변", "일출", "서핑"],
};

export const MainPage = () => {
  const navigate = useNavigate();
  const { spot, setSpot, setState } = useBottomSheetStore();

  // 관광지별 영상
  const shorts = spot ? getShortsBySpotId(spot.id) : dummyShorts.slice(0, 4);

  // 페이지 로드 시 더미 데이터 설정
  useEffect(() => {
    setSpot(dummySpot);
    setState("middle");
  }, []);

  const handleViewAll = () => {
    navigate(`/shorts?spotId=${spot?.id || "1"}`);
  };

  const handleShortsClick = (index: number) => {
    navigate("/shorts/viewer", {
      state: {
        startIndex: index,
        feedType: "related",
        spotId: spot?.id,
      },
    });
  };

  return (
    <div className="h-screen relative overflow-hidden">
      {/* 지도 */}
      <MapView />

      {/* 검색바 */}
      <SearchBar />

      {/* 우측 컨트롤 */}
      <MapControls />

      {/* 필터 */}
      <FilterButtons />

      {/* 바텀시트 */}
      <DraggableBottomSheet
        header={
          spot && (
            <SpotInfo
              name={spot.name}
              category={spot.category}
              address={spot.address}
              tags={spot.tags}
            />
          )
        }
      >
        <ShortsGrid
          shorts={shorts}
          onViewAll={handleViewAll}
          onItemClick={handleShortsClick}
        />
      </DraggableBottomSheet>

      {/* 하단 네비게이션 */}
      <BottomNav />
    </div>
  );
};
