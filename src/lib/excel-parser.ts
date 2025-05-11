// src/lib/excel-parser.ts
import type { Place, PlaceCategory, Region, Coordinates } from '@/types';
import { REGIONS } from '@/types';
import { nanoid } from '@/lib/utils';

interface RawPlaceData {
  [key: string]: any;
  업체명?: string;
  대표자?: string;
  주소?: string;
  전화번호?: string;
  대표전화?: string;
  연락처?: string;
  전화?: string;
  // 추가 필드가 있을 수 있음
}

interface GeocodingResult {
  lat: number;
  lng: number;
}

// 지역명 매핑 (축약형 -> 전체명)
const REGION_MAPPING: Record<string, Region> = {
  '서울': '서울',
  '서울시': '서울',
  '서울특별시': '서울',
  '경기': '경기',
  '경기도': '경기',
  '인천': '인천',
  '인천시': '인천',
  '인천광역시': '인천',
  '강원': '강원',
  '강원도': '강원',
  '충북': '충북',
  '충청북도': '충북',
  '충남': '충남',
  '충청남도': '충남',
  '전북': '전북',
  '전라북도': '전북',
  '전남': '전남',
  '전라남도': '전남',
  '경북': '경북',
  '경상북도': '경북',
  '경남': '경남',
  '경상남도': '경남',
  '부산': '부산',
  '부산시': '부산',
  '부산광역시': '부산',
  '대구': '대구',
  '대구시': '대구',
  '대구광역시': '대구',
  '울산': '울산',
  '울산시': '울산',
  '울산광역시': '울산',
  '광주': '광주',
  '광주시': '광주',
  '광주광역시': '광주',
  '대전': '대전',
  '대전시': '대전',
  '대전광역시': '대전',
  '세종': '세종',
  '세종시': '세종',
  '세종특별자치시': '세종',
  '제주': '제주',
  '제주도': '제주',
  '제주특별자치도': '제주'
};

// 주소에서 지역 추출 함수
export function extractRegionFromAddress(address: string): Region {
  if (!address) return '서울';

  // 주소 시작 부분에서 지역명 추출 시도
  for (const [shortRegion, fullRegion] of Object.entries(REGION_MAPPING)) {
    if (address.startsWith(shortRegion)) {
      return fullRegion;
    }
  }

  // 시/도 단위로 주소 분석
  const addressParts = address.split(' ');
  if (addressParts.length > 0) {
    const firstPart = addressParts[0];
    for (const [shortRegion, fullRegion] of Object.entries(REGION_MAPPING)) {
      if (firstPart.includes(shortRegion)) {
        return fullRegion;
      }
    }
  }

  // 기본값 반환
  return '서울';
}

// 네이버/카카오 지오코딩 API 호출 (개발용 더미 구현)
export async function geocodeAddress(address: string): Promise<GeocodingResult | null> {
  // 실제 API 연동 시 구현할 부분
  // 여기서는 개발용 더미 데이터 반환
  return new Promise(resolve => {
    setTimeout(() => {
      // 주소별로 고정된 좌표값 생성 (실제로는 API 호출 필요)
      let seed = 0;
      for (let i = 0; i < address.length; i++) {
        seed += address.charCodeAt(i);
      }
      
      // 지역에 따른 대략적인 좌표 생성
      let baseLat = 37.5;
      let baseLng = 127.0;
      
      const region = extractRegionFromAddress(address);
      
      // 지역별 대략적인 좌표 설정
      switch(region) {
        case '서울': 
          baseLat = 37.56; baseLng = 126.98; break;
        case '인천': 
          baseLat = 37.45; baseLng = 126.70; break;
        case '경기': 
          baseLat = 37.28; baseLng = 127.00; break;
        case '강원': 
          baseLat = 37.88; baseLng = 127.73; break;
        case '부산': 
          baseLat = 35.18; baseLng = 129.08; break;
        case '대구': 
          baseLat = 35.87; baseLng = 128.60; break;
        case '광주': 
          baseLat = 35.16; baseLng = 126.85; break;
        case '대전': 
          baseLat = 36.35; baseLng = 127.38; break;
        case '울산': 
          baseLat = 35.54; baseLng = 129.31; break;
        case '세종': 
          baseLat = 36.48; baseLng = 127.28; break;
        case '경남': 
          baseLat = 35.46; baseLng = 128.21; break;
        case '경북': 
          baseLat = 36.57; baseLng = 128.50; break;
        case '전남': 
          baseLat = 34.81; baseLng = 126.46; break;
        case '전북': 
          baseLat = 35.82; baseLng = 127.10; break;
        case '충남': 
          baseLat = 36.50; baseLng = 126.80; break;
        case '충북': 
          baseLat = 36.63; baseLng = 127.49; break;
        case '제주': 
          baseLat = 33.49; baseLng = 126.51; break;
      }
      
      // 같은 주소는 항상 같은 좌표 반환 + 약간의 변동성
      const variation = 0.05;
      const rng = (seed % 1000) / 1000;
      
      const lat = baseLat + (rng - 0.5) * variation;
      const lng = baseLng + ((seed % 713) / 713 - 0.5) * variation;
      
      resolve({ lat, lng });
    }, 10); 
  });
}

