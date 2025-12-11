import { useBottomSheetStore } from "@/store";
import { Globe, MapPin, Phone, Copy } from "lucide-react";

export const SpotDetail = () => {
  const { spot } = useBottomSheetStore();

  if (!spot) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-3 h-full overflow-y-auto pb-4">
      {/* 제목 + 카테고리 */}
      <div className="flex items-center gap-2">
        <h2 className="text-lg font-bold text-gray-900">{spot.name}</h2>
        {spot.category && (
          <span className="text-sm text-gray-400">{spot.category}</span>
        )}
      </div>

      {/* 이미지 */}
      {spot.thumbnailUrl ? (
        <img
          src={spot.thumbnailUrl}
          alt={spot.name}
          className="w-8/12 h-48 object-cover rounded-xl"
        />
      ) : (
        <div className="w-8/12 h-48 bg-gray-100 rounded-xl flex items-center justify-center">
          <span className="text-gray-400 text-sm">사진 없음</span>
        </div>
      )}

      {/* 정보 리스트 */}
      <div className="divide-y divide-gray-100">
        {/* 홈페이지 */}

        <div className="flex items-center gap-2 py-3">
          <Globe size={18} className="text-gray-400" />
          <a
            href={spot.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm
            text-blue-500 hover:underline truncate"
          >
            {spot.homepage}
          </a>
        </div>

        {/* 주소 */}
        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-gray-400" />
            <span className="text-sm text-gray-700">{spot.address}</span>
          </div>
          <button
            onClick={() => handleCopy(spot.address)}
            className="text-xs text-blue-500 hover:text-blue-600 mr-4"
          >
            복사
          </button>
        </div>

        {/* 전화번호 */}

        <div className="flex items-center justify-between py-3">
          <div className="flex items-center gap-2">
            <Phone size={18} className="text-gray-400" />
            <div>
              <a href={`tel:${spot.tel}`} className="text-sm text-gray-700">
                {spot.tel}
              </a>
              {spot.telname && (
                <span className="text-xs text-gray-400 ml-2">
                  {spot.telname}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => handleCopy(spot.tel!)}
            className="text-xs text-blue-500 hover:text-blue-600 mr-4"
          >
            복사
          </button>
        </div>

        {/* 설명 */}
        <p className="text-gray-700 text-sm py-3">{spot.description}</p>
      </div>
    </div>
  );
};
