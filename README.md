\# PICTORY 노션 홈페이지



노션 API를 활용한 개인 포트폴리오 홈페이지 자동 생성 스크립트입니다.



\## 주요 파일



| 파일 | 설명 |

|------|------|

| `setup.js` | 초기 DB 및 페이지 구조 생성 |

| `setup-homepage.js` | 홈페이지 메인 페이지 세팅 |

| `setup-contact.js` | 연락처 페이지 및 DB 세팅 |

| `seed.js` | 기본 샘플 데이터 생성 |

| `seed-works.js` | 포트폴리오 작품 샘플 데이터 생성 |

| `verify.js` | 세팅 완료 후 검증 |



\## \_archive 폴더



세팅 과정에서 사용한 보조 스크립트 모음입니다.

다른 프로젝트에서 노션 페이지 수정이 필요할 때 참고용으로 활용할 수 있습니다.



| 파일 | 설명 |

|------|------|

| `cleanup-final.js` | 불필요한 블록 최종 정리 |

| `cleanup-step.js` | 단계별 정리 |

| `complex-tasks.js` | 복잡한 작업 처리 |

| `create-about-page.js` | About 페이지 생성 |

| `create-contact-page.js` | Contact 페이지 생성 |

| `create-works-page.js` | Works 페이지 생성 |

| `final-tasks.js` | 마무리 작업 |

| `fix-categories.js` | 카테고리 수정 |

| `fix-works-view.js` | Works 뷰 수정 |

| `list-blocks.js` | 블록 목록 확인 |

| `list-current.js` | 현재 상태 확인 |

| `rebuild-main.js` | 메인 페이지 재빌드 |

| `reorder.js` | 순서 변경 |

| `reorganize-main-v2.js` | 메인 재정리 v2 |

| `reorganize-main.js` | 메인 재정리 |

| `reset-categories.js` | 카테고리 초기화 |

| `restore-all.js` | 전체 복구 |

| `restore-dbs.js` | DB 복구 |

| `step1\_works.js` | Works 세팅 1단계 |

| `step3\_about.js` | About 세팅 3단계 |

| `update-all-dbs.js` | 전체 DB 업데이트 |

| `update-contact-inquiry.js` | 문의 DB 업데이트 |



\## 시작하는 방법



1\. `.env` 파일 생성 후 노션 API 키 입력

2\. `npm install`

3\. `node setup.js`

4\. `node setup-homepage.js`

5\. `node seed.js`

6\. `node verify.js`



\## 라이선스

MIT License

