import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { X, Check, MapPin, Sun, Cloud, Snowflake, Upload as UploadIcon, Image } from "lucide-react";
import { useUploadStore } from "@/store";
import { useVideoMetadata } from "@/hooks";
import { videosApi } from "@/api";
import type { Weather, Season } from "@/types";

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

  // 파일 선택
  const handleFileSelect = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (!selectedFile) return;

      console.log("=== 파일 선택됨 ===");
      setFile(selectedFile);

      try {
        // 메타데이터 추출
        const meta = await extractMetadata(selectedFile);
        setMetadata(meta);

        // 위치 정보 표시
        if (meta.latitude && meta.longitude) {
          setExtractedLocation(`${meta.latitude.toFixed(4)}, ${meta.longitude.toFixed(4)}`);
        } else {
          setExtractedLocation("위치 정보 없음");
        }

        // 날짜 정보 표시
        if (meta.createdAt) {
          const date = new Date(meta.createdAt);
          setExtractedDate(date.toLocaleDateString("ko-KR"));

          // 계절 자동 추정
          const month = date.getMonth() + 1;
          if (month >= 3 && month <= 5) setSeason("spring");
          else if (month >= 6 && month <= 8) setSeason("summer");
          else if (month >= 9 && month <= 11) setSeason("fall");
          else setSeason("winter");
        } else {
          setExtractedDate("날짜 정보 없음");
        }

        // 썸네일 추출
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

  // 업로드 실행
  const handleUpload = useCallback(async () => {
    if (!file) return;

    console.log("=== 업로드 시작 ===");
    setIsUploading(true);

    try {
      // 1. presigned URL 발급
      console.log("1. presigned URL 요청...");
      const { uploadUrl, fileKey } = await videosApi.getUploadUrl(file.name, file.type, file.size);
      console.log("presigned URL 발급 완료:", fileKey);

      // 2. S3 업로드
      console.log("2. S3 업로드 시작...");
      await videosApi.uploadToS3(uploadUrl, file, (p) => {
        console.log("업로드 진행률:", p, "%");
        setProgress(p);
      });
      console.log("S3 업로드 완료");

      // 3. 업로드 완료 처리
      console.log("3. 업로드 완료 API 호출...");
      await videosApi.completeUpload({
        fileKey,
        title,
        touristSpotId: "1", // TODO: 선택된 관광지 ID
        weather: weather || "sunny",
        season: season || "spring",
        latitude: metadata?.latitude,
        longitude: metadata?.longitude,
      });
      console.log("업로드 완료!");

      alert("업로드 완료!");
      reset();
      navigate("/");
    } catch (err) {
      console.error("업로드 실패:", err);
      alert("업로드 실패");
    } finally {
      setIsUploading(false);
    }
  }, [file, title, weather, season, metadata, reset, navigate, setIsUploading, setProgress]);

  const weatherOptions: { value: Weather; icon: React.ReactNode; label: string }[] = [
    { value: "sunny", icon: <Sun size={16} />, label: "맑음" },
    { value: "cloudy", icon: <Cloud size={16} />, label: "흐림" },
    { value: "snowy", icon: <Snowflake size={16} />, label: "눈" },
  ];

  const seasonOptions: { value: Season; label: string }[] = [
    { value: "spring", label: "봄" },
    { value: "summer", label: "여름" },
    { value: "fall", label: "가을" },
    { value: "winter", label: "겨울" },
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

        {/* 스텝 인디케이터 */}
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? "bg-emerald-500 text-white" : "bg-gray-200 text-gray-400"
                }`}>
                {step > s ? <Check size={16} /> : s}
              </div>
              {s < 3 && (
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
                {file?.name} ({(file?.size || 0 / 1024 / 1024).toFixed(2)} MB)
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
                <p className="font-bold text-gray-900 text-sm">{extractedLocation || "-"}</p>
              </div>
              <div className="bg-white rounded-xl p-3">
                <p className="text-xs text-gray-500">촬영 일시</p>
                <p className="font-bold text-gray-900">{extractedDate || "-"}</p>
              </div>
            </div>
          </div>

          {/* 관광지 선택 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">📍 관광지 선택</p>
            <div className="p-3 border-2 border-emerald-500 rounded-xl flex items-center justify-between bg-emerald-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <MapPin size={20} className="text-emerald-500" />
                </div>
                <div>
                  <p className="font-medium text-gray-900">해운대 해수욕장</p>
                  <p className="text-xs text-emerald-600">AI 추천</p>
                </div>
              </div>
              <Check size={20} className="text-emerald-500" />
            </div>
          </div>

          {/* 날씨 선택 */}
          <div className="bg-white rounded-2xl p-4 mb-4">
            <p className="font-bold text-gray-900 mb-3">🌤 날씨</p>
            <div className="flex gap-2">
              {weatherOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setWeather(opt.value)}
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
                  onClick={() => setSeason(opt.value)}
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

          {/* 제목 입력 */}
          <div className="bg-white rounded-2xl p-4">
            <p className="font-bold text-gray-900 mb-3">✏️ 제목</p>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="영상 제목을 입력하세요"
              className="w-full px-4 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      )}

      {/* Step 3: 언어 설정 */}
      {step === 3 && (
        <div className="p-4">
          <div className="bg-white rounded-2xl p-4">
            <p className="font-bold text-gray-900 mb-3">🌐 번역 언어</p>
            {["English", "日本語", "中文"].map((lang, i) => (
              <label
                key={lang}
                className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl mb-2 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={i < 2}
                  className="w-5 h-5 accent-emerald-500"
                />
                <span className="font-medium text-gray-900">{lang}</span>
              </label>
            ))}
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
                onClick={() => setStep((step - 1) as 1 | 2 | 3)}
                className="flex-1 py-3.5 border border-gray-300 rounded-2xl font-bold text-gray-600">
                이전
              </button>
            )}
            <button
              onClick={() => {
                if (step < 3) setStep((step + 1) as 1 | 2 | 3);
                else handleUpload();
              }}
              className="flex-1 py-3.5 bg-emerald-500 rounded-2xl font-bold text-white">
              {step === 3 ? "업로드" : "다음"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
