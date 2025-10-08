# TODO List

## 파일 관리 개선
- [ ] **미사용 파일 정리 시스템 구현**
  - S3/MinIO Lifecycle Policy 설정으로 임시 파일 자동 삭제
  - 업로드 시 `/temp/` 폴더 사용, 게시글 생성 완료 시 `/uploads/`로 이동
  - 24시간 후 temp 폴더 파일 자동 삭제 정책 적용
  - 또는 Cron Job으로 고아 파일 주기적 정리

## 기타
- [ ] 추가 TODO 항목들...
