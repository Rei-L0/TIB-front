import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  X,
  Check,
  MapPin,
  Sun,
  Cloud,
  Snowflake,
  CloudRain,
  Upload as UploadIcon,
  Waves,
  Mountain,
  Coffee,
  Utensils,
  PartyPopper,
  Footprints,
  Moon,
} from "lucide-react";
import { useUploadStore } from "@/store";
import { useVideoMetadata } from "@/hooks";
import { shortsApi } from "@/api/shorts";
import type { Theme, NearbyAttraction } from "@/types";

type Weather = "SUNNY" | "CLOUDY" | "RAINY" | "SNOWY";
type Season = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

const getAddressFromCoords = async (lat: number, lng: number): Promise<string> => {
  try {
    const addressRes = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
        },
      }
    );
    const addressData = await addressRes.json();

    if (addressData.documents?.length > 0) {
      const doc = addressData.documents[0];
      return doc.road_address?.address_name || doc.address?.address_name;
    }

    const regionRes = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${lng}&y=${lat}`,
      {
        headers: {
          Authorization: `KakaoAK ${import.meta.env.VITE_KAKAO_REST_KEY}`,
        },
      }
    );
    const regionData = await regionRes.json();

    if (regionData.documents?.length > 0) {
      return regionData.documents[0].address_name;
    }

    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  } catch {
    return "주소 변환 실패";
  }
};

const dataURLtoBlob = (dataURL: string): Blob => {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

export const UploadPage = () => {
  const navigate = useNavigate();
  const {
    step,
    setStep,
    file,
    setFile,
    metadata,
    setMetadata,
    weather,
    setWeather,
    season,
    setSeason,
    title,
    setTitle,
    isUploading,
    setIsUploading,
    progress,
    setProgress,
    reset,
  } = useUploadStore();

  const { extractMetadata, extractThumbnail } = useVideoMetadata();
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [extractedLocation, setExtractedLocation] = useState<string | null>(null);
  const [extractedDate, setExtractedDate] = useState<string | null>(null);
  const [nearbySpots, setNearbySpots] = useState<NearbyAttraction[]>([]);
  const [selectedSpotId, setSelectedSpotId] = useState<number | null>(null);
  const [theme, setTheme] = useState<Theme | null>(null);
  const [name, setName] = useState<string>("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [hashtagInput, setHashtagInput] = useState<string>("");

  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      if (!["video/mp4", "video/quicktime"].includes(selectedFile.type)) {
        alert("MP4 또는 MOV 파일만 업로드 가능합니다.");
        return;
      }
      if (selectedFile.size > 500 * 1024 * 1024) {
        alert("파일 크기는 500MB 이하만 가능합니다.");
        return;
      }

      setFile(selectedFile);

      try {
        const meta = await extractMetadata(selectedFile);
        setMetadata(meta);

        if (meta.latitude && meta.longitude) {
          const address = await getAddressFromCoords(meta.latitude, meta.longitude);
          setExtractedLocation(address);

          try {
            const spots = await shortsApi.getNearbyAttractions(
              meta.latitude,
              meta.longitude,
              20000
            );
            setNearbySpots(spots);
            if (spots.length > 0) {
              setSelectedSpotId(spots[0].contentId);
            }
          } catch {
            setNearbySpots([]);
          }
        } else {
          setExtractedLocation("위치 정보 없음");
        }

        if (meta.createdAt) {
          const date = new Date(meta.createdAt);
          setExtractedDate(date.toLocaleDateString("ko-KR"));

          const month = date.getMonth() + 1;
          if (month >= 3 && month <= 5) setSeason("SPRING" as any);
          else if (month >= 6 && month <= 8) setSeason("SUMMER" as any);
          else if (month >= 9 && month <= 11) setSeason("AUTUMN" as any);
          else setSeason("WINTER" as any);
        } else {
          setExtractedDate("날짜 정보 없음");
        }

        try {
          const thumbUrl = await extractThumbnail(selectedFile);
          setThumbnail(thumbUrl);
        } catch (err) {
          console.warn("썸네일 추출 실패:", err);
        }

        setStep(2);
      } catch (err) {
        console.error("메타데이터 추출 실패:", err);
        alert("파일을 읽을 수 없습니다.");
      }
    },
    [extractMetadata, extractThumbnail, setFile, setMetadata, setStep, setSeason]
  );

  const handleAddHashtag = () => {
    const tag = hashtagInput.trim().replace(/^#/, "");
    if (tag && !hashtags.includes(tag)) {
      setHashtags([...hashtags, tag]);
    }
    setHashtagInput("");
  };

  const handleRemoveHashtag = (tag: string) => {
    setHashtags(hashtags.filter((t) => t !== tag));
  };

  const handleUpload = useCallback(async () => {
    if (!file || !thumbnail || !name.trim() || !title.trim()) {
      alert("필수 항목을 입력해주세요.");
      return;
    }

    setIsUploading(true);
    setProgress(0);

    try {
      const thumbnailBlob = dataURLtoBlob(thumbnail);

      const { videoUploadUrl, videoKey, thumbnailUploadUrl, thumbnailKey } =
        await shortsApi.getUploadUrl({
          videoFileName: file.name,
          videoContentType: file.type,
          videoFileSize: file.size,
          thumbnailFileName: "thumbnail.jpg",
          thumbnailContentType: "image/jpeg",
          thumbnailFileSize: thumbnailBlob.size,
        });

      await shortsApi.uploadToS3(videoUploadUrl, file, (p) => {
        setProgress(Math.round(p * 0.8));
      });

      await shortsApi.uploadToS3(thumbnailUploadUrl, thumbnailBlob);
      setProgress(90);

      await shortsApi.create({
        videoKey,
        thumbnailKey,
        name: name.trim(),
        title: title.trim(),
        contentId: selectedSpotId || undefined,
        weather: weather || undefined,
        theme: theme || undefined,
        season: season || undefined,
        latitude: metadata?.latitude,
        longitude: metadata?.longitude,
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      });

      setProgress(100);
      alert("업로드 완료!");
      reset();
      navigate("/");
    } catch (err) {
      console.error("업로드 실패:", err);
      alert("업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
    }
  }, [
    file,
    thumbnail,
    name,
    title,
    weather,
    theme,
    season,
    metadata,
    selectedSpotId,
    hashtags,
    reset,
    navigate,
    setIsUploading,
    setProgress,
  ]);

  const weatherOptions: { value: Weather; icon: React.ReactNode; label: string }[] = [
    { value: "SUNNY", icon: <Sun size={16} />, label: "맑음" },
    { value: "CLOUDY", icon: <Cloud size={16} />, label: "흐림" },
    { value: "RAINY", icon: <CloudRain size={16} />, label: "비" },
    { value: "SNOWY", icon: <Snowflake size={16} />, label: "눈" },
  ];

  const seasonOptions: { value: Season; label: string }[] = [
    { value: "SPRING", label: "봄" },
    { value: "SUMMER", label: "여름" },
    { value: "AUTUMN", label: "가을" },
    { value: "WINTER", label: "겨울" },
  ];

  const themeOptions: { value: Theme; icon: React.ReactNode; label: string }[] = [
    { value: "NIGHT_VIEW", icon: <Moon size={16} />, label: "야경" },
    { value: "OCEAN", icon: <Waves size={16} />, label: "바다" },
    { value: "MOUNTAIN", icon: <Mountain size={16} />, label: "산" },
    { value: "CAFE", icon: <Coffee size={16} />, label: "카페" },
    { value: "FOOD", icon: <Utensils size={16} />, label: "맛집" },
    { value: "FESTIVAL", icon: <PartyPopper size={16} />, label: "축제" },
    { value: "WALK", icon: <Footprints size={16} />, label: "산책" },
  ];

  return (
    <div className="h-screen bg-gray-50 relative">
      {/* 헤더 */}
      <div className="bg-white px-4 pt-10 pb-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              reset();
              navigate(-1);
            }}
            className="w-10 h-10 flex items-center justify-center">
            <X size={24} className="text-gray-600" />
          </button>
          <h1 className="text-lg font-bold">영상 업로드</h1>
          <div className="w-10" />
        </div>

        <div className="flex items-center gap-2 mt-4">
          {[1, 2].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 2 && (
                <div
                  className={`flex-1 h-1 rounded ${step > s ? "bg-emerald-500" : "bg-gray-200"}`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step 1: 파일 선택 */}
      {step === 1 && (
        <div className="p-4">
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-2xl p-8 cursor-pointer hover:border-emerald-500 transition-colors">
            <input type="file" accept="video/*" onChange={handleFileSelect} className="hidden" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <UploadIcon size={28} className="text-emerald-500" />
              </div>
              <p className="text-gray-900 font-bold mb-1">영상을 업로드하세요</p>
              <p className="text-gray-500 text-sm">MP4, MOV 최대 500MB</p>
            </div>
          </label>
        </div>
      )}

      {/* Step 2: 메타데이터 입력 */}
      {step === 2 && (
        <div className="p-4 pb-24 overflow-y-auto h-[calc(100%-140px)]">
          {/* 썸네일 미리보기 */}
          {thumbnail && (
            <div className="bg-white rounded-2xl p-4 mb-4">
              <p className="font-bold text-gray-900 mb-3">📹 영상 미리보기</p>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <img src={thumbnail} alt="썸네일" className="w-full h-full object-contain" />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {file?.name} ({((file?.size || 0) / 1024 / 1024).toFixed(2)} MB)
              </p>
            </div>
          )}

          {/* 자동 추출 정보 */}
          <div className="bg-emerald-50 rounded-2xl p-4 mb-4">
            <p className="text-emerald-700 font-bold text-sm mb-3">✨ 자동 추출 정보</p>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">영상 길이</p>
                <p className="font-bold text-gray-900">
                  {metadata ? `${Math.floor(metadata.duration)}초` : "-"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">해상도</p>
                <p className="font-bold text-gray-900">
                  {metadata ? `${metadata.width}x${metadata.height}` : "-"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">촬영 위치</p>
                <p className="font-bold text-gray-900 text-sm truncate">
                  {extractedLocation || "-"}
                </p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">촬영 일시</p>
                <p className="font-bold text-gray-900">{extractedDate || "-"}</p>
              </div>
            </div>
          </div>

          {/* 닉네임 입력 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">👤 닉네임 *</p>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="닉네임을 입력하세요"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 제목 입력 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">✏️ 제목 *</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="영상 제목을 입력하세요"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* 관광지 선택 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">📍 관광지 선택</p>
            {nearbySpots.length > 0 ? (
              <div className="space-y-2">
                {nearbySpots.map((spot, index) => (
                  <button
                    key={spot.contentId}
                    onClick={() => setSelectedSpotId(spot.contentId)}
                    className={`w-full p-3 rounded-xl flex items-center justify-between ${
                      selectedSpotId === spot.contentId
                        ? "border-2 border-emerald-500 bg-emerald-50"
                        : "border border-gray-200"
                    }`}>
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          selectedSpotId === spot.contentId ? "bg-emerald-100" : "bg-gray-100"
                        }`}>
                        <MapPin
                          size={20}
                          className={
                            selectedSpotId === spot.contentId ? "text-emerald-500" : "text-gray-400"
                          }
                        />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">{spot.title}</p>
                        <p className="text-xs text-gray-500">{Math.round(spot.distance)}m 거리</p>
                      </div>
                    </div>
                    {selectedSpotId === spot.contentId && (
                      <Check size={20} className="text-emerald-500" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">위치 정보가 없어 관광지를 찾을 수 없습니다.</p>
            )}
          </div>

          {/* 테마 선택 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">🎨 테마</p>
            <div className="flex flex-wrap gap-2">
              {themeOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setTheme(theme === opt.value ? null : opt.value)}
                  className={`px-3 py-2 rounded-xl flex items-center gap-1 text-sm font-medium ${
                    theme === opt.value
                      ? "bg-purple-100 text-purple-600 border-2 border-purple-300"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 날씨 선택 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">🌤 날씨</p>
            <div className="flex gap-2">
              {weatherOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setWeather(weather === opt.value ? null : (opt.value as any))}
                  className={`flex-1 py-2.5 rounded-xl flex items-center justify-center gap-1 text-sm font-medium ${
                    weather === opt.value
                      ? "bg-amber-100 text-amber-600 border-2 border-amber-300"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 계절 선택 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">🗓 계절</p>
            <div className="flex gap-2">
              {seasonOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSeason(season === opt.value ? null : (opt.value as any))}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                    season === opt.value
                      ? "bg-pink-100 text-pink-600 border-2 border-pink-300"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* 해시태그 입력 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3"># 해시태그</p>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAddHashtag()}
                placeholder="해시태그 입력 후 엔터"
                className="flex-1 px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <button
                onClick={handleAddHashtag}
                className="px-4 py-3 bg-emerald-500 text-white rounded-xl font-medium">
                추가
              </button>
            </div>
            {hashtags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {hashtags.map((tag) => (
                  <span
                    key={tag}
                    onClick={() => handleRemoveHashtag(tag)}
                    className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-sm cursor-pointer">
                    #{tag} ×
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 하단 버튼 */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100">
        {isUploading ? (
          <div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
              <div
                className="h-full bg-emerald-500 transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-center text-sm text-gray-500">업로드 중... {progress}%</p>
          </div>
        ) : (
          <div className="flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-bold text-gray-600">
                이전
              </button>
            )}
            <button
              onClick={step === 2 ? handleUpload : undefined}
              disabled={step === 2 && (!name.trim() || !title.trim())}
              className={`flex-1 py-3.5 rounded-2xl font-bold text-white ${
                step === 2 && (!name.trim() || !title.trim()) ? "bg-gray-300" : "bg-emerald-500"
              }`}>
              업로드
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
