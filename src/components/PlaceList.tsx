import { useRef, useEffect } from 'react';
import type { Place } from '@/types';
import PlaceCard from '@/components/PlaceCard';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PlaceListProps {
  places: Place[];
  favorites: Set<string>;
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  onFavoriteToggle: (id: string) => void;
  onNavigate?: (place: Place) => void;
}

export default function PlaceList({
  places,
  favorites,
  selectedPlace,
  onPlaceSelect,
  onFavoriteToggle,
  onNavigate,
}: PlaceListProps) {
  const selectedRef = useRef<HTMLDivElement>(null);

  // 디버깅을 위한 로그
  console.log('PlaceList rendered with places:', places);
  
  // 선택된 업체가 변경될 때 해당 요소로 스크롤
  useEffect(() => {
    if (selectedPlace && selectedRef.current) {
      selectedRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }
  }, [selectedPlace]);

  return (
    <div className="h-full flex flex-col">
      <div className="px-4 py-2 border-b">
        <h2 className="font-medium">
          검색 결과 ({places.length}개)
        </h2>
      </div>
      
      {places.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-muted-foreground p-4">
          <p>검색 결과가 없습니다. 필터를 조정해보세요.</p>
        </div>
      ) : (
        <ScrollArea className="flex-1">
          <div className="p-4 space-y-2">
            {places.map((place) => (
              <PlaceCard
                key={place.id}
                ref={selectedPlace?.id === place.id ? selectedRef : undefined}
                place={place}
                isSelected={selectedPlace?.id === place.id}
                isFavorite={favorites.has(place.id)}
                onFavoriteToggle={onFavoriteToggle}
                onNavigate={onNavigate}
                onClick={() => onPlaceSelect(place)}
                className="cursor-pointer"
              />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}
