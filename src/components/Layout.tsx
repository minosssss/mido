// src/components/Layout.tsx
import { useCallback, useMemo, useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FilterPanel from './FilterPanel';
import PlaceList from '@/components/PlaceList';
import NaverMap from '@/components/NaverMap';
import FileUpload from '@/components/FileUpload';
import useGeolocation from '@/hooks/useGeolocation';
import usePlaces from '@/hooks/usePlaces';
import type { Place, PlaceCategory, PlaceFilter } from '@/types';
import MOCK_PLACES from '@/data/mockPlaces';
import { FunnelPlus, Map, Upload } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

export default function Layout() {
  // 지오로케이션 훅 - 마지막 위치 저장 활성화
  const { coordinates, loading: locationLoading } = useGeolocation({
    enableHighAccuracy: true,
    persistLastLocation: true,
  });

  const [sheetOpen, setSheetOpen] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Places 훅
  const {
    places,
    filteredPlaces,
    filter,
    setFilter,
    favorites,
    toggleFavorite,
    selectedPlace,
    selectPlace,
    addPlaces,
    setViewportMode,
  } = usePlaces(MOCK_PLACES, { userLocation: coordinates });

  // 필터 변경 핸들러 - 메모이제이션
  const handleFilterChange = useCallback(
    (newFilter: PlaceFilter) => {
      setFilter(newFilter);
    },
    [setFilter],
  );

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
  const handleMobilePlaceSelect = useCallback(
    (place: Place) => {
      selectPlace(place);
      setSheetOpen(false);
    },
    [selectPlace],
  );

  // 현재 지도 영역에서 검색 처리
  const handleSearchInCurrentView = useCallback(
    (bounds: { sw: { lat: number; lng: number }; ne: { lat: number; lng: number } }) => {
      console.log('현재 지도 영역에서 검색:', bounds);

      // 지도 영역 모드로 변경
      setViewportMode(bounds);
    },
    [setViewportMode],
  );

  // 데이터 업로드 처리 핸들러
  const handleDataParsed = useCallback(
    (newPlaces: Place[], category: PlaceCategory) => {
      addPlaces(newPlaces);
      console.log(`${newPlaces.length}개의 ${category} 데이터가 추가되었습니다.`);

      // 업로드 후 다이얼로그 닫기
      setIsUploadDialogOpen(false);
    },
    [addPlaces],
  );

  // 업로드 오류 처리 핸들러
  const handleUploadError = useCallback((error: string) => {
    console.error('파일 업로드 오류:', error);
    // 여기에 알림이나 토스트 추가 가능
  }, []);

  // 모바일 필터 토글 핸들러
  const handleToggleMobileFilter = useCallback(() => {
    setSheetOpen(true);
  }, []);

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
        searchMode={filter.searchMode}
        onToggleMobileFilter={handleToggleMobileFilter}
        onSearchInView={handleSearchInCurrentView}
      />
    );
  }, [
    locationLoading,
    coordinates,
    filteredPlaces,
    selectedPlace,
    selectPlace,
    filter.radius,
    filter.searchMode,
    handleSearchInCurrentView,
    handleToggleMobileFilter,
  ]);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-14 flex items-center px-4 shadow-sm z-10">
        <h1 className="text-lg font-semibold">내 주변 업체 찾기</h1>
        <div className="ml-auto flex gap-2">
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Upload className="w-4 h-4" />
                <span className="hidden sm:inline">데이터 업로드</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>업체 데이터 업로드</DialogTitle>
              </DialogHeader>
              <Tabs defaultValue="resource" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="resource">건설자원협회</TabsTrigger>
                  <TabsTrigger value="concrete">레미콘공장</TabsTrigger>
                  <TabsTrigger value="aggregate">골재생산업체</TabsTrigger>
                </TabsList>

                <TabsContent value="resource">
                  <FileUpload
                    onDataParsed={handleDataParsed}
                    category="건설자원협회"
                    onError={handleUploadError}
                    idPrefix="RECY"
                  />
                </TabsContent>

                <TabsContent value="concrete">
                  <FileUpload
                    onDataParsed={handleDataParsed}
                    category="레미콘공장"
                    onError={handleUploadError}
                    idPrefix="REMI"
                  />
                </TabsContent>

                <TabsContent value="aggregate">
                  <FileUpload
                    onDataParsed={handleDataParsed}
                    category="골재생산업체"
                    onError={handleUploadError}
                    idPrefix="AGGR"
                    aggregateTypeField="골재원"
                  />
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSheetOpen(true)}
          >
            ☰
          </Button>
        </div>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex flex-col w-80 border-r h-full">
          <div className="p-2 border-b overflow-y-auto">
            <div className="px-2 flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">검색 및 필터</h2>
            </div>
            <FilterPanel filter={filter} onFilterChange={handleFilterChange} />
          </div>
          {/* 목록 (스크롤) */}
          <div className="flex items-center justify-between px-4 py-2 border-b">
            <h2 className="font-medium">
              검색 결과 ({places.length}개)
            </h2>
            <span className="text-muted-foreground text-xs ml-1">(최대 200개)</span>
          </div>
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
        <main className="relative flex-1">{mapComponent}</main>

        {/*/!* 데이터 통계 표시 오버레이 *!/*/}
        {/*<div className="absolute top-28 z-10 bg-white dark:bg-gray-800 p-2 rounded-lg shadow-md border text-xs">*/}
        {/*  <div className="flex items-center gap-2">*/}
        {/*    <Map className="h-4 w-4 text-gray-500" />*/}
        {/*    <span>데이터 현황: </span>*/}
        {/*    <span className="text-blue-600 font-medium">*/}
        {/*      건설자원협회 {places.filter(p => p.category === '건설자원협회').length}개*/}
        {/*    </span>*/}
        {/*    <span className="text-green-600 font-medium">*/}
        {/*      레미콘공장 {places.filter(p => p.category === '레미콘공장').length}개*/}
        {/*    </span>*/}
        {/*    <span className="text-orange-600 font-medium">*/}
        {/*      골재생산업체 {places.filter(p => p.category === '골재생산업체').length}개*/}
        {/*    </span>*/}
        {/*  </div>*/}
        {/*</div>*/}
      </div>

      {/* 모바일 하단 시트 */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetTrigger asChild>
          <Button
            variant="outline"
            className="lg:hidden border-accent-foreground fixed bottom-10 right-16 z-20"
          >
            <FunnelPlus className="h-4 w-4" />
          </Button>
        </SheetTrigger>
        <SheetContent side="bottom" className="flex flex-col h-[60vh] p-0 rounded-t-lg">
          {/* 필터 */}
          <div className="p-4 border-b overflow-y-auto h-[30vh]">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-medium">검색 및 필터</h2>
            </div>
            <FilterPanel filter={filter} onFilterChange={handleFilterChange} />
          </div>
          {/* 목록 */}
          <div className="flex-1 overflow-y-auto">
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
