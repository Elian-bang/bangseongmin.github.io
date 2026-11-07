---
title: "[항해-99] CH03 - 주특기 과제 완료"
kind: "article"
permalink: "/posts/tistory-113.html"
published_on: "2022-05-25"
section: "학습·회고"
category: "학습·회고 / 항해99 / Spring"
---

#### Revision History

| Version | Description | Date | Writer |
| --- | --- | --- | --- |
| 0.1 | 1. 요구사항 명세서 작성 2. API 설계 3. DB 테이블 설계 | 2022-05-25 11:40 | Mr.Bang |
| 0.2 | 1. DB 설계 수정(**Mark**) | 2022-05-25 14:15 | Mr.Bang |

---

#### **[ 요구사항 명세서 ]**

1. 전체 게시글 목록 조회 API
   * 제목, 작성자명, 작성 날짜를 조회하기
   * 작성 날짜 기준으로 내림차순 정렬하기
2. 게시글 작성 API
   * 제목, 작성자명, 비밀번호, 작성 내용을 입력하기
3. 게시글 조회 API
   * 제목, 작성자명, 작성 날짜, 작성 내용을 조회하기 (검색 기능이 아닙니다. 간단한 게시글 조회만 구현해주세요.)
4. 게시글 수정 API
   * API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 수정되게 하기
5. 게시글 삭제 API
   * API를 호출할 때 입력된 비밀번호를 비교하여 동일할 때만 글이 삭제되게 하기

---

#### **[API 설계]**

**1. 전체 게시글 목록 조회(GET /api/posts)**

**2. 게시글 작성 API(POST /api/post)**

**3. 게시글 조회 API(GET /api/posts)**

**4. 게시글 수정 API(PUT /api/posts/{id})**

**5. 게시글 삭제 API(DELETE /api/posts/{id})**

#### **[DB 설계]**

**posts**

**id - INT AUTO INCREMENT**

**title - String NOT NULL,**

**writer - String NOT NULL,**

**password - String NOT NULL,**

**contents - String NOT NULL,**

**modifiedAT - DateTime NOT NULL,**

**PRIMARY KEY(id)**

**[클래스]**

**필요 클래스 : POST Class, PostRepository, PostRequestDto, TimeStamped, PostService, PostController**

**controller : **PostController****

**domain : **POST Class, PostRepository, PostRequestDto, TimeStamped****

**service : **PostService****

---

보완해야할 것

1. 비밀번호 암호화

2. title 수정 가능
