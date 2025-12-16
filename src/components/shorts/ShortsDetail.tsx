import { useNavigate } from "react-router-dom";
import { Play } from "lucide-react";
import type { Shorts } from "@/types";

interface ShortsDetailProps {
  shorts: Shorts;
}

const seasonLabel: Record<string, string> = {
  Spring: "봄",
  Summer: "여름",
  Autumn: "가을",
  Winter: "겨울",
};

const weatherLabel: Record<string, string> = {
  Sunny: "맑음",
  Cloudy: "흐림",
  Rainy: "비",
  Snowy: "눈",
};

export const ShortsDetail = ({ shorts }: ShortsDetailProps) => {
  const navigate = useNavigate();

  const handlePlay = () => {
    navigate("/shorts/viewer", {
      state: { startIndex: 0, shortsList: [shorts] },
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="pb-4">
      {/* 제목 + 분류 */}
      <div className="flex items-center gap-2 mb-2">
        <h2 className="text-lg font-bold text-gray-900">{shorts.title}</h2>
        {shorts.touristSpot && (
          <span className="text-xs text-gray-400">{shorts.touristSpot.name}</span>
        )}
      </div>

      {/* 조회수, 좋아요 */}
      <p className="text-sm text-gray-500 mb-1">
        조회수 {shorts.readcount?.toLocaleString() || 0} · 좋아요{" "}
        {shorts.good?.toLocaleString() || 0}
      </p>

      {/* 날짜, 날씨, 계절 */}
      <p className="text-sm text-gray-400 mb-4">
        {shorts.createdAt && formatDate(shorts.createdAt)}
        {shorts.weather && ` · ${weatherLabel[shorts.weather] || shorts.weather}`}
        {shorts.season && ` · ${seasonLabel[shorts.season] || shorts.season}`}
      </p>

      {/* 썸네일 + 재생 버튼 */}
      <div
        className="relative aspect-video bg-gray-200 rounded-xl overflow-hidden cursor-pointer mb-4"
        onClick={handlePlay}>
        {shorts.thumbnailUrl ? (
          <img
            src={shorts.thumbnailUrl}
            alt={shorts.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300" />
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
          <div className="w-14 h-14 bg-white/90 rounded-full flex items-center justify-center">
            <Play size={24} className="text-emerald-500 ml-1" fill="currentColor" />
          </div>
        </div>
      </div>

      {/* 재생 버튼 */}
      <button
        onClick={handlePlay}
        className="w-full py-3 bg-emerald-500 text-white font-bold rounded-xl">
        영상 보기
      </button>
    </div>
  );
};
