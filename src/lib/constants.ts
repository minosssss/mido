// 기본 중심 좌표 (서울 시청)
export const DEFAULT_CENTER = {
  lat: 37.5665,
  lng: 126.9780,
};

// 기본 줌 레벨
export const DEFAULT_ZOOM = 14;

// 최소/최대 줌 레벨
export const MIN_ZOOM = 10;
export const MAX_ZOOM = 19;

// 기본 검색 반경 (미터)
export const DEFAULT_RADIUS = 1000;
export const MIN_RADIUS = 500;
export const MAX_RADIUS = 5000;
export const RADIUS_STEP = 100;

// 미터당 픽셀 계산 (줌 레벨에 따라 다름)
export const METERS_PER_PIXEL = {
  10: 38.2,
  11: 19.1,
  12: 9.55,
  13: 4.78,
  14: 2.39,
  15: 1.19,
  16: 0.6,
  17: 0.3,
  18: 0.15,
  19: 0.07,
};

// 지역별 중심 좌표
export const REGION_COORDINATES = {
  '서울': { lat: 37.5665, lng: 126.9780 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '경기': { lat: 37.4138, lng: 127.5183 },
  '강원': { lat: 37.8228, lng: 128.1555 },
  '부산': { lat: 35.1796, lng: 129.0756 },
  '울산': { lat: 35.5384, lng: 129.3114 },
  '경남': { lat: 35.4606, lng: 128.2132 },
  '대구': { lat: 35.8714, lng: 128.6014 },
  '경북': { lat: 36.4919, lng: 128.8889 },
  '대전': { lat: 36.3504, lng: 127.3845 },
  '세종': { lat: 36.4801, lng: 127.2882 },
  '충남': { lat: 36.6588, lng: 126.6728 },
  '충북': { lat: 36.6357, lng: 127.4912 },
  '광주': { lat: 35.1595, lng: 126.8526 },
  '전남': { lat: 34.8679, lng: 126.9910 },
  '전북': { lat: 35.8242, lng: 127.1480 },
  '제주': { lat: 33.4890, lng: 126.4983 },
};

// 지도 마커 색상
export const MARKER_COLORS = {
  '건설자원협회': '#4CAF50', // 녹색
  '레미콘공장': '#2196F3',        // 파란색
  '골재생산업체': '#FFC107',      // 노란색
};

// 거리 계산 함수 (하버사인 공식 - 구면 좌표계에서의 두 점 사이 거리)
export function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // 지구 반지름 (미터)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터 단위 거리
}
