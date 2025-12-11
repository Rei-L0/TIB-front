import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import ReactPlayer from "react-player";
import { ArrowLeft, Heart, Share2, MapPin, Play, Volume2, VolumeX } from "lucide-react";
import { BottomNav, WeatherBadge, SeasonBadge } from "@/components/common";
import { shortsApi } from "@/api/shorts";
import type { Shorts } from "@/types";

import "swiper/css";

export const ShortsViewerPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as {
    startIndex?: number;
    shortsList?: Shorts[];
    spotId?: string;
    district?: string;
  } | null;

  const [shortsList, setShortsList] = useState<Shorts[]>(state?.shortsList || []);
  const [activeIndex, setActiveIndex] = useState(state?.startIndex || 0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(!state?.shortsList);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const swiperRef = useRef<SwiperType | null>(null);
  const viewedRef = useRef<Set<string>>(new Set());

  const currentShorts = shortsList[activeIndex];

  // 초기 로드
  useEffect(() => {
    if (!state?.shortsList) {
      loadShorts();
    } else {
      // 초기 좋아요 상태 설정
      const initialLikes: Record<string, boolean> = {};
      const initialCounts: Record<string, number> = {};
      state.shortsList.forEach((s) => {
        initialLikes[s.id] = s.liked || false;
        initialCounts[s.id] = s.likeCount;
      });
      setLikes(initialLikes);
      setLikeCounts(initialCounts);
    }
  }, []);

  // 조회수 증가
  useEffect(() => {
    if (currentShorts && !viewedRef.current.has(currentShorts.id)) {
      viewedRef.current.add(currentShorts.id);
      shortsApi.increaseViews(currentShorts.id).catch(console.error);
    }
  }, [currentShorts?.id]);

  const loadShorts = async (pageNum = 0) => {
    try {
      setLoading(true);
      const res = await shortsApi.getList({
        page: pageNum,
        size: 10,
        contentId: state?.spotId ? Number(state.spotId) : undefined,
      });

      const newShorts = res.content;

      if (pageNum === 0) {
        setShortsList(newShorts);
      } else {
        setShortsList((prev) => [...prev, ...newShorts]);
      }

      // 좋아요 상태 설정
      newShorts.forEach((s) => {
        setLikes((prev) => ({ ...prev, [s.id]: s.liked || false }));
        setLikeCounts((prev) => ({ ...prev, [s.id]: s.likeCount }));
      });

      setHasMore(res.page < res.totalPages - 1);
      setPage(pageNum);
    } catch (err) {
      console.error("숏츠 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number) => {
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    return count.toString();
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    setIsPlaying(true);

    // 끝에 가까워지면 더 로드
    if (swiper.activeIndex >= shortsList.length - 3 && hasMore && !loading) {
      loadShorts(page + 1);
    }
  };

  const toggleLike = async (id: string) => {
    try {
      const res = await shortsApi.toggleLike(id);
      setLikes((prev) => ({ ...prev, [id]: res.liked }));
      setLikeCounts((prev) => ({ ...prev, [id]: res.good }));
    } catch (err) {
      console.error("좋아요 실패:", err);
    }
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const handleLocationClick = () => {
    if (currentShorts?.touristSpot) {
      navigate("/", {
        state: { spotId: currentShorts.touristSpot.id },
      });
    }
  };

  if (loading && shortsList.length === 0) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        로딩 중...
      </div>
    );
  }

  if (!currentShorts) {
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        영상이 없습니다
      </div>
    );
  }

  return (
    <div className="h-screen bg-black relative">
      <Swiper
        direction="vertical"
        initialSlide={state?.startIndex || 0}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onSlideChange={handleSlideChange}
        className="h-full w-full">
        {shortsList.map((shorts, index) => (
          <SwiperSlide key={shorts.id}>
            <div className="relative w-full h-full" onClick={togglePlay}>
              <ReactPlayer
                url={shorts.videoUrl}
                playing={activeIndex === index && isPlaying}
                muted={isMuted}
                loop
                width="100%"
                height="100%"
                style={{ position: "absolute", top: 0, left: 0, objectFit: "cover" }}
                playsinline
                config={{
                  file: {
                    attributes: {
                      style: { objectFit: "cover", width: "100%", height: "100%" },
                    },
                  },
                }}
              />

              {!isPlaying && activeIndex === index && (
                <div className="absolute inset-0 flex items-center justify-center z-10">
                  <div className="w-20 h-20 bg-white/20 backdrop-blur rounded-full flex items-center justify-center">
                    <Play size={40} className="text-white ml-1" fill="white" />
                  </div>
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* 상단 UI */}
      <div className="absolute top-10 left-0 right-0 px-4 z-20">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
            <ArrowLeft size={22} className="text-white" />
          </button>
          <div className="flex items-center gap-2">
            {currentShorts.weather && <WeatherBadge weather={currentShorts.weather} size="sm" />}
            {currentShorts.season && <SeasonBadge season={currentShorts.season} size="sm" />}
          </div>
        </div>
      </div>

      {/* 우측 액션 */}
      <div className="absolute right-4 bottom-36 flex flex-col items-center gap-5 z-20">
        <button
          onClick={() => toggleLike(currentShorts.id)}
          className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
            <Heart
              size={24}
              className={likes[currentShorts.id] ? "text-red-500" : "text-white"}
              fill={likes[currentShorts.id] ? "currentColor" : "none"}
            />
          </div>
          <span className="text-white text-xs font-medium">
            {formatCount(likeCounts[currentShorts.id] || currentShorts.likeCount)}
          </span>
        </button>

        <button className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
            <Share2 size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-medium">공유</span>
        </button>

        <button onClick={handleLocationClick} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center">
            <MapPin size={24} className="text-white" />
          </div>
          <span className="text-white text-xs font-medium">위치</span>
        </button>

        <button onClick={() => setIsMuted(!isMuted)} className="flex flex-col items-center gap-1">
          <div className="w-12 h-12 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
            {isMuted ? (
              <VolumeX size={24} className="text-white" />
            ) : (
              <Volume2 size={24} className="text-white" />
            )}
          </div>
          <span className="text-white text-xs font-medium">{isMuted ? "음소거" : "소리"}</span>
        </button>
      </div>

      {/* 하단 정보 */}
      <div className="absolute bottom-16 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
        <h2 className="text-white text-xl font-bold mb-1">{currentShorts.title}</h2>
        {currentShorts.touristSpot && (
          <>
            <p className="text-white/80 text-sm flex items-center gap-1 mb-2">
              <MapPin size={14} /> {currentShorts.touristSpot.address}
            </p>
            <p className="text-white/60 text-sm">{currentShorts.touristSpot.description}</p>
          </>
        )}

        <div className="mt-4 flex gap-1">
          {shortsList.slice(0, 10).map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1 rounded-full ${
                i === activeIndex ? "bg-white" : "bg-white/30"
              }`}
            />
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};
