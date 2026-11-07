# 걸어가는 길

방성민의 기술 블로그입니다. [공개 블로그](https://elian-bang.github.io/bangseongmin.github.io/)

## 글 추가하기

`posts/`에 Markdown 파일을 추가합니다. 아래처럼 제목, 주소, 발행일, 대분류와 세부 분류를 입력하면 홈페이지에 표시됩니다. 본문 제목은 글 화면에 자동으로 표시됩니다.

```yaml
---
title: "글 제목"
kind: article
permalink: /posts/example.html
published_on: "2026-11-07"
section: "트러블슈팅"
category: "트러블슈팅 / 데이터베이스"
---
```

본문 이미지는 `assets/`에 넣고 게시글에서 `../assets/파일명`으로 참조합니다. `main`에 변경이 반영되면 GitHub Pages가 사이트를 빌드합니다.
