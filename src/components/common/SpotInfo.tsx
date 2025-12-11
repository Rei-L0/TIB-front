// src/components/common/SpotInfo.tsx
import { MapPin } from "lucide-react";

interface SpotInfoProps {
  name: string;
  category?: string;
  address?: string;
  tags?: string[];
  shortsCount?: number;
  onNavigate?: () => void;
  onShare?: () => void;
  onDetailClick?: () => void;
}

export const SpotInfo = ({
  name,
  category,
  address,
  tags = [],
  shortsCount,
  onNavigate,
  onShare,
  onDetailClick,
}: SpotInfoProps) => {
  return (
    <div>
      {/* 제목 + 카테고리 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">{name}</h2>
        {category && <span className="text-sm text-gray-400">{category}</span>}
      </div>

      {/* 주소 */}
      {address && (
        <p className="text-sm text-gray-500 flex items-center gap-1 mb-2">
          <MapPin size={14} /> {address}
        </p>
      )}

      {/* 태그 */}
      {tags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="px-2.5 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-medium"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <button
        onClick={onDetailClick}
        className="text-sm text-blue-500 hover:text-blue-600"
      >
        상세보기
      </button>
    </div>
  );
};
