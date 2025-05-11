// src/components/NaverMap.tsx
import { useCallback, useEffect, useRef, useState, memo } from 'react';
import type { Place, PlaceCategory } from '@/types';
import { MARKER_COLORS } from '@/lib/constants';
import { MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button.tsx';

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  width?: string;
  height?: string;
  currentLocation: { lat: number; lng: number };
  places: Place[];
  selectedPlace: Place | null;
  onPlaceSelect: (place: Place) => void;
  searchRadius?: number;
  onSearchInView?: (bounds: { sw: {lat: number, lng: number}, ne: {lat: number, lng: number} }) => void;
}

// 마커 HTML 생성 함수 - 모던한 단일 라벨 디자인
const createMarkerHtml = (place: Place, isSelected: boolean) => {
  const color = MARKER_COLORS[place.category as PlaceCategory] || '#FF6B6B';
  
  // 카테고리와 이름을 하나로 합친 모던한 디자인
  return `
    <div style="
      display:flex; flex-direction:column; align-items:center;
      font-family:'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif;
    ">
      <div style="
        background:white; 
        padding:6px 10px; 
        border-radius:8px;
        box-shadow:0 2px 6px rgba(0,0,0,0.15);
        white-space:nowrap;
        margin-bottom:5px;
        display:flex;
        flex-direction:row;
        align-items:center;
        max-width:180px;
        overflow:hidden;
        transform:${isSelected ? 'scale(1.05)' : 'scale(1)'};
        transition:transform 0.2s ease;
      ">
        <div style="
          background-color:${color};
          color:white;
          font-size:10px;
          font-weight:600;
          padding:2px 6px;
          border-radius:4px;
          margin-right:6px;
          white-space:nowrap;
          text-overflow:ellipsis;
        ">${place.category}</div>
        <div style="
          font-size:12px;
          font-weight:600;
          white-space:nowrap;
          overflow:hidden;
          text-overflow:ellipsis;
        ">${place.name}</div>
      </div>
      <div style="
        width:${isSelected ? 16 : 12}px;
        height:${isSelected ? 16 : 12}px;
        background-color:${color};
        border:2px solid white;
        border-radius:50%;
        box-shadow:0 2px 5px rgba(0,0,0,0.2);
      "></div>
    </div>
  `;
};

