---
title: "[어드민 서비스] 01. 프로젝트 기획"
kind: "article"
permalink: "/posts/tistory-354.html"
published_on: "2023-03-26"
section: "프로젝트"
category: "프로젝트 / 게시판 서비스"
---

## **프로젝트 기획**

---

### **개발 목적 이해하기**

---

#### **🎀 어드민 서비스 프로젝트의 목표**

* 게시판 서비스 기능과 서비스 현황을 관리할 수 있는 도구를 만든다.
* 관리 도구에서 고려해야 하는 요소들과 아이디어를 고민한다.
* 자바 + 스프링 부트로 어드민 프로젝트 요구사항을 구현해본다.
* 최신 버전의 기술을 사용해 보면서 기술 동향을 파악하고, 새로운 문제와 해결 방법을 확인한다.
* 기획부터 개발, 형상관리, 테스트, 배포까지 개발 프로세스 전반을 경험한다.

#### **🔨어드민의 새로운 문제 정의와 해결**

* **고객의 재정의**
  + (X) 게시판 사용자, 서비스 외부에서 접속하는 사람
  + (O) 게시판 관리자, 내부에서 접근하는 서비스 운영자
* **사용자에게 웹 화면으로 서비스 제공 + 디자인 요소(Admin LTE)**
  + 게시글 관리 페이지
  + 댓글 관리 페이지
  + 회원 관리 페이지
  + 로그인 페이지
* **어드민 회원 인증**
* **다양한 부가 기능**

#### **어드민 서비스 프로젝트에서 변경된 도구 버전**

* IDE : Intellij IDEA 2022.3 (Ultimate Edition)
* 언어: Java 17
* 프레임워크 : Spring Boot 2.7.6
* 빌드 도구 : Gradle 7.4.1
* git GUI: GitKraken 9.0

### **필요한 기술 정리하기**

---

#### **🤔 예상하는 세부 기능들**

* **어드민 회원, 방문자 수 집계 도메인의 설계**
* **도메인 데이터를 DB에 저장**
* **사용자에게 웹 화면으로 서비스 제공 + 디자인 요소**
* **게시판 서비스와 API 통신**
* **부가 기능**
  + **다크 모드**
  + **todo list**
  + **방문자 수 집계**
  + **채팅**
* **인증 기능 : 카카오 기반 OAuth 2.0 인증**

### 예상 필요 기술 (스프링 부트 의존성)

* **Java + Spring Boot 기반에서 선택**
* **웹서비스 제공 => Spring Web**
* **도메인의 설계와 DB 저장 => Spring Data JPA, H2 Database, MySQL Driver**
* **JSON API로 데이터 제공 => Rest Repositories, Rest Repositories HAL Explorer**
* **웹 화면: 서버 사이드 렌더링으로 접근 → 템플릿 엔진 → Thymeleaf**
* **디자인 요소 => AdminLTE 3.2.0**
* **API 통신 => RestTemplate, OpenFeign**
* **채팅 기능 => WebSocket**
* **인증 기능 => Spring Security OAuth2 Client**
* **생산성 => Lombok, Spring Boot Dev Tools, Spring Boot Actuator**
