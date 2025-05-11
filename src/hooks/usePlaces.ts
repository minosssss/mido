// src/hooks/usePlaces.ts
import { useState, useMemo, useCallback, useRef } from 'react';
import type { Place, PlaceFilter, Coordinates, PlaceCategory } from '@/types';
import { calculateDistance } from '@/lib/utils';
import useLocalStorage from '@/hooks/useLocalStorage';
import { PLACE_CATEGORIES } from '@/types';

interface UsePlacesOptions {
  userLocation: Coordinates;
}

interface UsePlacesReturn {
  places: Place[]; // 전체 장소 목록 (필터링 전)
  filteredPlaces: Place[]; // 필터링된 장소 목록
  filter: PlaceFilter;
  setFilter: React.Dispatch<React.SetStateAction<PlaceFilter>>;
  favorites: Set<string>;
  toggleFavorite: (id: string) => void;
  isFavorite: (id: string) => boolean;
  selectedPlace: Place | null;
  selectPlace: (place: Place | null) => void;
  setViewportMode: (bounds: { sw: {lat: number, lng: number}, ne: {lat: number, lng: number} }) => void;
  setRadiusMode: () => void;
  getDistanceText: (place: Place) => string;
  addPlaces: (newPlaces: Place[]) => void; // 새로운 장소 추가 함수
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
    
    // 필터링 모드에 따라 적용
    if (filter.searchMode === 'radius') {
      // 반경 필터
      if (userLocation && userLocation.lat && userLocation.lng) {
        const distance = calculateDistance(
          userLocation.lat,
          userLocation.lng,
          place.lat,
          place.lng
        );
        
        // filter.radius는 미터 단위이므로 km로 변환하여 비교
        // 반경보다 거리가 큰 경우 필터링
        if (distance > filter.radius / 1000) {
          return false;
        }
      }
    } else if (filter.searchMode === 'viewport' && filter.mapBounds) {
      // 지도 영역 필터 (bounds 내에 있는지 확인)
      const { sw, ne } = filter.mapBounds;
      
      if (
        place.lat < sw.lat || 
        place.lat > ne.lat || 
        place.lng < sw.lng || 
        place.lng > ne.lng
      ) {
        return false;
      }
    }
    
    return true;
  });
}

// 거리를 텍스트로 변환
function formatDistance(kilometers: number): string {
  // 1km 미만은 미터 단위로 표시
  if (kilometers < 1) {
    return `${Math.round(kilometers * 1000)}m`;
  } else if (kilometers < 10) {
    // 10km 미만은 소수점 한 자리까지 표시
    return `${kilometers.toFixed(1)}km`;
  } else {
    // 10km 이상은 정수로 표시
    return `${Math.round(kilometers)}km`;
  }
}

export default function usePlaces(initialPlaces: Place[], options: UsePlacesOptions): UsePlacesReturn {
  const { userLocation } = options;
  
  // 모든 장소 데이터 (필터링 전 상태)
  const [places, setPlaces] = useState<Place[]>(initialPlaces);
  
  // 이전 위치 참조 저장
  const prevLocationRef = useRef<Coordinates | null>(null);
  
  // 지도 중심점 (viewport 모드에서 거리 계산에 사용)
  const [mapCenter, setMapCenter] = useState<Coordinates | null>(null);
  
  // 필터 상태
  const [filter, setFilter] = useState<PlaceFilter>({
    region: '전체',
    categories: new Set<PlaceCategory>(PLACE_CATEGORIES),
    radius: 10000, // 기본 반경 10km
    searchMode: 'viewport', // 기본 모드: 지도 영역 (변경됨)
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

  // 지도 영역 모드로 전환 - bounds 정보로 필터링
  const setViewportMode = useCallback((bounds: { sw: {lat: number, lng: number}, ne: {lat: number, lng: number} }) => {
    // 지도 중심점 계산 (거리 계산용)
    const centerLat = (bounds.sw.lat + bounds.ne.lat) / 2;
    const centerLng = (bounds.sw.lng + bounds.ne.lng) / 2;
    setMapCenter({ lat: centerLat, lng: centerLng });
    
    setFilter(prev => ({
      ...prev,
      searchMode: 'viewport',
      mapBounds: bounds
    }));
  }, []);
  
  // 반경 모드로 전환
  const setRadiusMode = useCallback(() => {
    setMapCenter(null);
    setFilter(prev => ({
      ...prev,
      searchMode: 'radius',
      mapBounds: undefined
    }));
  }, []);
  
  // 장소까지의 거리 텍스트 계산
  const getDistanceText = useCallback((place: Place): string => {
    // 반경 모드면 사용자 위치로부터의 거리
    if (filter.searchMode === 'radius' || !mapCenter) {
      const distance = calculateDistance(
        userLocation.lat,
        userLocation.lng,
        place.lat,
        place.lng
      );
      return formatDistance(distance); // calculateDistance는 이미 km 단위로 반환
    } 
    // 지도 영역 모드면 지도 중심으로부터의 거리
    else {
      const distance = calculateDistance(
        mapCenter.lat,
        mapCenter.lng,
        place.lat,
        place.lng
      );
      return formatDistance(distance); // calculateDistance는 이미 km 단위로 반환
    }
  }, [filter.searchMode, userLocation, mapCenter]);

  // 새로운 장소 추가 함수 - 콜백 메모이제이션
  const addPlaces = useCallback((newPlaces: Place[]) => {
    setPlaces(prev => {
      // 기존 ID 조회용 Set (중복 방지)
      const existingIds = new Set(prev.map(p => p.id));
      
      // 중복되지 않는 항목만 추가
      const uniqueNewPlaces = newPlaces.filter(place => !existingIds.has(place.id));
      
      // 중복 항목 카운트 (로깅용)
      const duplicateCount = newPlaces.length - uniqueNewPlaces.length;
      if (duplicateCount > 0) {
        console.log(`중복된 ${duplicateCount}개 항목 제외됨`);
      }
      
      // 기존 장소 + 새 장소 병합하여 반환
      return [...prev, ...uniqueNewPlaces];
    });
  }, []);

  // 필터링된 업체 목록 - 메모이제이션
  const filteredPlaces = useMemo(() => {
    // 위치 변경 확인
    const locationChanged = !prevLocationRef.current || 
      prevLocationRef.current.lat !== userLocation.lat || 
      prevLocationRef.current.lng !== userLocation.lng;
    
    // 현재 위치 저장
    prevLocationRef.current = { ...userLocation };
    
    // 필터링 수행
    const filtered = filterPlaces(places, filter, userLocation);
    
    // 거리순 정렬 (모드에 따라 기준점이 달라짐)
    return filtered.sort((a, b) => {
      let distA, distB;
      
      if (filter.searchMode === 'radius' || !mapCenter) {
        // 사용자 위치 기준
        distA = calculateDistance(userLocation.lat, userLocation.lng, a.lat, a.lng);
        distB = calculateDistance(userLocation.lat, userLocation.lng, b.lat, b.lng);
      } else {
        // 지도 중심 기준
        distA = calculateDistance(mapCenter.lat, mapCenter.lng, a.lat, a.lng);
        distB = calculateDistance(mapCenter.lat, mapCenter.lng, b.lat, b.lng);
      }
      
      return distA - distB;
    });
  }, [places, filter, userLocation, mapCenter]);

  return {
    places,
    filteredPlaces,
    filter,
    setFilter,
    favorites,
    toggleFavorite,
    isFavorite,
    selectedPlace,
    selectPlace,
    setViewportMode,
    setRadiusMode,
    getDistanceText,
    addPlaces
  };
}
