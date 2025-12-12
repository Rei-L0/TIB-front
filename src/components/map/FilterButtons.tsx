// src/components/map/FilterButtons.tsx
import { useState } from "react";
import { Filter, ChevronDown } from "lucide-react";
import { useMapStore } from "@/store";
import type { Weather, Season, TouristSpot, Theme } from "@/types";

export const FilterButtons = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { filters, setFilters, fetchShorts, setPlaces } = useMapStore();

  const weatherOptions: { value: Weather; label: string }[] = [
    { value: "Sunny", label: "☀️ 맑음" },
    { value: "Cloudy", label: "☁️ 흐림" },
    { value: "Rainy", label: "🌧️ 비" },
    { value: "Snowy", label: "❄️ 눈" },
  ];

  const seasonOptions: { value: Season; label: string }[] = [
    { value: "Spring", label: "🌸 봄" },
    { value: "Summer", label: "🌻 여름" },
    { value: "Autumn", label: "🍂 가을" },
    { value: "Winter", label: "⛄ 겨울" },
  ];

  const themeOptions: { value: Theme; label: string }[] = [
    { value: "NightView", label: "🌅 야경" },
    { value: "Rest", label: "☀️ 자연" },
    { value: "Food", label: "🌙 맛집" },
  ];

  const handleFilterChange = (newFilters: Partial<typeof filters>) => {
    setFilters(newFilters);

    fetchShorts();
  };

  return (
    <div className="absolute top-28 left-4 z-30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-2 bg-white rounded-full shadow-md text-xs font-medium text-gray-700 flex items-center gap-1"
      >
        <Filter size={12} />
        필터
        <ChevronDown
          size={12}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="mt-2 bg-white rounded-xl shadow-lg p-4 w-64">
          {/* 날씨 */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">날씨</p>
            <div className="flex gap-1">
              {weatherOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    handleFilterChange({
                      weather:
                        filters.weather === item.value ? null : item.value,
                    })
                  }
                  className={`w-14 py-1.5 rounded-full text-xs font-medium ${
                    filters.weather === item.value
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 계절 */}
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">계절</p>
            <div className="flex gap-1">
              {seasonOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    handleFilterChange({
                      season: filters.season === item.value ? null : item.value,
                    })
                  }
                  className={`w-14 py-1.5 rounded-full text-xs font-medium ${
                    filters.season === item.value
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* 시간 */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">테마</p>
            <div className="flex gap-2">
              {themeOptions.map((item) => (
                <button
                  key={item.value}
                  onClick={() =>
                    handleFilterChange({
                      time: filters.time === item.value ? null : item.value,
                    })
                  }
                  className={`w-14 py-1.5 rounded-full text-xs font-medium ${
                    filters.time === item.value
                      ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
