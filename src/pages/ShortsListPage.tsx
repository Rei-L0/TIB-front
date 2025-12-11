import { useState, useEffect } from "react";
import { Video, Play, Eye } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { BottomNav } from "@/components/common";
import { shortsApi } from "@/api/shorts";
import type { Shorts } from "@/types";

export const ShortsListPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const spotId = params.get("spotId");
  const district = params.get("district");

  const [shorts, setShorts] = useState<Shorts[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const title = spotId ? "관광지 Shorts" : district ? `${district} Shorts` : "Shorts";

  useEffect(() => {
    loadShorts();
  }, [spotId, district]);

  const loadShorts = async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await shortsApi.getList({
        page: pageNum,
        size: 20,
        contentId: spotId ? Number(spotId) : undefined,
      });

      if (pageNum === 0) {
        setShorts(res.content);
      } else {
        setShorts((prev) => [...prev, ...res.content]);
      }

      setHasMore(res.page < res.totalPages - 1);
      setPage(pageNum);
    } catch (err) {
      console.error("숏츠 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    if (!loading && hasMore) {
      loadShorts(page + 1);
    }
  };

  const formatViewCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    return count.toString();
  };

  const handleShortsClick = (item: Shorts, index: number) => {
    navigate("/shorts/viewer", {
      state: {
        startIndex: index,
        shortsList: shorts,
        spotId,
        district,
      },
    });
  };

  return (
    <div className="h-screen bg-black relative pb-16">
      {/* 헤더 */}
      <div className="bg-black px-4 pt-10 pb-4 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Video size={24} className="text-red-500" />
          <h1 className="text-xl font-bold text-white">{title}</h1>
        </div>
      </div>

      {/* 숏츠 그리드 */}
      <div className="px-2 pb-4 overflow-y-auto h-[calc(100%-120px)]">
        {loading && shorts.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-white/60">로딩 중...</p>
          </div>
        ) : shorts.length === 0 ? (
          <div className="flex items-center justify-center h-40">
            <p className="text-white/60">영상이 없습니다</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-1">
              {shorts.map((item, index) => (
                <button
                  key={item.id}
                  onClick={() => handleShortsClick(item, index)}
                  className="relative aspect-[9/14] bg-gray-900 rounded-lg overflow-hidden">
                  {item.thumbnailUrl ? (
                    <img
                      src={item.thumbnailUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-900" />
                  )}

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black/20">
                    <div className="w-12 h-12 bg-black/50 backdrop-blur rounded-full flex items-center justify-center">
                      <Play size={24} className="text-white ml-1" fill="white" />
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/80">
                    <p className="text-white text-sm font-medium truncate">{item.title}</p>
                    <p className="text-white/70 text-xs flex items-center gap-1">
                      <Eye size={12} /> 조회수 {formatViewCount(item.viewCount)}회
                    </p>
                  </div>
                </button>
              ))}
            </div>

            {hasMore && (
              <button
                onClick={loadMore}
                disabled={loading}
                className="w-full py-4 text-white/60 text-sm">
                {loading ? "로딩 중..." : "더 보기"}
              </button>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
