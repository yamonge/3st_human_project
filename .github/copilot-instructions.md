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
  ├─ screens/        # 화면 컴포넌트 (스타일 제외, 로직만)
  ├─ navigation/     # 네비게이션 (MetaballNavigation)
  ├─ components/     # 재사용 컴포넌트
  ├─ api/            # API 통신
  ├─ styles/         # 모든 스타일 파일 (카테고리별 폴더 구조)
  │   ├─ common/     # 공통 스타일 변수 및 테마 (index.js)
  │   ├─ screens/    # 화면별 스타일 파일 (카테고리별 하위 폴더)
  │   ├─ components/ # 컴포넌트별 스타일 파일
  │   └─ navigation/ # 네비게이션 스타일 파일
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
7. **스타일 관리 (카테고리별 폴더 구조)**: 
   - **모든 스타일 파일은 화면 컴포넌트와 분리**하여 `src/styles/` 하위 폴더에 위치
   - **공통 스타일**: `src/styles/common/index.js` - 색상, 폰트, 간격 등 전역 변수
   - **화면 스타일**: `src/styles/screens/[카테고리]/[화면명]Styles.js` - 각 화면별 스타일 (카테고리별 하위 폴더)
   - **컴포넌트 스타일**: `src/styles/components/[컴포넌트명]Styles.js` - 재사용 컴포넌트 스타일
   - **네비게이션 스타일**: `src/styles/navigation/[네비명]Styles.js` - 네비게이션 관련 스타일
   - **화면 컴포넌트 파일 내부에 StyleSheet 작성 절대 금지**
   - **import 예시**: 
     - 화면: `import styles from '../../../styles/screens/[카테고리]/[화면명]Styles';`
     - 컴포넌트: `import styles from '../../styles/components/[컴포넌트명]Styles';`
     - 네비게이션: `import styles from '../../styles/navigation/[네비명]Styles';`
     - 공통 변수: `import { colors, spacing } from '../../styles/common';`
8. **피그마 디자인 참고 원칙**:
   - 피그마에서 UI 구현 시 **구도와 디자인(색상, 폰트, 컴포넌트 배치)**만 참고
   - **여백(padding, margin)은 피그마를 따르지 말고** 모바일 화면에 최적화된 여백 사용
   - 실제 디바이스에서 자연스럽고 사용하기 편한 간격으로 조정
   - **피그마의 상단 시간/배터리 상태바와 하단 네비게이션 바는 가져오지 말 것** (실제 앱에서 별도 구현됨)
