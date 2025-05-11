# 내 주변 업체 찾기

네이버 지도 API를 활용한 위치 기반 업체 검색 웹 애플리케이션입니다. 현재 위치를 중심으로 주변의 음식점, 카페, 편의점, 약국 등을 찾고 필터링할 수 있습니다.

## 주요 기능

- 🌍 **현재 위치 기반 검색**: 사용자의 현재 위치를 중심으로 주변 업체 표시
- 🔍 **필터링 기능**: 카테고리, 지역, 반경, 키워드 기반 필터링
- 📱 **반응형 디자인**: 모바일과 데스크톱 환경에 최적화된 UI
- 📍 **상세 정보 제공**: 업체명, 주소, 연락처, 영업시간, 평점 등 제공
- 🔖 **즐겨찾기 기능**: 자주 찾는 업체 저장 (로컬 스토리지 활용)
- 🧭 **네이버 지도 연동**: 길찾기 기능 제공

## 기술 스택

- **React**: 사용자 인터페이스 구축
- **TypeScript**: 타입 안전성 확보
- **Vite**: 빠른 개발 환경 및 빌드 도구
- **Tailwind CSS**: 스타일링
- **shadcn/ui**: 재사용 가능한 UI 컴포넌트
- **네이버 지도 API**: 지도 표시 및 지리 정보 서비스

## 실행 방법

### 사전 요구사항

- Node.js 18 이상
- pnpm 설치
- 네이버 클라우드 플랫폼 계정 및 애플리케이션 등록 (지도 API 사용을 위함)

### 설치 및 실행

1. 저장소 클론:
   ```bash
   git clone <repository-url>
   cd nearby-places-finder
   ```

2. 의존성 설치:
   ```bash
   pnpm install
   ```

3. 환경 변수 설정:
   `.env` 파일에 네이버 지도 API 클라이언트 ID 설정
   ```
   VITE_NAVER_MAPS_CLIENT_ID=your_naver_maps_client_id
   ```

4. 개발 서버 실행:
   ```bash
   pnpm dev
   ```

5. 브라우저에서 확인:
   ```
   http://localhost:5173
   ```

## 배포

### 빌드 생성

```bash
pnpm build
```

빌드된 파일은 `dist` 디렉토리에 생성됩니다.

### 주의사항

- 네이버 지도 API 사용을 위해서는 도메인 등록이 필요합니다. 로컬 개발에는 `localhost`를 등록하고, 실제 배포 시에는 해당 도메인을 네이버 클라우드 플랫폼에 등록해야 합니다.
- 위치 정보 접근을 위해 HTTPS 환경이 권장됩니다. (로컬 개발 환경에서는 예외)

## 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

## 기여하기

1. 이슈 생성 또는 기존 이슈 확인
2. 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

---

이 프로젝트는 교육 및 학습 목적으로 만들어졌으며, 지속적으로 개선될 예정입니다. 피드백과 기여를 환영합니다!
