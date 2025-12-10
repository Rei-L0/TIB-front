import { useState } from "react";
import { Search } from "lucide-react";
import { useMapStore } from "@/store";

export const SearchBar = () => {
  const [inputValue, setInputValue] = useState("");
  const { fetchSearchPlaces } = useMapStore();

  const handleSearch = () => {
    fetchSearchPlaces(inputValue);
    console.log("검색:", { inputValue });
  };

  return (
    <div className="absolute top-10 left-4 right-4 z-30">
      <div className="flex items-center gap-3 px-4 py-3.5 bg-white rounded-2xl shadow-lg">
        <Search size={20} className="text-gray-400" />
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          placeholder="관광지 검색..."
          className="flex-1 outline-none bg-transparent"
        />
      </div>
    </div>
  );
};
