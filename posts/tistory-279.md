---
title: "[게시판 서비스 고도화] 1차 대댓글 - 뷰 수정"
kind: "article"
permalink: "/posts/tistory-279.html"
published_on: "2022-12-16"
section: "프로젝트"
category: "프로젝트 / 게시판 서비스"
---

## **뷰 수정**

---

### **게시글 페이지**

---

게시글 페이지에 댓글 구조가 대댓글이 추가됨에 따라 댓글 리스트를 출력하는 구조 등을 변경시켜주어야 한다.

댓글 입력 창이 한 개에서 대댓글 입력이 가능해지면서 여러 개로 변하면서 id가 아닌 class 레벨 접근으로 변경

![본문 이미지](../assets/tistory/5e139181e8a9c1add03fd235.png)

클래스를 통해 부모 댓글임을 명시하고 중복 사용되는 삭제 버튼은 id가 아닌 class 레벨 접근으로 변경

![본문 이미지](../assets/tistory/13f5af3946139c55dcd9b116.png)

그에 따라 로직에서도 id 접근에서 class 접근으로 변경

![본문 이미지](../assets/tistory/d473b3efe64dfcd458697aa3.png)

대댓글 출력 로직

![본문 이미지](../assets/tistory/6040831edbf766ca2957baa0.png)

### Check The Issue

---

![본문 이미지](../assets/tistory/990943763cbebb59d9403f54.png)

![본문 이미지](../assets/tistory/a2a06ffde4de38f244ba91c0.png)
