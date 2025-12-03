# My Own Chef (MOC) - GitHub Copilot 지침서

## 프로젝트 개요
AI 기반 레시피 자동 추천 및 공동 장보기 서비스

### 주요 기능
1. **AI 레시피 추천**: 냉장고 재료 기반 레시피 자동 추천
2. **같이 장보기**: 지도 기반 공동 구매 매칭

---

## 기술 스택

### Backend
- **Framework**: Spring Boot 3.5.9-SNAPSHOT
- **ORM**: MyBatis
- **Database**: Oracle (SQL Developer)
- **구조**: `backend/moc/src/main/java/com/cucook/moc`

### Frontend
- **Framework**: React Native 0.78.3
- **Language**: JavaScript (`.js` 파일 사용, TypeScript 아님)
- **Navigation**: React Navigation (Bottom Tabs + Metaball Animation)
- **Font**: Noto Sans KR (`src/assets/fonts/`)
- **주요 라이브러리**: 
  - Reanimated, Skia (애니메이션)
  - Lottie (로딩/온보딩)
  - Lucide Icons
- **구조**: `frontend/moc/src/`

---

## 디렉토리 구조

```
backend/moc/src/main/
  ├─ java/com/cucook/moc/
  └─ resources/
      ├─ application.properties
      └─ mybatis/mappers/

frontend/moc/src/
  ├─ screens/        # 화면 컴포넌트
  ├─ navigation/     # 네비게이션 (MetaballNavigation)
  ├─ components/     # 재사용 컴포넌트
  ├─ api/            # API 통신
  └─ assets/         # 이미지, 아이콘, 애니메이션
```

---

## 개발 시 주의사항

1. **화면 플로우 확인**: 개발 전 `frontend/moc/PROJECT_STRUCTURE.md` 파일에서 화면 구조와 플로우 확인 필수
2. **API 통신**: Spring Boot ↔ React Native 연동 시 CORS 설정 확인
3. **DB 쿼리**: MyBatis XML 매퍼 사용 (Oracle SQL 문법)
4. **네비게이션**: 기존 MetaballNavigation 스타일 유지
5. **코드 스타일**: JavaScript (`.js`) 사용, ESLint 규칙 준수
6. **경로**: 절대 경로 사용 시 Windows 경로 형식 (`c:\project\pro_moc`)
