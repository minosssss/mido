// src/components/NaverMap.tsx
import { useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    naver: any;
  }
}

interface NaverMapProps {
  width?: string;
  height?: string;
  onMapLoad?: (map: any) => void;
}

export default function NaverMap({
                                   width = '100%',
                                   height = '100%',
                                   onMapLoad,
                                 }: NaverMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
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

  // 2) 스크립트 로드 후, 현재 위치 받아서 지도 초기화
  useEffect(() => {
    if (!loaded || !containerRef.current) return;

    const initMap = (lat: number, lng: number) => {
      const coord = new window.naver.maps.LatLng(lat, lng);
      const map = new window.naver.maps.Map(containerRef.current!, {
        center: coord,
        zoom: 14,
      });
      new window.naver.maps.Marker({ position: coord, map });
      onMapLoad?.(map);
    };

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => initMap(coords.latitude, coords.longitude),
      (error) => {
        console.warn('위치 정보 사용 불가, 기본 위치로 표시합니다.', error);
        // 서울 시청 좌표(기본)
        initMap(37.5665, 126.9780);
      },
      { enableHighAccuracy: true }
    );
  }, [loaded, onMapLoad]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className="bg-gray-100"  /* 로딩 중 회색 배경 */
    />
  );
}
