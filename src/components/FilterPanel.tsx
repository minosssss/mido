import { useCallback } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, MapPin, Search } from 'lucide-react';
import type { PlaceCategory, PlaceFilter, Region } from '@/types';
import { PLACE_CATEGORIES, REGIONS } from '@/types';
import CategoryCheckbox from './CategoryCheckbox';

interface FilterPanelProps {
  filter: PlaceFilter;
  onFilterChange: (filter: PlaceFilter) => void;
}

export default function FilterPanel({ filter, onFilterChange }: FilterPanelProps) {
  // 지역 변경 핸들러
  const handleRegionChange = (value: string) => {
    onFilterChange({
      ...filter,
      region: value as Region,
    });
  };

  // 카테고리 토글 핸들러
  const toggleCategory = (category: PlaceCategory) => {
    const newCategories = new Set(filter.categories);
    if (newCategories.has(category)) {
      newCategories.delete(category);
    } else {
      newCategories.add(category);
    }

    onFilterChange({
      ...filter,
      categories: newCategories,
    });
  };

  // 모든 카테고리 토글 핸들러
  const toggleAllCategories = useCallback(() => {
    if (filter.categories.size === PLACE_CATEGORIES.length) {
      // 모두 선택됨 -> 모두 해제
      onFilterChange({
        ...filter,
        categories: new Set<PlaceCategory>(),
      });
    } else {
      // 일부만 선택됨 -> 모두 선택
      onFilterChange({
        ...filter,
        categories: new Set<PlaceCategory>(PLACE_CATEGORIES),
      });
    }
  }, [filter, onFilterChange]);

  // 반경 변경 핸들러
  const handleRadiusChange = (values: number[]) => {
    onFilterChange({
      ...filter,
      radius: values[0],
    });
  };

  // 키워드 검색 핸들러
  const handleKeywordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filter,
      keyword: e.target.value || undefined,
    });
  };

  // 키워드 검색 제출 핸들러
  const handleKeywordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 검색 로직은 이미 onChange에서 처리됨
  };

  // 검색 모드 변경 핸들러
  const handleSearchModeChange = (value: string) => {
    onFilterChange({
      ...filter,
      searchMode: value as 'radius' | 'viewport',
    });
  };

  const allCategoriesSelected = filter.categories.size === PLACE_CATEGORIES.length;

  return (
    <div className="p-2 space-y-4">
      {/* 키워드 검색 */}
      <form onSubmit={handleKeywordSubmit}>
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="업체명, 주소, 대표자 검색"
            value={filter.keyword || ''}
            onChange={handleKeywordChange}
            className="pl-8"
          />
        </div>
      </form>
      <Separator />

      {/* 검색 모드 선택 */}
      <div>
        <h2 className="mb-2 text-sm font-medium">검색 모드</h2>
        <Tabs value={filter.searchMode} onValueChange={handleSearchModeChange} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="viewport" className="flex items-center gap-1">
              <Map className="h-4 w-4" />
              <span>지도 영역</span>
            </TabsTrigger>
            <TabsTrigger value="radius" className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              <span>반경</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="viewport" className="mt-2">
            <div className="p-2 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground">
                현재 지도에 표시된 영역 내의 모든 업체가 표시됩니다.
                <br />
                지도를 이동한 후 <strong>"현 지도에서 검색"</strong> 버튼을 클릭하면 해당 영역의
                업체를 볼 수 있습니다.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="radius" className="mt-2">
            <div className="mb-2 flex justify-between items-center">
              <h3 className="text-sm font-medium">검색 반경</h3>
              <span className="text-sm">{(filter.radius / 1000).toFixed(1)}km</span>
            </div>
            <Slider
              defaultValue={[filter.radius]}
              value={[filter.radius]}
              min={1000}
              max={100000}
              step={1000}
              onValueChange={handleRadiusChange}
              className="mb-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1km</span>
              <span>100km</span>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <Separator />

      {/* 지역 필터 */}
      <div>
        <h2 className="mb-2 text-sm font-medium">지역</h2>
        <Select value={filter.region} onValueChange={handleRegionChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="전체" />
          </SelectTrigger>
          <SelectContent>
            {REGIONS.map(region => (
              <SelectItem key={region} value={region}>
                {region}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <Separator />

      {/* 카테고리 필터 */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-sm font-medium">카테고리</h2>
          <Button
            size="sm"
            variant={allCategoriesSelected ? 'default' : 'outline'}
            onClick={toggleAllCategories}
          >
            {allCategoriesSelected ? '전체 해제' : '전체 선택'}
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-2">
          {PLACE_CATEGORIES.map(category => (
            <CategoryCheckbox
              key={category}
              category={category}
              isChecked={filter.categories.has(category)}
              onChange={() => toggleCategory(category)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
