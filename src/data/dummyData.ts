import type { Shorts } from "@/types";

const haeundaeSpot = {
  id: "1",
  name: "해운대 해수욕장",
  address: "부산광역시 해운대구",
  description: "부산의 대표 해변, 일출이 아름다운 곳 🌅",
  latitude: 35.1587,
  longitude: 129.1604,
  thumbnailUrl: "",
  shortsCount: 6,
  tags: ["해변", "일출", "서핑"],
};

const gyeongbokSpot = {
  id: "2",
  name: "경복궁",
  address: "서울특별시 종로구",
  description: "조선의 법궁, 야간 개장이 인기",
  latitude: 37.5796,
  longitude: 126.977,
  thumbnailUrl: "",
  shortsCount: 4,
  tags: ["고궁", "야경", "한복"],
};

export const dummyShorts: Shorts[] = [
  // 해운대 영상들
  {
    id: "1",
    title: "해운대 일출 명소",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/1-g73ty9v04/hqdefault.jpg",
    viewCount: 124000,
    likeCount: 2400,
    duration: 30,
    touristSpot: haeundaeSpot,
    weather: "sunny",
    season: "spring",
    createdAt: "2024-03-15",
  },
  {
    id: "2",
    title: "해운대 서핑 스팟",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
    viewCount: 82000,
    likeCount: 1800,
    duration: 45,
    touristSpot: haeundaeSpot,
    weather: "sunny",
    season: "summer",
    createdAt: "2024-03-14",
  },
  {
    id: "3",
    title: "해운대 야경 투어",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/wCkNA1cIFIg/hqdefault.jpg",
    viewCount: 51000,
    likeCount: 900,
    duration: 25,
    touristSpot: haeundaeSpot,
    weather: "cloudy",
    season: "fall",
    createdAt: "2024-03-13",
  },
  {
    id: "4",
    title: "해운대 불꽃축제",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/bEg4kEYKjYs/hqdefault.jpg",
    viewCount: 180000,
    likeCount: 5200,
    duration: 35,
    touristSpot: haeundaeSpot,
    weather: "sunny",
    season: "fall",
    createdAt: "2024-03-12",
  },
  {
    id: "5",
    title: "해운대 맛집 거리",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/n1WpP7iowLc/hqdefault.jpg",
    viewCount: 91000,
    likeCount: 2100,
    duration: 28,
    touristSpot: haeundaeSpot,
    weather: "sunny",
    season: "spring",
    createdAt: "2024-03-11",
  },
  {
    id: "6",
    title: "해운대 새벽 산책",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/g3J4VxWIM5s/hqdefault.jpg",
    viewCount: 53000,
    likeCount: 1300,
    duration: 40,
    touristSpot: haeundaeSpot,
    weather: "sunny",
    season: "winter",
    createdAt: "2024-03-10",
  },
  // 경복궁 영상들
  {
    id: "7",
    title: "경복궁 야간 개장",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/1-g73ty9v04/hqdefault.jpg",
    viewCount: 95000,
    likeCount: 3200,
    duration: 32,
    touristSpot: gyeongbokSpot,
    weather: "cloudy",
    season: "fall",
    createdAt: "2024-03-09",
  },
  {
    id: "8",
    title: "경복궁 한복 체험",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/aqz-KE-bpKQ/hqdefault.jpg",
    viewCount: 72000,
    likeCount: 1500,
    duration: 38,
    touristSpot: gyeongbokSpot,
    weather: "sunny",
    season: "spring",
    createdAt: "2024-03-08",
  },
  {
    id: "9",
    title: "경복궁 수문장 교대식",
    videoUrl:
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/wCkNA1cIFIg/hqdefault.jpg",
    viewCount: 64000,
    likeCount: 1100,
    duration: 22,
    touristSpot: gyeongbokSpot,
    weather: "sunny",
    season: "summer",
    createdAt: "2024-03-07",
  },
  {
    id: "10",
    title: "경복궁 겨울 설경",
    videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    thumbnailUrl: "https://i.ytimg.com/vi/bEg4kEYKjYs/hqdefault.jpg",
    viewCount: 88000,
    likeCount: 2800,
    duration: 29,
    touristSpot: gyeongbokSpot,
    weather: "snowy",
    season: "winter",
    createdAt: "2024-03-06",
  },
];

// 지역별 필터링
export const getShortsByDistrict = (district: string) => {
  return dummyShorts.filter((s) => s.touristSpot.address.includes(district));
};

// 관광지별 필터링
export const getShortsBySpotId = (spotId: string) => {
  return dummyShorts.filter((s) => s.touristSpot.id === spotId);
};

// 주변 영상 (더미용)
export const getNearbyShorts = (lat: number, lng: number, excludeId?: string) => {
  return dummyShorts.filter((s) => s.id !== excludeId).sort(() => Math.random() - 0.5);
};
