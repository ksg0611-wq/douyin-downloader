# Project: shortspack.com

## 1. Project Overview
- 숏폼(Shorts) 콘텐츠 제작 및 관리/분석 웹 툴 서비스 플랫폼
- 1인 개발/운영 환경으로, 빠른 기능 추가와 견고한 코드 유지를 최우선으로 함

## 2. Technical Stack & Rules
- Framework: Next.js / React, TypeScript
- Styling: Tailwind CSS (반응형 모바일 퍼스트 레이아웃 준수)
- State & API: TypeScript 타입 엄격 준수, 모든 API 호출 시 에러 핸들링 필수

## 3. Gemini Agent Working Guidelines
- 코드를 수정할 때는 기존 UI 디자인 시스템과의 통일성을 항상 유지한다.
- 파일 수정 전/후 관련된 컴포넌트 간의 타입(Type) 오류나 의존성 깨짐이 없는지 확인한다.
- 변경 사항 적용 시 주요 로직에는 직관적인 주석을 달아준다.
- 기능 구현 후 작동 여부를 테스트할 수 있는 방법이나 확인 절차를 안내한다.