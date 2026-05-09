# 🏠 PICTORY 노션 홈페이지

> 노션 API로 개인 포트폴리오 홈페이지를 자동 생성하는 스크립트

## 왜 만들었나

별도 웹사이트 없이 노션만으로 깔끔한 개인 포트폴리오 홈페이지를 만들 수 있도록
노션 API를 활용한 자동 생성 스크립트를 만들었습니다.

## 페이지 구성

- 메인 홈페이지
- About (프로필 소개)
- Works (포트폴리오)
- Contact (연락처 및 문의 DB)

## 주요 파일

| 파일 | 설명 |
|------|------|
| setup.js | 초기 DB 및 페이지 구조 생성 |
| setup-homepage.js | 홈페이지 메인 페이지 세팅 |
| setup-contact.js | 연락처 페이지 및 DB 세팅 |
| seed.js | 기본 샘플 데이터 생성 |
| seed-works.js | 포트폴리오 작품 샘플 데이터 생성 |
| verify.js | 세팅 완료 후 검증 |

## 시작하는 방법

1. .env 파일 생성 후 노션 API 키 입력

NOTION_TOKEN=secret_xxxxx
NOTION_PAGE_ID=xxxxxxxx

2. 패키지 설치 및 실행

npm install
node setup.js
node setup-homepage.js
node seed.js
node verify.js

## 라이선스

MIT License
