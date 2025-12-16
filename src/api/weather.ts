type Weather = "Sunny" | "Cloudy" | "Rainy" | "Snowy";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8080";

export interface WeatherInfo {
  weather: Weather;
  avgTemp: number; // 평균 기온
  maxTemp: number; // 최고 기온
  minTemp: number; // 최저 기온
  humidity: number; // 습도
  rainfall: number; // 강수량
  sunshine: number; // 일조시간
  date: string; // 날짜
  station: string; // 관측소
}

interface ASOSItem {
  stnNm: string;
  tm: string;
  sumRn: string;
  ddMes: string;
  avgTca: string;
  avgTa: string;
  maxTa: string;
  minTa: string;
  avgRhm: string;
  sumSsHr: string;
}

const parseWeather = (cloud: number, rainfall: number, snow: number, temp: number): Weather => {
  if (snow > 0) return "Snowy";
  if (rainfall > 0 && temp < 2) return "Snowy";
  if (rainfall > 0) return "Rainy";
  if (cloud >= 6) return "Cloudy";
  return "Sunny";
};

const formatDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}${month}${day}`;
};

export const getWeatherByDate = async (
  lat: number,
  lng: number,
  date: Date
): Promise<WeatherInfo | null> => {
  try {
    const dateStr = formatDate(date);
    const res = await fetch(`${API_BASE}/weather?lat=${lat}&lng=${lng}&date=${dateStr}`);

    if (!res.ok) throw new Error("날씨 조회 실패");

    const data = await res.json();
    const item: ASOSItem = data?.response?.body?.items?.item?.[0];

    if (!item) return null;

    const rainfall = parseFloat(item.sumRn || "0");
    const snow = parseFloat(item.ddMes || "0");
    const cloud = parseFloat(item.avgTca || "0");
    const avgTemp = parseFloat(item.avgTa || "0");

    return {
      weather: parseWeather(cloud, rainfall, snow, avgTemp),
      avgTemp,
      maxTemp: parseFloat(item.maxTa || "0"),
      minTemp: parseFloat(item.minTa || "0"),
      humidity: parseFloat(item.avgRhm || "0"),
      rainfall,
      sunshine: parseFloat(item.sumSsHr || "0"),
      date: item.tm,
      station: item.stnNm,
    };
  } catch (error) {
    console.error("날씨 조회 실패:", error);
    return null;
  }
};
