export type Place = {
  id: string;
  name: string;          // 업체명
  address: string;       // 주소
  region: Region;        // 지역 
  category: PlaceCategory;
  representative?: string; // 대표자
  tel?: string;          // 전화번호
  lat: number;           // 위도
  lng: number;           // 경도
  aggregateType?: string; // 골재원(종류) - 골재 생산업체만 해당
  businessHours?: string;
  rating?: number;
  tags?: string[];
  imageUrl?: string;
};

// 업로드된 데이터에 맞게 카테고리 수정
export const PLACE_CATEGORIES = ['건설자원협회', '레미콘공장', '골재생산업체'] as const;
export type PlaceCategory = typeof PLACE_CATEGORIES[number];

export const REGIONS = [
  '전체', '서울', '인천', '경기', '강원', '부산', '울산', '경남',
  '대구', '경북', '대전', '세종', '충남', '충북', '광주', '전남', '전북', '제주',
] as const;
export type Region = typeof REGIONS[number];

export type MapOptions = {
  center?: {
    lat: number;
    lng: number;
  };
  zoom?: number;
  minZoom?: number;
  maxZoom?: number;
};

export type PlaceFilter = {
  region: Region;
  categories: Set<PlaceCategory>;
  radius: number;
  keyword?: string;
};

export type Coordinates = {
  lat: number;
  lng: number;
};
