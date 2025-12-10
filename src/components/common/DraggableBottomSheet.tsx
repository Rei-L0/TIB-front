// src/components/common/DraggableBottomSheet.tsx
import { useEffect, ReactNode } from "react";
import { useBottomSheet } from "@/hooks";
import { useBottomSheetStore, useMapStore } from "@/store";

interface DraggableBottomSheetProps {
  header?: ReactNode;
  children?: ReactNode;
  initialState?: "min" | "middle" | "max";
}

export const DraggableBottomSheet = ({
  header,
  children,
  initialState = "middle",
}: DraggableBottomSheetProps) => {
  const { state, currentHeight, isDragging, handlers } =
    useBottomSheet(initialState);
  const { mode } = useBottomSheetStore();
  const { searchResults, keyword, fetchSelectPlace } = useMapStore();
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      handlers.onMouseMove({ clientY: e.clientY } as React.MouseEvent);
    };

    const handleMouseUp = () => {
      handlers.onMouseUp();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handlers]);

  const renderContent = () => {
    if (mode === "search" || mode === "nearby") {
      return (
        <div className="flex flex-col gap-2">
          {searchResults.map((place) => (
            <button
              key={place.id}
              onClick={() => fetchSelectPlace(place)}
              className="w-full p-3 bg-gray-50 rounded-xl text-left hover:bg-gray-100 transition"
            >
              <p className="font-medium text-gray-900">{place.name}</p>
              <p className="text-sm text-gray-500">{place.address}</p>
            </button>
          ))}
        </div>
      );
    }

    return null;
  };
  return (
    <div
      className={`fixed left-0 right-0 bg-white rounded-t-3xl shadow-2xl z-40 transition-all duration-300 ease-out overflow-hidden ${
        state === "max" ? "bottom-0" : "bottom-12"
      }`}
      style={{ height: currentHeight }}
    >
      {/* 드래그 핸들 */}
      <div
        className="w-full py-2 cursor-grab active:cursor-grabbing"
        onMouseDown={handlers.onMouseDown}
        onTouchStart={handlers.onTouchStart}
        onTouchMove={handlers.onTouchMove}
        onTouchEnd={handlers.onTouchEnd}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto" />
      </div>

      {/* 검색/주변 모드일 때 */}
      {mode === "search" && (
        <>
          {(state === "middle" || state === "max") && (
            <div
              className={`px-5 ${
                state === "max" ? "overflow-y-auto" : "overflow-hidden"
              }`}
              style={{
                height: state === "max" ? "calc(100% - 120px)" : "150px",
              }}
            >
              {renderContent()}
            </div>
          )}
        </>
      )}

      {/* 주변 관광지 모드일 때 - 영상만 */}
      {mode === "nearby" && (state === "middle" || state === "max") && (
        <div
          className={`px-5 ${
            state === "max" ? "overflow-y-auto" : "overflow-hidden"
          }`}
          style={{ height: state === "max" ? "calc(100% - 120px)" : "150px" }}
        >
          {children}
        </div>
      )}

      {/* 기본 모드일 때 (기존 header, children) */}
      {mode === "spot" && (
        <>
          {header && <div className="px-5 pb-3">{header}</div>}
          {children && (state === "middle" || state === "max") && (
            <div
              className={`px-5 ${
                state === "max" ? "overflow-y-auto" : "overflow-hidden"
              }`}
              style={{
                height: state === "max" ? "calc(100% - 120px)" : "150px",
              }}
            >
              {children}
            </div>
          )}
        </>
      )}
    </div>
  );
};
