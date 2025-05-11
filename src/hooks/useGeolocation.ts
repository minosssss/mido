// src/hooks/useGeolocation.ts
import { useState, useEffect, useRef } from 'react';
import type { Coordinates } from '@/types';
import { DEFAULT_CENTER } from '@/lib/constants';
import useLocalStorage from './useLocalStorage';

interface UseGeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  persistLastLocation?: boolean; // 마지막 위치 저장 여부
}

interface UseGeolocationReturn {
  coordinates: Coordinates;
  loading: boolean;
  error: GeolocationPositionError | null;
  setCustomCoordinates?: (coords: Coordinates) => void; // 수동으로 좌표 설정 (테스트용)
}

export default function useGeolocation(
  options: UseGeolocationOptions = {}
): UseGeolocationReturn {
  // 마지막 위치를 로컬 스토리지에 저장 (앱 재로드 시 빠르게 표시)
  const [lastKnownLocation, setLastKnownLocation] = useLocalStorage<Coordinates | null>(
    'last-location', 
    null
  );
  
  // 초기 좌표 설정 (마지막 저장 위치가 있으면 사용, 없으면 기본값)
  const initialCoordinates = (options.persistLastLocation && lastKnownLocation) 
    ? lastKnownLocation 
    : DEFAULT_CENTER;
  
  const [coordinates, setCoordinates] = useState<Coordinates>(initialCoordinates);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<GeolocationPositionError | null>(null);
  
  // 위치 갱신 횟수를 제한하기 위한 Ref
  const lastUpdateTimeRef = useRef<number>(0);
  const watchIdRef = useRef<number | null>(null);

  // 커스텀 좌표 설정 함수 (개발/테스트 시 유용)
  const setCustomCoordinates = (coords: Coordinates) => {
    setCoordinates(coords);
    if (options.persistLastLocation) {
      setLastKnownLocation(coords);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      // 브라우저에서 위치 정보를 지원하지 않는 경우
      const customError = {
        code: 0,
        message: 'Geolocation is not supported by this browser.',
        PERMISSION_DENIED: 1,
        POSITION_UNAVAILABLE: 2,
        TIMEOUT: 3,
      } as GeolocationPositionError;
      
      setError(customError);
      setLoading(false);
      return;
    }

    // 최소 업데이트 간격 (밀리초) - 너무 자주 업데이트되는 것 방지
    const MIN_UPDATE_INTERVAL = 1000; 

    const handleSuccess = (position: GeolocationPosition) => {
      const now = Date.now();
      
      // 마지막 업데이트 후 MIN_UPDATE_INTERVAL 이내면 업데이트 건너뛰기
      if (now - lastUpdateTimeRef.current < MIN_UPDATE_INTERVAL) {
        return;
      }
      
      const newCoordinates = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      
      setCoordinates(newCoordinates);
      
      // 마지막 위치 저장 (옵션 활성화된 경우)
      if (options.persistLastLocation) {
        setLastKnownLocation(newCoordinates);
      }
      
      setLoading(false);
      lastUpdateTimeRef.current = now;
    };

    const handleError = (error: GeolocationPositionError) => {
      setError(error);
      setLoading(false);
      console.warn('Error getting geolocation:', error.message);
    };

    // 위치 정보 가져오기 옵션
    const geolocationOptions: PositionOptions = {
      enableHighAccuracy: options.enableHighAccuracy ?? true,
      timeout: options.timeout ?? 10000,
      maximumAge: options.maximumAge ?? 0,
    };

    // 일회성으로 현재 위치 가져오기
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, geolocationOptions);
    
    // 위치 추적 시작 (변경 사항 감지)
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      geolocationOptions
    );

    // 클린업: 컴포넌트 언마운트 시 위치 추적 중지
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [
    options.enableHighAccuracy, 
    options.timeout, 
    options.maximumAge, 
    options.persistLastLocation, 
    setLastKnownLocation
  ]);

  return { 
    coordinates, 
    loading, 
    error,
    setCustomCoordinates // 개발용 함수
  };
}
