import { useCallback, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark } from 'lucide-react';
import { Separator } from '@/components/ui/separator.tsx';
import { Button } from '@/components/ui/button.tsx';

type Place = {
  id: string;
  name: string;
  address: string;
  category: string;
  lat: number;
  lng: number;
};

const REGIONS = [
  '전체', '서울', '인천', '경기', '강원', '부산', '울산', '경남',
  '대구', '경북', '대전', '세종', '충남', '충북', '광주', '전남', '전북', '제주',
] as const;
type Region = typeof REGIONS[number];

const CATEGORIES = ['음식점', '카페', '편의점', '약국'] as const;
type Category = typeof CATEGORIES[number];

export default function FilterPanel({
                                      places,
                                      favorites,
                                      onFavoriteToggle,
                                    }: {
  places: Place[];
  favorites: Set<string>;
  onFavoriteToggle: (id: string) => void;
}) {
  const [region, setRegion] = useState<Region>('전체');
  const [selectedCats, setSelectedCats] = useState<Set<Category>>(
    () => new Set(CATEGORIES),
  );
  const [distance, setDistance] = useState<number[]>([1000]);
  const allSelected = selectedCats.size === CATEGORIES.length;
  const toggleCat = (cat: Category) =>
    setSelectedCats(prev => {
      const next = new Set(prev);
      next.has(cat) ? next.delete(cat) : next.add(cat);
      return next;
    });

  const filtered = places.filter(
    p =>
      (region === '전체' || p.address.includes(region)) &&
      selectedCats.has(p.category as Category),
  );

  // 전체 토글 핸들러
  const handleToggleAll = useCallback(() => {
    if (selectedCats.size === CATEGORIES.length) {
      // 이미 모두 선택되어 있으면 전부 해제
      setSelectedCats(new Set());
    } else {
      // 아니면 전부 선택
      setSelectedCats(new Set(CATEGORIES));
    }
  }, [selectedCats]);

  return (
    <div className="flex flex-col h-full">
      {/* 1) 고정 필터 섹션 */}
      <div className="p-4 space-y-6">
        {/* Region */}
        <div>
          <h2 className="mb-2 text-md font-medium">지역</h2>
          <Select
            value={region}
            onValueChange={v => setRegion(v as Region)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="전체" />
            </SelectTrigger>
            <SelectContent>
              {REGIONS.map(r => (
                <SelectItem key={r} value={r}>{r}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Separator className="bg-gray-600 dark:bg-gray-200" />

        {/* Category */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-md font-medium">카테고리</h2>
            <Button
              size="sm"
              variant={allSelected ? 'default' : 'outline'}  // 선택 상태에 따라 variant 변경
              onClick={handleToggleAll}
            >
              전체
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center space-x-1">
                <Checkbox
                  checked={selectedCats.has(cat)}
                  onCheckedChange={() => toggleCat(cat)}
                />
                <span className="text-sm">{cat}</span>
              </label>
            ))}
          </div>
        </div>
        <Separator className="bg-gray-600 dark:bg-gray-200" />

        {/* Distance */}
        <div>
          <div className="mb-2 flex justify-between items-center">
            <h2 className=" text-md font-medium">검색 반경</h2>
            <span className="text-sm">{distance[0]}m</span>
          </div>
          <Slider
            value={distance}
            className="mb-2"
            onValueChange={vals => setDistance(vals)}
            min={500}
            max={5000}
            step={100}
          />
        </div>
        <Separator className="bg-gray-600 dark:bg-gray-200" />
      </div>

       {/*2) 업체 리스트(카드) — 이 부분만 스크롤*/}
      <div className="flex flex-col flex-1 p-4 overflow-hidden">
        <h2 className="mb-2 text-md font-medium">
          업체 목록 ({filtered.length})
        </h2>
        <div className="flex-1 overflow-y-auto space-y-2">
          {filtered.map(p => (
            <Card key={p.id} className="hover:shadow-md cursor-pointer p-2">
              <div className="p-1">
                {/* 1행: 카테고리 + 북마크 */}
                <div className="flex justify-between items-center">
                  <Badge variant="outline">{p.category}</Badge>
                  <button onClick={() => onFavoriteToggle(p.id)}>
                    <Bookmark
                      className={
                        favorites.has(p.id)
                          ? 'fill-current text-blue-500'
                          : ''
                      }
                    />
                  </button>
                </div>
                <div className="p-1">
                  {/* 2행: 업체명 */}
                  <p className="font-medium">{p.name}</p>
                  {/* 3행: 주소(트렁케이트) */}
                  <p className="text-xs text-muted-foreground truncate">
                    {p.address}
                  </p>
                </div>

              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