// 필드명 정규화 함수 (다양한 형태의 필드명을 표준화)
function normalizeFieldName(fieldName: string): string {
  const normalized = fieldName.trim().toLowerCase();
  
  // 업체명 필드 정규화
  if (['업체명', '회사명', '상호', '사업자명', '공장명', '업소명', 'name', '이름'].includes(normalized)) {
    return '업체명';
  }
  
  // 주소 필드 정규화
  if (['주소', '소재지', '사업장주소', '공장주소', '사업장소재지', 'address', '상세주소'].includes(normalized)) {
    return '주소';
  }
  
  // 전화번호 필드 정규화
  if (['전화번호', '전화', '연락처', '대표전화', '사업장전화', 'tel', 'phone', '번호'].includes(normalized)) {
    return '전화번호';
  }
  
  // 대표자 필드 정규화
  if (['대표자', '대표자명', '대표', 'representative', 'ceo', '사장'].includes(normalized)) {
    return '대표자';
  }
  
  // 골재원(종류) 필드 정규화
  if (['골재원', '골재종류', '골재유형', '골재원(종류)', '골재', 'type', '자원종류'].includes(normalized)) {
    return '골재원';
  }
  
  // 원래 필드명 반환
  return fieldName;
}

// 전화번호 포맷 표준화
function formatPhoneNumber(phone: string | undefined): string | undefined {
  if (!phone) return undefined;
  
  // 숫자만 추출
  const numbers = phone.replace(/[^0-9]/g, '');
  
  // 너무 짧거나 긴 경우 그대로 반환
  if (numbers.length < 9 || numbers.length > 12) return phone;
  
  // 10자리 또는 11자리인 경우 포맷팅
  if (numbers.length === 10) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  } else if (numbers.length === 11) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
  } else if (numbers.length === 9) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2, 5)}-${numbers.slice(5)}`;
  }
  
  // 기타 경우 그대로 반환
  return phone;
}

// 필드 매핑 자동 감지
function detectFieldMapping(headers: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  
  for (const header of headers) {
    const normalized = normalizeFieldName(header);
    if (normalized !== header) {
      mapping[header] = normalized;
    }
  }
  
  return mapping;
}

// 필드 유효성 검사
function validateRequiredFields(item: RawPlaceData, mapping: Record<string, string>): string | null {
  // 업체명 확인
  let hasName = false;
  // 주소 확인
  let hasAddress = false;
  
  for (const [original, normalized] of Object.entries(mapping)) {
    if (normalized === '업체명' && item[original]) {
      hasName = true;
    }
    if (normalized === '주소' && item[original]) {
      hasAddress = true;
    }
  }
  
  if (!hasName && !item['업체명']) {
    return '업체명 필드가 필요합니다';
  }
  
  if (!hasAddress && !item['주소']) {
    return '주소 필드가 필요합니다';
  }
  
  return null;
}

// 엑셀 파일을 파싱해 장소 데이터 생성
export async function parseExcelData(
  buffer: ArrayBuffer,
  category: PlaceCategory,
  options?: {
    idPrefix?: string;
    aggregateTypeField?: string; // 골재생산업체인 경우 '골재원' 필드명
    progressCallback?: (progress: number) => void;
  }
): Promise<Place[]> {
  const reportProgress = (progress: number) => {
    if (options?.progressCallback) {
      options.progressCallback(Math.min(Math.max(progress, 0), 100));
    }
  };
  
  try {
    reportProgress(10);
    
    // SheetJS 라이브러리는 런타임에 로드 (빌드 시 제외됨)
    const XLSX = await import('xlsx');
    
    reportProgress(20);
    
    // 엑셀 파일 읽기
    const workbook = XLSX.read(buffer, { type: 'array' });
    
    reportProgress(30);
    
    // 첫 번째 시트만 사용
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    
    // 원본 데이터를 JSON으로 변환
    const rawData = XLSX.utils.sheet_to_json<RawPlaceData>(sheet, { defval: '' });
    
    reportProgress(40);
    
    if (rawData.length === 0) {
      throw new Error('엑셀 파일에 데이터가 없습니다.');
    }
    
    // 필드 매핑 자동 감지
    const sampleItem = rawData[0];
    const headers = Object.keys(sampleItem);
    const fieldMapping = detectFieldMapping(headers);
    
    // 결과 배열 초기화
    const places: Place[] = [];
    const idPrefix = options?.idPrefix || category.substring(0, 2);
    
    // 중복 주소 관리를 위한 매핑
    const addressCoordinates: Map<string, Coordinates> = new Map();
    
    let processedCount = 0;
    const totalCount = rawData.length;
    
    reportProgress(50);
    
    // 데이터 처리 및 변환
    for (const item of rawData) {
      // 필수 필드 검증
      const validationError = validateRequiredFields(item, fieldMapping);
      if (validationError) {
        console.warn(`데이터 검증 실패: ${validationError}`, item);
        continue;
      }
      
      // 필드 매핑 적용
      const mappedItem: RawPlaceData = { ...item };
      for (const [original, normalized] of Object.entries(fieldMapping)) {
        if (item[original] !== undefined) {
          mappedItem[normalized] = item[original];
        }
      }
      
      // 필수 데이터 추출
      const name = mappedItem['업체명'] || '';
      const address = mappedItem['주소'] || '';
      const representative = mappedItem['대표자'] || '';
      
      // 전화번호 필드 통합 (여러 필드명이 있을 수 있음)
      let tel = mappedItem['전화번호'] || mappedItem['대표전화'] || mappedItem['연락처'] || mappedItem['전화'] || '';
      tel = formatPhoneNumber(tel);
      
      // 지역 추출
      const region = extractRegionFromAddress(address);
      
      // 좌표 캐싱을 통한 중복 지오코딩 방지
      let coordinates: GeocodingResult | null = null;
      
      if (addressCoordinates.has(address)) {
        const cached = addressCoordinates.get(address);
        if (cached) {
          coordinates = { lat: cached.lat, lng: cached.lng };
        }
      } else {
        // 지오코딩 API 호출
        coordinates = await geocodeAddress(address);
        
        if (coordinates) {
          addressCoordinates.set(address, coordinates);
        }
      }
      
      if (coordinates) {
        // 기본 장소 정보 생성
        const place: Place = {
          id: `${idPrefix}-${nanoid(8)}`,
          name,
          address,
          region,
          category,
          representative,
          tel,
          lat: coordinates.lat,
          lng: coordinates.lng
        };
        
        // 골재생산업체인 경우 골재원 필드 추가
        if (category === '골재생산업체') {
          const aggregateFieldName = options?.aggregateTypeField || '골재원';
          const aggregateType = mappedItem[aggregateFieldName] || mappedItem['골재원'] || '';
          if (aggregateType) {
            place.aggregateType = String(aggregateType);
          }
        }
        
        places.push(place);
      }
      
      // 진행률 업데이트
      processedCount++;
      if (processedCount % 10 === 0 || processedCount === totalCount) {
        const progress = 50 + (processedCount / totalCount) * 40;
        reportProgress(progress);
      }
    }
    
    reportProgress(95);
    
    console.log(`${category} 데이터 파싱 완료: ${places.length}개 항목`);
    
    reportProgress(100);
    
    return places;
    
  } catch (error) {
    console.error('엑셀 파일 파싱 중 오류:', error);
    throw error;
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
