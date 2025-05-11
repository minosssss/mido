import type { Place } from '@/types';

// 샘플 데이터 (통합)
export const MOCK_PLACES: Place[] = [
  { 
    id: '1', 
    name: '강남 건설자원', 
    address: '서울 강남구 역삼동', 
    region: '서울',
    category: '건설자원협회', 
    representative: '홍길동',
    tel: '02-123-4567',
    lat: 37.4999, 
    lng: 127.0366 
  },
  { 
    id: '2', 
    name: '삼성 레미콘', 
    address: '서울 강남구 삼성동', 
    region: '서울',
    category: '레미콘공장', 
    representative: '김철수',
    tel: '02-234-5678',
    lat: 37.5125, 
    lng: 127.0587 
  },
  { 
    id: '3', 
    name: '논현 골재상사', 
    address: '서울 강남구 논현동', 
    region: '서울',
    category: '골재생산업체', 
    representative: '이영희',
    tel: '02-345-6789',
    aggregateType: '모래',
    lat: 37.5080, 
    lng: 127.0265 
  },
  { 
    id: '4', 
    name: '경기 건설자원', 
    address: '경기도 성남시 분당구', 
    region: '경기',
    category: '건설자원협회', 
    representative: '박지성',
    tel: '031-123-4567',
    lat: 37.3500, 
    lng: 127.1086 
  },
  { 
    id: '5', 
    name: '인천 레미콘', 
    address: '인천광역시 연수구', 
    region: '인천',
    category: '레미콘공장', 
    representative: '최민수',
    tel: '032-234-5678',
    lat: 37.4056, 
    lng: 126.6776 
  },
  { 
    id: '6', 
    name: '부산 골재상사', 
    address: '부산광역시 해운대구', 
    region: '부산',
    category: '골재생산업체', 
    representative: '이영자',
    tel: '051-345-6789',
    aggregateType: '자갈',
    lat: 35.1631, 
    lng: 129.1639 
  },
  {
    id: '7',
    name: '산본역',
    address: '경기도 군포시 번영로 504',
    region: '경기',
    category: '레미콘공장',
    representative: '이영자',
    tel: '0507-1370-9844',
    lat: 37.358019,
    lng: 126.932969
  }
];

export default MOCK_PLACES;
