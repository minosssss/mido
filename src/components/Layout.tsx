import { useState } from 'react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import NaverMap from './NaverMap';
import FilterPanel from './FilterPanel';

type Place = {
  id: string;
  name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
};

// 10개 예시 데이터
const MOCK_PLACES: Place[] = [
  { id: '1', name: '강남 한식당', address: '서울 강남구 역삼동', category: '음식점', lat: 37.4999, lng: 127.0366 },
  { id: '2', name: '코엑스 카페', address: '서울 강남구 삼성동', category: '카페', lat: 37.5125, lng: 127.0587 },
  { id: '3', name: 'GS25 편의점', address: '서울 강남구 논현동', category: '편의점', lat: 37.5080, lng: 127.0265 },
  { id: '4', name: '올리브영 약국', address: '서울 강남구 대치동', category: '약국', lat: 37.4936, lng: 127.0661 },
  { id: '5', name: '청담 동물병원', address: '서울 강남구 청담동', category: '약국', lat: 37.5256, lng: 127.0492 },
  { id: '6', name: '압구정 브런치', address: '서울 강남구 압구정동', category: '음식점', lat: 37.5274, lng: 127.0286 },
  { id: '7', name: '신사 와인바', address: '서울 강남구 신사동', category: '카페', lat: 37.5172, lng: 127.0208 },
  { id: '8', name: '역삼 편의점24시', address: '서울 강남구 역삼1동', category: '편의점', lat: 37.5000, lng: 127.0384 },
  { id: '9', name: '삼성동 한의원', address: '서울 강남구 삼성1동', category: '약국', lat: 37.5100, lng: 127.0590 },
  { id: '10', name: '논현 숯불구이', address: '서울 강남구 논현2동', category: '음식점', lat: 37.5070, lng: 127.0235 },
];

export default function AppLayout() {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const toggleFav = (id: string) => {
    setFavorites(prev => {
      const next = new Set(prev);
      prev.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const [isFilterOpen, setFilterOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="h-12 flex items-center px-4 shadow-sm z-10">
        <h1 className="text-lg font-semibold">내 주변 업체 찾기</h1>
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto lg:hidden"
          onClick={() => setFilterOpen(true)}
        >
          ☰
        </Button>
      </header>

      {/* Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop 필터 (h-full 물려받아야) */}
        <aside className="hidden lg:flex flex-col w-80 border-r h-full">
          <FilterPanel
            places={MOCK_PLACES}
            favorites={favorites}
            onFavoriteToggle={toggleFav}
          />
        </aside>

        {/* Map */}
        <main className="relative flex-1">
          <NaverMap width="100%" height="100%" />
        </main>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={isFilterOpen} onOpenChange={setFilterOpen}>
        <SheetTrigger asChild>
          <Button
            variant="default"
            className="lg:hidden fixed bottom-4 right-4"
          >
            필터 열기
          </Button>
        </SheetTrigger>
        <SheetContent
          side="bottom"
          className="flex flex-col h-[80vh] p-0 rounded-t-lg"
        >
          <FilterPanel
            places={MOCK_PLACES}
            favorites={favorites}
            onFavoriteToggle={toggleFav}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
