// src/components/Layout.tsx
import { useState, useCallback, useMemo } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import FilterPanel from './FilterPanel';
import PlaceList from '@/components/PlaceList';
import NaverMap from '@/components/NaverMap';
import useGeolocation from '@/hooks/useGeolocation';
import usePlaces from '@/hooks/usePlaces';
import type { Place, PlaceFilter } from '@/types';
import MOCK_PLACES from '@/data/mockPlaces';
import { FunnelPlus } from 'lucide-react';

export default function Layout() {
  // 지오로케이션 훅 - 마지막 위치 저장 활성화
  const { coordinates, loading: locationLoading } = useGeolocation({ 
    enableHighAccuracy: true,
    persistLastLocation: true
  });
  
  const [sheetOpen, setSheetOpen] = useState(false);
  
  // Places 훅
  const {
    filteredPlaces,
    filter,
    setFilter,
    favorites,
    toggleFavorite,
    selectedPlace,
    selectPlace,
  } = usePlaces(MOCK_PLACES, { userLocation: coordinates });

  // 필터 변경 핸들러 - 메모이제이션
  const handleFilterChange = useCallback((newFilter: PlaceFilter) => {
    setFilter(newFilter);
  }, [setFilter]);

  // 네이버 지도 길찾기 핸들러 - 메모이제이션
  const handleNavigate = useCallback((place: Place) => {
    const lat = place.lat;
    const lng = place.lng;
    const name = encodeURIComponent(place.name);
    const schemeUrl = `nmap://route/public?dlat=${lat}&dlng=${lng}&dname=${name}&appname=내%20주변%20업체%20찾기`;
    const webUrl = `https://map.naver.com/v5/search/${name}`;

    const ua = navigator.userAgent;
    const isiOS = /iPhone|iPad|iPod/.test(ua);
    const isAndroid = /Android/.test(ua);

    if (isiOS || isAndroid) {
      window.location.href = schemeUrl;
      setTimeout(() => (window.location.href = webUrl), 1500);
    } else {
      window.open(webUrl, '_blank');
    }
  }, []);
  
  // 모바일에서 장소 선택 시 시트 닫기 + 장소 선택 핸들러
  const handleMobilePlaceSelect = useCallback((place: Place) => {
    selectPlace(place);
    setSheetOpen(false);
  }, [selectPlace]);
  
  // 현재 지도 영역에서 검색 처리
  const handleSearchInCurrentView = useCallback((bounds: { sw: {lat: number, lng: number}, ne: {lat: number, lng: number} }) => {
    console.log('현재 지도 영역에서 검색:', bounds);
    
    // bounds 정보를 이용해 해당 영역 내 업체 필터링
    // 예: 서버에 API 요청 또는 프론트엔드에서 필터링
    
    // 예시: 알림으로 영역 표시
    alert(`지도 영역 내 업체 ${filteredPlaces.length}개 검색 완료 (남서: ${bounds.sw.lat.toFixed(4)}, ${bounds.sw.lng.toFixed(4)} / 북동: ${bounds.ne.lat.toFixed(4)}, ${bounds.ne.lng.toFixed(4)})`);
  }, [filteredPlaces.length]);

  // 렌더링 최적화를 위한 메모이제이션된 지도 컴포넌트
  const mapComponent = useMemo(() => {
    if (locationLoading) {
      return (
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-gray-500">위치 정보를 가져오는 중...</span>
        </div>
      );
    }
    
    return (
      <NaverMap
        width="100%"
        height="100%"
        currentLocation={coordinates}
        places={filteredPlaces}
        selectedPlace={selectedPlace}
        onPlaceSelect={selectPlace}
        searchRadius={filter.radius}
        onSearchInView={handleSearchInCurrentView}
      />
    );
  }, [locationLoading, coordinates, filteredPlaces, selectedPlace, selectPlace, filter.radius, handleSearchInCurrentView]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-14 flex items-center px-4 shadow-sm z-10">
        <h1 className="text-lg font-semibold">내 주변 업체 찾기</h1>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setSheetOpen(true)}
        >
          ☰
        </Button>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-r h-full">
          {/* 1) 필터 */}
          <FilterPanel filter={filter} onFilterChange={handleFilterChange} />
          {/* 2) 목록 (스크롤) */}
          <div className="flex-1 overflow-y-auto">
            <PlaceList
              places={filteredPlaces}
              favorites={favorites}
              selectedPlace={selectedPlace}
              onPlaceSelect={selectPlace}
              onFavoriteToggle={toggleFavorite}
              onNavigate={handleNavigate}
            />
          </div>
        </aside>

        {/* Map */}
        <main className="relative flex-1">
          {mapComponent}
        </main>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="lg:hidden border-accent-foreground fixed bottom-10 right-16 z-20">
            <FunnelPlus />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="flex flex-col h-[80vh] p-0 rounded-t-lg">
          {/* 1) 필터 */}
          <div className="p-4 border-b">
            <FilterPanel filter={filter} onFilterChange={handleFilterChange} />
          </div>
          {/* 2) 목록 */}
          <div className="flex-1 overflow-y-auto p-4">
            <PlaceList
              places={filteredPlaces}
              favorites={favorites}
              selectedPlace={selectedPlace}
              onPlaceSelect={handleMobilePlaceSelect}
              onFavoriteToggle={toggleFavorite}
              onNavigate={handleNavigate}
            />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
