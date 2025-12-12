import { Play, Eye } from "lucide-react";
import type { Shorts } from "@/types";

interface ShortsGridItemProps {
  shorts: Shorts;
  onClick: () => void;
}

export const ShortsGridItem = ({ shorts, onClick }: ShortsGridItemProps) => {
  const formatViewCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    return count.toString();
  };

  return (
    <button onClick={onClick} className="w-full text-left">
      <div className="w-full aspect-[9/13] bg-gray-200 rounded-xl relative overflow-hidden">
        {/* 썸네일 */}
        {shorts.thumbnailUrl && (
          <img
            src={shorts.thumbnailUrl}
            alt={shorts.title}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {/* 오버레이 */}
        <div className="absolute inset-0 bg-black/10" />

        {/* 플레이 버튼 */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
            <Play size={18} className="text-white ml-0.5" fill="white" />
          </div>
        </div>

        {/* 하단 그라데이션 */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-black/60 to-transparent" />

        {/* 제목 + 조회수 */}
        <div className="absolute bottom-2 left-2 right-2">
          <p className="text-white text-xs font-medium truncate">{shorts.title}</p>
          <div className="text-white/80 text-[10px] flex items-center gap-1 mt-0.5">
            <Eye size={10} />
            <span>{formatViewCount(shorts.readcount)}</span>
          </div>
        </div>
      </div>
    </button>
  );
};
