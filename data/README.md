# 배포용 데이터 (`data/`)

Vercel 등 정적 호스팅에는 브라우저 `localStorage`·IndexedDB가 없습니다. 이 폴더의 JSON이 공개 사이트의 기준 데이터입니다.

## 갱신 방법

1. 로컬에서 [admin.html](../admin.html)에 로그인해 로고·갤러리·SNS를 저장합니다.
2. **배포용 파일보내기**를 눌러 `site.json`, `gallery.json`을 받습니다.
3. 받은 파일을 이 폴더(`data/`)에 덮어씁니다.
4. GitHub에 commit · push → Vercel이 자동 배포합니다.

## 파일

| 파일 | 내용 |
|------|------|
| `site.json` | 로고, ABOUT 히어로, SNS URL, 페이지별 디자인 토큰 |
| `gallery.json` | 갤러리·썸네일 (업로드 이미지는 base64로 포함될 수 있음) |

`gallery.json`이 크면 저장소 용량이 커질 수 있습니다. 필요 시 Git LFS를 검토하세요.