function NaverMapComponent({
  width = '100%',
  height = '100%',
  currentLocation,
  places,
  selectedPlace,
  onPlaceSelect,
  searchRadius = 1000,
  onSearchInView,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const myLocationMarkerRef = useRef<any>(null);
  const isInitializedRef = useRef<boolean>(false);
  const [loaded, setLoaded] = useState(false);
  const [mapCenter, setMapCenter] = useState(currentLocation); // 지도 중심 상태 추가
  
  // 네이버 지도 스크립트 로드 - 최초 1회만 실행
  useEffect(() => {
    if (document.getElementById('naver-maps-script')) {
      setLoaded(true);
      return;
    }
    
    const script = document.createElement('script');
    script.id = 'naver-maps-script';
    script.async = true;
    script.defer = true;
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${import.meta.env.VITE_NAVER_MAPS_CLIENT_ID}`;
    script.onload = () => setLoaded(true);
    document.head.appendChild(script);
    
    return () => {
      // 클린업 로직 (필요시)
    };
  }, []);
  
  // 현재 위치 마커 생성 함수
  const createMyLocationMarker = () => {
    if (!mapRef.current || !window.naver) return null;
    
    const { naver } = window;
    const coord = new naver.maps.LatLng(
      currentLocation.lat,
      currentLocation.lng
    );
    
    // 현재 위치 마커 HTML
    const html = `
      <div style="position: relative;">
        <div style="
          width: 18px;
          height: 18px;
          background-color: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
          position: relative;
          z-index: 2;
        "></div>
        <div style="
          position: absolute;
          top: -12px;
          left: -12px;
          width: 36px;
          height: 36px;
          background-color: rgba(66, 133, 244, 0.2);
          border-radius: 50%;
          animation: pulse 2s infinite;
          z-index: 1;
        "></div>
      </div>
      <style>
        @keyframes pulse {
          0% { transform: scale(0.8); opacity: 0.8; }
          50% { transform: scale(1.2); opacity: 0.4; }
          100% { transform: scale(0.8); opacity: 0.8; }
        }
      </style>
    `;
    
    // 마커 생성
    return new naver.maps.Marker({
      position: coord,
      map: mapRef.current,
      icon: {
        content: html,
        anchor: new naver.maps.Point(9, 9), // 중앙 기준점
      },
      zIndex: 300, // 가장 위에 표시
    });
  };
  
  // 맵 이벤트 핸들러 등록
  const setupMapEvents = useCallback(() => {
    if (!mapRef.current || !window.naver) return;
    
    const { naver } = window;
    
    // 지도 드래그 종료 시 현재 중심점 업데이트
    naver.maps.Event.addListener(mapRef.current, 'dragend', () => {
      const center = mapRef.current.getCenter();
      setMapCenter({ 
        lat: center.lat(), 
        lng: center.lng() 
      });
      
      // 반경 원 중심 업데이트
      if (circleRef.current) {
        circleRef.current.setCenter(center);
      }
    });
    
    // 줌 변경 시 이벤트
    naver.maps.Event.addListener(mapRef.current, 'zoom_changed', () => {
      const center = mapRef.current.getCenter();
      setMapCenter({ 
        lat: center.lat(), 
        lng: center.lng() 
      });
    });
    
    // 지도 클릭 이벤트 (필요시)
    // naver.maps.Event.addListener(mapRef.current, 'click', (e) => {
    //   console.log('지도 클릭:', e.coord.lat(), e.coord.lng());
    // });
  }, []);

  // 지도 초기화 - 최초 로드 시에만 생성
  useEffect(() => {
    if (!loaded || !containerRef.current || !window.naver) return;
    
    const { naver } = window;
    const coord = new naver.maps.LatLng(
      currentLocation.lat,
      currentLocation.lng
    );

    // 맵이 없을 때만 생성 (최초 1회)
    if (!mapRef.current) {
      console.log('지도 인스턴스 생성');
      mapRef.current = new naver.maps.Map(containerRef.current, {
        center: coord,
        zoom: 14,
        zoomControl: true,
        logoControl: false,
        mapDataControl: false,
        mapTypeControl: true,
        zoomControlOptions: { position: naver.maps.Position.TOP_RIGHT },
      });
      
      // 반경 원 생성
      circleRef.current = new naver.maps.Circle({
        map: mapRef.current,
        center: coord,
        radius: searchRadius,
        strokeColor: '#5347AA',
        strokeOpacity: 0.5,
        strokeWeight: 2,
        fillColor: '#5347AA',
        fillOpacity: 0.1,
      });
      
      // 지도 이벤트 설정
      setupMapEvents();
      
      isInitializedRef.current = true;
    }
    
    // 언마운트 시 정리
    return () => {
      // 컴포넌트가 완전히 제거될 때만 수행
      if (typeof window !== 'undefined') {
        if (circleRef.current) {
          circleRef.current.setMap(null);
          circleRef.current = null;
        }
        markersRef.current.forEach(marker => marker.setMap(null));
      }
    };
  }, [loaded, currentLocation, searchRadius, setupMapEvents]);
  
  // 현재 위치 변경 시 반경 원도 함께 업데이트
  useEffect(() => {
    if (!mapRef.current || !circleRef.current || !window.naver) return;
    
    const coord = new window.naver.maps.LatLng(
      currentLocation.lat,
      currentLocation.lng
    );
    
    // 반경 원 중심 업데이트
    circleRef.current.setCenter(coord);
    circleRef.current.setRadius(searchRadius);
    
    // 반경 원이 지도에 표시되어 있지 않다면 다시 표시
    if (!circleRef.current.getMap()) {
      circleRef.current.setMap(mapRef.current);
    }
  }, [currentLocation, searchRadius]);

  // 탭 포커스 시 이벤트 리스너 추가
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && mapRef.current && isInitializedRef.current) {
        // 탭이 다시 활성화되었을 때 지도 인스턴스를 유지하고 강제 리사이즈
        window.naver?.maps?.Event.trigger(mapRef.current, 'resize');
        
        // 반경 원이 제거되었다면 다시 표시
        if (circleRef.current && !circleRef.current.getMap()) {
          circleRef.current.setMap(mapRef.current);
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);
  
  // 마커 업데이트 - 장소 목록이나 선택된 장소가 변경될 때만 실행
  useEffect(() => {
    if (!loaded || !mapRef.current || !window.naver) return;
    
    const { naver } = window;
    
    // 기존 마커 제거
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];
    
    // 마커가 너무 많으면 클러스터링 또는 필터링 고려
    // 여기서는 200개로 제한 (성능 최적화)
    const visiblePlaces = places.slice(0, 200);
    
    visiblePlaces.forEach(place => {
      const pos = new naver.maps.LatLng(place.lat, place.lng);
      const isSel = selectedPlace?.id === place.id;
      
      const html = createMarkerHtml(place, isSel);
      
      const marker = new naver.maps.Marker({
        position: pos,
        map: mapRef.current,
        icon: {
          content: html,
          anchor: new naver.maps.Point(0, 50),
        },
        zIndex: isSel ? 200 : 100,
      });
      
      naver.maps.Event.addListener(marker, 'click', () => onPlaceSelect(place));
      markersRef.current.push(marker);
    });
    
    // 선택된 장소가 있으면 해당 장소로 지도 이동
    if (selectedPlace) {
      const selectedPos = new naver.maps.LatLng(
        selectedPlace.lat, 
        selectedPlace.lng
      );
      mapRef.current.setCenter(selectedPos);
      setMapCenter({ 
        lat: selectedPlace.lat, 
        lng: selectedPlace.lng 
      });
    }
  }, [loaded, places, selectedPlace, onPlaceSelect]);

  // 맵 센터 재조정 함수 - 현재 위치로 이동
  const recenter = useCallback(() => {
    if (!mapRef.current || !window.naver) return;
    
    const { naver } = window;
    const coord = new naver.maps.LatLng(
      currentLocation.lat,
      currentLocation.lng
    );
    
    // 지도 중심 변경
    mapRef.current.setCenter(coord);
    mapRef.current.setZoom(14);
    
    // 지도 중심 상태 업데이트
    setMapCenter(currentLocation);
    
    // 반경 원 중심 업데이트
    if (circleRef.current) {
      circleRef.current.setCenter(coord);
      circleRef.current.setRadius(searchRadius);
    }
  }, [currentLocation, searchRadius]);

  // 현재 지도에서 검색 핸들러
  const handleSearchInCurrentView = useCallback(() => {
    if (!mapRef.current || !window.naver) return;
    
    const { naver } = window;
    const bounds = mapRef.current.getBounds();
    
    // 경계 정보 추출
    const boundInfo = {
      sw: { 
        lat: bounds.getSW().lat(), 
        lng: bounds.getSW().lng() 
      },
      ne: { 
        lat: bounds.getNE().lat(), 
        lng: bounds.getNE().lng() 
      }
    };
    
    console.log('현재 지도 영역에서 검색:', boundInfo);
    
    // 상위 컴포넌트에 이벤트 전달
    if (onSearchInView) {
      onSearchInView(boundInfo);
    } else {
      // 기본 동작 (알림)
      alert(`현재 지도 영역 내에서 업체를 검색합니다.\n남서(${boundInfo.sw.lat.toFixed(4)}, ${boundInfo.sw.lng.toFixed(4)}) ~ 북동(${boundInfo.ne.lat.toFixed(4)}, ${boundInfo.ne.lng.toFixed(4)})`);
    }
  }, [onSearchInView]);
  
  // 현재 위치 마커 생성 및 업데이트
  useEffect(() => {
    if (!loaded || !mapRef.current || !window.naver) return;
    
    // 이전 마커 제거
    if (myLocationMarkerRef.current) {
      myLocationMarkerRef.current.setMap(null);
      myLocationMarkerRef.current = null;
    }
    
    // 새 마커 생성
    myLocationMarkerRef.current = createMyLocationMarker();
    
    // cleanup
    return () => {
      if (myLocationMarkerRef.current) {
        myLocationMarkerRef.current.setMap(null);
      }
    };
  }, [loaded, currentLocation]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full"
      style={{ width, height }}
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-white">
          <span className="text-gray-500">지도를 불러오는 중...</span>
        </div>
      )}
      
      {/* 현재 위치 버튼 */}
      <Button 
        variant="outline" 
        className="absolute bottom-24 right-4 z-20 shadow-md" 
        onClick={recenter}
      >
        <MapPin className="h-4 w-4" />
      </Button>
      
      {/* 현재 지도에서 검색 버튼 */}
      <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center">
        <Button 
          variant="default" 
          className="rounded-full px-6 py-2 shadow-md bg-blue-500 hover:bg-blue-600 text-white"
          onClick={handleSearchInCurrentView}
        >
          <Search className="h-4 w-4 mr-2" />
          현 지도에서 검색
        </Button>
      </div>
    </div>
  );
}

// 메모이제이션으로 불필요한 렌더링 방지
export default memo(NaverMapComponent);
