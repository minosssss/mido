import type { Place, PlaceCategory } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bookmark, MapPin, Navigation, Phone, User, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MARKER_COLORS } from '@/lib/constants';

interface PlaceDetailsProps {
  place: Place;
  isFavorite: boolean;
  onFavoriteToggle: (id: string) => void;
  onNavigate: (place: Place) => void;
  onClose: () => void;
}

export default function PlaceDetails({
  place,
  isFavorite,
  onFavoriteToggle,
  onNavigate,
  onClose,
}: PlaceDetailsProps) {
  // 네이버 지도 앱으로 길찾기
  const openNaverMap = () => {
    // 모바일 환경에서 네이버 지도 앱 실행 시도
    window.location.href = `nmap://route/public?dlat=${place.lat}&dlng=${place.lng}&dname=${encodeURIComponent(place.name)}&appname=${encodeURIComponent('내 주변 업체 찾기')}`;

    // 앱이 설치되지 않은 경우를 대비해 1초 후 웹 버전으로 이동
    setTimeout(() => {
      window.open(
        `https://map.naver.com/v5/directions/-/-/-/transit?c=${place.lng},${place.lat},15,0,0,0,dh&destination=${encodeURIComponent(place.name)}`,
        '_blank',
      );
    }, 1000);
  };

  // 전화 걸기
  const callPlace = () => {
    if (place.tel) {
      window.location.href = `tel:${place.tel.replace(/-/g, '')}`;
    }
  };

  // 카테고리 색상 적용
  const categoryColor = MARKER_COLORS[place.category as PlaceCategory] || '#FF6B6B';
  const badgeStyle = {
    backgroundColor: categoryColor,
    color: '#FFFFFF',
    fontWeight: 'bold',
    border: 'none',
  };

  return (
    <Card className="absolute bottom-4 left-4 right-4 z-20 max-w-md mx-auto shadow-lg">
      <CardHeader className="pb-2 relative">
        <Button variant="ghost" size="icon" className="absolute right-2 top-2" onClick={onClose}>
          <X size={18} />
        </Button>

        <div className="flex items-start">
          <Badge style={badgeStyle}>
            {place.category}
          </Badge>
        </div>

        <h2 className="text-xl font-semibold mt-2">{place.name}</h2>

        {place.representative && (
          <div className="flex items-center text-sm">
            <User className="h-4 w-4 text-gray-500 mr-1" />
            <span>대표자: {place.representative}</span>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-2 pb-2">
        <div className="flex items-start">
          <MapPin className="h-4 w-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
          <span className="text-sm">{place.address}</span>
        </div>

        {place.tel && (
          <div className="flex items-center">
            <Phone className="h-4 w-4 mr-2 text-gray-500 flex-shrink-0" />
            <span className="text-sm">{place.tel}</span>
          </div>
        )}

        {place.category === '골재생산업체' && place.aggregateType && (
          <div className="flex flex-wrap gap-1 pt-1">
            <Badge variant="secondary" className="text-xs">
              골재원: {place.aggregateType}
            </Badge>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0 flex justify-between">
        <Button
          variant="outline"
          size="sm"
          className={cn(isFavorite && 'bg-yellow-50')}
          onClick={() => onFavoriteToggle(place.id)}
        >
          <Bookmark
            className={cn(
              'mr-2 h-4 w-4',
              isFavorite ? 'fill-current text-yellow-500' : 'text-gray-500',
            )}
          />
          {isFavorite ? '저장됨' : '저장'}
        </Button>

        <div className="space-x-2">
          {place.tel && (
            <Button variant="outline" size="sm" onClick={callPlace}>
              <Phone className="mr-2 h-4 w-4 text-blue-500" />
              전화
            </Button>
          )}

          <Button variant="default" size="sm" onClick={() => onNavigate(place)}>
            <Navigation className="mr-2 h-4 w-4" />
            길찾기
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
