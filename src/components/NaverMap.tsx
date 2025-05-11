// src/components/NaverMap.tsx
import { useEffect, useRef, useState } from 'react';
import type { Place, PlaceCategory } from '@/types';
import { MARKER_COLORS } from '@/lib/constants';

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
}

export default function NaverMap({
  width = '100%',
  height = '100%',
  currentLocation,
  places,
  selectedPlace,
  onPlaceSelect,
  searchRadius = 1000,
}: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const circleRef = useRef<any>(null);
  const [loaded, setLoaded] = useState(false);

  // 1) 지도 스크립트 로드
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
  }, []);

  // 2) 지도 초기화 및 현재 위치 표시
  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    const { naver } = window;
    if (!naver) return;

    // 현재 위치 좌표 설정
    const coord = new naver.maps.LatLng(currentLocation.lat, currentLocation.lng);
    
    // 지도가 초기화되지 않았다면 초기화
    if (!mapRef.current) {
      mapRef.current = new naver.maps.Map(containerRef.current, {
        center: coord,
        zoom: 14,
        zoomControl: true,
        zoomControlOptions: {
          position: naver.maps.Position.TOP_RIGHT,
        },
      });

      // 현재 위치 마커 (파란색)
      new naver.maps.Marker({
        position: coord,
        map: mapRef.current,
        icon: {
          content: `
            <div style="
              width: 20px; 
              height: 20px; 
              background-color: #006AFF; 
              border-radius: 50%; 
              border: 3px solid white;
              box-shadow: 0 0 5px rgba(0,0,0,0.3);
            "></div>
          `,
          anchor: new naver.maps.Point(10, 10),
        },
        zIndex: 100,
      });
    } else {
      // 지도가 이미 생성된 경우, 중심점만 현재 위치로 변경
      mapRef.current.setCenter(coord);
    }

    // 반경 원 표시
    if (circleRef.current) {
      circleRef.current.setMap(null);
    }

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

  }, [loaded, currentLocation, searchRadius]);

  // 3) 업체 마커 표시
  useEffect(() => {
    if (!loaded || !mapRef.current || !places.length) return;

    const { naver } = window;
    if (!naver) return;

    // 기존 마커 제거
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 새 마커 생성
    places.forEach((place) => {
      const markerPosition = new naver.maps.LatLng(place.lat, place.lng);
      
      // 카테고리에 따른 마커 색상
      const markerColor = MARKER_COLORS[place.category as PlaceCategory] || '#FF6B6B';
      
      // 마커 생성
      const marker = new naver.maps.Marker({
        position: markerPosition,
        map: mapRef.current,
        icon: {
          content: `
            <div style="
              width: 12px; 
              height: 12px; 
              background-color: ${markerColor}; 
              border-radius: 50%; 
              border: 2px solid white;
              box-shadow: 0 0 3px rgba(0,0,0,0.3);
              cursor: pointer;
            "></div>
          `,
          anchor: new naver.maps.Point(6, 6),
        },
        zIndex: 50,
      });

      // 마커 클릭 이벤트
      naver.maps.Event.addListener(marker, 'click', () => {
        onPlaceSelect(place);
      });

      markersRef.current.push(marker);
    });
  }, [loaded, places, onPlaceSelect]);

  // 4) 선택된 업체 강조 표시
  useEffect(() => {
    if (!loaded || !mapRef.current || !selectedPlace) return;

    const { naver } = window;
    if (!naver) return;

    // 선택된 업체 위치로 지도 이동
    const selectedPosition = new naver.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
    mapRef.current.setCenter(selectedPosition);
    
    // 모든 마커 다시 생성 (선택된 마커 강조)
    markersRef.current.forEach((marker) => marker.setMap(null));
    markersRef.current = [];

    // 모든 업체 마커 생성
    places.forEach((place) => {
      const isSelected = place.id === selectedPlace.id;
      const markerPosition = new naver.maps.LatLng(place.lat, place.lng);
      const markerColor = MARKER_COLORS[place.category as PlaceCategory] || '#FF6B6B';
      
      // 선택된 마커는 크기를 키우고 애니메이션 효과
      const size = isSelected ? 20 : 12;
      const markerContent = isSelected 
        ? `
          <div style="
            width: ${size}px; 
            height: ${size}px; 
            background-color: ${markerColor}; 
            border-radius: 50%; 
            border: 3px solid white;
            box-shadow: 0 0 5px rgba(0,0,0,0.5);
            cursor: pointer;
            animation: pulse 1.5s infinite;
          "></div>
          <style>
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.2); }
              100% { transform: scale(1); }
            }
          </style>
        `
        : `
          <div style="
            width: ${size}px; 
            height: ${size}px; 
            background-color: ${markerColor}; 
            border-radius: 50%; 
            border: 2px solid white;
            box-shadow: 0 0 3px rgba(0,0,0,0.3);
            cursor: pointer;
          "></div>
        `;
      
      const marker = new naver.maps.Marker({
        position: markerPosition,
        map: mapRef.current,
        icon: {
          content: markerContent,
          anchor: new naver.maps.Point(size/2, size/2),
        },
        zIndex: isSelected ? 150 : 50,
      });

      naver.maps.Event.addListener(marker, 'click', () => {
        onPlaceSelect(place);
      });

      markersRef.current.push(marker);
    });
  }, [loaded, selectedPlace, places, onPlaceSelect]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className="relative bg-gray-100"
    >
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-gray-400">지도를 불러오는 중...</div>
        </div>
      )}
    </div>
  );
}
