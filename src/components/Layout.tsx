import { useCallback, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Filter, ListFilter } from 'lucide-react';
import FilterPanel from './FilterPanel';
import PlaceList from '@/components/PlaceList';
import NaverMap from '@/components/NaverMap';
import useGeolocation from '@/hooks/useGeolocation';
import usePlaces from '@/hooks/usePlaces';
import type { PlaceFilter } from '@/types';
import MOCK_PLACES from '@/data/mockPlaces';

export default function AppLayout() {
  // 현재 위치 정보 가져오기
  const { coordinates, loading: locationLoading } = useGeolocation({
    enableHighAccuracy: true,
  });

  // 모바일 시트 상태
  const [sheetOpen, setSheetOpen] = useState(false);

  // 탭 상태 (필터 / 목록)
  const [activeTab, setActiveTab] = useState<'filter' | 'list'>('list');

  // 업체 필터링 및 데이터 관리
  const {
    filteredPlaces,
    filter,
    setFilter,
    favorites,
    toggleFavorite,
    selectedPlace,
    selectPlace,
  } = usePlaces(MOCK_PLACES, { userLocation: coordinates });

  // 필터 변경 핸들러
  const handleFilterChange = useCallback(
    (newFilter: PlaceFilter) => {
      setFilter(newFilter);
    },
    [setFilter],
  );

  // 길찾기 핸들러
  const handleNavigate = useCallback(place => {
    // 모바일 환경에서 네이버 지도 앱 실행 시도
    window.location.href = `nmap://route/public?dlat=${place.lat}&dlng=${place.lng}&dname=${encodeURIComponent(place.name)}&appname=${encodeURIComponent('내 주변 업체 찾기')}`;

    // 앱이 설치되지 않은 경우를 대비해 1초 후 웹 버전으로 이동
    setTimeout(() => {
      window.open(
        `https://map.naver.com/v5/directions/-/-/-/transit?c=${place.lng},${place.lat},15,0,0,0,dh&destination=${encodeURIComponent(place.name)}`,
        '_blank',
      );
    }, 1000);
  }, []);

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
        {/* Desktop 사이드바 */}
        <aside className="hidden lg:flex w-80 border-r flex-col h-full">
          <Tabs
            defaultValue="list"
            value={activeTab}
            onValueChange={v => setActiveTab(v as 'filter' | 'list')}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 h-12 rounded-none">
              <TabsTrigger value="filter">
                <Filter className="mr-2 h-4 w-4" />
                필터
              </TabsTrigger>
              <TabsTrigger value="list">
                <ListFilter className="mr-2 h-4 w-4" />
                목록 ({filteredPlaces.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="filter" className="flex-1 m-0 overflow-auto border-0">
              <FilterPanel filter={filter} onFilterChange={handleFilterChange} />
            </TabsContent>
            <TabsContent value="list" className="flex-1 m-0 overflow-hidden border-0">
              <PlaceList
                places={filteredPlaces}
                favorites={favorites}
                selectedPlace={selectedPlace}
                onPlaceSelect={selectPlace}
                onFavoriteToggle={toggleFavorite}
                onNavigate={handleNavigate}
              />
            </TabsContent>
          </Tabs>
        </aside>

        {/* Map */}
        <main className="relative flex-1">
          {locationLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-500">위치 정보를 가져오는 중...</div>
            </div>
          ) : (
            <NaverMap
              width="100%"
              height="100%"
              currentLocation={coordinates}
              places={filteredPlaces}
              selectedPlace={selectedPlace}
              onPlaceSelect={selectPlace}
              searchRadius={filter.radius}
            />
          )}
        </main>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="default" className="lg:hidden fixed bottom-4 right-4 z-20">
            필터 / 목록 보기
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="flex flex-col h-[80vh] p-0 rounded-t-lg">
          <Tabs
            defaultValue="list"
            value={activeTab}
            onValueChange={v => setActiveTab(v as 'filter' | 'list')}
            className="h-full flex flex-col"
          >
            <TabsList className="grid w-full grid-cols-2 h-14 rounded-none">
              <TabsTrigger value="filter" className="text-base">
                <Filter className="mr-2 h-4 w-4" />
                필터
              </TabsTrigger>
              <TabsTrigger value="list" className="text-base">
                <ListFilter className="mr-2 h-4 w-4" />
                목록 ({filteredPlaces.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="filter" className="flex-1 m-0 overflow-auto">
              <FilterPanel filter={filter} onFilterChange={handleFilterChange} />
            </TabsContent>
            <TabsContent value="list" className="flex-1 m-0 overflow-hidden">
              <PlaceList
                places={filteredPlaces}
                favorites={favorites}
                selectedPlace={selectedPlace}
                onPlaceSelect={place => {
                  selectPlace(place);
                  setSheetOpen(false);
                }}
                onFavoriteToggle={toggleFavorite}
                onNavigate={handleNavigate}
              />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  );
}
