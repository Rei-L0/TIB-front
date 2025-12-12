import { useNavigate } from "react-router-dom";
import { Play, Eye, Heart } from "lucide-react";
import type { Shorts } from "@/types";

interface ShortsPreviewModalProps {
  shorts: Shorts | null;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onMouseEnter?: () => void;
}

export const ShortsPreviewModal = ({
  shorts,
  position,
  onClose,
  onMouseEnter,
}: ShortsPreviewModalProps) => {
  const navigate = useNavigate();

  if (!shorts || !position) return null;

  const formatCount = (count: number | undefined) => {
    if (count === undefined || count === null) return "0";
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    return count.toString();
  };

  const handleClick = () => {
    navigate("/shorts/viewer", {
      state: { startIndex: 0, shortsList: [shorts] },
    });
  };

  return (
    <div
      className="fixed z-50"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -100%)",
        marginTop: -10, // 마커와 약간 간격
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onClose}>
      <div
        className="bg-white rounded-xl shadow-lg overflow-hidden w-48 cursor-pointer"
        onClick={handleClick}>
        {/* 썸네일 */}
        <div className="relative aspect-video bg-gray-200">
          {shorts.thumbnailUrl && (
            <img
              src={shorts.thumbnailUrl}
              alt={shorts.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 hover:opacity-100 transition-opacity">
            <div className="w-10 h-10 bg-black/50 rounded-full flex items-center justify-center">
              <Play size={20} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        </div>

        {/* 정보 */}
        <div className="p-3">
          <p className="font-medium text-gray-900 text-sm truncate">{shorts.title}</p>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Eye size={12} /> {formatCount(shorts.readcount)}
            </span>
            <span className="flex items-center gap-1">
              <Heart size={12} /> {formatCount(shorts.good)}
            </span>
          </div>
        </div>

        {/* 말풍선 꼬리 */}
        <div className="absolute left-1/2 bottom-0 -translate-x-1/2 translate-y-full">
          <div className="w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-white" />
        </div>
      </div>
    </div>
  );
};
