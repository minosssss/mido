import { forwardRef } from 'react';
import { Badge } from '@/components/ui/badge';
import { Bookmark, Navigation } from 'lucide-react';
import { Card } from '@/components/ui/card';
import type { Place, PlaceCategory } from '@/types';
import { cn } from '@/lib/utils';
import { MARKER_COLORS } from '@/lib/constants';

interface PlaceCardProps extends React.HTMLAttributes<HTMLDivElement> {
  place: Place;
  isSelected?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (id: string) => void;
  onNavigate?: (place: Place) => void;
}

// 카테고리별 배지 스타일 컴포넌트
const CategoryBadge = ({ category }: { category: PlaceCategory }) => {
  const color = MARKER_COLORS[category];
  
  // 배경색과 텍스트 색상 조합
  const style = {
    backgroundColor: color,
    color: '#FFFFFF', // 흰색 텍스트 (모든 배경색에 잘 보이도록)
    fontWeight: 'bold',
    border: 'none',
  };
  
  return (
    <Badge className="text-xs" style={style}>
      {category}
    </Badge>
  );
};

const PlaceCard = forwardRef<HTMLDivElement, PlaceCardProps>(
  (
    {
      place,
      isSelected = false,
      isFavorite = false,
      onFavoriteToggle,
      onNavigate,
      className,
      ...props
    },
    ref,
  ) => {
    return (
      <Card
        ref={ref}
        className={cn(
          'hover:shadow-md transition-all duration-200 p-1',
          isSelected ? 'border-primary shadow-md' : '',
          className,
        )}
        onClick={(e) => {
          e.preventDefault();
          props.onClick?.(e);
        }}
        {...props}
      >
        <div className="p-4">
          {/* 1행: 카테고리 배지 + 즐겨찾기/길찾기 버튼 */}
          <div className="flex justify-between items-center mb-2">
            <CategoryBadge category={place.category as PlaceCategory} />
            <div className="flex space-x-1">
              {onFavoriteToggle && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onFavoriteToggle(place.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label={isFavorite ? '즐겨찾기 해제' : '즐겨찾기 추가'}
                >
                  <Bookmark
                    size={18}
                    className={cn(
                      'transition-colors',
                      isFavorite ? 'fill-current text-yellow-500' : 'text-gray-400',
                    )}
                  />
                </button>
              )}

              {onNavigate && (
                <button
                  onClick={e => {
                    e.stopPropagation();
                    onNavigate(place);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="길찾기"
                >
                  <Navigation size={18} className="text-blue-500" />
                </button>
              )}
            </div>
          </div>

          {/* 2행: 업체명 */}
          <h3 className="text-base font-medium truncate">{place.name}</h3>

          {/* 3행: 주소 */}
          <p className="text-xs text-muted-foreground truncate mb-2">{place.address}</p>

          {/* 4행: 대표자 + 전화번호 */}
          {/*<div className="flex justify-between items-center text-xs">*/}
          {/*{place.representative && (*/}
          {/*  <div className="flex items-center">*/}
          {/*    <User size={14} className="text-gray-500 mr-1" />*/}
          {/*    <span>{place.representative}</span>*/}
          {/*  </div>*/}
          {/*)}*/}

          {/*{place.tel && (*/}
          {/*  <div className="flex items-center text-muted-foreground">*/}
          {/*    <Phone size={14} className="mr-1" />*/}
          {/*    <span>{place.tel}</span>*/}
          {/*  </div>*/}
          {/*)}*/}
          {/*</div>*/}
        </div>
      </Card>
    );
  },
);
PlaceCard.displayName = 'PlaceCard';

export default PlaceCard;
