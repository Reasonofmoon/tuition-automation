# 📚 학원 수강료 관리 시스템

완전한 클라이언트 사이드 학원 수강료 관리 웹 애플리케이션입니다. 서버 없이 브라우저의 localStorage를 사용하여 데이터를 저장하며, GitHub Pages에서 무료로 호스팅할 수 있습니다.

## ✨ 주요 기능

### 📊 대시보드
- 실시간 통계 (총 학생 수, 예상 수입, 납부 현황)
- 월별 수강료 수입 차트
- 최근 납부 내역 조회

### 👨‍🎓 학생 관리
- 학생 추가/수정/삭제
- 학생 정보 검색
- CSV 파일 가져오기/내보내기
- 형제 그룹 관리

### 🏫 반 관리
- 반 추가/수정/삭제
- 반별 기본 수강료 설정
- 반별 학생 수 확인
- 수업 일정 관리

### 💰 납부 관리
- 월별 수강료 내역 생성
- 형제 할인 자동 계산
- 개별 할인 및 교재비 관리
- 납부 여부 및 날짜 기록
- 엑셀 파일 다운로드

### 📈 리포트
- 기간별 수입 분석
- 납부율 통계
- 시각화 차트
- 상세 내역 테이블

## 🚀 빠른 시작

### GitHub Pages로 배포하기

1. **저장소 생성**
   ```bash
   # 로컬에 저장소 초기화
   git init
   git add .
   git commit -m "Initial commit"
   ```

2. **GitHub에 푸시**
   ```bash
   # GitHub에서 새 저장소 생성 후
   git remote add origin https://github.com/YOUR_USERNAME/tuition-manager.git
   git branch -M main
   git push -u origin main
   ```

3. **GitHub Pages 활성화**
   - GitHub 저장소 → Settings → Pages
   - Source: `main` 브랜치 선택
   - 폴더: `/ (root)` 선택
   - Save 클릭

4. **접속**
   - 5-10분 후 `https://YOUR_USERNAME.github.io/tuition-manager/` 에서 접속 가능

### 로컬에서 실행하기

1. **파일 다운로드**
   ```bash
   git clone https://github.com/YOUR_USERNAME/tuition-manager.git
   cd tuition-manager
   ```

2. **로컬 서버 실행**
   
   **Python 사용 (추천)**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   
   **Node.js 사용**
   ```bash
   npx http-server
   ```
   
   **VS Code Live Server 사용**
   - VS Code에서 `index.html` 열기
   - 우클릭 → "Open with Live Server"

3. **브라우저에서 열기**
   - `http://localhost:8000` 접속

## 📖 사용 가이드

### 1. 초기 설정

1. **학원명 입력**
   - 헤더의 입력 필드에 학원명 입력 후 '저장' 클릭

2. **반 추가**
   - '반 관리' 탭 → '+ 반 추가' 클릭
   - 반 이름, 기본 수강료, 수업 일정 등 입력

3. **학생 추가**
   - '학생 관리' 탭 → '+ 학생 추가' 클릭
   - 학생 정보 입력 (형제가 있는 경우 동일한 '형제 그룹 ID' 입력)

### 2. 월별 수강료 관리

1. **월별 내역 생성**
   - '납부 관리' 탭 → 월 선택 → '월별 내역 생성' 클릭

2. **할인 및 교재비 입력**
   - 각 학생별로 형제할인, 개별할인, 교재비 입력
   - 입력시 자동으로 '납부할 총액' 계산됨

3. **납부 처리**
   - 납부 여부 선택 (완납/미납/부분납)
   - 납부일 입력
   - 또는 '완납처리' 버튼으로 빠른 처리

4. **엑셀 다운로드**
   - '📤 엑셀 다운로드' 버튼 클릭
   - 자동으로 `.xlsx` 파일 다운로드

### 3. 형제 할인 관리

- 형제가 있는 학생들은 동일한 '형제 그룹 ID' 입력 (예: "김형제1")
- 납부 관리에서 형제 그룹이 파란색 선으로 표시됨
- 형제 그룹의 첫 번째 학생에게만 총 납부액이 표시됨
- 각 학생별로 형제 할인 금액 입력 가능

### 4. CSV로 학생 한번에 등록하기

`sample.csv` 파일을 다운로드하여 양식에 맞게 학생 정보를 입력한 후, 한번에 등록할 수 있습니다.

**CSV 파일 형식:**
```csv
학생명,반,기본수강료,형제그룹,연락처,등록일,비고
김민준,초급반,300000,A그룹,010-1234-5678,2023-01-15,첫째
김서연,초급반,300000,A그룹,010-1234-5679,2023-01-15,둘째
이도윤,중급반,350000,,010-2345-6789,2023-02-01,
```
- **학생명, 반, 기본수강료**는 필수 항목입니다.
- **형제그룹**은 형제/자매인 경우 동일한 이름을 입력합니다. (예: A그룹)
- 나머지 항목은 선택적으로 입력합니다.

**등록 방법:**
1. '학생 관리' 탭으로 이동합니다.
2. '📥 CSV 가져오기' 버튼을 클릭합니다.
3. 작성한 CSV 파일을 선택하면 학생들이 자동으로 추가됩니다.

### 5. 리포트 생성

1. '리포트' 탭 이동
2. 시작 월과 종료 월 선택
3. '리포트 생성' 클릭
4. 기간별 수입 분석 및 차트 확인

## 💾 데이터 백업

**중요:** 이 앱은 브라우저의 localStorage에 데이터를 저장합니다. 

### 백업 방법:
1. **학생 데이터**: '학생 관리' → '📤 CSV 내보내기'
2. **월별 납부 데이터**: '납부 관리' → 월 선택 → '📤 엑셀 다운로드'

### 백업 권장:
- 정기적으로 (주 1회 이상) CSV/Excel 파일 다운로드
- 브라우저 캐시 삭제 시 데이터가 사라질 수 있음
- 다른 컴퓨터나 브라우저에서 접속 시 데이터가 다름

## 🔧 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Charts**: Chart.js
- **Excel Export**: SheetJS (xlsx)
- **Storage**: Browser localStorage
- **Hosting**: GitHub Pages (정적 호스팅)

## 📱 브라우저 호환성

- Chrome (권장)
- Firefox
- Safari
- Edge
- 모바일 브라우저 지원

## 🛡️ 보안 및 프라이버시

- 모든 데이터는 사용자의 브라우저에만 저장됨
- 서버로 전송되는 데이터 없음
- 완전한 오프라인 작동 가능
- 개인정보 보호

## 📝 개발 로드맵

- [ ] PDF 리포트 생성
- [ ] 다중 학원 관리
- [ ] 클라우드 동기화 옵션
- [ ] 모바일 앱 (PWA)
- [ ] 알림 기능
- [ ] 문자/이메일 발송 연동

## 🤝 기여하기

이슈 및 풀 리퀘스트를 환영합니다!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포 가능합니다.

## 📞 문의

질문이나 건의사항이 있으시면 GitHub Issues를 이용해주세요.

---

**Made with ❤️ for Korean Academies**
