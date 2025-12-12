import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import type { Swiper as SwiperType } from "swiper";
import ReactPlayer from "react-player";
import {
  ArrowLeft,
  Heart,
  Share2,
  MapPin,
  Play,
  Volume2,
  VolumeX,
  Home,
  Video,
  Upload,
} from "lucide-react";
import { BottomNav, WeatherBadge, SeasonBadge } from "@/components/common";
import { shortsApi } from "@/api/shorts";
import type { Shorts } from "@/types";

import "swiper/css";

// 더미 영상 URL (영상 없을 때 폴백용)
const FALLBACK_VIDEO =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

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
  const [likes, setLikes] = useState<Record<number, boolean>>({});
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(!state?.shortsList);
  const [videoErrors, setVideoErrors] = useState<Record<number, boolean>>({});

  const swiperRef = useRef<SwiperType | null>(null);
  const viewedRef = useRef<Set<number>>(new Set());

  const currentShorts = shortsList[activeIndex];

  useEffect(() => {
    if (!state?.shortsList) {
      loadInitialShorts();
    } else {
      const initialLikes: Record<number, boolean> = {};
      const initialCounts: Record<number, number> = {};
      state.shortsList.forEach((s) => {
        initialLikes[s.id] = s.liked || false;
        initialCounts[s.id] = s.good;
      });
      setLikes(initialLikes);
      setLikeCounts(initialCounts);
    }
  }, []);

  useEffect(() => {
    if (currentShorts && !viewedRef.current.has(currentShorts.id)) {
      viewedRef.current.add(currentShorts.id);
      shortsApi.increaseViews(String(currentShorts.id)).catch(console.error);
    }
  }, [currentShorts?.id]);

  const loadInitialShorts = async () => {
    try {
      setLoading(true);
      const res = await shortsApi.getList({
        page: 0,
        size: 10,
        contentId: state?.spotId ? Number(state.spotId) : undefined,
      });

      const newShorts = res.content;
      setShortsList(newShorts);

      newShorts.forEach((s) => {
        setLikes((prev) => ({ ...prev, [s.id]: s.liked || false }));
        setLikeCounts((prev) => ({ ...prev, [s.id]: s.good }));
      });
    } catch (err) {
      console.error("숏츠 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreShorts = async () => {
    if (!currentShorts || loading) return;

    try {
      setLoading(true);
      const newShorts = await shortsApi.getRelated(currentShorts.id);

      setShortsList((prev) => {
        const existingIds = new Set(prev.map((s) => s.id));
        const filtered = newShorts.filter((s) => !existingIds.has(s.id));
        return [...prev, ...filtered];
      });

      newShorts.forEach((s) => {
        setLikes((prev) => ({ ...prev, [s.id]: s.liked || false }));
        setLikeCounts((prev) => ({ ...prev, [s.id]: s.good }));
      });
    } catch (err) {
      console.error("연관 숏츠 로드 실패:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatCount = (count: number | undefined) => {
    if (count === undefined || count === null) return "0";
    if (count >= 10000) return `${(count / 10000).toFixed(1)}만`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}천`;
    return count.toString();
  };

  const handleSlideChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    setIsPlaying(true);

    if (swiper.activeIndex >= shortsList.length - 3 && !loading) {
      loadMoreShorts();
    }
  };

  const toggleLike = async (id: number) => {
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

  // 영상 URL 가져오기 (없거나 에러면 폴백)
  const getVideoUrl = (shorts: Shorts) => {
    if (videoErrors[shorts.id]) return FALLBACK_VIDEO;
    if (!shorts.video || shorts.video.includes("dummy-bucket")) return FALLBACK_VIDEO;
    return shorts.video;
  };

  // 영상 에러 처리
  const handleVideoError = (id: number) => {
    console.log("영상 로드 실패, 폴백 사용:", id);
    setVideoErrors((prev) => ({ ...prev, [id]: true }));
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
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      {/* 모바일 컨테이너 - 9:16 비율 고정 */}
      <div className="relative h-full max-h-screen aspect-[9/19.5] bg-black">
        {/* 영상 영역 - BottomNav 높이(h-12) 제외 */}
        <div className="absolute inset-0 bottom-12">
          <Swiper
            direction="vertical"
            initialSlide={state?.startIndex || 0}
            onSwiper={(swiper) => (swiperRef.current = swiper)}
            onSlideChange={handleSlideChange}
            slidesPerView={1}
            className="h-full w-full">
            {shortsList.map((shorts, index) => (
              <SwiperSlide key={shorts.id}>
                <div className="relative w-full h-full" onClick={togglePlay}>
                  {shorts.thumbnailUrl && (
                    <div
                      className="absolute inset-0 bg-cover bg-center blur-sm opacity-50"
                      style={{ backgroundImage: `url(${shorts.thumbnailUrl})` }}
                    />
                  )}

                  <ReactPlayer
                    url={getVideoUrl(shorts)}
                    playing={activeIndex === index && isPlaying}
                    muted={isMuted}
                    loop
                    width="100%"
                    height="100%"
                    playsinline
                    onError={() => handleVideoError(shorts.id)}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                    config={{
                      file: {
                        attributes: {
                          style: {
                            objectFit: "cover",
                            width: "100%",
                            height: "100%",
                          },
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

                  {videoErrors[shorts.id] && (
                    <div className="absolute top-20 left-4 bg-yellow-500/80 text-black text-xs px-2 py-1 rounded z-30">
                      테스트 영상 재생 중
                    </div>
                  )}
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* 상단 UI */}
          <div className="absolute top-12 left-0 right-0 px-4 z-20">
            <div className="flex items-center justify-between">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 bg-black/30 backdrop-blur rounded-full flex items-center justify-center">
                <ArrowLeft size={22} className="text-white" />
              </button>
              <div className="flex items-center gap-2">
                {currentShorts.weather && (
                  <WeatherBadge weather={currentShorts.weather} size="sm" />
                )}
                {currentShorts.season && <SeasonBadge season={currentShorts.season} size="sm" />}
              </div>
            </div>
          </div>

          {/* 우측 액션 */}
          <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5 z-20">
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
                {formatCount(likeCounts[currentShorts.id] || currentShorts.good)}
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

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="flex flex-col items-center gap-1">
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
          <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20">
            <h2 className="text-white text-xl font-bold mb-1">{currentShorts.title}</h2>
            {currentShorts.touristSpot && (
              <>
                <p className="text-white/80 text-sm flex items-center gap-1 mb-2">
                  <MapPin size={14} /> {currentShorts.touristSpot.address}
                </p>
                <p className="text-white/60 text-sm">{currentShorts.touristSpot.description}</p>
              </>
            )}
          </div>
        </div>

        {/* BottomNav - 모바일 컨테이너 안에 */}
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-white border-t border-gray-200 flex items-center justify-around px-12 z-50">
          <button onClick={() => navigate("/")} className="text-gray-400">
            <Home size={24} />
          </button>
          <button className="text-emerald-500">
            <Video size={24} />
          </button>
          <button onClick={() => navigate("/upload")} className="text-gray-400">
            <Upload size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};
