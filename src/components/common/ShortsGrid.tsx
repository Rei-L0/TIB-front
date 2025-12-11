// src/components/common/ShortsGrid.tsx
import { ShortsGridItem } from "@/components/shorts/ShortsGridItem";
import { useEffect } from "react";
import { useMapStore, useBottomSheetStore } from "@/store";

interface ShortsGridProps {
  onItemClick?: (index: number) => void;
  maxItems?: number;
}

export const ShortsGrid = ({ onItemClick }: ShortsGridProps) => {
  const { spot, mode } = useBottomSheetStore();
  const { places, shorts, fetchShorts } = useMapStore();

  useEffect(() => {
    if (mode === "spot" || mode === "nearby") {
      fetchShorts();
    }
  }, [mode, spot?.id, places]);

  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {shorts.map((item, index) => (
        <ShortsGridItem
          key={item.id}
          shorts={item}
          onClick={() => onItemClick?.(index)}
        />
      ))}
    </div>
  );
};
