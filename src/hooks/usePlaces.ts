// src/hooks/usePlaces.ts
import { useState, useMemo, useCallback, useRef } from 'react';
import type { Place, PlaceFilter, Coordinates, PlaceCategory } from '@/types';
import { calculateDistance } from '@/lib/constants';
import useLocalStorage from '@/hooks/useLocalStorage';
import { PLACE_CATEGORIES } from '@/types';

interface UsePlacesOptions {
  userLocation: Coordinates;
}

interface UsePlacesReturn {
  filteredPlaces: Place[];
  filter: PlaceFilter;
  setFilter: React.Dispatch<React.SetStateAction<PlaceFilter>>;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  selectedPlace: Place | null;
  selectPlace: (place: Place | null) => void;
}

// 장소 필터링 함수 (외부로 분리하여 최적화)
function filterPlaces(
  places: Place[],
  filter: PlaceFilter,
  userLocation: Coordinates
): Place[] {
  return places.filter(place => {
    // 지역 필터
    if (filter.region !== '전체' && place.region !== filter.region) {
      return false;
    }
    
    // 카테고리 필터
    if (!filter.categories.has(place.category)) {
      return false;
    }
    
    // 키워드 검색 (업체명, 주소, 대표자)
    if (filter.keyword) {
      const keyword = filter.keyword.toLowerCase();
      const nameMatch = place.name.toLowerCase().includes(keyword);
      const addressMatch = place.address.toLowerCase().includes(keyword);
      const representativeMatch = place.representative?.toLowerCase().includes(keyword) || false;
      
      if (!nameMatch && !addressMatch && !representativeMatch) {
        return false;
      }
    }
    
    // 반경 필터
    if (userLocation && userLocation.lat && userLocation.lng) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.lat,
        place.lng
      );
      
      if (distance > filter.radius) {
        return false;
      }
    }
    
    return true;
  });
}

export default function usePlaces(places: Place[], options: UsePlacesOptions): UsePlacesReturn {
  const { userLocation } = options;
  
  // 이전 위치 참조 저장 (불필요한 재계산 방지)
  const prevLocationRef = useRef<Coordinates | null>(null);
  
  // 필터 상태
  const [filter, setFilter] = useState<PlaceFilter>({
    region: '전체',
    categories: new Set<PlaceCategory>(PLACE_CATEGORIES),
    radius: 5000, // 기본 반경을 더 넓게 설정 (5km)
  });

  // 로컬 스토리지에서 즐겨찾기 불러오기
  const [favoritesArray, setFavoritesArray] = useLocalStorage<string[]>('favorites', []);
  
  // 즐겨찾기 Set - 메모이제이션
  const favorites = useMemo(() => new Set(favoritesArray), [favoritesArray]);
  
  // 즐겨찾기 토글 함수 - 콜백 메모이제이션
  const toggleFavorite = useCallback((id: string) => {
    setFavoritesArray(prev => {
      if (prev.includes(id)) {
        return prev.filter(favId => favId !== id);
      } else {
        return [...prev, id];
      }
    });
  }, [setFavoritesArray]);
  
  // 즐겨찾기 확인 함수 - 콜백 메모이제이션
  const isFavorite = useCallback((id: string) => {
    return favorites.has(id);
  }, [favorites]);

  // 선택한 업체 상태
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  
  // 장소 선택 함수 - 콜백 메모이제이션
  const selectPlace = useCallback((place: Place | null) => {
    setSelectedPlace(place);
  }, []);

  // 필터링된 업체 목록 - 메모이제이션
  // 위치나 필터가 변경될 때만 재계산
  const filteredPlaces = useMemo(() => {
    // 위치가 변경되었는지 확인 (정확도가 높아질 경우 재계산 필요)
    const locationChanged = !prevLocationRef.current || 
      prevLocationRef.current.lat !== userLocation.lat || 
      prevLocationRef.current.lng !== userLocation.lng;
    
    // 현재 위치 저장
    prevLocationRef.current = { ...userLocation };
    
    // 필터링 수행
    return filterPlaces(places, filter, userLocation);
  }, [places, filter, userLocation]);

  // 정렬된 결과 - 거리 기준 (성능 최적화를 위해 필요 시 활성화)
  /*
  const sortedPlaces = useMemo(() => {
    // 거리 계산이 비싸므로, 필터링된 결과에만 적용
    return [...filteredPlaces].sort((a, b) => {
      const distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
      const distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      return distA - distB;
    });
  }, [filteredPlaces, userLocation]);
  */

  return {
    filteredPlaces,
    filter,
    setFilter,
    favorites,
    toggleFavorite,
    isFavorite,
    selectedPlace,
    selectPlace,
  };
}
