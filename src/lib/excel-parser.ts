// src/lib/excel-parser.ts
import type { Place, PlaceCategory, Region } from '@/types';
import { REGIONS } from '@/types';

interface RawPlaceData {
  업체명?: string;
  대표자?: string;
  주소?: string;
  전화번호?: string;
  // 추가 필드가 있을 수 있음
}

interface GeocodingResult {
  lat: number;
  lng: number;
}

// 주소에서 지역 추출 함수
export function extractRegionFromAddress(address: string): Region {
  if (!address) return '서울';

  const regions = [...REGIONS];
  // '전체'를 제외하고 주소에서 지역을 찾기
  const foundRegion = regions
    .slice(1)
    .find(region => address.startsWith(region));

  return foundRegion || '서울';
}

// 네이버 지오코딩 API 호출 (실제 구현에서는 API 키가 필요)
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // 실제 API 연동 시 구현
  // 예시 데이터 (임의 좌표)
  return new Promise(resolve => {
    setTimeout(() => {
      // 임시 구현: 주소에서 고정된 좌표 + 약간의 변동값 반환
      // 실제로는 네이버/카카오 지오코딩 API 활용 필요
      const lat = 37.5 + (Math.random() * 0.1);
      const lng = 127.0 + (Math.random() * 0.1);
      resolve({ lat, lng });
    }, 10); 
  });
}

// 엑셀 파일을 파싱해 장소 데이터 생성
export async function parseExcelData(
  buffer: ArrayBuffer,
  category: PlaceCategory,
  options?: {
    idPrefix?: string;
    aggregateTypeField?: string; // 골재생산업체인 경우 '골재원' 필드명 
  }
): Promise<Place[]> {
  try {
    // SheetJS 라이브러리는 런타임에 로드 (빌드 시 제외됨)
    const XLSX = await import('xlsx');
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = XLSX.utils.sheet_to_json<RawPlaceData>(sheet);

    const places: Place[] = [];
    const idPrefix = options?.idPrefix || category.substring(0, 2);
    
    for (let i = 0; i < rawData.length; i++) {
      const item = rawData[i];
      
      if (!item.업체명 || !item.주소) continue;
      
      const address = item.주소;
      const region = extractRegionFromAddress(address);
      
      // 지오코딩 API 호출
      const coordinates = await geocodeAddress(address);
      
      if (coordinates) {
        const place: Place = {
          id: `${idPrefix}-${i}`,
          name: item.업체명,
          address: address,
          region: region,
          category: category,
          representative: item.대표자,
          tel: item.전화번호,
          lat: coordinates.lat,
          lng: coordinates.lng
        };
        
        // 골재생산업체인 경우 골재원 필드 추가
        if (category === '골재생산업체' && options?.aggregateTypeField) {
          const aggregateField = options.aggregateTypeField;
          // @ts-ignore
          place.aggregateType = item[aggregateField];
        }
        
        places.push(place);
      }
    }
    
    return places;
    
  } catch (error) {
    console.error('엑셀 파일 파싱 중 오류:', error);
    return [];
  }
}

// 샘플 데이터 생성 (테스트용)
export function generateSamplePlaces(count: number): Place[] {
  const places: Place[] = [];
  const categories: PlaceCategory[] = ['건설자원협회', '레미콘공장', '골재생산업체'];
  const regions = [...REGIONS.slice(1)]; // '전체'를 제외한 지역들
  
  for (let i = 0; i < count; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)];
    const region = regions[Math.floor(Math.random() * regions.length)];
    
    const place: Place = {
      id: `sample-${i}`,
      name: `샘플 업체 ${i+1}`,
      address: `${region} 테스트구 샘플로 ${i+1}`,
      region: region,
      category: category,
      representative: `홍길동${i}`,
      tel: `02-123-${1000 + i}`,
      lat: 37.5 + (Math.random() - 0.5) * 0.2,
      lng: 127.0 + (Math.random() - 0.5) * 0.2,
    };
    
    if (category === '골재생산업체') {
      place.aggregateType = Math.random() > 0.5 ? '모래' : '자갈';
    }
    
    places.push(place);
  }
  
  return places;
}

export default {
  parseExcelData,
  generateSamplePlaces,
  geocodeAddress,
  extractRegionFromAddress
};
