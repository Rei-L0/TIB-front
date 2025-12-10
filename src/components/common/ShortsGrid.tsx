// src/components/common/ShortsGrid.tsx
import { ShortsGridItem } from "@/components/shorts/ShortsGridItem";
import type { Shorts } from "@/types";

interface ShortsGridProps {
  shorts: Shorts[];
  onItemClick?: (index: number) => void;
  maxItems?: number;
}

export const ShortsGrid = ({ shorts, onItemClick, maxItems }: ShortsGridProps) => {
  const displayShorts = maxItems ? shorts.slice(0, maxItems) : shorts;

  return (
    <div className="grid grid-cols-2 gap-3 pb-4">
      {displayShorts.map((item, index) => (
        <ShortsGridItem key={item.id} shorts={item} onClick={() => onItemClick?.(index)} />
      ))}
    </div>
  );
};
